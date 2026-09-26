import { Star } from "lucide-react";

import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

/** النجوم لا تُعكس في RTL — الرمز غير اتجاهي. */
export function RatingStars({
  rating,
  count,
  className,
}: {
  rating: number;
  count?: number;
  className?: string;
}) {
  const label =
    count === undefined
      ? `التقييم ${rating} من 5`
      : `التقييم ${rating} من 5 بناءً على ${count} تقييم`;

  return (
    <span
      className={cn("inline-flex items-center gap-1 text-sm", className)}
      aria-label={label}
    >
      <Star className="size-4 fill-warning text-warning" aria-hidden />
      <span className="font-medium text-foreground">
        {rating.toFixed(1).replace(/\.0$/, "")}
      </span>
      {count !== undefined ? (
        <span className="text-muted-foreground">({formatNumber(count)})</span>
      ) : null}
    </span>
  );
}
