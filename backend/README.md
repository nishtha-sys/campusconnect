# 🎓 CampusConnect — Setup Guide

## 📁 Folder Structure

```
campusconnect/
├── backend/
│   ├── main.py                  ← FastAPI app entry point
│   ├── firebase_config.py       ← Firebase Admin SDK setup
│   ├── requirements.txt         ← Python dependencies
│   ├── .env                     ← API keys (don't commit!)
│   ├── serviceAccountKey.json   ← Firebase key (download from Firebase)
│   ├── routers/
│   │   ├── lost_found.py        ← Lost & Found API routes
│   │   └── notes.py             ← Notes API routes
│   └── services/
│       └── gemini_service.py    ← All Gemini AI logic
└── frontend/
    ├── package.json
    ├── src/
    │   ├── main.jsx             ← React entry point
    │   ├── App.jsx              ← Main app + routing
    │   ├── api.js               ← All backend API calls
    │   ├── index.css            ← Tailwind CSS
    │   ├── firebase/
    │   │   └── config.js        ← Firebase web config
    │   └── pages/
    │       ├── Login.jsx        ← Google login
    │       ├── LostFound.jsx    ← Lost & Found page
    │       └── Notes.jsx        ← Notes sharing page
```

---

## ⚙️ Step 1 — Firebase Setup (5 mins)

1. Go to https://console.firebase.google.com
2. Create a new project → call it `campusconnect`
3. Enable **Authentication** → Sign-in method → Enable **Google**
4. Create **Firestore Database** → Start in test mode
5. Create **Storage** → Start in test mode
6. Go to Project Settings → **Service Accounts** → Generate New Private Key
   → Save as `backend/serviceAccountKey.json`
7. Go to Project Settings → **Your Apps** → Add Web App
   → Copy the config into `frontend/src/firebase/config.js`

---

## 🔑 Step 2 — Gemini API Key (2 mins)

1. Go to https://aistudio.google.com/app/apikey
2. Click **Create API Key**
3. Paste it into `backend/.env`:
   ```
   GEMINI_API_KEY=your_key_here
   ```

---

## 🐍 Step 3 — Run Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate      # Mac/Linux
venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Start server
uvicorn main:app --reload --port 8000
```

✅ Backend running at: http://localhost:8000
📄 Auto API docs at: http://localhost:8000/docs

---

## ⚛️ Step 4 — Run Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

✅ Frontend running at: http://localhost:5173

---

## 🔁 Step 5 — Update Firebase Storage Bucket

In `backend/firebase_config.py`, replace:

```python
"storageBucket": "your-project-id.appspot.com"
```

with your actual Firebase project ID.

---

## 🚀 Features Summary

| Feature          | How it works                        |
| ---------------- | ----------------------------------- |
| Google Login     | Firebase Auth                       |
| Report Lost Item | POST /api/lost-found/report         |
| AI Item Matching | Gemini compares lost vs found items |
| AI Auto-Category | Gemini tags item type automatically |
| Upload Notes     | POST /api/notes/upload              |
| AI Summary       | Gemini summarizes note text         |
| AI Tags          | Gemini extracts subject tags        |
| Search Notes     | GET /api/notes/search?query=...     |

---

## 🏆 Demo Tips for Judges

1. Show Google login → instant, no signup needed
2. Report a "lost laptop" → show AI auto-categorizes it
3. Report a "found laptop" → show AI match alert appears
4. Upload notes with text → show AI summary + tags generated
5. Search notes by subject → show instant results
6. Point to `/docs` endpoint → shows auto-generated API docs (impressive!)
