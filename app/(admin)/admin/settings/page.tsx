import Link from "next/link";

import { PageHeader } from "@/components/layout/page-shell";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { ar } from "@/content/ar";

export const metadata = { title: ar.admin.settings };

const sections = [
  { href: "/admin/settings/branding", label: ar.admin.branding, hint: "الاسم، الشعار، الألوان، الخط" },
  { href: "/admin/commission", label: ar.admin.commission, hint: "نسبة عمولة المنصة" },
];

export default function Page() {
  return (
    <>
      <PageHeader title={ar.admin.settings} />
      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardContent className="space-y-1 p-5">
                <CardTitle className="text-base">{section.label}</CardTitle>
                <p className="text-sm text-muted-foreground">{section.hint}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
