import { MapPin } from "lucide-react";

import { PageHeader } from "@/components/layout/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/states/empty-state";
import { MapView } from "@/components/map/map-view";
import { ar } from "@/content/ar";
import { listAddresses } from "@/lib/data";

export const metadata = { title: ar.account.addresses };

export default async function Page() {
  const addresses = await listAddresses();

  return (
    <>
      <PageHeader
        title={ar.account.addresses}
        description="تُستخدم عند طلب خدمة تحتاج توصيلًا، فلا تكرر إدخالها."
      />

      {addresses.length === 0 ? (
        <EmptyState title="لا توجد عناوين محفوظة" hint="يُحفظ العنوان تلقائيًا عند أول طلب توصيل." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <Card key={a.id}>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="flex items-center gap-2 font-medium">
                      <MapPin className="size-4 text-primary" aria-hidden />
                      {a.label_ar ?? "عنوان محفوظ"}
                    </p>
                    <p className="text-sm text-muted-foreground">{a.address_text}</p>
                    {a.notes ? (
                      <p className="text-xs text-muted-foreground">{a.notes}</p>
                    ) : null}
                  </div>
                  <Button variant="ghost" size="sm" className="text-destructive">
                    {ar.common.delete}
                  </Button>
                </div>
                <MapView center={a.location} className="min-h-40" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
