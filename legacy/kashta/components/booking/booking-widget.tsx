"use client";

import * as React from "react";
import { Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { QuantityStepper } from "@/components/cart/quantity-stepper";
import { PriceBreakdown } from "@/components/domain/price-breakdown";
import {
  submitBooking,
  type BookingResult,
} from "@/app/(public)/places/[slug]/actions";
import { ar } from "@/content/ar";
import { formatSAR } from "@/lib/format";
import { priceUnitLabel } from "@/lib/adapters";
import { halalas, type Halalas } from "@/lib/money";
import {
  addonAmount,
  buildQuote,
  DEFAULT_COMMISSION_RATE,
  lineAmount,
  type PricingContext,
} from "@/lib/pricing";
import type { Addon, RateUnit } from "@/types/domain";

interface Props {
  placeId: string;
  addons: Addon[];
  rates: {
    price_per_hour: Halalas | null;
    price_per_day: Halalas | null;
    price_per_night: Halalas | null;
  };
  capacityMin: number;
  capacityMax: number;
  checkInTime: string;
  /** false قبل ربط القاعدة — الزر يبقى معطّلًا بدل أن يفشل صامتًا. */
  canBook: boolean;
}

/** الأنواع المتاحة فعلًا — لا نعرض تبويبًا بلا سعر. */
function availableUnits(rates: Props["rates"]): RateUnit[] {
  const units: RateUnit[] = [];
  if (rates.price_per_hour !== null) units.push("hour");
  if (rates.price_per_day !== null) units.push("day");
  if (rates.price_per_night !== null) units.push("night");
  return units;
}

/**
 * النوع المختار افتراضيًا.
 *
 * لا بد أن يطابق ترتيب lib/adapters.ts (ليلة ← يوم ← ساعة) وإلا رأى
 * العميل سعرًا في البطاقة وسعرًا مختلفًا فور فتح الصفحة.
 */
function defaultUnit(rates: Props["rates"]): RateUnit {
  if (rates.price_per_night !== null) return "night";
  if (rates.price_per_day !== null) return "day";
  return "hour";
}

const UNIT_LABEL: Record<RateUnit, string> = {
  hour: ar.booking.hourly,
  day: ar.booking.daily,
  night: ar.booking.nightly,
};

/** تاريخ اليوم بصيغة input[type=date]، بتوقيت الرياض. */
function todayISO(): string {
  const now = new Date();
  const riyadh = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  return riyadh.toISOString().slice(0, 10);
}

export function BookingWidget({
  placeId,
  addons,
  rates,
  capacityMin,
  capacityMax,
  checkInTime,
  canBook,
}: Props) {
  const [pending, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<BookingResult | null>(null);
  const units = availableUnits(rates);
  const [unit, setUnit] = React.useState<RateUnit>(defaultUnit(rates));
  const [date, setDate] = React.useState(todayISO());
  const [startTime, setStartTime] = React.useState(checkInTime);
  const [duration, setDuration] = React.useState(
    defaultUnit(rates) === "hour" ? 4 : 1,
  );
  const [guests, setGuests] = React.useState(capacityMin);
  const [selectedAddons, setSelectedAddons] = React.useState<Set<string>>(
    new Set(),
  );

  // تبديل نوع الحجز يعيد ضبط المدة لقيمة معقولة لذلك النوع
  function handleUnitChange(next: string) {
    const u = next as RateUnit;
    setUnit(u);
    setDuration(u === "hour" ? 4 : 1);
  }

  const baseRate =
    unit === "hour"
      ? rates.price_per_hour
      : unit === "day"
        ? rates.price_per_day
        : rates.price_per_night;

  // سياق التسعير المشترك — نفس البنية التي يستخدمها الخادم عند الحفظ،
  // فما يراه العميل هنا يطابق ما سيُحسب هناك.
  const ctx: PricingContext = React.useMemo(
    () => ({
      hours: unit === "hour" ? duration : 0,
      days: unit === "day" ? duration : 0,
      nights: unit === "night" ? duration : 0,
      persons: guests,
      quantity: 1,
      distanceKm: 0,
    }),
    [unit, duration, guests],
  );

  const quote = React.useMemo(() => {
    const lines = [];

    if (baseRate !== null) {
      lines.push({
        label: `${UNIT_LABEL[unit]} × ${duration}`,
        amount: lineAmount(
          baseRate,
          unit === "hour" ? "per_hour" : unit === "day" ? "per_day" : "per_night",
          ctx,
        ),
      });
    }

    for (const addon of addons) {
      if (!selectedAddons.has(addon.id)) continue;
      lines.push({ label: addon.name_ar, amount: addonAmount(addon, ctx) });
    }

    return buildQuote({ lines, commissionRate: DEFAULT_COMMISSION_RATE });
  }, [baseRate, unit, duration, ctx, addons, selectedAddons]);

  function toggleAddon(id: string) {
    setSelectedAddons((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const durationLabel =
    unit === "hour" ? "عدد الساعات" : unit === "day" ? "عدد الأيام" : "عدد الليالي";

  return (
    <div className="space-y-4">
      {units.length > 1 ? (
        <Tabs value={unit} onValueChange={handleUnitChange}>
          <TabsList className="w-full">
            {units.map((u) => (
              <TabsTrigger key={u} value={u} className="flex-1">
                {UNIT_LABEL[u]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="booking-date">{ar.common.date}</Label>
        <Input
          id="booking-date"
          type="date"
          value={date}
          min={todayISO()}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {unit === "hour" ? (
        <div className="space-y-1.5">
          <Label htmlFor="booking-start">{ar.booking.startTime}</Label>
          <Input
            id="booking-start"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <Label>{durationLabel}</Label>
        <QuantityStepper
          value={duration}
          onChange={(next) => setDuration(Math.max(1, next))}
          max={unit === "hour" ? 12 : 30}
          label={durationLabel}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <Label className="flex items-center gap-2">
          <Users className="size-4 text-muted-foreground" aria-hidden />
          {ar.common.guests}
        </Label>
        <QuantityStepper
          value={guests}
          onChange={(next) => setGuests(Math.max(capacityMin, next))}
          max={capacityMax}
          label={ar.common.guests}
        />
      </div>

      {addons.length > 0 ? (
        <>
          <Separator />
          <fieldset className="space-y-3">
            <legend className="mb-2 text-sm font-medium">
              {ar.listing.addons}
            </legend>
            {addons.map((addon) => (
              <label
                key={addon.id}
                className="flex cursor-pointer items-start gap-3 text-sm"
              >
                <Checkbox
                  checked={selectedAddons.has(addon.id)}
                  onCheckedChange={() => toggleAddon(addon.id)}
                  className="mt-0.5"
                />
                <span className="flex-1">{addon.name_ar}</span>
                <span className="shrink-0 text-muted-foreground">
                  {formatSAR(addonAmount(addon, ctx))}
                  {addon.pricing_mode !== "per_booking" &&
                  addon.pricing_mode !== "fixed" ? (
                    <span className="block text-xs">
                      {formatSAR(addon.price)} {priceUnitLabel(addon.pricing_mode)}
                    </span>
                  ) : null}
                </span>
              </label>
            ))}
          </fieldset>
        </>
      ) : null}

      <Separator />

      {/* السعر يتحدّث لحظيًا مع كل تغيير أعلاه */}
      <PriceBreakdown quote={quote} />

      {result?.ok === true ? (
        <p className="rounded-md bg-success/10 p-3 text-sm text-success">
          تم الحجز. رقمك المرجعي <span dir="ltr">{result.reference}</span> —
          المبلغ {formatSAR(halalas(result.total))}.
        </p>
      ) : null}
      {result?.ok === false ? (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {result.error}
        </p>
      ) : null}

      <Button
        size="lg"
        className="w-full"
        disabled={!canBook || pending || result?.ok === true}
        onClick={() =>
          startTransition(async () => {
            setResult(
              await submitBooking({
                placeId,
                rateUnit: unit,
                date,
                duration,
                guests,
                startTime: unit === "hour" ? startTime : undefined,
                addonIds: [...selectedAddons],
              }),
            );
          })
        }
      >
        {pending ? ar.common.loading : ar.common.bookNow}
      </Button>

      <p className="text-xs text-muted-foreground">
        السعر تقديري. يُعاد حسابه في الخادم ويُتحقق من توفّر الموعد قبل تأكيد
        الحجز.
      </p>
    </div>
  );
}

export { halalas };
