"use client";

import { useActionState } from "react";

import { updateCommission, type SettingsResult } from "@/app/(admin)/admin/settings/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * ★ فعلي، ويُطبَّق على الحجوزات الجديدة فورًا ★
 * create_booking في القاعدة (0016) تقرأ platform_settings.commission_rate
 * مباشرة عند كل حجز — لا حاجة لأي نشر أو تعديل كود بعد هذا الحفظ.
 */
export function CommissionForm({ ratePercent }: { ratePercent: number }) {
  const [state, action, pending] = useActionState<SettingsResult, FormData>(
    updateCommission,
    null,
  );

  return (
    <form action={action} className="space-y-4">
      {state?.ok === true ? (
        <Badge variant="success">
          حُفظت. تُطبَّق على كل حجز أو طلب جديد من الآن.
        </Badge>
      ) : null}
      {state?.ok === false ? (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="rate">نسبة العمولة (%)</Label>
        <Input
          id="rate"
          name="rate"
          type="number"
          min={0}
          max={100}
          step="0.5"
          dir="ltr"
          defaultValue={ratePercent.toString()}
        />
      </div>
      <p className="text-xs leading-6 text-muted-foreground">
        القيمة تُقرأ من <code dir="ltr">platform_settings.commission_rate</code>{" "}
        وليست ثابتة في الكود. لا تؤثر على حجوزات أُنشئت قبل الحفظ — مبلغها
        محفوظ وقت إنشائها.
      </p>

      <Button type="submit" disabled={pending}>
        {pending ? "جارٍ الحفظ…" : "حفظ النسبة"}
      </Button>
    </form>
  );
}
