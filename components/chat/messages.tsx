import { LogoMark } from "@/components/layout/logo";
import type { AssistantMessage as AssistantMessageType, UserMessage as UserMessageType } from "@/lib/ai/types";
import { hasVisibleText } from "@/lib/chat/apply-event";
import { ar } from "@/lib/content/ar";

import { Markdown } from "./markdown";
import { SourceCard } from "./source-card";
import { ErrorState, NoSourceState } from "./status-blocks";

export function UserMessage({ message }: { message: UserMessageType }) {
  return (
    <div className="flex justify-end">
      <div
        data-testid="user-message"
        aria-label={ar.chat.userLabel}
        className="max-w-[85%] rounded-lg rounded-ee-sm bg-primary-soft px-4 py-3 text-text whitespace-pre-wrap [overflow-wrap:anywhere]"
      >
        {message.content}
      </div>
    </div>
  );
}

/**
 * رد المساعد على "سلسلة الإسناد" نفسها في الشعار: الحلقة الأولى سَنَد،
 * والأخيرة بطاقة المصدر. لا يُعرض أي نص إلا ومصدره تحته.
 */
export function AssistantMessage({
  message,
  onRetry,
  canRetry,
}: {
  message: AssistantMessageType;
  onRetry: () => void;
  canRetry: boolean;
}) {
  const t = ar.chat;
  const hasText = hasVisibleText(message);
  const showSources = hasText && message.sources.length > 0;
  const isStreaming = message.status === "streaming";

  return (
    <article
      data-testid="assistant-message"
      data-status={message.status}
      aria-label={t.assistantLabel}
      aria-busy={isStreaming}
      className="grid grid-cols-[2rem_1fr] gap-x-3 sm:gap-x-4"
    >
      <div className="flex flex-col items-center">
        <LogoMark />
        {showSources && <span aria-hidden="true" className="mt-2 w-px flex-1 bg-border-strong" />}
      </div>

      <div className="min-w-0 pb-5">
        <p className="text-sm font-semibold text-primary">{t.assistantName}</p>

        <div className="mt-2 space-y-4">
          {isStreaming && !hasText && (
            <p data-testid="waiting" className="text-sm text-text-muted">
              {t.waiting}
            </p>
          )}

          {message.parts.map((part, i) =>
            part.type === "quote" ? (
              <p
                key={i}
                data-part="quote"
                className="font-naskh text-reading whitespace-pre-line text-text [overflow-wrap:anywhere] sm:text-reading-lg"
              >
                {part.text}
              </p>
            ) : (
              <div key={i} data-part="text">
                <Markdown>{part.text}</Markdown>
              </div>
            ),
          )}

          {message.status === "stopped" && (
            <p data-testid="stopped" className="text-xs text-text-subtle">
              {t.stopped}
            </p>
          )}
          {message.status === "no-source" && <NoSourceState />}
          {message.status === "error" && <ErrorState onRetry={onRetry} disabled={!canRetry} />}
        </div>
      </div>

      {showSources && (
        <>
          <div className="flex flex-col items-center">
            <span aria-hidden="true" className="h-5 w-px bg-border-strong" />
            <span aria-hidden="true" className="size-3 rounded-full bg-accent ring-4 ring-accent-soft" />
          </div>
          <div className="min-w-0 space-y-3">
            {message.sources.map((source) => (
              <SourceCard key={source.id} source={source} />
            ))}
          </div>
        </>
      )}
    </article>
  );
}
