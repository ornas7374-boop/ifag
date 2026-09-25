import { NextResponse } from "next/server";

/**
 * وسيط بين المتصفح و Claude API.
 * المفتاح يُقرأ هنا على الخادم فقط — لا يحمل البادئة NEXT_PUBLIC_
 * لذلك لا يُضمَّن في أي حزمة ترسل إلى المتصفح.
 */

type ChatMessage = { role: "user" | "assistant"; content: string };

const MAX_MESSAGES = 50;
const MAX_CHARS = 8000;

function isValidMessages(value: unknown): value is ChatMessage[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.length <= MAX_MESSAGES &&
    value.every(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0 &&
        m.content.length <= MAX_CHARS,
    ) &&
    value[value.length - 1].role === "user"
  );
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "الخادم غير مهيأ: أضف ANTHROPIC_API_KEY في ملف .env.local" },
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "طلب غير صالح." }, { status: 400 });
  }

  const messages = (body as { messages?: unknown })?.messages;
  if (!isValidMessages(messages)) {
    return NextResponse.json(
      { error: "الرسالة فارغة أو طويلة جدًا." },
      { status: 400 },
    );
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5",
        max_tokens: 2048,
        messages,
      }),
      signal: AbortSignal.timeout(60_000),
    });

    if (!res.ok) {
      console.error("Claude API error", res.status, await res.text());
      const error =
        res.status === 401
          ? "مفتاح API غير صحيح."
          : res.status === 429
            ? "تم تجاوز حد الطلبات. حاول بعد قليل."
            : "تعذر الحصول على رد من الذكاء الاصطناعي.";
      return NextResponse.json({ error }, { status: 502 });
    }

    const data = (await res.json()) as {
      content?: { type: string; text?: string }[];
    };
    const reply = (data.content ?? [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();

    if (!reply) {
      return NextResponse.json({ error: "وصل رد فارغ." }, { status: 502 });
    }
    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Claude API request failed", err);
    const timedOut = err instanceof Error && err.name === "TimeoutError";
    return NextResponse.json(
      {
        error: timedOut
          ? "انتهت مهلة الانتظار. حاول مرة أخرى."
          : "تعذر الاتصال بخدمة الذكاء الاصطناعي.",
      },
      { status: 502 },
    );
  }
}
