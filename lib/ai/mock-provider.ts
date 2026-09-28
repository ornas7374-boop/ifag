import {
  AIProviderError,
  type AIProvider,
  type AskInput,
  type MessagePart,
  type Source,
  type StreamEvent,
} from "./types";

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
 */

const PLACEHOLDER_SOURCES: Source[] = [
  {
    id: "mock-source-1",
    title: "[عنوان الصفحة الأولى]",
    sourceLabel: "[اسم الموقع]",
    volume: null,
    page: null,
    url: "https://example.com/source-1",
  },
  {
    id: "mock-source-2",
    title: "[عنوان الصفحة الثانية]",
    sourceLabel: "[اسم الموقع]",
    volume: null,
    page: null,
    url: "https://example.com/source-2",
  },
];

/** رد تجريبي يستعرض كل أنواع الأجزاء وعناصر الـ Markdown المدعومة. */
const PLACEHOLDER_PARTS: MessagePart[] = [
  {
    type: "text",
    text: "**[إجابة تجريبية]** ستظهر هنا إجابة سَنَد عن سؤالك، مجمّعة من المصادر.",
  },
  {
    type: "quote",
    sourceId: "mock-source-1",
    text: "[اقتباس تجريبي — يظهر هنا نص منقول حرفيًا من أحد المصادر]",
  },
  {
    type: "text",
    text: [
      "### [عنوان تجريبي]",
      "",
      "- [نقطة تجريبية أولى]",
      "- [نقطة تجريبية ثانية]",
      "",
      "> [ملاحظة تجريبية بصيغة اقتباس]",
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
    if (question.includes("#religious")) {
      yield { type: "out-of-scope" };
      yield { type: "done" };
      return;
    }

    yield { type: "sources", sources: PLACEHOLDER_SOURCES };

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
