import Link from "next/link";
import { ShoppingCart, User } from "lucide-react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { ar } from "@/content/ar";

const links = [
  { href: "/search?kind=place", label: ar.nav.places },
  { href: "/search?kind=service", label: ar.nav.services },
  { href: "/become-a-host", label: ar.nav.becomeHost },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-6 px-4">
        <BrandLogo />

        <nav className="hidden items-center gap-1 md:flex" aria-label="التنقل الرئيسي">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/cart" aria-label={ar.nav.cart}>
              <ShoppingCart aria-hidden />
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
            <Link href="/login">
              <User aria-hidden />
              {ar.nav.login}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
