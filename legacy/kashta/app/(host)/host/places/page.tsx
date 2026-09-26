import Link from "next/link";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/layout/page-shell";
import { ListingManageRow } from "@/components/domain/listing-manage-row";
import { EmptyState } from "@/components/states/empty-state";
import { Button } from "@/components/ui/button";
import { ar } from "@/content/ar";
import { listPlaces } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: ar.host.places };

export default async function Page() {
  // قبل ربط Supabase (المعاينة الهيكلية) لا يوجد عميل حقيقي أصلًا —
  // requireSupabaseEnv يرمي خطأ فورًا، فنتحقق من isSupabaseConfigured
  // قبل إنشاء العميل لا بعده.
  let user = null;
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    user = (await supabase.auth.getUser()).data.user;
  }

  // بلا مستخدم (معاينة، أو زائر لم يُطرد بعد) ⇒ لا نطاق مضيف
  // لتصفيته به، فتبقى القائمة فارغة بدل كشف أماكن الجميع.
  const { data: places } = user
    ? await listPlaces({ hostId: user.id })
    : { data: [] };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <PageHeader title={ar.host.places} />
        <Button asChild>
          <Link href="/host/places/new">
            <Plus aria-hidden />
            {ar.host.addPlace}
          </Link>
        </Button>
      </div>

      {places.length === 0 ? (
        <EmptyState
          title="لم تضف أي مكان بعد"
          action={
            <Button asChild>
              <Link href="/host/places/new">{ar.host.addPlace}</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {places.map((p) => (
            <ListingManageRow
              key={p.id}
              title={p.title_ar}
              imageUrl={p.cover_image_url}
              city={p.city_name_ar}
              status={p.status}
              price={p.price_per_night ?? p.price_per_day ?? p.price_per_hour!}
              priceUnit={p.price_per_night ? "night" : p.price_per_day ? "day" : "hour"}
              rating={p.rating_avg}
              ratingCount={p.rating_count}
              viewHref={`/places/${p.slug}`}
              editHref={`/host/places/${p.id}/edit`}
            />
          ))}
        </div>
      )}
    </>
  );
}
