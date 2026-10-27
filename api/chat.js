// Proxy del chat IA: la clave de OpenAI vive solo en el servidor (OPENAI_API_KEY).
const MAX_MESSAGES = 30;
const MAX_CHARS = 4000;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const key = process.env.OPENAI_API_KEY;
  if (!key) return res.status(503).json({ error: 'not_configured' });

  const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const messages = Array.isArray(b.messages) ? b.messages.slice(-MAX_MESSAGES) : [];
  const clean = messages
    .filter((m) => m && ['system', 'user', 'assistant'].includes(m.role) && typeof m.content === 'string')
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
  if (!clean.length) return res.status(400).json({ error: 'no_messages' });

  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: clean,
        temperature: Math.min(Math.max(Number(b.temperature) || 0.7, 0), 1),
        max_tokens: Math.min(Number(b.maxTokens) || 700, 1000),
      }),
    });
    if (!r.ok) return res.status(502).json({ error: `openai_${r.status}` });
    const data = await r.json();
    return res.status(200).json({ content: data.choices?.[0]?.message?.content || '' });
  } catch {
    return res.status(502).json({ error: 'upstream' });
  }
}
