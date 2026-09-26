import { PageShell, PageHeader } from "@/components/layout/page-shell";
import { LegalShell } from "@/components/domain/legal-shell";
import { ar } from "@/content/ar";

export const metadata = { title: ar.footer.privacy };

const SECTIONS = [
  { heading: "البيانات التي نجمعها", hint: "الاسم، الجوال، البريد، مواقع التوصيل الجغرافية، سجل الحجوزات والطلبات." },
  { heading: "الغرض من الجمع", hint: "تنفيذ الحجز أو الطلب، التواصل، تحسين الخدمة — كل غرض يُذكر صراحةً." },
  { heading: "مشاركة البيانات", hint: "ما الذي يراه المزوّد من بيانات العميل، وما الذي يراه العميل من بيانات المزوّد." },
  { heading: "بيانات الموقع الجغرافي", hint: "بند مستقل: المنصة تحفظ إحداثيات مواقع التوصيل، ويجب توضيح مدة الحفظ ومن يطّلع عليها." },
  { heading: "بيانات الدفع", hint: "المنصة لا تخزّن بيانات البطاقات إطلاقًا — تُعالَج لدى بوابة الدفع. يجب ذكر اسم البوابة." },
  { heading: "مدة الاحتفاظ", hint: "كم تبقى بيانات الحجوزات والطلبات، ومتى تُحذف." },
  { heading: "حقوق المستخدم", hint: "حق الاطلاع والتصحيح والحذف وسحب الموافقة، وفق نظام حماية البيانات الشخصية." },
  { heading: "ملفات الارتباط", hint: "ما يُستخدم منها ولأي غرض." },
  { heading: "أمن البيانات", hint: "إجراءات الحماية وآلية الإبلاغ عند وقوع خرق." },
  { heading: "التواصل", hint: "قناة تقديم طلبات الخصوصية والشكاوى." },
];

export default function Page() {
  return (
    <PageShell>
      <PageHeader title={ar.footer.privacy} />
      <LegalShell sections={SECTIONS} />
    </PageShell>
  );
}
