// api/notes/delete.js — DELETE /api/notes/delete?id=
// Admin only — token verified server-side
import { getDb } from '../_firebase.js';
import { getAuth } from 'firebase-admin/auth';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // 1. Verify Firebase ID token
    const authHeader = req.headers.authorization ?? '';
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!idToken) return res.status(401).json({ error: 'Missing auth token' });

    const decoded = await getAuth().verifyIdToken(idToken);
    if (decoded.email !== ADMIN_EMAIL) {
      return res.status(403).json({ error: 'Admin only' });
    }

    // 2. Delete the note
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Missing note id' });

    const db = getDb();
    const docRef = db.collection('notes').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Note not found' });

    await docRef.delete();
    return res.status(200).json({ message: 'Note deleted' });

  } catch (err) {
    console.error('delete error:', err);
    return res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
}