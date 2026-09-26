import Link from "next/link";

import { getBrand } from "@/config/brand";
import { ar } from "@/content/ar";

const legal = [
  { href: "/terms", label: ar.footer.terms },
  { href: "/privacy", label: ar.footer.privacy },
  { href: "/help", label: ar.nav.help },
];

export async function SiteFooter() {
  const brand = await getBrand();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-border bg-card">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <p className="text-base font-bold text-foreground">{brand.appName}</p>
          <p className="max-w-md text-sm text-muted-foreground">
            {brand.appDescription}
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="روابط الفوتر">
          {legal.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-border py-4">
        <p className="mx-auto w-full max-w-7xl px-4 text-xs text-muted-foreground">
          © {year} {brand.appName} — {ar.footer.rights}
        </p>
      </div>
    </footer>
  );
}
