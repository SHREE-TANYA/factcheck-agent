export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { claim } = req.body;
  if (!claim) return res.status(400).json({ error: 'No claim provided' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'web-search-2025-03-05'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        system: 'You are a rigorous fact-checker. Use web search to verify the claim. Reply ONLY with this exact JSON (no markdown, no extra text): {"verdict":"Verified","explanation":"..."} — verdict must be exactly one of: Verified, Inaccurate, False.',
        messages: [{ role: 'user', content: `Fact-check this claim: "${claim}"` }]
      })
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });

    const txt = data.content.filter(b => b.type === 'text').map(b => b.text).join('');
    const jm = txt.match(/\{[\s\S]*?\}/);
    if (!jm) return res.status(500).json({ error: 'No JSON in response' });

    const obj = JSON.parse(jm[0]);
    return res.status(200).json({ verdict: obj.verdict || 'False', explanation: obj.explanation || 'No details.' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
