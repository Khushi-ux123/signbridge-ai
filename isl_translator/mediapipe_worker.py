"""
MediaPipe worker — isolated process (no TensorFlow).
Reads base64 JPEG frames from stdin.
Writes JSON to stdout: { keypoints, landmarks }
landmarks = { left_hand: [[x,y],...], right_hand: [[x,y],...], pose: [[x,y],...] }
"""
import sys, json, base64
import numpy as np
import cv2
import mediapipe as mp

mp_holistic = mp.solutions.holistic

def extract_keypoints(results):
    pose = np.array([[r.x,r.y,r.z,r.visibility] for r in results.pose_landmarks.landmark]).flatten() \
        if results.pose_landmarks else np.zeros(33*4)
    lh = np.array([[r.x,r.y,r.z] for r in results.left_hand_landmarks.landmark]).flatten() \
        if results.left_hand_landmarks else np.zeros(21*3)
    rh = np.array([[r.x,r.y,r.z] for r in results.right_hand_landmarks.landmark]).flatten() \
        if results.right_hand_landmarks else np.zeros(21*3)
    return np.concatenate([pose, lh, rh])

def extract_landmarks(results):
    """Return normalized (x,y) coords for drawing on canvas."""
    out = {}
    if results.left_hand_landmarks:
        out["left_hand"] = [[r.x, r.y] for r in results.left_hand_landmarks.landmark]
    if results.right_hand_landmarks:
        out["right_hand"] = [[r.x, r.y] for r in results.right_hand_landmarks.landmark]
    if results.pose_landmarks:
        # Only upper body: indices 0-16 (face+shoulders+arms)
        out["pose"] = [[r.x, r.y] for r in list(results.pose_landmarks.landmark)[:17]]
    return out

# MediaPipe hand connections for drawing
HAND_CONNECTIONS = [
    (0,1),(1,2),(2,3),(3,4),
    (0,5),(5,6),(6,7),(7,8),
    (0,9),(9,10),(10,11),(11,12),
    (0,13),(13,14),(14,15),(15,16),
    (0,17),(17,18),(18,19),(19,20),
    (5,9),(9,13),(13,17)
]

def main():
    with mp_holistic.Holistic(
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5,
        model_complexity=0
    ) as holistic:
        for line in sys.stdin:
            line = line.strip()
            if not line:
                continue
            try:
                if "," in line:
                    _, encoded = line.split(",", 1)
                else:
                    encoded = line

                img_bytes = base64.b64decode(encoded)
                img_array = np.frombuffer(img_bytes, dtype=np.uint8)
                frame = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

                if frame is None:
                    print(json.dumps({"error": "decode_failed"}), flush=True)
                    continue

                rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                rgb.flags.writeable = False
                results = holistic.process(rgb)

                kp = extract_keypoints(results)
                lm = extract_landmarks(results)

                print(json.dumps({
                    "keypoints": kp.tolist(),
                    "landmarks": lm,
                    "connections": {
                        "hand": HAND_CONNECTIONS
                    }
                }), flush=True)

            except Exception as e:
                print(json.dumps({"error": str(e), "keypoints": np.zeros(258).tolist(), "landmarks": {}}), flush=True)

if __name__ == "__main__":
    main()
