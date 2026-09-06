import { AlertTriangle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

/**
 * هيكل صفحة قانونية.
 *
 * العناوين موجودة لأنها بنية معروفة، لكن النص نفسه متروك عمدًا:
 * شروط أو سياسة خصوصية مُختلقة في منصة تتعامل بمدفوعات ومواقع
 * جغرافية وبيانات عملاء تُعرّض المالك لمسؤولية حقيقية. الصياغة
 * تحتاج مختصًا يعرف نظام التجارة الإلكترونية ونظام حماية البيانات
 * الشخصية السعودي.
 */
export function LegalShell({
  sections,
}: {
  sections: { heading: string; hint: string }[];
}) {
  return (
    <div className="space-y-6">
      <Card className="border-warning/40 bg-warning/5">
        <CardContent className="flex items-start gap-3 p-5">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden />
          <div className="space-y-1 text-sm">
            <p className="font-semibold text-foreground">
              هذه الصفحة تحتاج صياغة قانونية قبل الإطلاق
            </p>
            <p className="leading-7 text-muted-foreground">
              العناوين أدناه هي البنية المطلوبة، والنص يجب أن يكتبه مختص
              قانوني يراجع نظام التجارة الإلكترونية ونظام حماية البيانات
              الشخصية. لا تنشر المنصة بنص عام منسوخ.
            </p>
          </div>
        </CardContent>
      </Card>

      <ol className="space-y-4">
        {sections.map((s, i) => (
          <li key={s.heading}>
            <Card>
              <CardContent className="space-y-2 p-5">
                <h2 className="font-semibold">
                  {i + 1}. {s.heading}
                </h2>
                <p className="text-sm leading-7 text-muted-foreground">{s.hint}</p>
              </CardContent>
            </Card>
          </li>
        ))}
      </ol>
    </div>
  );
}
