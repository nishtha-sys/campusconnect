// api/notes/all.js — GET /api/notes/all
import { getDb } from '../_firebase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const db = getDb();
    const snap = await db.collection('notes').orderBy('created_at', 'desc').get();
    const notes = snap.docs.map((d) => d.data());
    return res.status(200).json({ notes });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
