import Link from "next/link";

import { BrandLogo } from "@/components/brand/brand-logo";
import { NAV_BY_ROLE } from "@/config/navigation";
import type { Role } from "@/types/domain";

/**
 * هيكل لوحات التحكم الثلاث. يختلف المحتوى بالدور، ويبقى التخطيط واحدًا.
 * الشريط الجانبي يظهر على الشاشات الكبيرة، وشريط أفقي قابل للتمرير على الجوال.
 */
export function DashboardShell({
  role,
  title,
  children,
}: {
  role: Role;
  title: string;
  children: React.ReactNode;
}) {
  const items = NAV_BY_ROLE[role];

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4">
          <BrandLogo />
          <span className="text-sm text-muted-foreground">{title}</span>
          <Link
            href="/"
            className="ms-auto text-sm font-medium text-primary hover:underline"
          >
            العودة للموقع
          </Link>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 lg:flex-row">
        <nav
          aria-label={title}
          className="flex gap-1 overflow-x-auto pb-2 lg:w-56 lg:shrink-0 lg:flex-col lg:overflow-visible lg:pb-0"
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
