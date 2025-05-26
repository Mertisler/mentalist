import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { messages } = req.body;
  if (!messages) return res.status(400).json({ error: 'No messages provided' });

  try {
    const apiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer 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`,
      },
      body: JSON.stringify({
        model: 'openrouter/auto',
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
    const reply = data.choices?.[0]?.message?.content || 'Bir hata oluştu.';
    res.status(200).json({ reply });
  } catch (e) {
    console.error("OpenRouter API hatası:", e);
    res.status(500).json({ error: 'OpenRouter API hatası' });
  }
} 