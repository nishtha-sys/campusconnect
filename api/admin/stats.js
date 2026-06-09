// api/admin/stats.js — GET /api/admin/stats
// Admin only — returns site-wide stats
import { getDb } from '../_firebase.js';
import { getAuth } from 'firebase-admin/auth';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Verify admin token
    const authHeader = req.headers.authorization ?? '';
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!idToken) return res.status(401).json({ error: 'Missing auth token' });

    const db = getDb();
    const decoded = await getAuth().verifyIdToken(idToken);
    if (decoded.email !== ADMIN_EMAIL) {
      return res.status(403).json({ error: 'Admin only' });
    }

    // Fetch all collections in parallel
    const [notesSnap, lfSnap] = await Promise.all([
      db.collection('notes').get(),
      db.collection('lost_found').get(),
    ]);

    const notes = notesSnap.docs.map(d => d.data());
    const items = lfSnap.docs.map(d => d.data());

    // Notes stats
    const totalNotes = notes.length;
    const totalViews = notes.reduce((sum, n) => sum + (n.downloads || 0), 0);
    const uniqueUploaders = new Set(notes.map(n => n.uploader_email || n.uploader_name)).size;
    const subjectBreakdown = notes.reduce((acc, n) => {
      acc[n.subject] = (acc[n.subject] || 0) + 1;
      return acc;
    }, {});

    // Lost & Found stats
    const totalItems = items.length;
    const lostCount = items.filter(i => i.type === 'lost').length;
    const foundCount = items.filter(i => i.type === 'found').length;
    const resolvedCount = items.filter(i => i.status === 'resolved').length;
    const openCount = items.filter(i => i.status === 'open').length;
    const matchRate = totalItems > 0 ? Math.round((resolvedCount / totalItems) * 100) : 0;
    const uniqueReporters = new Set(items.map(i => i.contact)).size;

    return res.status(200).json({
      notes: { totalNotes, totalViews, uniqueUploaders, subjectBreakdown },
      lostFound: { totalItems, lostCount, foundCount, resolvedCount, openCount, matchRate, uniqueReporters },
      generatedAt: new Date().toISOString(),
    });

  } catch (err) {
    console.error('stats error:', err);
    return res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
}