import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": "Bearer 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",
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