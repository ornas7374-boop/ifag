"use client";

import { useActionState } from "react";

import { updatePlace, type UpdateResult } from "@/app/(host)/host/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { halalasToSar } from "@/lib/money";
import type { Place } from "@/types/domain";

type EditablePlace = Pick<
  Place,
  | "id"
  | "title_ar"
  | "description_ar"
  | "capacity_min"
  | "capacity_max"
  | "turnaround_minutes"
  | "price_per_hour"
  | "price_per_day"
  | "price_per_night"
  | "cancellation_policy_ar"
  | "rules_ar"
>;

/**
 * تعديل السعر والتفاصيل بعد الإنشاء — لا الموقع ولا المرافق، تفاديًا
 * لمضاعفة منتقي الخريطة هنا (يبقيان من شاشة الإنشاء فقط في هذه
 * الدفعة). الحالة (منشور/قيد المراجعة) قرار إدارة، لا حقل هنا.
 */
export function PlaceDetailsForm({ place }: { place: EditablePlace }) {
  const [state, action, pending] = useActionState<UpdateResult, FormData>(
    updatePlace,
    null,
  );

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="id" value={place.id} />

      <Card>
        <CardHeader>
          <CardTitle>الأساسيات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">اسم المكان</Label>
            <Input id="title" name="title" defaultValue={place.title_ar} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">الوصف</Label>
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={place.description_ar}
              className="w-full rounded-md border border-input bg-card p-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="cap-min">أقل عدد أشخاص</Label>
              <Input
                id="cap-min"
                name="capacity_min"
                type="number"
                min={1}
                defaultValue={place.capacity_min}
                dir="ltr"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cap-max">أقصى عدد أشخاص</Label>
              <Input
                id="cap-max"
                name="capacity_max"
                type="number"
                min={1}
                defaultValue={place.capacity_max}
                dir="ltr"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>الأسعار</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            حدّد سعرًا واحدًا على الأقل. اتركه فارغًا لإخفاء نوع الحجز هذا.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="price_per_hour">بالساعة (ريال)</Label>
              <Input
                id="price_per_hour"
                name="price_per_hour"
                type="number"
                min={0}
                step="0.01"
                dir="ltr"
                defaultValue={
                  place.price_per_hour !== null
                    ? halalasToSar(place.price_per_hour)
                    : ""
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="price_per_day">باليوم (ريال)</Label>
              <Input
                id="price_per_day"
                name="price_per_day"
                type="number"
                min={0}
                step="0.01"
                dir="ltr"
                defaultValue={
                  place.price_per_day !== null ? halalasToSar(place.price_per_day) : ""
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="price_per_night">بالليلة (ريال)</Label>
              <Input
                id="price_per_night"
                name="price_per_night"
                type="number"
                min={0}
                step="0.01"
                dir="ltr"
                defaultValue={
                  place.price_per_night !== null
                    ? halalasToSar(place.price_per_night)
                    : ""
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>التجهيز والسياسات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="turnaround">مدة التجهيز بين حجزين (دقيقة)</Label>
            <Input
              id="turnaround"
              name="turnaround_minutes"
              type="number"
              min={0}
              step={15}
              dir="ltr"
              defaultValue={place.turnaround_minutes}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cancellation_policy">سياسة الإلغاء</Label>
            <textarea
              id="cancellation_policy"
              name="cancellation_policy"
              rows={3}
              defaultValue={place.cancellation_policy_ar}
              className="w-full rounded-md border border-input bg-card p-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rules">قوانين المكان (اختياري)</Label>
            <textarea
              id="rules"
              name="rules"
              rows={3}
              defaultValue={place.rules_ar ?? ""}
              className="w-full rounded-md border border-input bg-card p-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            />
          </div>
        </CardContent>
      </Card>

      {state?.ok === false ? (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      {state?.ok === true ? (
        <p className="rounded-md bg-success/10 p-3 text-sm text-success">
          حُفظت التغييرات.
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "جارٍ الحفظ…" : "حفظ التغييرات"}
      </Button>
    </form>
  );
}
