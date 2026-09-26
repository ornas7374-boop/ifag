import { CircleAlert, RotateCcw, SearchX } from "lucide-react";

import { buttonClasses } from "@/components/ui/button";
import { ar } from "@/lib/content/ar";

/** حالة "لم توجد فتوى": هادئة ومعلوماتية، لا بشكل خطأ. */
export function NoSourceState() {
  const t = ar.chat;
  return (
    <div data-testid="no-source" className="rounded-md border border-primary/15 bg-primary-soft p-4">
      <p className="flex items-center gap-2 font-semibold text-primary">
        <SearchX aria-hidden="true" className="size-4 shrink-0" />
        {t.noSourceTitle}
      </p>
      <p className="mt-2 text-text">{t.noSourceBody}</p>
      <p className="mt-1 text-sm text-text-muted">{t.noSourceHint}</p>
    </div>
  );
}

export function ErrorState({ onRetry, disabled }: { onRetry: () => void; disabled?: boolean }) {
  const t = ar.chat;
  return (
    <div data-testid="error-state" role="alert" className="rounded-md border border-danger/25 bg-surface p-4">
      <p className="flex items-center gap-2 font-semibold text-danger">
        <CircleAlert aria-hidden="true" className="size-4 shrink-0" />
        {t.errorTitle}
      </p>
      <p className="mt-1 text-sm text-text-muted">{t.errorBody}</p>
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
