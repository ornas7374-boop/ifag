import type { Metadata } from "next";
import { Minus } from "lucide-react";

import { DisclaimerNote } from "@/components/layout/disclaimer-note";
import { ButtonLink } from "@/components/ui/button";
import { ar } from "@/lib/content/ar";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: ar.about.metaTitle,
};

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="border-t border-border pt-10">
      <h2 id={id} className="text-2xl font-bold text-text">
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-text-muted">{children}</div>
    </section>
  );
}

export default function AboutPage() {
  const t = ar.about;

  return (
    <article className="mx-auto max-w-reading px-4 py-14 sm:px-6 sm:py-20">
      <header>
        <h1 className="text-3xl font-bold text-text">{t.title}</h1>
        <p className="mt-5 text-lg text-text-muted">{t.lead}</p>
      </header>

      <div className="mt-12 space-y-12">
        <Section id="idea" title={t.ideaTitle}>
          {t.ideaBody.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </Section>

        <Section id="source" title={t.sourceTitle}>
          <p>{t.sourceBody}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2">
            <ButtonLink href={site.source.url} external variant="secondary">
              {t.sourceCta}
            </ButtonLink>
            <span dir="ltr" className="text-sm text-text-subtle">
              {site.source.domain}
            </span>
          </div>
        </Section>

        <Section id="limits" title={t.limitsTitle}>
          <ul className="space-y-3">
            {t.limits.map((limit) => (
              <li key={limit} className="flex items-start gap-3">
                <Minus aria-hidden="true" className="mt-1.5 size-4 shrink-0 text-primary" />
                <span>{limit}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section id="notice" title={t.noticeTitle}>
          <DisclaimerNote />
        </Section>
      </div>
    </article>
  );
}
