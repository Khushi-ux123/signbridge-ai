import os, sys, json, asyncio, base64
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

import cv2
import numpy as np
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from tensorflow.keras.models import load_model
from tensorflow.keras.layers import LSTM
from tensorflow.keras.utils import custom_object_scope

BASE     = os.path.dirname(os.path.abspath(__file__))
ROOT     = os.path.dirname(BASE)
ISL_IMGS = os.path.join(ROOT, "Indian Sign Languge Images")

WORKER_PATH   = os.path.join(BASE, "mediapipe_worker.py")
WORKER_PYTHON = os.path.join(BASE, "mp_env", "Scripts", "python.exe")
if not os.path.exists(WORKER_PYTHON):
    WORKER_PYTHON = sys.executable

# ── Load model (priority: landmark MLP > isl CNN > action LSTM) ───────────────
def try_load(mpath, cpath, kind):
    if not (os.path.exists(mpath) and os.path.exists(cpath)):
        return None, []
    try:
        if kind == "lstm":
            with custom_object_scope({"LSTM": lambda **kw: LSTM(**{k:v for k,v in kw.items() if k!="time_major"})}):
                m = load_model(mpath, compile=False)
        else:
            m = load_model(mpath, compile=False)
        with open(cpath) as f:
            cls = [l.strip() for l in f if l.strip()]
        print(f"[server] Loaded {kind}: {len(cls)} classes")
        return m, cls
    except Exception as e:
        print(f"[server] Failed {kind}: {e}")
        return None, []

model, actions, model_type = None, [], None
for mpath, cpath, kind in [
    (os.path.join(BASE,"landmark_model.h5"),  os.path.join(BASE,"landmark_classes.txt"), "landmark"),
    (os.path.join(BASE,"isl_model.h5"),        os.path.join(BASE,"isl_classes.txt"),      "cnn"),
    (os.path.join(BASE,"action_model.h5"),     os.path.join(BASE,"classes.txt"),           "lstm"),
]:
    m, c = try_load(mpath, cpath, kind)
    if m: model, actions, model_type = m, c, kind; break

print(f"[server] Active: {model_type} | {len(actions)} classes")

CONFIDENCE_THRESHOLD = 0.70

# ── Landmark-based prediction (42 features from hand landmarks) ───────────────
def predict_from_landmarks(landmarks: dict):
    """Use right or left hand landmarks (21 points * 2 = 42 features)."""
    hand = landmarks.get("right_hand") or landmarks.get("left_hand")
    if not hand or len(hand) < 21:
        return "", 0.0
    # Normalize relative to wrist (point 0)
    wx, wy = hand[0][0], hand[0][1]
    feat = []
    for pt in hand:
        feat.append(pt[0] - wx)
        feat.append(pt[1] - wy)
    feat = np.array(feat, dtype=np.float32).reshape(1, -1)
    probs = model.predict(feat, verbose=0)[0]
    idx   = int(np.argmax(probs))
    return actions[idx], float(probs[idx])

# ── CNN prediction (fallback) ─────────────────────────────────────────────────
def predict_cnn(frame_b64: str, landmarks: dict = None):
    _, encoded = frame_b64.split(",", 1)
    frame = cv2.imdecode(np.frombuffer(base64.b64decode(encoded), np.uint8), cv2.IMREAD_COLOR)
    if frame is None:
        return "", 0.0
    h, w  = frame.shape[:2]
    crop  = frame
    if landmarks:
        hand = landmarks.get("right_hand") or landmarks.get("left_hand")
        if hand:
            xs = [p[0] for p in hand]; ys = [p[1] for p in hand]
            pad = 0.15
            x1 = max(0, int((min(xs)-pad)*w)); y1 = max(0, int((min(ys)-pad)*h))
            x2 = min(w, int((max(xs)+pad)*w)); y2 = min(h, int((max(ys)+pad)*h))
            if x2-x1 > 10 and y2-y1 > 10:
                crop = frame[y1:y2, x1:x2]
    rgb   = cv2.cvtColor(cv2.resize(crop,(128,128)), cv2.COLOR_BGR2RGB).astype(np.float32)/255.0
    probs = model.predict(np.expand_dims(rgb,0), verbose=0)[0]
    idx   = int(np.argmax(probs))
    return actions[idx], float(probs[idx])

