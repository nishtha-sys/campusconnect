// api/_gemini.js — Gemini AI helper
export async function askGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return 'AI not available';

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'AI not available';
  } catch (e) {
    console.error('Gemini error:', e);
    return 'AI not available';
  }
}

export async function summarizeNotes(text) {
  const prompt = `Summarize these notes and give 3-5 tags.

Reply ONLY in this format:
SUMMARY: your summary here
TAGS: tag1, tag2, tag3

Notes:
${text}`;

  const result = await askGemini(prompt);
  if (result === 'AI not available') {
    return { summary: text.slice(0, 120), tags: ['general'] };
  }

  try {
    const summary = result.split('SUMMARY:')[1].split('TAGS:')[0].trim();
    const tags = result.split('TAGS:')[1].trim().split(',').map((t) => t.trim());
    return { summary, tags };
  } catch {
    return { summary: result, tags: ['general'] };
  }
}

export async function tagLostItem(description) {
  const prompt = `Categorize this lost/found campus item into ONE of these categories: Electronics, Books & Notes, Clothing, ID & Cards, Keys, Bags, Other.

Item: "${description}"
Reply with only the category name.`;

  const result = await askGemini(prompt);
  const valid = ['Electronics', 'Books & Notes', 'Clothing', 'ID & Cards', 'Keys', 'Bags', 'Other'];
  return valid.find((c) => result.includes(c)) ?? 'Other';
}

export async function matchLostItem(description, foundItems) {
  if (!foundItems.length) return [];
  const prompt = `A user lost: "${description}"

These items were found on campus:
${foundItems.map((i, n) => `${n + 1}. "${i.description}" at ${i.location}`).join('\n')}

Reply with ONLY the numbers (comma-separated) of matching items, or "none".`;

  const result = await askGemini(prompt);
  if (result.toLowerCase().includes('none')) return [];

  const indices = result.match(/\d+/g)?.map(Number) ?? [];
  return indices.map((i) => foundItems[i - 1]).filter(Boolean);
}
