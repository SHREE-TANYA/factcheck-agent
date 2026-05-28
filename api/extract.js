export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'No text provided' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: 'You extract verifiable factual claims from documents. Return ONLY a raw JSON array of 5-8 strings — specific stats, dates, percentages, named facts, financial or scientific figures. No markdown, no preamble, no explanation. Just the array.',
        messages: [{ role: 'user', content: 'Extract 5-8 specific verifiable claims from this document:\n\n' + text.slice(0, 8000) }]
      })
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });

    const raw = data.content.filter(b => b.type === 'text').map(b => b.text).join('');
    const match = raw.match(/\[[\s\S]*?\]/);
    if (!match) return res.status(500).json({ error: 'Could not parse claims from response' });

    const claims = JSON.parse(match[0]);
    return res.status(200).json({ claims });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
