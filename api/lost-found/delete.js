// api/lost-found/delete.js — DELETE /api/lost-found/delete?id=
// Admin can delete anything. Reporter can delete their own item.
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
    // 1. Verify Firebase ID token from Authorization header
    const authHeader = req.headers.authorization ?? '';
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!idToken) return res.status(401).json({ error: 'Missing auth token' });

    const decoded = await getAuth().verifyIdToken(idToken);
    const callerEmail = decoded.email;

    // 2. Fetch the item
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Missing item id' });

    const db = getDb();
    const docRef = db.collection('lost_found').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Item not found' });

    const item = doc.data();

    // 3. Allow if admin OR if caller is the reporter
    const isAdmin = callerEmail === ADMIN_EMAIL;
    const isReporter = item.contact === callerEmail;

    if (!isAdmin && !isReporter) {
      return res.status(403).json({ error: 'Not allowed to delete this item' });
    }

    await docRef.delete();
    return res.status(200).json({ message: 'Item deleted' });

  } catch (err) {
    console.error('delete error:', err);
    return res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
}