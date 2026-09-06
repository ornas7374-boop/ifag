import Link from "next/link";

import { PageHeader } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/states/empty-state";
import { ar } from "@/content/ar";
import { formatDate, formatSAR } from "@/lib/format";
import { listPlaces } from "@/lib/data";

export const metadata = { title: ar.admin.places };

const STATUS_LABEL = {
  draft: "مسودة",
  pending: "قيد المراجعة",
  published: "منشور",
  rejected: "مرفوض",
  suspended: "معلّق",
} as const;

export default async function Page() {
  const { data: places } = await listPlaces();

  return (
    <>
      <PageHeader
        title={ar.admin.places}
        description="الأماكن الجديدة لا تظهر للعامة حتى تُقبل من هنا."
      />

      {places.length === 0 ? (
        <EmptyState title="لا توجد أماكن" />
      ) : (
        <div className="space-y-3">
          {places.map((place) => (
            <Card key={place.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div className="min-w-0 space-y-1">
                  <Link
                    href={`/places/${place.slug}`}
                    className="font-semibold hover:underline"
                  >
                    {place.title_ar}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {place.city_name_ar} · أُضيف {formatDate(place.created_at)}
                    {place.price_per_night
                      ? ` · ${formatSAR(place.price_per_night)} لليلة`
                      : ""}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={place.status === "published" ? "success" : "warning"}
                  >
                    {STATUS_LABEL[place.status]}
                  </Badge>
                  <Button size="sm" variant="outline">
                    {ar.admin.approve}
                  </Button>
                  <Button size="sm" variant="ghost">
                    {ar.admin.reject}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
