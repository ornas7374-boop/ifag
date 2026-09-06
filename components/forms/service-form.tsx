"use client";

import * as React from "react";

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
import {
  DELIVERY_STRATEGIES,
  PricingModeField,
} from "@/components/forms/pricing-mode-field";
import type { City, DeliveryFeeStrategy, PricingMode, ServiceKind } from "@/types/domain";

const SERVICE_KINDS: { value: ServiceKind; label: string; hint: string }[] = [
  { value: "setup", label: "خدمة تجهيز", hint: "تُركّب في موقع العميل — خيمة، جلسة، تجهيز مناسبة." },
  { value: "product", label: "منتج / معدات", hint: "تُؤجَّر وتُوصَّل — طاولات، كراسي، إضاءة." },
  { value: "labor", label: "خدمة عمالة", hint: "أشخاص يقدّمون الخدمة — صبّاب، عامل تجهيز." },
];

/**
 * نموذج إضافة خدمة.
 *
 * لا شيء هنا مثبّت في الشيفرة: نوع الخدمة وطريقة التسعير واستراتيجية
 * التوصيل كلها قوائم بيانات، فيستطيع المزوّد تركيب أي خدمة دون
 * أن نضيف له نموذجًا خاصًا.
 */
export function ServiceForm({ cities }: { cities: City[] }) {
  const [kind, setKind] = React.useState<ServiceKind>("setup");
  const [price, setPrice] = React.useState("");
  const [mode, setMode] = React.useState<PricingMode>("per_booking");
  const [requiresDelivery, setRequiresDelivery] = React.useState(true);
  const [strategy, setStrategy] = React.useState<DeliveryFeeStrategy>("flat");
  const [submitted, setSubmitted] = React.useState(false);

  const strategySpec = DELIVERY_STRATEGIES.find((s) => s.value === strategy);

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
            <Label htmlFor="title">اسم الخدمة</Label>
            <Input id="title" name="title" required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">الوصف</Label>
            <textarea
              id="description"
              name="description"
              rows={4}
              className="w-full rounded-md border border-input bg-card p-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="kind">نوع الخدمة</Label>
              <Select value={kind} onValueChange={(v) => setKind(v as ServiceKind)}>
                <SelectTrigger id="kind">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_KINDS.map((k) => (
                    <SelectItem key={k.value} value={k.value}>
                      {k.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {SERVICE_KINDS.find((k) => k.value === kind)?.hint}
              </p>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>التسعير</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <PricingModeField
            mode={mode}
            price={price}
            onModeChange={setMode}
            onPriceChange={setPrice}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="min-qty">أقل كمية</Label>
              <Input id="min-qty" type="number" min={1} defaultValue={1} dir="ltr" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="unit-label">وحدة القياس</Label>
              <Input id="unit-label" placeholder="خيمة / طقم / صبّاب" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>التوصيل</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex cursor-pointer items-center gap-3 text-sm">
            <Checkbox
              checked={requiresDelivery}
              onCheckedChange={(v) => setRequiresDelivery(v === true)}
            />
            <span>هذه الخدمة تحتاج توصيل لموقع العميل</span>
          </label>

          {requiresDelivery ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="strategy">طريقة حساب الرسوم</Label>
                <Select
                  value={strategy}
                  onValueChange={(v) => setStrategy(v as DeliveryFeeStrategy)}
                >
                  <SelectTrigger id="strategy">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DELIVERY_STRATEGIES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">{strategySpec?.hint}</p>
              </div>

              {strategy !== "free" ? (
                <div className="space-y-1.5">
                  <Label htmlFor="fee">رسوم التوصيل (ريال)</Label>
                  <Input id="fee" type="number" min={0} step="0.01" dir="ltr" />
                </div>
              ) : null}

              <div className="space-y-1.5">
                <Label htmlFor="free-over">توصيل مجاني فوق (ريال، اختياري)</Label>
                <Input id="free-over" type="number" min={0} dir="ltr" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="max-km">أقصى مسافة (كم)</Label>
                <Input id="max-km" type="number" min={1} dir="ltr" />
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" size="lg">
          حفظ الخدمة
        </Button>
        {submitted ? (
          <p className="text-sm text-muted-foreground">
            النموذج مكتمل — الحفظ في قاعدة البيانات يُفعّل عند ربط Supabase.
          </p>
        ) : null}
      </div>
    </form>
  );
}
