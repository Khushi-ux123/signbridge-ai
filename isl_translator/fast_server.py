"""
Fast single-process server.
Run: isl_translator/mp_env/Scripts/python isl_translator/fast_server.py
"""
import os, sys, json, asyncio, base64, warnings, logging
warnings.filterwarnings("ignore")
logging.getLogger("sklearn").setLevel(logging.ERROR)
import os
os.environ["PYTHONWARNINGS"] = "ignore"
os.environ["JOBLIB_MULTIPROCESSING"] = "0"

import cv2
import numpy as np
import mediapipe as mp

BASE     = os.path.dirname(os.path.abspath(__file__))
ROOT     = os.path.dirname(BASE)
ISL_IMGS = os.path.join(ROOT, "Indian Sign Languge Images")

# ── MediaPipe Hands ───────────────────────────────────────────────────────────
mp_hands       = mp.solutions.hands
hands_detector = mp_hands.Hands(
    static_image_mode=False, max_num_hands=2,
    min_detection_confidence=0.5, min_tracking_confidence=0.5, model_complexity=0
)

# ── Load / train RF classifier ────────────────────────────────────────────────
MODEL_FILE   = os.path.join(BASE, "rf_model.pkl")
CLASSES_FILE = os.path.join(BASE, "rf_classes.txt")
DATA_FILE    = os.path.join(BASE, "landmark_data.npz")
clf, classes = None, []

def load_classifier():
    global clf, classes
    import pickle
    if os.path.exists(MODEL_FILE) and os.path.exists(CLASSES_FILE):
        with open(MODEL_FILE, "rb") as f: clf = pickle.load(f)
        # Force single-threaded prediction to avoid joblib/asyncio conflict
        if hasattr(clf, 'n_jobs'): clf.n_jobs = 1
        if hasattr(clf, 'named_steps'):
            for step in clf.named_steps.values():
                if hasattr(step, 'n_jobs'): step.n_jobs = 1
        with open(CLASSES_FILE) as f: classes = [l.strip() for l in f if l.strip()]
        print(f"[server] RF loaded: {len(classes)} classes")
        return True
    return False

def train_classifier():
    global clf, classes
    import pickle
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.model_selection import train_test_split
    print("[server] Training RF from landmark_data.npz ...")
    d = np.load(DATA_FILE, allow_pickle=True)
    X, y, classes[:] = d["X"].astype(np.float32), d["y"].astype(np.int32), list(d["classes"])
    Xtr, Xv, ytr, yv = train_test_split(X, y, test_size=0.15, random_state=42, stratify=y)
    clf = RandomForestClassifier(n_estimators=200, n_jobs=-1, random_state=42)
    clf.fit(Xtr, ytr)
    print(f"[server] RF accuracy: {clf.score(Xv,yv)*100:.1f}%  classes: {len(classes)}")
    with open(MODEL_FILE, "wb") as f: pickle.dump(clf, f)
    with open(CLASSES_FILE, "w") as f: f.writelines(c+"\n" for c in classes)

if not load_classifier():
    if os.path.exists(DATA_FILE): train_classifier()
    else: print("[server] WARNING: No model. Run extract_landmarks.py first.")

# ── Feature extraction ────────────────────────────────────────────────────────
def normalize_landmarks(lm):
    """
    Scale-invariant normalization matching extract_landmarks.py:
    1. Translate wrist to origin
    2. Scale by wrist-to-middle-MCP (landmark 9) distance
    """
    pts = np.array([[p.x, p.y] for p in lm], dtype=np.float32)
    pts -= pts[0]
    scale = np.linalg.norm(pts[9])
    if scale > 0.001:
        pts /= scale
    return pts.flatten().astype(np.float32)

