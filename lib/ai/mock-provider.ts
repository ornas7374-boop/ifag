import { site } from "@/lib/site";

import {
  AIProviderError,
  type AIProvider,
  type AskInput,
  type MessagePart,
  type Source,
  type StreamEvent,
} from "./types";

/**
 * مزوّد تجريبي يحاكي الذكاء الاصطناعي (PHASE 2–6).
 *
 * قاعدة المصدر: كل ما يمثّل فتوى أو مصدرًا هنا placeholder صريح بين أقواس،
 * والرابط هو الصفحة الرئيسية للموقع الرسمي فقط (لا روابط فتاوى مختلَقة).
 *
 * أوامر الاختبار داخل نص الرسالة:
 * - `#error`      خطأ في كل محاولة.
 * - `#error-once` خطأ في المحاولة الأولى فقط، ثم تنجح إعادة المحاولة.
 * - `#nosource`   حالة "لم توجد فتوى".
 */

const PLACEHOLDER_SOURCE: Source = {
  id: "mock-source-1",
  title: "[عنوان الفتوى]",
  sourceLabel: "[اسم المصدر]",
  volume: "[الجزء]",
  page: "[الصفحة]",
  url: site.source.url,
};

/** رد تجريبي يستعرض كل أنواع الأجزاء وعناصر الـ Markdown المدعومة. */
const PLACEHOLDER_PARTS: MessagePart[] = [
  {
    type: "text",
    text: "**[سطر تمهيدي تجريبي]** يظهر هنا عند الحاجة، قبل نص الفتوى.",
  },
  {
    type: "quote",
    sourceId: PLACEHOLDER_SOURCE.id,
    text: "[إجابة تجريبية — ستُعرض هنا فتوى الشيخ ابن باز بنصها ورابطها]",
  },
  {
    type: "text",
    text: [
      "### [عنوان تجريبي]",
      "",
      "- [نقطة تجريبية أولى]",
      "- [نقطة تجريبية ثانية]",
      "",
      "> [اقتباس تجريبي لعرض التنسيق]",
    ].join("\n"),
  },
];

export type MockProviderOptions = {
  /** التأخير قبل أول حدث (محاكاة البحث). */
  firstEventDelayMs?: number;
  /** التأخير بين أجزاء البث. */
  chunkDelayMs?: number;
};

export class MockProvider implements AIProvider {
  private readonly firstEventDelayMs: number;
  private readonly chunkDelayMs: number;
  private readonly failedOnce = new Set<string>();

  constructor({ firstEventDelayMs = 900, chunkDelayMs = 45 }: MockProviderOptions = {}) {
    this.firstEventDelayMs = firstEventDelayMs;
    this.chunkDelayMs = chunkDelayMs;
  }

  async *ask({ messages, signal }: AskInput): AsyncIterable<StreamEvent> {
    const last = messages.at(-1);
    const question = last?.role === "user" ? last.content : "";

    await sleep(this.firstEventDelayMs, signal);

    if (question.includes("#error-once") && !this.failedOnce.has(question)) {
      this.failedOnce.add(question);
      throw new AIProviderError("server", "Mock: first attempt fails");
    }
    if (question.includes("#error") && !question.includes("#error-once")) {
      throw new AIProviderError("server", "Mock: requested error");
    }
    if (question.includes("#nosource")) {
      yield { type: "no-source" };
      yield { type: "done" };
      return;
    }

    yield { type: "sources", sources: [PLACEHOLDER_SOURCE] };

    for (const part of PLACEHOLDER_PARTS) {
      yield {
        type: "part-start",
        part: part.type === "quote" ? { type: "quote", sourceId: part.sourceId } : { type: "text" },
      };
      for (const chunk of chunkWords(part.text)) {
        await sleep(this.chunkDelayMs, signal);
        yield { type: "delta", text: chunk };
      }
    }

    yield { type: "done" };
  }
}

/** يقسم النص إلى كلمات مع الإبقاء على المسافات وفواصل الأسطر. */
function chunkWords(text: string): string[] {
  return text.match(/\S+\s*/g) ?? [];
}

function sleep(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) return reject(abortError());
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(abortError());
    };
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

function abortError() {
  return new DOMException("Aborted", "AbortError");
}
