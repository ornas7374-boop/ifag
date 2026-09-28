import { CircleAlert, RotateCcw, SearchX, ShieldQuestion } from "lucide-react";

import { buttonClasses } from "@/components/ui/button";
import type { AIErrorKind } from "@/lib/ai/types";
import { ar } from "@/lib/content/ar";

/** حالة معلوماتية هادئة (لا بشكل خطأ). */
function InfoState({
  testId,
  icon: Icon,
  title,
  body,
  hint,
}: {
  testId: string;
  icon: typeof SearchX;
  title: string;
  body: string;
  hint: string;
}) {
  return (
    <div
      data-testid={testId}
      className="rounded-md border border-primary/15 bg-primary-soft p-4"
    >
      <p className="flex items-center gap-2 font-semibold text-primary">
        <Icon aria-hidden="true" className="size-4 shrink-0" />
        {title}
      </p>
      <p className="mt-2 text-text">{body}</p>
      <p className="mt-1 text-sm text-text-muted">{hint}</p>
    </div>
  );
}

/** لم توجد مصادر كافية للإجابة. */
export function NoSourceState() {
  const t = ar.chat;
  return (
    <InfoState
      testId="no-source"
      icon={SearchX}
      title={t.noSourceTitle}
      body={t.noSourceBody}
      hint={t.noSourceHint}
    />
  );
}

/** سؤال شرعي أو فتوى — خارج اختصاص سَنَد. */
export function OutOfScopeState() {
  const t = ar.chat;
  return (
    <InfoState
      testId="out-of-scope"
      icon={ShieldQuestion}
      title={t.outOfScopeTitle}
      body={t.outOfScopeBody}
      hint={t.outOfScopeHint}
    />
  );
}

export function ErrorState({
  kind = "unknown",
  onRetry,
  disabled,
}: {
  kind?: AIErrorKind;
  onRetry: () => void;
  disabled?: boolean;
}) {
  const t = ar.chat;
  const copy = t.errors[kind];
  return (
    <div
      data-testid="error-state"
      data-kind={kind}
      role="alert"
      className="rounded-md border border-danger/25 bg-surface p-4"
    >
      <p className="flex items-center gap-2 font-semibold text-danger">
        <CircleAlert aria-hidden="true" className="size-4 shrink-0" />
        {copy.title}
      </p>
      <p className="mt-1 text-sm text-text-muted">{copy.body}</p>
      <button
        type="button"
        onClick={onRetry}
        disabled={disabled}
        className={buttonClasses({
          variant: "secondary",
          className: "mt-3 disabled:cursor-not-allowed disabled:opacity-50",
        })}
      >
        <RotateCcw aria-hidden="true" className="size-4" />
        {t.retry}
      </button>
    </div>
  );
}
