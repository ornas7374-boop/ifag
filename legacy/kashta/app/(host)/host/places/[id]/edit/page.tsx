import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PageHeader } from "@/components/layout/page-shell";
import { ImageManager } from "@/components/forms/image-manager";
import { PlaceDetailsForm } from "@/components/forms/place-details-form";
import { LISTING_STATUS_LABEL } from "@/components/domain/listing-manage-row";
import { Separator } from "@/components/ui/separator";
import { ar } from "@/content/ar";
import { halalas } from "@/lib/money";
import { listingImagePublicUrl } from "@/lib/storage";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "تعديل المكان" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // بلا قاعدة حقيقية لا يوجد إعلان فعلي لتعديله.
  if (!isSupabaseConfigured) notFound();

  const { id } = await params;
  const supabase = await createClient();

  // "published places are public" في 0012 تعني: لو المكان لغيري
  // ومنشور، هذا الاستعلام سينجح ويُظهره لي — أفحص host_id صراحةً
  // بدل الاتكال على RLS وحدها لهذه الشاشة الإدارية تحديدًا.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: place } = await supabase
    .from("places")
    .select(
      "id, title_ar, description_ar, host_id, status, capacity_min, capacity_max, turnaround_minutes, price_per_hour, price_per_day, price_per_night, cancellation_policy_ar, rules_ar, listing_images(id, storage_path, sort_order, is_cover)",
    )
    .eq("id", id)
    .maybeSingle();

  if (!place || !user || place.host_id !== user.id) notFound();

  const images = [...place.listing_images]
    .sort((a, b) => Number(b.is_cover) - Number(a.is_cover) || a.sort_order - b.sort_order)
    .map((i) => ({
      id: i.id,
      storage_path: i.storage_path,
      url: listingImagePublicUrl(i.storage_path),
      sort_order: i.sort_order,
      is_cover: i.is_cover,
    }));

  return (
    <>
      <Link
        href="/host/places"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowRight className="size-4" aria-hidden />
        {ar.host.places}
      </Link>
      <PageHeader
        title={place.title_ar}
        description={`الحالة: ${LISTING_STATUS_LABEL[place.status].label}`}
      />

      <PlaceDetailsForm
        place={{
          id: place.id,
          title_ar: place.title_ar,
          description_ar: place.description_ar,
          capacity_min: place.capacity_min,
          capacity_max: place.capacity_max,
          turnaround_minutes: place.turnaround_minutes,
          price_per_hour: place.price_per_hour === null ? null : halalas(place.price_per_hour),
          price_per_day: place.price_per_day === null ? null : halalas(place.price_per_day),
          price_per_night:
            place.price_per_night === null ? null : halalas(place.price_per_night),
          cancellation_policy_ar: place.cancellation_policy_ar,
          rules_ar: place.rules_ar,
        }}
      />

      <Separator className="my-8" />

      <h2 className="mb-4 text-lg font-bold text-foreground">الصور</h2>
      <ImageManager target="place" targetId={place.id} images={images} />
    </>
  );
}
