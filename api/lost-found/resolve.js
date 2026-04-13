// api/lost-found/resolve.js — PATCH /api/lost-found/resolve?id=
import { getDb } from '../_firebase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Missing item id' });

    const db = getDb();
    const docRef = db.collection('lost_found').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Item not found' });

    await docRef.update({ status: 'resolved' });
    return res.status(200).json({ message: 'Item marked as resolved' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
