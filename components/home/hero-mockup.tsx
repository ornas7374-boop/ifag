import { BookOpenText, ExternalLink } from "lucide-react";

import { LogoMark } from "@/components/layout/logo";
import { ar } from "@/lib/content/ar";
import { site } from "@/lib/site";

/**
 * مثال بصري لشكل الإجابة: السؤال ← نص الفتوى ← المصدر، موصولة بخط "سند".
 *
 * قاعدة المصدر: كل ما يمثّل فتوى هنا placeholder صريح بين أقواس — لا نص
 * منسوب للشيخ ولا أسماء كتب. العنصر كله صورة توضيحية (role="img")،
 * فلا شيء بداخله قابل للنقر أو للتركيز.
 */
export function HeroMockup() {
  const m = ar.mockup;

  return (
    <figure
      role="img"
      aria-label={m.label}
      className="rounded-xl border border-border bg-surface p-5 shadow-md sm:p-7"
    >
      {/* سؤال المستخدم — في نهاية السطر (يسار في RTL) */}
      <div className="flex justify-end">
        <p className="max-w-[85%] rounded-lg rounded-ee-sm bg-primary-soft px-4 py-3 text-sm font-medium text-text sm:text-base">
          {m.question}
        </p>
      </div>

      {/* الإجابة والمصدر على سلسلة واحدة */}
      <div className="mt-6 grid grid-cols-[2rem_1fr] gap-x-3 sm:gap-x-4">
        {/* الحلقة الأولى: سَنَد */}
        <div className="flex flex-col items-center">
          <LogoMark />
          <span aria-hidden="true" className="mt-2 w-px flex-1 bg-border-strong" />
        </div>
        <div className="pb-6">
          <p className="text-sm font-semibold text-primary">{m.assistantName}</p>
          <p className="mt-2 font-naskh text-reading text-text sm:text-reading-lg">
            {m.answerPlaceholder}
          </p>
        </div>

        {/* الحلقة الأخيرة: المصدر */}
        <div className="flex flex-col items-center">
          <span aria-hidden="true" className="h-5 w-px bg-border-strong" />
          <span aria-hidden="true" className="size-3 rounded-full bg-accent ring-4 ring-accent-soft" />
        </div>
        <div className="rounded-md border border-accent/25 bg-accent-soft p-4">
          <p className="flex items-center gap-2 text-xs font-semibold text-accent">
            <BookOpenText aria-hidden="true" className="size-4" />
            {m.sourceHeading}
          </p>
          <p className="mt-2 font-semibold text-text">{m.sourceTitle}</p>
          <p className="text-sm text-text-muted">{m.sourceLabel}</p>
          <p className="text-sm text-text-muted">{m.sourceLocation}</p>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-accent/20 pt-3">
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
              {m.readFull}
              <ExternalLink aria-hidden="true" className="size-3.5" />
            </span>
            <span dir="ltr" className="text-xs text-text-subtle">
              {site.source.domain}
            </span>
          </div>
        </div>
      </div>
    </figure>
  );
}
