import Link from "next/link";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/layout/page-shell";
import { ListingManageRow } from "@/components/domain/listing-manage-row";
import { EmptyState } from "@/components/states/empty-state";
import { Button } from "@/components/ui/button";
import { ar } from "@/content/ar";
import { listServices } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: ar.host.services };

export default async function Page() {
  // قبل ربط Supabase لا يوجد عميل حقيقي أصلًا — التحقق يسبق الإنشاء.
  let user = null;
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    user = (await supabase.auth.getUser()).data.user;
  }

  const { data: services } = user
    ? await listServices({ hostId: user.id })
    : { data: [] };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <PageHeader title={ar.host.services} />
        <Button asChild>
          <Link href="/host/services/new">
            <Plus aria-hidden />
            {ar.host.addService}
          </Link>
        </Button>
      </div>

      {services.length === 0 ? (
        <EmptyState
          title="لم تضف أي خدمة بعد"
          action={
            <Button asChild>
              <Link href="/host/services/new">{ar.host.addService}</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {services.map((s) => (
            <ListingManageRow
              key={s.id}
              title={s.title_ar}
              imageUrl={s.cover_image_url}
              city={s.city_name_ar}
              status={s.status}
              price={s.price}
              priceUnit={s.pricing_mode}
              rating={s.rating_avg}
              ratingCount={s.rating_count}
              viewHref={`/services/${s.slug}`}
              editHref={`/host/services/${s.id}/edit`}
            />
          ))}
        </div>
      )}
    </>
  );
}
