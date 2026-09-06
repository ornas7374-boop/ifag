"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PricingModeField } from "@/components/forms/pricing-mode-field";
import { EmptyState } from "@/components/states/empty-state";
import { formatSAR } from "@/lib/format";
import { priceUnitLabel } from "@/lib/adapters";
import type { Addon, PricingMode } from "@/types/domain";

/**
 * إضافة وتعديل الخدمات الإضافية.
 *
 * تستخدم نفس PricingModeField المستخدم في نموذج الخدمة — الإضافات
 * والخدمات تتشاركان enum التسعير نفسه في قاعدة البيانات، فمن الطبيعي
 * أن تتشاركا الحقل نفسه في الواجهة.
 */
export function AddonsManager({ initial }: { initial: Addon[] }) {
  const [addons, setAddons] = React.useState(initial);
  const [name, setName] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [mode, setMode] = React.useState<PricingMode>("per_booking");

  const canAdd = name.trim().length > 1 && Number(price) > 0;

  function add() {
    if (!canAdd) return;
    setAddons((cur) => [
      ...cur,
      {
        id: `new-${Date.now()}`,
        place_id: cur[0]?.place_id ?? "",
        name_ar: name.trim(),
        description_ar: null,
        image_url: null,
        price: Math.round(Number(price) * 100) as Addon["price"],
        pricing_mode: mode,
      },
    ]);
    setName("");
    setPrice("");
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="space-y-1.5">
            <Label htmlFor="addon-name">اسم الإضافة</Label>
            <Input
              id="addon-name"
              placeholder="بروجكتر، سماعة، خيمة إضافية…"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <PricingModeField
            mode={mode}
            price={price}
            onModeChange={setMode}
            onPriceChange={setPrice}
          />

          <Button onClick={add} disabled={!canAdd}>
            <Plus aria-hidden />
            إضافة
          </Button>
        </CardContent>
      </Card>

      {addons.length === 0 ? (
        <EmptyState title="لا توجد إضافات بعد" hint="أضف أول إضافة من الأعلى." />
      ) : (
        <ul className="space-y-3">
          {addons.map((a) => (
            <li key={a.id}>
              <Card>
                <CardContent className="flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <p className="font-medium">{a.name_ar}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatSAR(a.price)} {priceUnitLabel(a.pricing_mode)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => setAddons((c) => c.filter((x) => x.id !== a.id))}
                    aria-label={`حذف ${a.name_ar}`}
                  >
                    <Trash2 aria-hidden />
                  </Button>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-muted-foreground">
        التغييرات معروضة محليًا — الحفظ في قاعدة البيانات يُفعّل عند ربط Supabase.
      </p>
    </div>
  );
}
