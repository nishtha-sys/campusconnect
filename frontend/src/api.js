// src/api.js — All backend calls in one place

const BASE_URL = "http://localhost:8000/api";

// ─── LOST & FOUND ───────────────────────────────────────────

export async function reportItem(formData) {
  const res = await fetch(`${BASE_URL}/lost-found/report`, {
    method: "POST",
    body: formData, // FormData handles multipart
  });
  return res.json();
}

export async function getItems(type = "", category = "") {
  const params = new URLSearchParams();
  if (type) params.append("type", type);
  if (category) params.append("category", category);
  const res = await fetch(`${BASE_URL}/lost-found/items?${params}`);
  return res.json();
}

export async function resolveItem(itemId) {
  const res = await fetch(`${BASE_URL}/lost-found/resolve/${itemId}`, {
    method: "PATCH",
  });
  return res.json();
}

// ─── NOTES ──────────────────────────────────────────────────

export async function uploadNote(formData) {
  const res = await fetch(`${BASE_URL}/notes/upload`, {
    method: "POST",
    body: formData,
  });
  return res.json();
}

export async function searchNotes(query = "", subject = "") {
  const params = new URLSearchParams();
  if (query) params.append("query", query);
  if (subject) params.append("subject", subject);
  const res = await fetch(`${BASE_URL}/notes/search?${params}`);
  return res.json();
}

export async function getAllNotes() {
  const res = await fetch(`${BASE_URL}/notes/all`);
  return res.json();
}

export async function countDownload(noteId) {
  await fetch(`${BASE_URL}/notes/download/${noteId}`, { method: "PATCH" });
}
