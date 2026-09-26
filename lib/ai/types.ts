/**
 * عقد الذكاء الاصطناعي الموحّد (CLAUDE.md §4).
 *
 * الواجهة لا تعرف إلا هذا الملف: MockProvider اليوم، والمزوّد الحقيقي في
 * PHASE 8 يطبّق نفس AIProvider دون تعديل أي مكوّن.
 */

/** مصدر فتوى. الجزء والصفحة null إن لم يذكرهما المصدر — ممنوع التخمين. */
export type Source = {
  id: string;
  /** عنوان الفتوى */
  title: string;
  /** مثل: نور على الدرب / مجموع الفتاوى */
  sourceLabel: string;
  volume: string | null;
  page: string | null;
  /** رابط الصفحة الأصلية في binbaz.org.sa */
  url: string;
};

/**
 * رد المساعد مكوّن من أجزاء:
 * - `text`: نص مولَّد (سطر تمهيدي، ملخص…) يُعرض كـ Markdown.
 * - `quote`: نص الفتوى حرفيًا، مرتبط بمصدره، يُعرض كما هو بالخط النسخي.
 * الفصل بينهما يسمح في PHASE 8 بعرض نص الفتوى من قاعدة البيانات مباشرة
 * فتكون الحرفية مضمونة بالتصميم.
 */
export type MessagePart =
  | { type: "text"; text: string }
  | { type: "quote"; text: string; sourceId: string };

export type AssistantStatus = "streaming" | "done" | "stopped" | "error" | "no-source";

export type UserMessage = {
  id: string;
  role: "user";
  content: string;
  createdAt: number;
};

export type AssistantMessage = {
  id: string;
  role: "assistant";
  parts: MessagePart[];
  sources: Source[];
  status: AssistantStatus;
  /** نوع الخطأ عند status = "error" */
  errorKind?: AIErrorKind;
  createdAt: number;
};

export type ChatMessage = UserMessage | AssistantMessage;

/**
 * أحداث البث. الترتيب المتوقع:
 * sources ← (part-start ← delta…)… ← done
 * أو: no-source ← done
 * المصادر تصل أولًا حتى لا يظهر أي نص بلا مصدره، حتى لو أُوقف التوليد.
 */
export type StreamEvent =
  | { type: "sources"; sources: Source[] }
  | { type: "part-start"; part: { type: "text" } | { type: "quote"; sourceId: string } }
  | { type: "delta"; text: string }
  | { type: "no-source" }
  | { type: "done" };

export type AIErrorKind = "network" | "timeout" | "server" | "unknown";

export class AIProviderError extends Error {
  readonly kind: AIErrorKind;

  constructor(kind: AIErrorKind, message?: string) {
    super(message ?? kind);
    this.name = "AIProviderError";
    this.kind = kind;
  }
}

export type AskInput = {
  /** سجل المحادثة حتى سؤال المستخدم الأخير (شاملًا له). */
  messages: ChatMessage[];
  signal: AbortSignal;
};

export interface AIProvider {
  /**
   * يبث الرد حدثًا حدثًا. عند إلغاء `signal` يرمي DOMException باسم AbortError.
   * عند الفشل يرمي AIProviderError.
   */
  ask(input: AskInput): AsyncIterable<StreamEvent>;
}
