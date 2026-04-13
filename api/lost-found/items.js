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

    let query = db.collection('lost_found');
    if (type) query = query.where('type', '==', type);
    if (category && category !== 'All') query = query.where('category', '==', category);

    const snap = await query.orderBy('created_at', 'desc').get();
    const items = snap.docs.map((d) => d.data());

    return res.status(200).json({ items });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
