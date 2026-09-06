import { PageHeader } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getBrand } from "@/config/brand";
import { ar } from "@/content/ar";

export const metadata = { title: ar.admin.branding };

/**
 * هدف المرحلة 11.
 *
 * الحقول معطّلة الآن، لكنها تقرأ القيم الحقيقية من getBrand() — أي أن
 * السلسلة كاملة (brand.ts ← متغيّرات CSS ← Tailwind ← المكونات) موصولة
 * وتعمل فعليًا اليوم. ما ينقص في المرحلة 11 هو الحفظ في platform_settings،
 * وهو تغيير في جسم getBrand() وحده.
 */
export default async function BrandingSettingsPage() {
  const brand = await getBrand();

  const colorRows = [
    { key: "primary", label: "اللون الأساسي", value: brand.colors.light.primary },
    { key: "accent", label: "لون الإجراء", value: brand.colors.light.accent },
    {
      key: "background",
      label: "الخلفية",
      value: brand.colors.light.background,
    },
    {
      key: "foreground",
      label: "لون النص",
      value: brand.colors.light.foreground,
    },
  ];

  return (
    <>
      <PageHeader
        title={ar.admin.branding}
        description="القيم المعروضة هنا هي القيم الفعلية المطبّقة على الواجهة الآن."
      />

      <div className="mb-4">
        <Badge variant="warning">للعرض فقط — التعديل يُفعّل في المرحلة 11</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>الهوية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="appName" className="text-sm font-medium">
                اسم المنصة
              </label>
              <Input id="appName" defaultValue={brand.appName} disabled />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="logoUrl" className="text-sm font-medium">
                رابط الشعار
              </label>
              <Input id="logoUrl" defaultValue={brand.logoUrl} dir="ltr" disabled />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="radius" className="text-sm font-medium">
                انحناء الحواف
              </label>
              <Input id="radius" defaultValue={brand.radius} dir="ltr" disabled />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="font" className="text-sm font-medium">
                الخط
              </label>
              <Input id="font" defaultValue={brand.fontFamily} dir="ltr" disabled />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>الألوان (الوضع الفاتح)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {colorRows.map((row) => (
              <div key={row.key} className="space-y-1.5">
                <label htmlFor={row.key} className="text-sm font-medium">
                  {row.label}
                </label>
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="size-10 shrink-0 rounded-md border border-border"
                    style={{ backgroundColor: row.value }}
                  />
                  <Input id={row.key} defaultValue={row.value} dir="ltr" disabled />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>معاينة حيّة</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          {/* هذه العناصر تستخدم نفس أصناف الثيم — تتغيّر فور تغيير config/brand.ts */}
          <Button>زر أساسي</Button>
          <Button variant="accent">زر إجراء</Button>
          <Button variant="outline">زر ثانوي</Button>
          <Badge>وسم</Badge>
          <Badge variant="success">مؤكد</Badge>
          <Badge variant="destructive">ملغى</Badge>
        </CardContent>
      </Card>
    </>
  );
}
