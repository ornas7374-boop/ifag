"use client";

import * as React from "react";
import { useActionState } from "react";

import { updateService, type UpdateResult } from "@/app/(host)/host/actions";
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
import { halalasToSar } from "@/lib/money";
import type { DeliveryFeeStrategy, PricingMode, Service } from "@/types/domain";

type EditableService = Pick<
  Service,
  | "id"
  | "title_ar"
  | "description_ar"
  | "price"
  | "pricing_mode"
  | "min_quantity"
  | "unit_label_ar"
  | "requires_delivery"
  | "delivery_strategy"
  | "delivery_fee"
  | "free_delivery_over"
  | "max_distance_km"
>;

export function ServiceDetailsForm({ service }: { service: EditableService }) {
  const [state, action, pending] = useActionState<UpdateResult, FormData>(
    updateService,
    null,
  );
  const [price, setPrice] = React.useState(
    halalasToSar(service.price).toString(),
  );
  const [mode, setMode] = React.useState<PricingMode>(service.pricing_mode);
  const [requiresDelivery, setRequiresDelivery] = React.useState(
    service.requires_delivery,
  );
  const [strategy, setStrategy] = React.useState<DeliveryFeeStrategy>(
    service.delivery_strategy,
  );

  const strategySpec = DELIVERY_STRATEGIES.find((s) => s.value === strategy);

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="id" value={service.id} />
      <input type="hidden" name="pricing_mode" value={mode} />
      <input type="hidden" name="price" value={price} />
      <input type="hidden" name="delivery_strategy" value={strategy} />

      <Card>
        <CardHeader>
          <CardTitle>الأساسيات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">اسم الخدمة</Label>
            <Input id="title" name="title" defaultValue={service.title_ar} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">الوصف</Label>
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={service.description_ar}
              className="w-full rounded-md border border-input bg-card p-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            />
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
              <Input
                id="min-qty"
                name="min_quantity"
                type="number"
                min={1}
                defaultValue={service.min_quantity}
                dir="ltr"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="unit-label">وحدة القياس</Label>
              <Input
                id="unit-label"
                name="unit_label"
                defaultValue={service.unit_label_ar}
              />
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
              name="requires_delivery"
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
                  <Input
                    id="fee"
                    name="delivery_fee"
                    type="number"
                    min={0}
                    step="0.01"
                    dir="ltr"
                    defaultValue={halalasToSar(service.delivery_fee)}
                  />
                </div>
              ) : null}

              <div className="space-y-1.5">
                <Label htmlFor="free-over">توصيل مجاني فوق (ريال، اختياري)</Label>
                <Input
                  id="free-over"
                  name="free_delivery_over"
                  type="number"
                  min={0}
                  dir="ltr"
                  defaultValue={
                    service.free_delivery_over !== null
                      ? halalasToSar(service.free_delivery_over)
                      : ""
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="max-km">أقصى مسافة (كم)</Label>
                <Input
                  id="max-km"
                  name="max_distance_km"
                  type="number"
                  min={1}
                  dir="ltr"
                  defaultValue={service.max_distance_km ?? ""}
                />
              </div>
            </div>
          ) : null}
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
