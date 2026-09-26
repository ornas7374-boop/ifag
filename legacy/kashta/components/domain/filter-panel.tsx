"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { ar } from "@/content/ar";
import { formatSAR } from "@/lib/format";
import { halalas } from "@/lib/money";
import type { Amenity } from "@/types/domain";

/** بالهللة: 0 – 5000 ريال */
const PRICE_MIN = 0;
const PRICE_MAX = 500_000;
const PRICE_STEP = 5_000;

const RATINGS = [4.5, 4, 3.5, 3];

interface Props {
  amenities: Amenity[];
}

/**
 * الفلاتر تعيش في الـ URL لا في حالة المكوّن.
 *
 * الفائدة: الرابط قابل للمشاركة والحفظ، وزر الرجوع يعمل، وصفحة
 * النتائج (مكوّن خادم) تقرأ نفس القيم دون تزامن يدوي.
 */
function FilterFields({
  amenities,
  onApply,
}: Props & { onApply?: () => void }) {
  const router = useRouter();
  const params = useSearchParams();

  const [price, setPrice] = React.useState<[number, number]>([
    Number(params.get("minPrice") ?? PRICE_MIN),
    Number(params.get("maxPrice") ?? PRICE_MAX),
  ]);
  const [rating, setRating] = React.useState(params.get("minRating") ?? "");
  const [selected, setSelected] = React.useState<Set<string>>(
    new Set(params.get("amenities")?.split(",").filter(Boolean) ?? []),
  );

  function toggleAmenity(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function apply() {
    const next = new URLSearchParams(params.toString());

    // نحذف المعامل بدل كتابة القيمة الافتراضية، حتى يبقى الرابط نظيفًا
    if (price[0] > PRICE_MIN) next.set("minPrice", String(price[0]));
    else next.delete("minPrice");

    if (price[1] < PRICE_MAX) next.set("maxPrice", String(price[1]));
    else next.delete("maxPrice");

    if (rating) next.set("minRating", rating);
    else next.delete("minRating");

    if (selected.size > 0) next.set("amenities", [...selected].join(","));
    else next.delete("amenities");

    router.push(`/search?${next.toString()}`);
    onApply?.();
  }

  function reset() {
    const next = new URLSearchParams();
    const kind = params.get("kind");
    if (kind) next.set("kind", kind);
    setPrice([PRICE_MIN, PRICE_MAX]);
    setRating("");
    setSelected(new Set());
    router.push(`/search?${next.toString()}`);
    onApply?.();
  }

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto">
      <fieldset className="space-y-3">
        <legend className="mb-2 text-sm font-medium">
          {ar.search.priceRange}
        </legend>
        <Slider
          value={price}
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={PRICE_STEP}
          onValueChange={(v) => setPrice([v[0] ?? 0, v[1] ?? PRICE_MAX])}
          aria-label={ar.search.priceRange}
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{formatSAR(halalas(price[0]))}</span>
          <span>
            {formatSAR(halalas(price[1]))}
            {price[1] >= PRICE_MAX ? "+" : ""}
          </span>
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-medium">{ar.common.rating}</legend>
        <div className="flex flex-wrap gap-2">
          {RATINGS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRating(rating === String(r) ? "" : String(r))}
              aria-pressed={rating === String(r)}
              className="cursor-pointer"
            >
              <Badge variant={rating === String(r) ? "default" : "outline"}>
                {r}+ ★
              </Badge>
            </button>
          ))}
        </div>
      </fieldset>

      {amenities.length > 0 ? (
        <fieldset className="space-y-2.5">
          <legend className="mb-2 text-sm font-medium">
            {ar.search.amenities}
          </legend>
          {amenities.map((amenity) => (
            <label
              key={amenity.id}
              className="flex cursor-pointer items-center gap-3 text-sm"
            >
              <Checkbox
                checked={selected.has(amenity.id)}
                onCheckedChange={() => toggleAmenity(amenity.id)}
              />
              <span>{amenity.name_ar}</span>
            </label>
          ))}
        </fieldset>
      ) : null}

      <div className="mt-auto flex gap-2 pt-2">
        <Button onClick={apply} className="flex-1">
          {ar.common.apply}
        </Button>
        <Button variant="outline" onClick={reset}>
          <X aria-hidden />
          {ar.common.clearFilters}
        </Button>
      </div>
    </div>
  );
}

/** سطح المكتب: عمود جانبي ثابت. */
export function FilterSidebar({ amenities }: Props) {
  return (
    <aside className="hidden w-64 shrink-0 lg:block">
      <div className="sticky top-24 rounded-lg border border-border bg-card p-4">
        <h2 className="mb-4 flex items-center gap-2 font-semibold">
          <SlidersHorizontal className="size-4" aria-hidden />
          {ar.common.filters}
        </h2>
        <FilterFields amenities={amenities} />
      </div>
    </aside>
  );
}

/** الجوال: لوح سفلي — نفس الحقول تمامًا، لا نسخة ثانية منها. */
export function FilterSheet({ amenities }: Props) {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="lg:hidden">
          <SlidersHorizontal aria-hidden />
          {ar.common.filters}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[85dvh]">
        <SheetHeader>
          <SheetTitle>{ar.common.filters}</SheetTitle>
        </SheetHeader>
        <FilterFields amenities={amenities} onApply={() => setOpen(false)} />
        <SheetFooter />
      </SheetContent>
    </Sheet>
  );
}
