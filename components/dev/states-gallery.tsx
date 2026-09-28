"use client";

import { AssistantMessage, UserMessage } from "@/components/chat/messages";
import { ChatSkeleton, SidebarListSkeleton } from "@/components/chat/skeletons";
import { LONG_PARTS, LONG_SOURCES, PLACEHOLDER_PARTS, PLACEHOLDER_SOURCES } from "@/lib/ai/mock-fixtures";
import type { AIErrorKind, AssistantMessage as Msg, MessagePart } from "@/lib/ai/types";

const T = 0;
const assistant = (id: string, overrides: Partial<Msg>): Msg => ({
  id,
  role: "assistant",
  parts: PLACEHOLDER_PARTS,
  sources: PLACEHOLDER_SOURCES,
  status: "done",
  createdAt: T,
  ...overrides,
});
const partial: MessagePart[] = [
  PLACEHOLDER_PARTS[0],
  { ...PLACEHOLDER_PARTS[1], text: PLACEHOLDER_PARTS[1].text.split(" ").slice(0, 4).join(" ") } as MessagePart,
];
const errorKinds: AIErrorKind[] = ["network", "timeout", "server", "unknown"];
const noop = () => {};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-border pt-8">
      <h2 className="mb-6 text-sm font-semibold text-text-subtle">{title}</h2>
      <div className="space-y-8">{children}</div>
    </section>
  );
}

export function StatesGallery() {
  return (
    <main className="mx-auto max-w-reading space-y-10 px-4 py-10 sm:px-6">
      <header>
        <h1 className="text-2xl font-bold text-text">حالات الواجهة</h1>
        <p className="mt-2 text-sm text-text-muted">صفحة تطوير فقط — كل حالات المحادثة ببيانات placeholder.</p>
      </header>

      <Section title="تحميل المحادثات (skeleton)">
        <div className="rounded-lg border border-border">
          <ChatSkeleton />
        </div>
        <div className="w-72 rounded-lg border border-border bg-surface-muted/50">
          <SidebarListSkeleton />
        </div>
      </Section>

      <Section title="انتظار أول جزء (typing indicator)">
        <AssistantMessage message={assistant("wait", { parts: [], status: "streaming" })} onRetry={noop} canRetry={false} />
      </Section>

      <Section title="أثناء البث">
        <AssistantMessage message={assistant("stream", { parts: partial, status: "streaming" })} onRetry={noop} canRetry={false} />
      </Section>

      <Section title="إجابة مكتملة مع مصدرين وزر النسخ">
        <AssistantMessage message={assistant("done", {})} onRetry={noop} canRetry />
      </Section>

      <Section title="أُوقف التوليد">
        <AssistantMessage message={assistant("stopped", { parts: partial, status: "stopped" })} onRetry={noop} canRetry />
      </Section>

      <Section title="الأخطاء (رسالة مختلفة لكل نوع)">
        {errorKinds.map((kind) => (
          <AssistantMessage
            key={kind}
            message={assistant(`err-${kind}`, { parts: [], sources: [], status: "error", errorKind: kind })}
            onRetry={noop}
            canRetry
          />
        ))}
      </Section>

      <Section title="لم أجد مصادر / خارج الاختصاص">
        <AssistantMessage message={assistant("nosrc", { parts: [], sources: [], status: "no-source" })} onRetry={noop} canRetry />
        <AssistantMessage message={assistant("oos", { parts: [], sources: [], status: "out-of-scope" })} onRetry={noop} canRetry />
      </Section>

      <Section title="رسالة مستخدم طويلة، وكلمة ورابط طويلان بلا مسافات">
        <UserMessage
          message={{
            id: "u-long",
            role: "user",
            createdAt: T,
            content:
              "[سؤال تجريبي طويل] " +
              "هذه رسالة طويلة لاختبار التفاف النص داخل الفقاعة دون كسر التخطيط. ".repeat(6) +
              "\nكلمة_طويلة_جدا_بلا_مسافات_" +
              "ـ".repeat(40) +
              "\nhttps://example.com/" +
              "a-very-long-path-segment-without-any-spaces/".repeat(6),
          }}
        />
      </Section>

      <Section title="إجابة طويلة جدًا (2000+ كلمة) مع 4 مصادر">
        <AssistantMessage message={assistant("long", { parts: LONG_PARTS, sources: LONG_SOURCES })} onRetry={noop} canRetry />
      </Section>
    </main>
  );
}
