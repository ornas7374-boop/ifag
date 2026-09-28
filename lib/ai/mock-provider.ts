import { LONG_PARTS, LONG_SOURCES, PLACEHOLDER_PARTS, PLACEHOLDER_SOURCES } from "./mock-fixtures";
import { AIProviderError, type AIProvider, type AskInput, type StreamEvent } from "./types";

/**
 * مزوّد تجريبي يحاكي الذكاء الاصطناعي مع البحث في الإنترنت (حتى PHASE 8).
 *
 * قاعدة المصدر: كل ما يمثّل إجابة أو مصدرًا هنا placeholder صريح بين أقواس،
 * والروابط على example.com (نطاق محجوز للأمثلة) — لا روابط مختلَقة لمواقع حقيقية.
 *
 * أوامر الاختبار داخل نص الرسالة:
 * - `#error`      خطأ في كل محاولة.
 * - `#error-once` خطأ في المحاولة الأولى فقط، ثم تنجح إعادة المحاولة.
 * - `#nosource`   حالة "لم أجد مصادر كافية".
 * - `#religious`  سؤال شرعي — خارج اختصاص سَنَد.
 * - `#long`       رد طويل جدًا (2000+ كلمة) مع 4 مصادر.
 * - `#timeout`    خطأ انتهاء المهلة.  `#offline` خطأ الاتصال.
 */

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
    if (question.includes("#timeout")) throw new AIProviderError("timeout", "Mock: timeout");
    if (question.includes("#offline")) throw new AIProviderError("network", "Mock: offline");
    if (question.includes("#error") && !question.includes("#error-once")) {
      throw new AIProviderError("server", "Mock: requested error");
    }
    if (question.includes("#nosource")) {
      yield { type: "no-source" };
      yield { type: "done" };
      return;
    }
    if (question.includes("#religious")) {
      yield { type: "out-of-scope" };
      yield { type: "done" };
      return;
    }

    const long = question.includes("#long");
    yield { type: "sources", sources: long ? LONG_SOURCES : PLACEHOLDER_SOURCES };

    for (const part of long ? LONG_PARTS : PLACEHOLDER_PARTS) {
      yield {
        type: "part-start",
        part: part.type === "quote" ? { type: "quote", sourceId: part.sourceId } : { type: "text" },
      };
      // الرد الطويل يُبث بدفعات أكبر (≈40 كلمة) حتى لا يستغرق دقائق.
      for (const chunk of chunkWords(part.text, long ? 40 : 1)) {
        await sleep(this.chunkDelayMs, signal);
        yield { type: "delta", text: chunk };
      }
    }

    yield { type: "done" };
  }
}

/** يقسم النص إلى كلمات مع الإبقاء على المسافات وفواصل الأسطر. */
function chunkWords(text: string, wordsPerChunk = 1): string[] {
  const words = text.match(/\S+\s*/g) ?? [];
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += wordsPerChunk) chunks.push(words.slice(i, i + wordsPerChunk).join(""));
  return chunks;
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
