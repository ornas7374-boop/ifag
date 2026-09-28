import type { AssistantMessage } from "@/lib/ai/types";
import { ar } from "@/lib/content/ar";

/**
 * نص النسخ = الإجابة + قائمة المصادر بروابطها، حتى لا تنتقل المعلومة
 * منفصلة عن مصدرها عند لصقها في مكان آخر.
 */
export function buildCopyText(message: AssistantMessage) {
  const body = message.parts
    .map((p) => (p.type === "quote" ? p.text.split("\n").map((l) => `> ${l}`).join("\n") : p.text))
    .map((t) => t.trim())
    .filter(Boolean)
    .join("\n\n");

  if (message.sources.length === 0) return body;

  const sources = message.sources
    .map((s, i) => `${i + 1}. ${s.title} — ${s.sourceLabel}\n   ${s.url}`)
    .join("\n");
  return `${body}\n\n${ar.chat.copySourcesHeading}\n${sources}`;
}
