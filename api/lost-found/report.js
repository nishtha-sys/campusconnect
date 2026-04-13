// api/lost-found/report.js — POST /api/lost-found/report
import { getDb } from '../_firebase.js';
import { tagLostItem, matchLostItem } from '../_gemini.js';
import { randomUUID } from 'crypto';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { type, description, location, contact } = req.body;
    if (!type || !description || !location || !contact) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = getDb();
    const category = await tagLostItem(description);

    const itemData = {
      id: randomUUID(),
      type,
      description,
      location,
      contact,
      category,
      status: 'open',
      created_at: new Date().toISOString(),
    };

    await db.collection('lost_found').doc(itemData.id).set(itemData);

    let matches = [];
    if (type === 'lost') {
      const snap = await db
        .collection('lost_found')
        .where('type', '==', 'found')
        .where('status', '==', 'open')
        .get();
      const foundItems = snap.docs.map((d) => d.data());
      matches = await matchLostItem(description, foundItems);
    }

    return res.status(200).json({ message: 'Item reported successfully', item: itemData, ai_matches: matches });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
