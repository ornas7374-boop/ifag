"use client";

import * as React from "react";
import { Crosshair, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { GeoPoint } from "@/types/domain";

/**
 * تحديد موقع التوصيل.
 *
 * الخريطة التفاعلية تحتاج مفتاح Google، لكن الشاشة يجب أن تعمل بدونه —
 * وإلا تعطّل مسار الطلب بأكمله لغياب مفتاح. لذلك:
 *   • مع المفتاح  : خريطة قابلة للسحب (المرحلة القادمة)
 *   • بدون المفتاح: تحديد بالموقع الجغرافي للمتصفح + إدخال يدوي
 *
 * الحقول المحفوظة واحدة في الحالتين، فالانتقال لا يغيّر شكل البيانات.
 */

export interface PickedLocation {
  point: GeoPoint;
  addressText: string;
  notes: string;
}

export function LocationPicker({
  value,
  onChange,
  className,
}: {
  value: PickedLocation | null;
  onChange: (next: PickedLocation) => void;
  className?: string;
}) {
  const hasMapKey = Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
  const [locating, setLocating] = React.useState(false);
  const [geoError, setGeoError] = React.useState<string | null>(null);

  const point = value?.point ?? null;

  function useMyLocation() {
    if (!("geolocation" in navigator)) {
      setGeoError("المتصفح لا يدعم تحديد الموقع.");
      return;
    }
    setLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({
          point: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          addressText: value?.addressText ?? "",
          notes: value?.notes ?? "",
        });
        setLocating(false);
      },
      () => {
        // الرفض ليس خطأ برمجيًا — نوجّه المستخدم للإدخال اليدوي بدلًا منه
        setGeoError("تعذّر تحديد موقعك. أدخل الإحداثيات أو العنوان يدويًا.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  function patch(next: Partial<PickedLocation>) {
    onChange({
      point: next.point ?? point ?? { lat: 24.7136, lng: 46.6753 },
      addressText: next.addressText ?? value?.addressText ?? "",
      notes: next.notes ?? value?.notes ?? "",
    });
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative grid min-h-48 place-items-center rounded-lg border border-border bg-muted">
        <div className="space-y-2 px-6 text-center">
          <MapPin className="mx-auto size-8 text-primary" aria-hidden />
          {point ? (
            <p className="text-xs text-muted-foreground" dir="ltr">
              {point.lat.toFixed(5)}, {point.lng.toFixed(5)}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">لم يُحدَّد موقع بعد</p>
          )}
          {!hasMapKey ? (
            <p className="text-xs text-muted-foreground">
              الخريطة التفاعلية تحتاج مفتاح Google Maps
            </p>
          ) : null}
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={useMyLocation}
        disabled={locating}
      >
        <Crosshair aria-hidden />
        {locating ? "جارٍ تحديد موقعك…" : "استخدم موقعي الحالي"}
      </Button>

      {geoError ? (
        <p className="rounded-md bg-warning/10 p-3 text-xs text-warning">{geoError}</p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="lat">خط العرض</Label>
          <Input
            id="lat"
            type="number"
            step="0.00001"
            dir="ltr"
            value={point?.lat ?? ""}
            onChange={(e) =>
              patch({
                point: {
                  lat: Number(e.target.value),
                  lng: point?.lng ?? 46.6753,
                },
              })
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lng">خط الطول</Label>
          <Input
            id="lng"
            type="number"
            step="0.00001"
            dir="ltr"
            value={point?.lng ?? ""}
            onChange={(e) =>
              patch({
                point: {
                  lat: point?.lat ?? 24.7136,
                  lng: Number(e.target.value),
                },
              })
            }
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="address">وصف العنوان</Label>
        <Input
          id="address"
          placeholder="مثال: طريق الثمامة، بعد مخرج 12"
          value={value?.addressText ?? ""}
          onChange={(e) => patch({ addressText: e.target.value })}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">ملاحظات للمزوّد (اختياري)</Label>
        <Input
          id="notes"
          placeholder="مثال: الاتصال قبل الوصول بنصف ساعة"
          value={value?.notes ?? ""}
          onChange={(e) => patch({ notes: e.target.value })}
        />
      </div>
    </div>
  );
}
