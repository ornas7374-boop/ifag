import { Info } from "lucide-react";

import { site } from "@/lib/site";
import { cn } from "@/lib/cn";

/** التنبيه الثابت — نصه معتمد حرفيًا في lib/site.ts. */
export function DisclaimerNote({ className }: { className?: string }) {
  return (
    <p
      data-testid="disclaimer"
      className={cn(
        "flex items-start gap-3 rounded-md border border-border bg-surface-muted p-4 text-sm text-text",
        className,
      )}
    >
      <Info aria-hidden="true" className="mt-1 size-4 shrink-0 text-primary" />
      <span>{site.disclaimer}</span>
    </p>
  );
}
