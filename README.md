# CampusConnect — Vercel Edition

> AI-powered campus utilities: Lost & Found matching + Notes sharing.
> Fully serverless — runs entirely on Vercel + Firebase.

---

## Stack

| Layer      | Technology                                 |
|------------|---------------------------------------------|
| Frontend   | React 18 + Vite + Tailwind CSS              |
| Auth       | Firebase Auth (Google Sign-In)              |
| Database   | Firebase Firestore                          |
| AI         | Gemini 1.5 Flash (via REST API)             |
| Backend    | Vercel Serverless Functions (Node.js 20)    |
| Hosting    | Vercel                                      |

---

## Project Structure

```
campusconnect/
├── api/                          ← Vercel serverless functions
│   ├── _firebase.js              ← Shared Firebase Admin init
│   ├── _gemini.js                ← Shared Gemini AI helper
│   ├── lost-found/
│   │   ├── report.js             ← POST  /api/lost-found/report
│   │   ├── items.js              ← GET   /api/lost-found/items
│   │   └── resolve.js            ← PATCH /api/lost-found/resolve?id=
│   └── notes/
│       ├── upload.js             ← POST  /api/notes/upload
│       ├── search.js             ← GET   /api/notes/search
│       ├── all.js                ← GET   /api/notes/all
│       └── download.js           ← PATCH /api/notes/download?id=
├── src/                          ← React frontend
│   ├── firebase/config.js        ← Firebase client config
│   ├── api.js                    ← All frontend API calls
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── LostFound.jsx
│   │   └── Notes.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── vercel.json                   ← Vercel routing config
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## Deploying to Vercel

### 1. Clone and install

```bash
git clone <your-repo>
cd campusconnect
npm install
```

### 2. Set up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com) → your project
2. Enable **Google Sign-In** under Authentication → Sign-in methods
3. Enable **Firestore Database** (start in test mode for development)
4. Go to **Project Settings → Service Accounts → Generate new private key**
   - Download the JSON file — you'll need its contents as an env var

### 3. Get a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key

### 4. Deploy to Vercel

```bash
npm install -g vercel
vercel
```

### 5. Set Environment Variables in Vercel

In your Vercel project dashboard → **Settings → Environment Variables**, add:

| Variable                  | Value                                          |
|---------------------------|------------------------------------------------|
| `GEMINI_API_KEY`          | Your Gemini API key from AI Studio             |
| `FIREBASE_SERVICE_ACCOUNT`| The entire JSON from your service account key (as a single-line string) |

**How to format `FIREBASE_SERVICE_ACCOUNT`:**
```bash
# On Mac/Linux — prints the JSON as one line you can paste
cat serviceAccountKey.json | jq -c .
```

> ⚠️ Never commit your service account JSON to git. Add it only as a Vercel env var.

### 6. Redeploy

```bash
vercel --prod
```

---

## Local Development

```bash
# Install Vercel CLI
npm install -g vercel

# Create .env.local with your env vars
cat > .env.local << 'EOF'
GEMINI_API_KEY=your_key_here
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
EOF

# Run with Vercel dev (runs both frontend + serverless functions)
vercel dev
```

> Use `vercel dev` instead of `vite` — it emulates the serverless functions locally.

---

## Key Changes from Original (Python FastAPI)

| Before                         | After                                      |
|--------------------------------|--------------------------------------------|
| Python FastAPI backend         | Node.js Vercel Serverless Functions        |
| `uvicorn` server               | No server — Vercel handles everything      |
| `firebase-admin` Python SDK    | `firebase-admin` Node.js SDK               |
| `google-generativeai` Python   | Gemini REST API via `fetch`                |
| `serviceAccountKey.json` file  | `FIREBASE_SERVICE_ACCOUNT` env variable    |
| `http://localhost:8000/api`    | `/api` (same-origin, works on Vercel)      |
| FormData multipart requests    | JSON request bodies                        |
| `requirements.txt`             | `package.json` only                        |

---

## Firestore Indexes

For the items/notes queries to work with ordering, you may need to create composite indexes in Firestore. Firestore will show you an error link in the Vercel function logs — click it to auto-create the index.

Collections used:
- `lost_found` — fields: `type`, `status`, `category`, `created_at`
- `notes` — fields: `created_at`

---

## License

MIT
