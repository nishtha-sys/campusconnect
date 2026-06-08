// api/_firebase.js — Firebase Admin init for Vercel Serverless Functions
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Vercel serverless functions can be warm (reused) or cold (fresh start).
// We use a module-level singleton so we only init once per warm instance.
let _db = null;

export function getDb() {
  if (_db) return _db;

  if (!getApps().length) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!raw) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT env var is not set. Add it in Vercel → Settings → Environment Variables.');
    }

    let serviceAccount;
    try {
      serviceAccount = JSON.parse(raw);
    } catch {
      throw new Error('FIREBASE_SERVICE_ACCOUNT is not valid JSON. Make sure you pasted the entire service account key as a single-line JSON string.');
    }

    // Firebase private keys stored in env vars often have escaped newlines \\n
    // We need to unescape them back to real newlines for the JWT to work.
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    initializeApp({ credential: cert(serviceAccount) });
  }

  _db = getFirestore();
  return _db;
}
