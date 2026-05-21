# 🤟 SignBridge AI — Real-Time Indian Sign Language Translator

A web-based application that translates **Indian Sign Language (ISL)** gestures into text in real time using computer vision and machine learning.

![SignBridge AI](ishaara_hero_section.png)

---

## ✨ Features

- 🎥 **Live Translator** — Real-time ISL gesture recognition via webcam
- 🖐️ **Hand Landmark Overlay** — Live skeleton drawn on camera feed (both hands)
- 📚 **ISL Library** — Interactive flip-card dictionary with 56 real ISL signs
- 🎓 **Learn Academy** — Structured modules with Learn & Quiz modes
- 📊 **Dashboard** — Live model stats and system health
- 🔊 **Text-to-Speech** — Detected signs spoken aloud

---

## 🧠 How It Works

1. Browser captures webcam frames at 10fps via WebSocket
2. **MediaPipe Hands** extracts 21 hand landmarks per hand
3. Landmarks normalized (wrist-relative, scale-invariant)
4. **Random Forest classifier** predicts sign in <5ms
5. Prediction + landmarks sent back to browser
6. Canvas overlay draws hand skeleton in real time

---

## 🗂️ Supported Signs (56 classes)

| Category | Signs |
|---|---|
| Alphabets | A–Z (26 signs) |
| Numbers | 0–9 (10 signs) |
| Basic Words | Morning, Thanks, Sorry, Namaste, Good, Home, Beautiful, and more (20 signs) |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, Framer Motion |
| Backend | FastAPI, Uvicorn, WebSocket |
| Hand Detection | MediaPipe Hands 0.10.14 |
| ML Model | scikit-learn Random Forest |
| Image Processing | OpenCV |
| Speech | Web Speech API |

---

## 🚀 Setup & Run

### Prerequisites
- Python 3.11
- Node.js 18+
- Webcam

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/signbridge-ai.git
cd signbridge-ai
```

### 2. Set up the Python environment
```bash
# Create isolated env for MediaPipe
python -m venv isl_translator/mp_env
isl_translator/mp_env/Scripts/pip install mediapipe==0.10.14 opencv-python numpy scikit-learn fastapi "uvicorn[standard]" python-multipart
```

### 3. Extract landmarks & train model
```bash
# Extract hand landmarks from dataset images (~15 min)
isl_translator/mp_env/Scripts/python isl_translator/extract_landmarks.py

# Train Random Forest classifier (~5 min)
isl_translator/mp_env/Scripts/python isl_translator/retrain_model.py
```

### 4. Start the backend
```bash
isl_translator/mp_env/Scripts/python isl_translator/fast_server.py
```

### 5. Start the frontend
```bash
cd isl_translator/frontend
npm install
npm run dev
```

### 6. Open in browser
```
http://localhost:5173
```

---

## 📁 Project Structure

```
signbridge-ai/
├── isl_translator/
│   ├── fast_server.py          # FastAPI WebSocket server
│   ├── mediapipe_worker.py     # MediaPipe subprocess worker
│   ├── extract_landmarks.py    # Landmark extraction from images
│   ├── retrain_model.py        # Model training script
│   ├── data_collection.py      # Collect new training data
│   ├── rf_classes.txt          # Class labels
│   └── frontend/               # React application
│       ├── src/
│       │   ├── pages/          # Home, Translate, Library, Learn, Dashboard
│       │   └── components/     # Navbar, Footer, PageWrapper, etc.
│       └── package.json
├── Indian Sign Languge Images/ # Training dataset (not in repo)
└── README.md
```

---

## 📊 Model Performance

| Metric | Value |
|---|---|
| Classes | 56 |
| Training Samples | ~12,000 |
| Algorithm | Random Forest (200 trees) |
| Inference Speed | <5ms per frame |
| Frame Rate | 10 fps |

---

## 🔮 Future Scope

- Dynamic sign recognition using LSTM for motion-based gestures
- Sentence-level ISL recognition
- Mobile app using TensorFlow Lite
- Text-to-ISL animation

---

## 👥 Team

**Team VNRR** — Mumbai, Maharashtra, India

---

## 📄 License

MIT License
