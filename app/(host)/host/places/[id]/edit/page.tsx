import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PageHeader } from "@/components/layout/page-shell";
import { ImageManager } from "@/components/forms/image-manager";
import { LISTING_STATUS_LABEL } from "@/components/domain/listing-manage-row";
import { ar } from "@/content/ar";
import { listingImagePublicUrl } from "@/lib/storage";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "صور المكان" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // بلا قاعدة حقيقية لا يوجد إعلان فعلي لإدارة صوره.
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
    .select("id, title_ar, host_id, status, listing_images(id, storage_path, sort_order, is_cover)")
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
        description={`صور الإعلان — الحالة: ${LISTING_STATUS_LABEL[place.status].label}`}
      />
      <ImageManager target="place" targetId={place.id} images={images} />
    </>
  );
}
