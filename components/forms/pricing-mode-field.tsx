"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatSAR } from "@/lib/format";
import { sarToHalalas } from "@/lib/money";
import type { DeliveryFeeStrategy, PricingMode } from "@/types/domain";

/**
 * ★ الدليل العملي على أن التسعير مبني على بيانات لا على شيفرة ★
 *
 * الحقل يقرأ من سجل واحد. إضافة طريقة تسعير جديدة مستقبلًا = سطر في
 * PRICING_MODES + قيمة في الـ enum بالـ SQL + حالة في محرّك التسعير.
 * لا نموذج جديد ولا شرط `if` مبعثر في الشاشات.
 */

interface ModeSpec {
  value: PricingMode;
  label: string;
  /** يشرح للمزوّد كيف سيُضرب السعر — يمنع أخطاء تسعير مكلفة. */
  hint: string;
  example: string;
}

export const PRICING_MODES: ModeSpec[] = [
  { value: "per_booking", label: "لكل حجز", hint: "مبلغ واحد للطلب مهما طالت مدته.", example: "خيمة مجهّزة 500 ر.س للحجز" },
  { value: "per_hour", label: "بالساعة", hint: "يُضرب في عدد الساعات وفي الكمية.", example: "صبّاب 200 ر.س/ساعة" },
  { value: "per_day", label: "باليوم", hint: "يُضرب في عدد الأيام وفي الكمية.", example: "مكيّف 120 ر.س/يوم" },
  { value: "per_night", label: "بالليلة", hint: "يُضرب في عدد الليالي وفي الكمية.", example: "مخيم 900 ر.س/ليلة" },
  { value: "per_person", label: "للشخص", hint: "يُضرب في عدد الأشخاص.", example: "ضيافة 25 ر.س للشخص" },
  { value: "per_unit", label: "للقطعة", hint: "يُضرب في الكمية المطلوبة فقط.", example: "طقم طاولة 150 ر.س" },
  { value: "per_km", label: "حسب المسافة", hint: "يُضرب في المسافة بالكيلومترات.", example: "نقل 5 ر.س/كم" },
  { value: "fixed", label: "سعر مقطوع", hint: "لا يتأثر بالكمية ولا بالمدة إطلاقًا.", example: "رسوم تجهيز 300 ر.س" },
];

export const DELIVERY_STRATEGIES: {
  value: DeliveryFeeStrategy;
  label: string;
  hint: string;
}[] = [
  { value: "free", label: "توصيل مجاني", hint: "لا رسوم توصيل إطلاقًا." },
  { value: "flat", label: "سعر ثابت", hint: "نفس الرسوم لكل الطلبات." },
  { value: "per_city", label: "حسب المدينة", hint: "رسوم مختلفة لكل مدينة تخدمها." },
  { value: "per_district", label: "حسب الحي", hint: "رسوم مختلفة لكل حي." },
  { value: "per_distance", label: "حسب المسافة", hint: "الرسوم المدخلة لكل 10 كم." },
];

export function PricingModeField({
  mode,
  price,
  onModeChange,
  onPriceChange,
}: {
  mode: PricingMode;
  /** بالريال — يُحوّل لهللة عند الحفظ */
  price: string;
  onModeChange: (next: PricingMode) => void;
  onPriceChange: (next: string) => void;
}) {
  const spec = PRICING_MODES.find((m) => m.value === mode) ?? PRICING_MODES[0]!;
  const numeric = Number(price);
  const preview =
    price !== "" && Number.isFinite(numeric) && numeric >= 0
      ? formatSAR(sarToHalalas(numeric))
      : null;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-1.5">
        <Label htmlFor="price">السعر (ريال)</Label>
        <Input
          id="price"
          type="number"
          min={0}
          step="0.01"
          dir="ltr"
          value={price}
          onChange={(e) => onPriceChange(e.target.value)}
        />
        {preview ? (
          <p className="text-xs text-muted-foreground">
            يظهر للعميل: {preview} {spec.label}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="pricing-mode">طريقة التسعير</Label>
        <Select value={mode} onValueChange={(v) => onModeChange(v as PricingMode)}>
          <SelectTrigger id="pricing-mode">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRICING_MODES.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs leading-6 text-muted-foreground">
          {spec.hint} <span className="block">مثال: {spec.example}</span>
        </p>
      </div>
    </div>
  );
}
