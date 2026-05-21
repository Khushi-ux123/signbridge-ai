"""
Extract hand landmarks with augmentation to improve live camera accuracy.
Run: isl_translator/mp_env/Scripts/python isl_translator/extract_landmarks.py
"""
import os, warnings
warnings.filterwarnings("ignore")
import numpy as np
import cv2
import mediapipe as mp

BASE     = os.path.dirname(os.path.abspath(__file__))
ROOT     = os.path.dirname(BASE)
SRC_BASE = os.path.join(ROOT, "Indian Sign Languge Images")
OUT_FILE = os.path.join(BASE, "landmark_data.npz")

mp_hands = mp.solutions.hands

def normalize(lm):
    """
    Normalize landmarks:
    1. Translate wrist to origin
    2. Scale by hand size (distance wrist to middle finger MCP = landmark 9)
    This makes features scale-invariant for any hand distance from camera.
    """
    pts = np.array([[p.x, p.y] for p in lm], dtype=np.float32)
    # Center on wrist
    pts -= pts[0]
    # Scale by wrist-to-middle-MCP distance
    scale = np.linalg.norm(pts[9])
    if scale > 0.001:
        pts /= scale
    return pts.flatten()

def augment(pts_flat, n=5):
    """Generate augmented versions by adding noise."""
    pts = pts_flat.reshape(21, 2)
    augmented = [pts_flat]
    for _ in range(n):
        noise = np.random.normal(0, 0.02, pts.shape).astype(np.float32)
        aug = pts + noise
        augmented.append(aug.flatten())
    return augmented

X, y, classes = [], [], []
np.random.seed(42)

with mp_hands.Hands(
    static_image_mode=True, max_num_hands=1,
    min_detection_confidence=0.3, model_complexity=1  # higher quality
) as hands:
    for cat in ["Alphabets", "BasicWords", "Number"]:
        cat_path = os.path.join(SRC_BASE, cat)
        if not os.path.exists(cat_path): continue
        for sign in sorted(os.listdir(cat_path)):
            sign_path = os.path.join(cat_path, sign)
            if not os.path.isdir(sign_path): continue
            if sign not in classes: classes.append(sign)
            label = classes.index(sign)
            imgs = sorted(os.listdir(sign_path))
            ok = fail = 0
            for img_name in imgs:
                frame = cv2.imread(os.path.join(sign_path, img_name))
                if frame is None: fail += 1; continue

                # Try original + flipped (simulate both hands)
                for img in [frame, cv2.flip(frame, 1)]:
                    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                    result = hands.process(rgb)
                    if result.multi_hand_landmarks:
                        feat = normalize(result.multi_hand_landmarks[0].landmark)
                        # Add original + augmented versions
                        for aug_feat in augment(feat, n=3):
                            X.append(aug_feat)
                            y.append(label)
                        ok += 1
                        break
                else:
                    fail += 1

            print(f"  {cat}/{sign}: {ok} ok ({ok*4} with aug), {fail} no-hand")

X = np.array(X, dtype=np.float32)
y = np.array(y, dtype=np.int32)
print(f"\nTotal: {len(X)} samples, {len(classes)} classes")
np.savez(OUT_FILE, X=X, y=y, classes=np.array(classes))
print(f"Saved: {OUT_FILE}")
