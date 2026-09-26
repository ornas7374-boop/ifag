import { PageHeader } from "@/components/layout/page-shell";
import { CommissionForm } from "@/components/forms/commission-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ar } from "@/content/ar";
import { formatSAR } from "@/lib/format";
import { halalas, pctH } from "@/lib/money";
import { DEFAULT_COMMISSION_RATE } from "@/lib/pricing";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

/** أمثلة توضّح أثر النسبة على مبالغ واقعية. */
const EXAMPLES = [50_000, 120_000, 320_000] as const;

export const metadata = { title: ar.admin.commission };

export default async function Page() {
  let rate = DEFAULT_COMMISSION_RATE;
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("platform_settings")
      .select("commission_rate")
      .maybeSingle();
    if (data) rate = Number(data.commission_rate);
  }

  return (
    <>
      <PageHeader
        title={ar.admin.commission}
        description="النسبة تُطبَّق على إجمالي الحجز أو الطلب، ويُخصم الباقي للمزوّد."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>النسبة الحالية</CardTitle>
          </CardHeader>
          <CardContent>
            <CommissionForm ratePercent={rate * 100} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>أمثلة محسوبة على النسبة الحالية</CardTitle>
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
