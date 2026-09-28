import type { Metadata } from "next";
import { Minus } from "lucide-react";

import { HowItWorksSteps } from "@/components/about/how-it-works";
import { DisclaimerNote } from "@/components/layout/disclaimer-note";
import { ar } from "@/lib/content/ar";

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

        <Section id="how-it-works" title={ar.howItWorks.title}>
          <div className="pt-2">
            <HowItWorksSteps />
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
