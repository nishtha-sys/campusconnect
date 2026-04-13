// api/notes/upload.js — POST /api/notes/upload
import { getDb } from '../_firebase.js';
import { summarizeNotes } from '../_gemini.js';
import { randomUUID } from 'crypto';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { title, subject, uploader_name, raw_text } = req.body;
    if (!title || !subject || !uploader_name || !raw_text?.trim()) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const aiResult = await summarizeNotes(raw_text);
    const db = getDb();

    const noteData = {
      id: randomUUID(),
      title,
      subject,
      uploader_name,
      raw_text,
      summary: aiResult.summary,
      tags: aiResult.tags,
      downloads: 0,
      created_at: new Date().toISOString(),
    };

    await db.collection('notes').doc(noteData.id).set(noteData);
    return res.status(200).json({ message: 'Notes uploaded successfully', note: noteData });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
