import { LogoMark } from "@/components/layout/logo";
import { ar } from "@/lib/content/ar";
import { suggestedQuestions } from "@/lib/content/suggested-questions";

export function EmptyState({ onPick, disabled }: { onPick: (question: string) => void; disabled: boolean }) {
  const t = ar.chat;

  return (
    <div className="mx-auto flex min-h-full max-w-reading flex-col justify-center px-4 py-10 sm:px-6 short:py-4">
      <LogoMark className="size-11 short:hidden" />
      <h1 className="mt-6 text-2xl font-bold text-text sm:text-3xl short:mt-0 short:text-xl">{t.emptyTitle}</h1>
      <p className="mt-3 text-text-muted short:mt-1 short:text-sm">{t.emptyBody}</p>

      <h2 className="sr-only">{t.suggestionsLabel}</h2>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2 short:mt-4 short:gap-2">
        {suggestedQuestions.map((q) => (
          <li key={q}>
            <button
              type="button"
              onClick={() => onPick(q)}
              disabled={disabled}
              data-testid="suggestion"
              className="flex min-h-14 short:min-h-11 w-full items-center rounded-lg border border-border bg-surface px-4 py-3 text-start text-sm font-medium text-text transition-colors hover:border-primary/40 hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-60"
            >
              {q}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
