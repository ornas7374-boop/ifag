import Link from "next/link";

import { Logo } from "@/components/layout/logo";
import { ButtonLink, buttonClasses } from "@/components/ui/button";
import { ar } from "@/lib/content/ar";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-content items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label={ar.a11y.home}
          className="-ms-1 inline-flex min-h-11 items-center rounded-md px-1 transition-opacity hover:opacity-75"
        >
          <Logo />
        </Link>

        <nav aria-label={ar.a11y.mainNav} className="flex items-center gap-1 sm:gap-2">
          <Link href="/about" className={buttonClasses({ variant: "ghost" })}>
            {ar.nav.about}
          </Link>
          <ButtonLink href="/chat" data-testid="header-cta">
            {ar.nav.ask}
          </ButtonLink>
        </nav>
      </div>
    </header>
  );
}
