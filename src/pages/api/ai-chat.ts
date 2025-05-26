import type { NextApiRequest, NextApiResponse } from 'next';

const apiKey = process.env.OPENROUTER_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { messages } = req.body;
  if (!messages) return res.status(400).json({ error: 'No messages provided' });

  try {
    const apiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-prover-v2:free',
        messages: [
          { role: 'system', content: 'Sen bir psikolojik destek ve motivasyon asistanısın. Kullanıcıya empatik, motive edici, pozitif ve kısa cevaplar ver. Gerekirse öneri ve tavsiye de sun.' },
          ...messages,
        ],
        max_tokens: 300,
        temperature: 0.8,
      }),
    });
    const data = await apiRes.json();
    console.log("OpenRouter yanıtı:", data);
    if (data.error) {
      return res.status(500).json({ error: data.error.message || 'OpenRouter API hatası' });
    }
    const reply = data.choices?.[0]?.message?.content || 'Bir hata oluştu.';
    res.status(200).json({ reply });
  } catch (e) {
    console.error("OpenRouter API hatası:", e);
    res.status(500).json({ error: e instanceof Error ? e.message : 'OpenRouter API hatası' });
  }
} 