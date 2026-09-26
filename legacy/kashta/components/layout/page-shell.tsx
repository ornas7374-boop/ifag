import { cn } from "@/lib/utils";

export function PageShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main className={cn("mx-auto w-full max-w-7xl px-4 py-8", className)}>
      {children}
    </main>
  );
}

export function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6 space-y-1.5">
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{title}</h1>
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

export function SectionHeader({
  title,
  href,
  linkLabel,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-4 flex items-baseline justify-between gap-4">
      <h2 className="text-xl font-bold text-foreground">{title}</h2>
      {href && linkLabel ? (
        <a
          href={href}
          className="text-sm font-medium text-primary hover:underline"
        >
          {linkLabel}
        </a>
      ) : null}
    </div>
  );
}
