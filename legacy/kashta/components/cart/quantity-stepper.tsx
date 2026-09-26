"use client";

import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/format";

export function QuantityStepper({
  value,
  onChange,
  max,
  label,
}: {
  value: number;
  onChange: (next: number) => void;
  max?: number | null;
  label?: string;
}) {
  const atMax = max !== null && max !== undefined && value >= max;

  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-9"
        onClick={() => onChange(value - 1)}
        aria-label={`إنقاص${label ? ` ${label}` : ""}`}
      >
        <Minus aria-hidden />
      </Button>

      {/* عرض العدد لاتينيًا وبعرض ثابت حتى لا يقفز التخطيط عند التغيير */}
      <span
        className="min-w-9 text-center text-sm font-medium tabular-nums"
        aria-live="polite"
      >
        {formatNumber(value)}
      </span>

      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-9"
        disabled={atMax}
        onClick={() => onChange(value + 1)}
        aria-label={`زيادة${label ? ` ${label}` : ""}`}
      >
        <Plus aria-hidden />
      </Button>
    </div>
  );
}
