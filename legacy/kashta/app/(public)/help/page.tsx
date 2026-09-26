import Link from "next/link";

import { PageShell, PageHeader } from "@/components/layout/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { getBrand } from "@/config/brand";
import { ar } from "@/content/ar";

export const metadata = { title: ar.nav.help };

const FAQ = [
  {
    q: "ما الفرق بين حجز مكان وطلب خدمة؟",
    a: "حجز المكان يعني استئجار موقع لفترة محددة (بالساعة أو اليوم أو الليلة). أما طلب الخدمة فهو شراء تجهيزات أو معدات أو عمالة تُوصَّل إلى الموقع الذي تحدده أنت — سواء كان مكانًا حجزته من المنصة أو موقعًا خاصًا بك.",
  },
  {
    q: "متى يصبح المكان متاحًا بعد انتهاء الحجز السابق؟",
    a: "يحدد صاحب المكان مدة تجهيز بعد كل حجز للتنظيف والترتيب. إذا خرج العميل السابق مبكرًا، يستطيع صاحب المكان تقديم وقت الإتاحة فيصبح المكان قابلًا للحجز قبل الموعد الأصلي.",
  },
  {
    q: "كيف تُحسب رسوم التوصيل؟",
    a: "يحدد كل مقدّم خدمة طريقته: مجانًا، أو سعرًا ثابتًا، أو حسب المدينة أو الحي أو المسافة. تظهر الرسوم منفصلة عن قيمة الخدمات قبل الدفع، وبعض المزوّدين يقدّمون توصيلًا مجانيًا فوق مبلغ معيّن.",
  },
  {
    q: "هل أستطيع طلب أكثر من خدمة في طلب واحد؟",
    a: "نعم. أضف ما تحتاجه إلى السلة ثم حدد الموقع والوقت مرة واحدة. تُحسب رسوم التوصيل لكل مزوّد على حدة لأن لكل واحد منهم رحلته الخاصة.",
  },
  {
    q: "ما سياسة الإلغاء؟",
    a: "تختلف من مكان لآخر ويحددها صاحبه، وهي معروضة في صفحة المكان قبل الحجز وفي تفاصيل حجزك بعده.",
  },
];

export default async function Page() {
  const brand = await getBrand();

  return (
    <PageShell>
      <PageHeader title={ar.nav.help} description="أكثر الأسئلة تكرارًا." />

      <div className="space-y-3">
        {FAQ.map((item) => (
          <Card key={item.q}>
            <CardContent className="p-0">
              <details className="group">
                <summary className="cursor-pointer p-5 font-medium marker:content-none">
                  {item.q}
                </summary>
                <p className="px-5 pb-5 text-sm leading-8 text-muted-foreground">
                  {item.a}
                </p>
              </details>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardContent className="space-y-2 p-5 text-sm">
          <p className="font-medium">لم تجد إجابتك؟</p>
          <p className="text-muted-foreground">
            {brand.contact.email ? (
              <>
                راسلنا على{" "}
                <a href={`mailto:${brand.contact.email}`} dir="ltr" className="text-primary hover:underline">
                  {brand.contact.email}
                </a>
              </>
            ) : (
              <>تواصل معنا عبر صفحة <Link href="/" className="text-primary hover:underline">المنصة</Link>.</>
            )}
          </p>
        </CardContent>
      </Card>
    </PageShell>
  );
}
