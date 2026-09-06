"use client";

import * as React from "react";
import { Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LocationPicker, type PickedLocation } from "@/components/map/location-picker";
import { formatSAR } from "@/lib/format";
import { sarToHalalas } from "@/lib/money";
import type { Amenity, City, PlaceKind } from "@/types/domain";

const PLACE_KINDS: { value: PlaceKind; label: string }[] = [
  { value: "kashta", label: "كشتة" },
  { value: "camp", label: "مخيم" },
  { value: "wild", label: "مكان بري" },
];

/** خيارات مدة التجهيز — قيم شائعة بدل ترك الحقل مفتوحًا. */
const TURNAROUND = [
  { value: "0", label: "بدون مدة تجهيز" },
  { value: "30", label: "30 دقيقة" },
  { value: "60", label: "ساعة" },
  { value: "120", label: "ساعتان" },
  { value: "180", label: "ثلاث ساعات" },
];

function PriceField({
  id,
  label,
  value,
  onChange,
  suffix,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix: string;
}) {
  const n = Number(value);
  const preview =
    value !== "" && Number.isFinite(n) && n > 0 ? formatSAR(sarToHalalas(n)) : null;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        min={0}
        step="0.01"
        dir="ltr"
        placeholder="اتركه فارغًا إن لم يكن متاحًا"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <p className="text-xs text-muted-foreground">
        {preview ? `${preview} ${suffix}` : `غير متاح — لن يظهر هذا النوع للعميل`}
      </p>
    </div>
  );
}

/**
 * نموذج إضافة مكان (المتطلب 18).
 *
 * يشترك مع نموذج الخدمة في المكونات نفسها بدل نسخها، ويختلف عنه في
 * أن التسعير هنا ثلاثة أسعار اختيارية (ساعة/يوم/ليلة) لا سعر واحد
 * بطريقة تسعير — لأن نوع الحجز يختاره العميل لا المزوّد.
 */
export function PlaceForm({
  cities,
  amenities,
}: {
  cities: City[];
  amenities: Amenity[];
}) {
  const [kind, setKind] = React.useState<PlaceKind>("kashta");
  const [hourly, setHourly] = React.useState("");
  const [daily, setDaily] = React.useState("");
  const [nightly, setNightly] = React.useState("");
  const [turnaround, setTurnaround] = React.useState("60");
  const [selectedAmenities, setSelectedAmenities] = React.useState<Set<string>>(
    new Set(),
  );
  const [location, setLocation] = React.useState<PickedLocation | null>(null);
  const [submitted, setSubmitted] = React.useState(false);

  const hasAnyPrice = [hourly, daily, nightly].some(
    (v) => v !== "" && Number(v) > 0,
  );

  function toggleAmenity(id: string) {
    setSelectedAmenities((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
    >
      <Card>
        <CardHeader>
          <CardTitle>الأساسيات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">اسم المكان</Label>
            <Input id="title" required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">الوصف</Label>
            <textarea
              id="description"
              rows={4}
              className="w-full rounded-md border border-input bg-card p-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="kind">نوع المكان</Label>
              <Select value={kind} onValueChange={(v) => setKind(v as PlaceKind)}>
                <SelectTrigger id="kind">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLACE_KINDS.map((k) => (
                    <SelectItem key={k.value} value={k.value}>
                      {k.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="city">المدينة</Label>
              <Select defaultValue={cities[0]?.id}>
                <SelectTrigger id="city">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name_ar}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="cap-min">أقل عدد أشخاص</Label>
              <Input id="cap-min" type="number" min={1} defaultValue={1} dir="ltr" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cap-max">أقصى عدد أشخاص</Label>
              <Input id="cap-max" type="number" min={1} defaultValue={20} dir="ltr" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>الموقع</CardTitle>
        </CardHeader>
        <CardContent>
          <LocationPicker value={location} onChange={setLocation} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>الأسعار</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            حدّد سعرًا واحدًا على الأقل. الأنواع التي تتركها فارغة لن تظهر
            للعميل كخيار حجز.
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            <PriceField id="p-hour" label="السعر بالساعة" value={hourly} onChange={setHourly} suffix="للساعة" />
            <PriceField id="p-day" label="السعر باليوم" value={daily} onChange={setDaily} suffix="لليوم" />
            <PriceField id="p-night" label="السعر بالليلة" value={nightly} onChange={setNightly} suffix="لليلة" />
          </div>

          {!hasAnyPrice ? (
            <p className="rounded-md bg-warning/10 p-3 text-xs text-warning">
              يجب تحديد سعر واحد على الأقل قبل الحفظ.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>الأوقات والتجهيز</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="check-in">وقت الدخول</Label>
              <Input id="check-in" type="time" defaultValue="16:00" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="check-out">وقت الخروج</Label>
              <Input id="check-out" type="time" defaultValue="12:00" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="turnaround">مدة التجهيز بين حجزين</Label>
            <Select value={turnaround} onValueChange={setTurnaround}>
              <SelectTrigger id="turnaround">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TURNAROUND.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* هذا الحقل يستحق الشرح: منه تُشتق قيمة حجب التقويم افتراضيًا */}
            <p className="flex items-start gap-2 rounded-md bg-secondary p-3 text-xs leading-6">
              <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <span>
                تُضاف هذه المدة تلقائيًا بعد نهاية كل حجز، فيبقى المكان محجوبًا
                خلالها للتنظيف والتجهيز. تستطيع تعديلها لأي حجز على حدة من صفحة
                الحجز، ولا تؤثر على المبلغ المستحق.
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>المرافق</CardTitle>
        </CardHeader>
        <CardContent>
          <fieldset className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <legend className="sr-only">المرافق المتوفرة</legend>
            {amenities.map((a) => (
              <label key={a.id} className="flex cursor-pointer items-center gap-3 text-sm">
                <Checkbox
                  checked={selectedAmenities.has(a.id)}
                  onCheckedChange={() => toggleAmenity(a.id)}
                />
                <span>{a.name_ar}</span>
              </label>
            ))}
          </fieldset>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>السياسات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="cancellation">سياسة الإلغاء</Label>
            <textarea
              id="cancellation"
              rows={3}
              placeholder="مثال: إلغاء مجاني حتى 48 ساعة قبل الموعد."
              className="w-full rounded-md border border-input bg-card p-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rules">قوانين المكان (اختياري)</Label>
            <textarea
              id="rules"
              rows={3}
              className="w-full rounded-md border border-input bg-card p-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" disabled={!hasAnyPrice}>
          حفظ وإرسال للمراجعة
        </Button>
        {submitted ? (
          <p className="text-sm text-muted-foreground">
            النموذج مكتمل — الحفظ ورفع الصور يُفعّلان عند ربط Supabase.
          </p>
        ) : null}
      </div>
    </form>
  );
}
