import { PageHeader } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ar } from "@/content/ar";
import { formatSAR } from "@/lib/format";
import { halalas, pctH } from "@/lib/money";
import { DEFAULT_COMMISSION_RATE } from "@/lib/pricing";

export const metadata = { title: ar.admin.commission };

/** أمثلة توضّح أثر النسبة على مبالغ واقعية. */
const EXAMPLES = [50_000, 120_000, 320_000] as const;

export default function Page() {
  const rate = DEFAULT_COMMISSION_RATE;

  return (
    <>
      <PageHeader
        title={ar.admin.commission}
        description="النسبة تُطبَّق على إجمالي الحجز أو الطلب، ويُخصم الباقي للمزوّد."
      />

      <div className="mb-4">
        <Badge variant="warning">
          للعرض فقط — التعديل والحفظ يُفعّلان عند ربط قاعدة البيانات
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>النسبة الحالية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="rate">نسبة العمولة (%)</Label>
              <Input
                id="rate"
                type="number"
                min={0}
                max={100}
                step="0.5"
                dir="ltr"
                defaultValue={(rate * 100).toString()}
                disabled
              />
            </div>
            <p className="text-xs leading-6 text-muted-foreground">
              القيمة تُقرأ من <code dir="ltr">platform_settings.commission_rate</code>{" "}
              وليست ثابتة في الكود. يمكن لاحقًا دعم نسب مختلفة حسب نوع الخدمة
              بإضافة صفوف لكل تصنيف.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>أمثلة محسوبة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {EXAMPLES.map((amount) => {
              const total = halalas(amount);
              const commission = pctH(total, rate);
              const net = halalas(total - commission);
              return (
                <div key={amount} className="space-y-1">
                  <div className="flex justify-between font-medium">
                    <span>إجمالي الطلب</span>
                    <span>{formatSAR(total)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>عمولة المنصة</span>
                    <span>- {formatSAR(commission)}</span>
                  </div>
                  <div className="flex justify-between text-success">
                    <span>صافي المزوّد</span>
                    <span>{formatSAR(net)}</span>
                  </div>
                  <Separator className="mt-3" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
