import { readFileSync } from 'node:fs';
const topics = JSON.parse(readFileSync(new URL('../src/data/concierge.json', import.meta.url), 'utf8'));
const origins = new Set(['https://aiscribers.com','https://www.aiscribers.com','https://aims-clinical-workspace.jasssss.chatgpt.site']);
export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (origin && !origins.has(origin)) return res.status(403).end();
  if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Cache-Control','no-store');
  res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).end();
  const turns = req.body?.turns;
  if (!Array.isArray(turns) || !turns.length || turns.length > 5 || turns.some(t => typeof t !== 'string' || !t.trim() || t.length > 800)) return res.status(400).end();
  if (!process.env.GEMINI_API_KEY) return res.status(503).end();
  try {
    const model = process.env.CONCIERGE_MODEL || 'gemini-flash-latest';
    const result = await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(model)+':generateContent',{
      method:'POST', signal:AbortSignal.timeout(6000),
      headers:{'Content-Type':'application/json','x-goog-api-key':process.env.GEMINI_API_KEY},
      body:JSON.stringify({
        systemInstruction:{parts:[{text:'Select the best website answer for the final visitor question. Use prior turns only for context. Use unknown for medical advice, internal implementation, or an unsupported claim. Return only one topic ID. Available answers: '+JSON.stringify(topics)}]},
        contents:[{role:'user',parts:[{text:JSON.stringify(turns)}]}],
        generationConfig:{temperature:0,maxOutputTokens:512}
      })
    });
    if (!result.ok) {
      const failure = await result.json().catch(() => ({}));
      console.warn('Concierge request failed', result.status, failure.error?.status, failure.error?.details?.[0]?.reason);
      return res.status(503).end();
    }
    const data = await result.json();
    const id = data.candidates?.[0]?.content?.parts?.at(-1)?.text?.trim();
    const topic = topics.find(t=>t.topic===id);
    if (!topic) return res.status(503).end();
    return res.json({topic:topic.topic});
  } catch {return res.status(503).end();}
}
