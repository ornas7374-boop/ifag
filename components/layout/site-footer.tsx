import Link from "next/link";

import { DisclaimerNote } from "@/components/layout/disclaimer-note";
import { LogoMark } from "@/components/layout/logo";
import { ar } from "@/lib/content/ar";

const footerLink =
  "inline-flex min-h-11 items-center rounded-sm text-sm font-medium text-text-muted " +
  "underline decoration-transparent underline-offset-4 transition-colors " +
  "hover:text-primary hover:decoration-current";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-content px-4 py-10 sm:px-6 lg:px-8">
        <DisclaimerNote className="max-w-reading" />

        <div className="mt-8 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <nav aria-label={ar.a11y.footerNav}>
            <ul className="flex flex-wrap items-center gap-x-6">
              <li>
                <Link href="/about" className={footerLink}>
                  {ar.nav.about}
                </Link>
              </li>
            </ul>
          </nav>

          <p className="flex items-center gap-2 text-xs text-text-subtle">
            <LogoMark className="size-5" />
            <span>
              {ar.footer.rights} <span dir="ltr">© {new Date().getFullYear()}</span>
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