def process_frame(frame_b64: str):
    _, enc = frame_b64.split(",", 1)
    frame  = cv2.imdecode(np.frombuffer(base64.b64decode(enc), np.uint8), cv2.IMREAD_COLOR)
    if frame is None: return {}, None

    res = hands_detector.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
    if not (res.multi_hand_landmarks and res.multi_handedness):
        return {}, None

    landmarks = {}
    features_list = []

    for hand_lm, handedness in zip(res.multi_hand_landmarks, res.multi_handedness):
        lm    = hand_lm.landmark
        label = handedness.classification[0].label  # "Left" or "Right"
        pts   = [[p.x, p.y] for p in lm]
        key   = "right_hand" if label == "Right" else "left_hand"
        landmarks[key] = pts
        features_list.append(normalize_landmarks(lm))

    # Use first detected hand for prediction (most confident)
    feat = features_list[0] if features_list else None
    return landmarks, feat

def predict(feat):
    if clf is None or feat is None: return "", 0.0
    import warnings
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        probs = clf.predict_proba([feat])[0]
    idx = int(np.argmax(probs))
    return classes[idx], float(probs[idx])

# ── FastAPI ───────────────────────────────────────────────────────────────────
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from collections import Counter

app = FastAPI(title="SignBridge")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
if os.path.exists(ISL_IMGS):
    app.mount("/isl-images", StaticFiles(directory=ISL_IMGS), name="isl-images")

@app.get("/api/health")
def health(): return {"status":"ok","model":"rf_landmark" if clf else "none","classes":len(classes)}

@app.get("/api/actions")
def get_actions(): return {"actions":classes,"model_loaded":clf is not None,"model_type":"rf_landmark"}

@app.get("/api/library")
def get_library():
    result = []
    for folder, cat in [("Alphabets","Alphabet"),("BasicWords","Word"),("Number","Number")]:
        p = os.path.join(ISL_IMGS, folder)
        if not os.path.exists(p): continue
        for sign in sorted(os.listdir(p)):
            sp = os.path.join(p, sign)
            if not os.path.isdir(sp): continue
            imgs = sorted(os.listdir(sp))
            if not imgs: continue
            result.append({"name":sign,"category":cat,"folder":folder,
                           "image":f"/isl-images/{folder}/{sign}/{imgs[min(5,len(imgs)-1)]}",
                           "total_images":len(imgs)})
    return {"signs": result}

# ── WebSocket ─────────────────────────────────────────────────────────────────
CONF_THRESH = 0.40  # lower threshold — RF on wrist-relative features
SMOOTH      = 3     # need same label 2/3 frames

@app.websocket("/ws")
async def ws_endpoint(ws: WebSocket):
    await ws.accept()
    history = []

    try:
        while True:
            data = await ws.receive_text()
            # process_frame in thread (mediapipe), predict synchronously (no joblib warning)
            landmarks, feat = await asyncio.to_thread(process_frame, data)
            label, conf     = predict(feat)  # synchronous — <1ms, no thread needed

            # No hand → clear and send empty
            if not landmarks:
                history.clear()
                await ws.send_text(json.dumps({
                    "prediction":"","confidence":0.0,
                    "buffering":1,"buffer_needed":1,
                    "landmarks":{},"hand_detected":False
                }))
                continue

            # Smooth: need same label 3/5 frames
            history.append(label if conf >= CONF_THRESH else "")
            if len(history) > SMOOTH: history.pop(0)
            top_label, top_count = Counter(history).most_common(1)[0]
            final = top_label if top_count >= 2 and top_label else ""

            await ws.send_text(json.dumps({
                "prediction": final,
                "confidence": round(conf, 3),
                "buffering":  1, "buffer_needed": 1,
                "landmarks":  landmarks,
                "hand_detected": True
            }))

    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"[ws] {e}")
        import traceback; traceback.print_exc()

if __name__ == "__main__":
    import uvicorn
    print(f"\n{'='*50}\nSignBridge | RF Landmark | {len(classes)} classes\nhttp://localhost:8000\n{'='*50}\n")
    uvicorn.run(app, host="0.0.0.0", port=8000, ws_max_size=10*1024*1024)
