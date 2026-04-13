// api/_firebase.js — shared Firebase Admin init for serverless functions
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let db;

export function getDb() {
  if (db) return db;

  if (!getApps().length) {
    // FIREBASE_SERVICE_ACCOUNT env var should be the JSON string of your service account key
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    initializeApp({ credential: cert(serviceAccount) });
  }

  db = getFirestore();
  return db;
}
