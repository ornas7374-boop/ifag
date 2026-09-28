import { ExternalLink } from "lucide-react";

import type { Source } from "@/lib/ai/types";
import { ar } from "@/lib/content/ar";

/** بطاقة مصدر — اللون البرونزي محجوز للمصادر وحدها. */
export function SourceCard({
  source,
  index,
}: {
  source: Source;
  index: number;
}) {
  const t = ar.chat;
  const location = [
    source.volume && `${t.volume} ${source.volume}`,
    source.page && `${t.page} ${source.page}`,
  ]
    .filter(Boolean)
    .join("، ");

  return (
    <div
      data-testid="source-card"
      className="flex flex-col rounded-md border border-accent/25 bg-accent-soft p-4"
    >
      <div className="flex-1">
        <p className="flex items-start gap-2">
          <span
            aria-hidden="true"
            className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-on-primary"
          >
            {index}
          </span>
          <span className="font-semibold text-text [overflow-wrap:anywhere]">
            {source.title}
          </span>
        </p>
        <p className="mt-1 text-sm text-text-muted">{source.sourceLabel}</p>
        {location && <p className="text-sm text-text-muted">{location}</p>}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-accent/20 pt-2">
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="-ms-2 inline-flex min-h-11 items-center gap-1.5 rounded-sm px-2 text-sm font-semibold text-primary underline decoration-transparent underline-offset-4 transition-colors hover:decoration-current"
        >
          {t.readFull}
          <ExternalLink aria-hidden="true" className="size-3.5" />
          <span className="sr-only"> {ar.a11y.opensInNewTab}</span>
        </a>
        <span dir="ltr" className="text-xs text-text-subtle">
          {safeHost(source.url)}
        </span>
      </div>
    </div>
  );
}

function safeHost(url: string) {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}
