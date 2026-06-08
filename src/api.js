// src/api.js — All backend calls pointing to Vercel serverless functions

const BASE = '/api';

// ─── LOST & FOUND ──────────────────────────────────────────

export async function reportItem(body) {
  const res = await fetch(`${BASE}/lost-found/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function getItems(type = '', category = '') {
  const params = new URLSearchParams();
  if (type) params.set('type', type);
  if (category && category !== 'All') params.set('category', category);
  const res = await fetch(`${BASE}/lost-found/items?${params}`);
  return res.json();
}

export async function resolveItem(id) {
  const res = await fetch(`${BASE}/lost-found/resolve?id=${id}`, { method: 'PATCH' });
  return res.json();
}

// ─── NOTES ─────────────────────────────────────────────────

export async function uploadNote(body) {
  const res = await fetch(`${BASE}/notes/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function searchNotes(query = '', subject = '') {
  const params = new URLSearchParams();
  if (query) params.set('query', query);
  if (subject) params.set('subject', subject);
  const res = await fetch(`${BASE}/notes/search?${params}`);
  return res.json();
}

export async function getAllNotes() {
  const res = await fetch(`${BASE}/notes/all`);
  return res.json();
}

export async function countDownload(id) {
  await fetch(`${BASE}/notes/download?id=${id}`, { method: 'PATCH' });
}
