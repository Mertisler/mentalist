import { NextRequest, NextResponse } from "next/server";

const apiKey = process.env.OPENROUTER_API_KEY;

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "openrouter/auto",
      messages: [{ role: "user", content: prompt }]
    })
  });

  if (!res.ok) {
    return NextResponse.json({ cevap: "Bir hata oluştu." }, { status: 500 });
  }

  const data = await res.json();
  return NextResponse.json({ cevap: data.choices[0].message.content });
} 