# ── FastAPI ───────────────────────────────────────────────────────────────────
app = FastAPI(title="SignBridge API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

if os.path.exists(ISL_IMGS):
    app.mount("/isl-images", StaticFiles(directory=ISL_IMGS), name="isl-images")

@app.get("/api/health")
def health():
    return {"status": "ok", "model": model_type, "classes": len(actions)}

@app.get("/api/actions")
def get_actions():
    return {"actions": actions, "model_loaded": model is not None, "model_type": model_type}

@app.get("/api/library")
def get_library():
    result = []
    for folder, cat_label in [("Alphabets","Alphabet"),("BasicWords","Word"),("Number","Number")]:
        path = os.path.join(ISL_IMGS, folder)
        if not os.path.exists(path): continue
        for sign in sorted(os.listdir(path)):
            sp = os.path.join(path, sign)
            if not os.path.isdir(sp): continue
            imgs = sorted(os.listdir(sp))
            if not imgs: continue
            preview = imgs[min(5, len(imgs)-1)]
            result.append({"name":sign,"category":cat_label,"folder":folder,
                           "image":f"/isl-images/{folder}/{sign}/{preview}","total_images":len(imgs)})
    return {"signs": result}

# ── WebSocket ─────────────────────────────────────────────────────────────────
@app.websocket("/ws")
async def ws_endpoint(ws: WebSocket):
    await ws.accept()

    # Start mediapipe worker subprocess
    proc = await asyncio.create_subprocess_exec(
        WORKER_PYTHON, WORKER_PATH,
        stdin=asyncio.subprocess.PIPE,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.DEVNULL,
    )

    # Warm up worker
    blank = np.zeros((64,64,3), dtype=np.uint8)
    _, buf = cv2.imencode('.jpg', blank)
    warmup = 'data:image/jpeg;base64,' + base64.b64encode(buf).decode()
    proc.stdin.write((warmup + "\n").encode())
    await proc.stdin.drain()
    try:
        await asyncio.wait_for(proc.stdout.readline(), timeout=15.0)
        print("[ws] worker ready")
    except Exception:
        print("[ws] worker warmup timeout")

    # Smoothing: keep last N predictions
    SMOOTH = 5
    pred_history = []

    try:
        while True:
            data = await ws.receive_text()

            # Send frame to mediapipe worker
            proc.stdin.write((data + "\n").encode())
            await proc.stdin.drain()

            landmarks = {}
            try:
                line = await asyncio.wait_for(proc.stdout.readline(), timeout=2.0)
                mp_result = json.loads(line.decode().strip())
                landmarks = mp_result.get("landmarks", {})
            except Exception:
                landmarks = {}

            # Predict from landmarks (fast MLP) or CNN fallback
            if model_type == "landmark":
                label, confidence = await asyncio.to_thread(predict_from_landmarks, landmarks)
            elif model_type == "cnn":
                label, confidence = await asyncio.to_thread(predict_cnn, data, landmarks)
            else:
                label, confidence = "", 0.0

            # Smooth predictions — only show if same label appears N times
            if label and confidence >= CONFIDENCE_THRESHOLD:
                pred_history.append(label)
            else:
                pred_history.append("")
            if len(pred_history) > SMOOTH:
                pred_history.pop(0)

            # Use most common prediction in window
            from collections import Counter
            counts = Counter(pred_history)
            top_label, top_count = counts.most_common(1)[0]
            final_label = top_label if top_count >= (SMOOTH // 2 + 1) and top_label else ""

            # Add to sentence when stable
            await ws.send_text(json.dumps({
                "prediction": final_label,
                "confidence": confidence,
                "buffering": 1,
                "buffer_needed": 1,
                "landmarks": landmarks,
                "hand_detected": bool(landmarks.get("right_hand") or landmarks.get("left_hand"))
            }))

    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"[ws] error: {e}")
        import traceback; traceback.print_exc()
    finally:
        proc.stdin.close()
        proc.kill()

if __name__ == "__main__":
    import uvicorn
    print(f"\n{'='*50}")
    print(f"SignBridge — {model_type} | {len(actions)} classes")
    print(f"http://localhost:8000")
    print(f"{'='*50}\n")
    uvicorn.run(app, host="0.0.0.0", port=8000, ws_max_size=10*1024*1024)
