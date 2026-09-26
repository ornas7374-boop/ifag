import { HeroMockup } from "@/components/home/hero-mockup";
import { ButtonLink } from "@/components/ui/button";
import { ar } from "@/lib/content/ar";

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="mx-auto max-w-content px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <h1 id="hero-title" className="text-display font-bold text-balance text-text">
            {ar.hero.title}
          </h1>
          <p className="mt-5 max-w-[34rem] text-lg text-text-muted">{ar.hero.description}</p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ButtonLink href="/chat" size="lg" data-testid="hero-cta">
              {ar.hero.primaryCta}
            </ButtonLink>
            <ButtonLink href="#how-it-works" size="lg" variant="secondary">
              {ar.hero.secondaryCta}
            </ButtonLink>
          </div>
        </div>

        <HeroMockup />
      </div>
    </section>
  );
}
