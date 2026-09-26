import { ar } from "@/content/ar";
import { cn } from "@/lib/utils";

/**
 * شاشة جاهزة هيكليًا تنتظر بيانات المرحلة القادمة.
 * صريحة عن حالتها بدل إيهام المستخدم بأنها تعمل.
 */
export function SectionPlaceholder({
  title,
  className,
}: {
  title: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-dashed border-border bg-card/50 px-6 py-12 text-center",
        className,
      )}
    >
      <p className="text-base font-semibold text-foreground">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        {ar.states.phasePlaceholder}
      </p>
    </div>
  );
}
