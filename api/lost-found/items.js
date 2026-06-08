// api/lost-found/items.js — GET /api/lost-found/items?type=&category=
import { getDb } from '../_firebase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const db = getDb();
    const { type, category } = req.query;

    // Fetch all items ordered by created_at — simple single-field query, no index needed.
    // Filter in JS to avoid Firestore composite index requirement.
    const snap = await db.collection('lost_found').orderBy('created_at', 'desc').get();
    let items = snap.docs.map((d) => d.data());

    if (type) {
      items = items.filter((item) => item.type === type);
    }
    if (category && category !== 'All') {
      items = items.filter((item) => item.category === category);
    }

    return res.status(200).json({ items });
  } catch (err) {
    console.error('items error:', err);
    return res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
}
