// api/notes/search.js — GET /api/notes/search?query=&subject=
import { getDb } from '../_firebase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const db = getDb();
    const { query = '', subject = '' } = req.query;

    const snap = await db.collection('notes').orderBy('created_at', 'desc').get();
    let notes = snap.docs.map((d) => d.data());

    if (query) {
      const q = query.toLowerCase();
      notes = notes.filter(
        (n) =>
          n.title?.toLowerCase().includes(q) ||
          n.subject?.toLowerCase().includes(q) ||
          n.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (subject) {
      notes = notes.filter((n) => n.subject?.toLowerCase() === subject.toLowerCase());
    }

    return res.status(200).json({ notes });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
