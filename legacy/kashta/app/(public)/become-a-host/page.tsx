import Link from "next/link";
import { CalendarCheck, Coins, ShieldCheck, Wrench } from "lucide-react";

import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getBrand } from "@/config/brand";
import { ar } from "@/content/ar";
import { DEFAULT_COMMISSION_RATE } from "@/lib/pricing";
import { formatNumber } from "@/lib/format";

export const metadata = { title: ar.nav.becomeHost };

const BENEFITS = [
  {
    icon: CalendarCheck,
    title: "تقويم يمنع التعارض",
    body: "لا يمكن أن يُحجز مكانك مرتين في نفس الوقت — المنع مطبَّق في قاعدة البيانات نفسها، لا في الواجهة.",
  },
  {
    icon: Wrench,
    title: "تتحكم في وقت التجهيز",
    body: "حدّد مدة التنظيف بين الحجوزات، وعدّلها لأي حجز على حدة. خروج العميل مبكرًا يحرّر الوقت دون أن يُنقص مبلغك.",
  },
  {
    icon: Coins,
    title: "أرباح واضحة",
    body: "ترى إجمالي المبيعات والعمولة والصافي لكل حجز وطلب، بلا رسوم خفية.",
  },
  {
    icon: ShieldCheck,
    title: "مراجعة قبل النشر",
    body: "كل مكان وخدمة تُراجع قبل ظهورها، فتبقى جودة المنصة محمية للجميع.",
  },
];

export default async function Page() {
  const brand = await getBrand();
  const rate = formatNumber(Math.round(DEFAULT_COMMISSION_RATE * 100));

  return (
    <PageShell>
      <section className="mb-12 space-y-4 text-center">
        <h1 className="text-3xl font-bold sm:text-4xl">
          أضف مكانك أو خدمتك إلى {brand.appName}
        </h1>
        <p className="mx-auto max-w-2xl text-base leading-8 text-muted-foreground">
          سواء كنت تملك كشتة أو مخيمًا أو موقعًا بريًا، أو تقدّم خدمات تجهيز
          ومعدات وعمالة — تصلك الحجوزات والطلبات في مكان واحد.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button size="lg" asChild>
            <Link href="/register">{ar.auth.register}</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/host/places/new">{ar.host.addPlace}</Link>
          </Button>
        </div>
      </section>

      <section className="mb-12 grid gap-4 sm:grid-cols-2">
        {BENEFITS.map(({ icon: Icon, title, body }) => (
          <Card key={title}>
            <CardContent className="space-y-2 p-5">
              <Icon className="size-6 text-primary" aria-hidden />
              <h2 className="font-semibold">{title}</h2>
              <p className="text-sm leading-7 text-muted-foreground">{body}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="rounded-lg border border-border bg-card p-6 text-center">
        <h2 className="mb-2 text-lg font-semibold">كيف تحتسب العمولة؟</h2>
        <p className="mx-auto max-w-xl text-sm leading-8 text-muted-foreground">
          تأخذ المنصة {rate}% من قيمة كل حجز أو طلب مكتمل، والباقي لك. لا
          رسوم اشتراك ولا رسوم إضافة. النسبة معروضة لك في كل حجز قبل وبعد
          التأكيد.
        </p>
      </section>
    </PageShell>
  );
}
