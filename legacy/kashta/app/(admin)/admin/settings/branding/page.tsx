import { PageHeader } from "@/components/layout/page-shell";
import { BrandingForm } from "@/components/forms/branding-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getBrand } from "@/config/brand";
import { ar } from "@/content/ar";

export const metadata = { title: ar.admin.branding };

export default async function BrandingSettingsPage() {
  const brand = await getBrand();

  return (
    <>
      <PageHeader
        title={ar.admin.branding}
        description="القيم المعروضة هنا هي القيم الفعلية المطبّقة على الواجهة الآن، وأي حفظ يظهر لكل زائر فورًا."
      />

      <BrandingForm brand={brand} />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>معاينة حيّة</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          {/* هذه العناصر تستخدم نفس أصناف الثيم — تتغيّر فور حفظ النموذج أعلاه */}
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
