// api/_gemini.js — Gemini AI helper (uses gemini-2.0-flash, more quota-friendly)

const GEMINI_MODEL = 'gemini-2.0-flash';

export async function askGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not set — AI features disabled');
    return 'AI not available';
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 512 },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('Gemini API error:', res.status, err?.error?.message ?? '');
      return 'AI not available';
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'AI not available';
  } catch (e) {
    console.error('Gemini fetch error:', e);
    return 'AI not available';
  }
}

export async function summarizeNotes(text) {
  const prompt = `Summarize these notes in 2-3 sentences and give 3-5 short tags.

Reply ONLY in this exact format (no extra text):
SUMMARY: your summary here
TAGS: tag1, tag2, tag3

Notes:
${text.slice(0, 4000)}`; // limit input to avoid token waste

  const result = await askGemini(prompt);
  if (result === 'AI not available') {
    return { summary: text.slice(0, 150) + '…', tags: ['general'] };
  }

  try {
    const summaryMatch = result.match(/SUMMARY:\s*(.+?)(?=\nTAGS:|$)/s);
    const tagsMatch = result.match(/TAGS:\s*(.+)/s);
    const summary = summaryMatch?.[1]?.trim() ?? text.slice(0, 150);
    const tags = tagsMatch?.[1]?.trim().split(',').map((t) => t.trim().toLowerCase()).filter(Boolean) ?? ['general'];
    return { summary, tags };
  } catch {
    return { summary: result.slice(0, 200), tags: ['general'] };
  }
}

export async function tagLostItem(description) {
  const CATEGORIES = ['Electronics', 'Books & Notes', 'Clothing', 'ID & Cards', 'Keys', 'Bags', 'Other'];
  const prompt = `Categorize this lost/found campus item into EXACTLY ONE of these categories: ${CATEGORIES.join(', ')}.

Item: "${description}"
Reply with only the category name, nothing else.`;

  const result = await askGemini(prompt);
  return CATEGORIES.find((c) => result.includes(c)) ?? 'Other';
}

export async function matchLostItem(description, foundItems) {
  if (!foundItems.length) return [];

  const prompt = `A student lost: "${description}"

Items recently found on campus:
${foundItems.map((item, n) => `${n + 1}. "${item.description}" at ${item.location}`).join('\n')}

Which of the found items above could be the same item? Reply with ONLY the numbers (comma-separated, e.g. "1, 3") of matching items, or reply "none" if there are no likely matches.`;

  const result = await askGemini(prompt);
  if (!result || result.toLowerCase().includes('none')) return [];

  const indices = result.match(/\d+/g)?.map(Number) ?? [];
  return indices.map((i) => foundItems[i - 1]).filter(Boolean);
}
