import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PageHeader } from "@/components/layout/page-shell";
import { ImageManager } from "@/components/forms/image-manager";
import { ServiceDetailsForm } from "@/components/forms/service-details-form";
import { LISTING_STATUS_LABEL } from "@/components/domain/listing-manage-row";
import { Separator } from "@/components/ui/separator";
import { ar } from "@/content/ar";
import { halalas } from "@/lib/money";
import { listingImagePublicUrl } from "@/lib/storage";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "تعديل الخدمة" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!isSupabaseConfigured) notFound();

  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: service } = await supabase
    .from("services")
    .select(
      "id, title_ar, description_ar, host_id, status, price, pricing_mode, min_quantity, unit_label_ar, requires_delivery, delivery_strategy, delivery_fee, free_delivery_over, max_distance_km, listing_images(id, storage_path, sort_order, is_cover)",
    )
    .eq("id", id)
    .maybeSingle();

  if (!service || !user || service.host_id !== user.id) notFound();

  const images = [...service.listing_images]
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
        href="/host/services"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowRight className="size-4" aria-hidden />
        {ar.host.services}
      </Link>
      <PageHeader
        title={service.title_ar}
        description={`الحالة: ${LISTING_STATUS_LABEL[service.status].label}`}
      />

      <ServiceDetailsForm
        service={{
          id: service.id,
          title_ar: service.title_ar,
          description_ar: service.description_ar,
          price: halalas(service.price),
          pricing_mode: service.pricing_mode,
          min_quantity: service.min_quantity,
          unit_label_ar: service.unit_label_ar,
          requires_delivery: service.requires_delivery,
          delivery_strategy: service.delivery_strategy,
          delivery_fee: halalas(service.delivery_fee),
          free_delivery_over:
            service.free_delivery_over === null ? null : halalas(service.free_delivery_over),
          max_distance_km: service.max_distance_km,
        }}
      />

      <Separator className="my-8" />

      <h2 className="mb-4 text-lg font-bold text-foreground">الصور</h2>
      <ImageManager target="service" targetId={service.id} images={images} />
    </>
  );
}
