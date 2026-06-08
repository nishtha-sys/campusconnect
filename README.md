# CampusConnect — Vercel Edition

> AI-powered campus utilities: Lost & Found matching + Notes sharing.
> Fully serverless — React frontend + Vercel Serverless Functions + Firebase + Gemini AI.

---

## Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | React 18 + Vite + Tailwind CSS          |
| Auth       | Firebase Auth (Google Sign-In)          |
| Database   | Firebase Firestore                      |
| AI         | Gemini 2.0 Flash (via REST API)         |
| Backend    | Vercel Serverless Functions (Node.js 20)|
| Hosting    | Vercel                                  |

---

## Deploy to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "campusconnect vercel edition"
git remote add origin https://github.com/YOUR_USERNAME/campusconnect.git
git push -u origin main
```

### 2. Import on Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Select your repo
3. Leave all settings as default (Vercel auto-detects Vite)
4. Click Deploy — it will fail on first deploy because env vars aren't set yet, that's fine

### 3. Set Environment Variables

Go to your project on Vercel → **Settings → Environment Variables**, add:

| Variable                   | Value                                                    |
|----------------------------|----------------------------------------------------------|
| `GEMINI_API_KEY`           | Your key from [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) |
| `FIREBASE_SERVICE_ACCOUNT` | The full service account JSON as a single-line string    |

**How to get `FIREBASE_SERVICE_ACCOUNT`:**
1. Firebase Console → Project Settings → Service Accounts → Generate new private key
2. Download the JSON file
3. Open it in a text editor, select all, copy — paste the entire JSON into the Vercel env var field
4. Vercel stores it as-is; the app handles parsing

> ⚠️ Never commit the service account JSON to git. `.gitignore` already excludes it.

### 4. Redeploy

Vercel → your project → Deployments → click the latest → Redeploy.

Or push any commit and it auto-redeploys.

---

## Local Development

```bash
npm install
npm install -g vercel

# Create .env.local
echo 'GEMINI_API_KEY=your_key_here' >> .env.local
echo 'FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...paste full json...}' >> .env.local

# Run locally (emulates serverless functions)
vercel dev
# Opens on http://localhost:3000
```

---

## Firebase Setup Checklist

- [ ] Firestore Database enabled (test mode for dev)
- [ ] Authentication → Google Sign-In enabled
- [ ] `localhost` added to Authorized Domains in Firebase Auth
- [ ] Your Vercel deployment URL added to Authorized Domains after deploy

---

## Firestore Collections

| Collection   | Key Fields                                       |
|--------------|--------------------------------------------------|
| `lost_found` | id, type, description, location, contact, category, status, created_at |
| `notes`      | id, title, subject, uploader_name, raw_text, summary, tags, downloads, created_at |

No composite indexes needed — filtering is done in application code.

