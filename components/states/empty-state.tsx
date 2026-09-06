import { cn } from "@/lib/utils";
import { ar } from "@/content/ar";

export function EmptyState({
  title = ar.states.emptyTitle,
  hint,
  action,
  className,
}: {
  title?: string;
  hint?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border px-6 py-14 text-center",
        className,
      )}
    >
      <p className="text-base font-semibold text-foreground">{title}</p>
      {hint ? (
        <p className="max-w-sm text-sm text-muted-foreground">{hint}</p>
      ) : null}
      {action}
    </div>
  );
}
