import Link from "next/link";

import { PageHeader } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/states/empty-state";
import { ar } from "@/content/ar";
import { formatDate, formatSAR } from "@/lib/format";
import { priceUnitLabel } from "@/lib/adapters";
import { listServices } from "@/lib/data";

export const metadata = { title: ar.admin.services };

const STATUS_LABEL = {
  draft: "مسودة",
  pending: "قيد المراجعة",
  published: "منشور",
  rejected: "مرفوض",
  suspended: "معلّق",
} as const;

export default async function Page() {
  const { data: services } = await listServices();

  return (
    <>
      <PageHeader
        title={ar.admin.services}
        description="الخدمات الجديدة لا تظهر للعامة حتى تُقبل من هنا."
      />

      {services.length === 0 ? (
        <EmptyState title="لا توجد خدمات" />
      ) : (
        <div className="space-y-3">
          {services.map((s) => (
            <Card key={s.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div className="min-w-0 space-y-1">
                  <Link href={`/services/${s.slug}`} className="font-semibold hover:underline">
                    {s.title_ar}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {s.city_name_ar} · {formatSAR(s.price)} {priceUnitLabel(s.pricing_mode)}
                    {" · "}أُضيفت {formatDate(s.created_at)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={s.status === "published" ? "success" : "warning"}>
                    {STATUS_LABEL[s.status]}
                  </Badge>
                  <Button size="sm" variant="outline">{ar.admin.approve}</Button>
                  <Button size="sm" variant="ghost">{ar.admin.reject}</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
