import { PageShell, PageHeader } from "@/components/layout/page-shell";
import { LegalShell } from "@/components/domain/legal-shell";
import { ar } from "@/content/ar";

export const metadata = { title: ar.footer.terms };

const SECTIONS = [
  { heading: "التعريفات", hint: "المنصة، العميل، المزوّد، المكان، الخدمة، الحجز، الطلب." },
  { heading: "طبيعة دور المنصة", hint: "المنصة وسيط بين العميل والمزوّد — يجب تحديد حدود مسؤوليتها عن جودة المكان أو الخدمة صراحةً." },
  { heading: "التسجيل والحسابات", hint: "شروط إنشاء الحساب، صحة البيانات، مسؤولية حماية كلمة المرور." },
  { heading: "الحجوزات والطلبات", hint: "متى يُعد الحجز مؤكدًا، ما الذي يلزم الطرفين، وكيف تُحل الخلافات." },
  { heading: "الأسعار والعمولة والدفع", hint: "طريقة احتساب المبالغ، نسبة عمولة المنصة، وتوقيت تحويل مستحقات المزوّد." },
  { heading: "الإلغاء والاسترجاع", hint: "سياسة المنصة العامة وعلاقتها بسياسة كل مزوّد على حدة." },
  { heading: "التزامات المزوّد", hint: "دقة الوصف والصور، سلامة الموقع، الالتزام بالمواعيد، التراخيص المطلوبة." },
  { heading: "المحتوى والتقييمات", hint: "ملكية المحتوى المرفوع، وحق المنصة في إخفاء ما يخالف." },
  { heading: "إنهاء الخدمة", hint: "حالات تعليق أو إغلاق الحساب." },
  { heading: "القانون الواجب التطبيق", hint: "الاختصاص القضائي وآلية فض النزاعات." },
];

export default function Page() {
  return (
    <PageShell>
      <PageHeader title={ar.footer.terms} />
      <LegalShell sections={SECTIONS} />
    </PageShell>
  );
}
