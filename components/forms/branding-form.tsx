"use client";

import { useActionState } from "react";

import { updateBranding, type SettingsResult } from "@/app/(admin)/admin/settings/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BrandConfig } from "@/types/brand";

const COLOR_FIELDS: { key: keyof Pick<BrandConfig["colors"]["light"], "primary" | "accent" | "background" | "foreground">; label: string }[] = [
  { key: "primary", label: "اللون الأساسي" },
  { key: "accent", label: "لون الإجراء" },
  { key: "background", label: "الخلفية" },
  { key: "foreground", label: "لون النص" },
];

/**
 * ★ الفعلي لا العرض فقط ★
 * تكتب platform_settings عبر updateBranding — getBrand() يقرأها في
 * الطلب التالي فتتغيّر الواجهة كلها فورًا، بلا إعادة نشر.
 */
export function BrandingForm({ brand }: { brand: BrandConfig }) {
  const [state, action, pending] = useActionState<SettingsResult, FormData>(
    updateBranding,
    null,
  );

  return (
    <form action={action}>
      {state?.ok === true ? (
        <div className="mb-4">
          <Badge variant="success">حُفظ. الواجهة كلها تعكس القيم الجديدة الآن.</Badge>
        </div>
      ) : null}
      {state?.ok === false ? (
        <p className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>الهوية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="appName">اسم المنصة</Label>
              <Input id="appName" name="appName" defaultValue={brand.appName} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="logoUrl">رابط الشعار</Label>
              <Input id="logoUrl" name="logoUrl" defaultValue={brand.logoUrl} dir="ltr" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="radius">انحناء الحواف</Label>
              <Input
                id="radius"
                name="radius"
                defaultValue={brand.radius}
                dir="ltr"
                placeholder="0.875rem"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fontFamily">الخط</Label>
              <Input
                id="fontFamily"
                name="fontFamily"
                defaultValue={brand.fontFamily}
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground">
                يجب أن يشير لخط مُحمَّل مسبقًا في app/layout.tsx — تغيير عائلة
                الخط كليًا يحتاج نشرًا جديدًا، بخلاف الألوان والاسم.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>الألوان (الوضع الفاتح)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {COLOR_FIELDS.map((f) => (
              <div key={f.key} className="space-y-1.5">
                <Label htmlFor={f.key}>{f.label}</Label>
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="size-10 shrink-0 rounded-md border border-border"
                    style={{ backgroundColor: brand.colors.light[f.key] }}
                  />
                  <Input
                    id={f.key}
                    name={f.key}
                    defaultValue={brand.colors.light[f.key]}
                    dir="ltr"
                    placeholder="#A65A2A"
                  />
                </div>
              </div>
            ))}
            <p className="text-xs text-muted-foreground">
              الوضع الداكن يُشتق تلقائيًا ولا يتأثر بهذي القيم حاليًا.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "جارٍ الحفظ…" : "حفظ التغييرات"}
        </Button>
      </div>
    </form>
  );
}
