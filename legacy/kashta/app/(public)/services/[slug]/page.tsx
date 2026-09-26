import Image from "next/image";
import { notFound } from "next/navigation";
import { MapPin, Truck, Wrench } from "lucide-react";

import { PageShell } from "@/components/layout/page-shell";
import { PriceBreakdown } from "@/components/domain/price-breakdown";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { RatingStars } from "@/components/domain/rating-stars";
import { FavoriteButton } from "@/components/domain/favorite-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ar } from "@/content/ar";
import { formatNumber, formatSAR } from "@/lib/format";
import { getServiceBySlug, listReviews } from "@/lib/data";
import { priceUnitLabel } from "@/lib/adapters";
import {
  buildQuote,
  DEFAULT_COMMISSION_RATE,
  serviceLine,
} from "@/lib/pricing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  return { title: service?.title_ar ?? ar.states.notFoundTitle };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) notFound();

  const reviews = await listReviews();

  // معاينة: أقل كمية مسموحة. الخادم يعيد الحساب عند الطلب الفعلي.
  const line = serviceLine(service, service.min_quantity, { hours: 4, persons: 1 });
  const quote = buildQuote({
    lines: [line],
    delivery: service.requires_delivery
      ? {
          strategy: service.delivery_strategy,
          fee: service.delivery_fee,
          freeOver: service.free_delivery_over,
          distanceKm: 15,
          itemsSubtotal: line.amount,
        }
      : undefined,
    commissionRate: DEFAULT_COMMISSION_RATE,
  });

  return (
    <PageShell>
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted sm:col-span-2">
          <Image
            src={service.cover_image_url}
            alt={service.title_ar}
            fill
            sizes="(max-width: 640px) 100vw, 66vw"
            className="object-cover"
            priority
          />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <header className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{service.city_name_ar}</Badge>
              {service.requires_delivery ? (
                <Badge variant="accent">{ar.listing.requiresDelivery}</Badge>
              ) : null}
              {service.requires_setup ? (
                <Badge variant="outline">يشمل التركيب</Badge>
              ) : null}
            </div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              {service.title_ar}
            </h1>
            <RatingStars
              rating={service.rating_avg}
              count={service.rating_count}
            />
          </header>

          <section>
            <h2 className="mb-2 text-lg font-semibold">
              {ar.listing.aboutService}
            </h2>
            <p className="leading-8 text-muted-foreground">
              {service.description_ar}
            </p>
          </section>

          <Separator />

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-2 text-sm">
              <Truck className="size-4 text-primary" aria-hidden />
              <span className="text-muted-foreground">
                {ar.listing.deliveryFee}:
              </span>
              <span className="font-medium">
                {service.delivery_strategy === "free"
                  ? ar.listing.freeDelivery
                  : formatSAR(service.delivery_fee)}
              </span>
            </div>

            {service.max_distance_km ? (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="size-4 text-primary" aria-hidden />
                <span className="text-muted-foreground">أقصى مسافة:</span>
                <span className="font-medium">
                  {formatNumber(service.max_distance_km)} كم
                </span>
              </div>
            ) : null}

            {service.setup_duration_minutes ? (
              <div className="flex items-center gap-2 text-sm">
                <Wrench className="size-4 text-primary" aria-hidden />
                <span className="text-muted-foreground">مدة التجهيز:</span>
                <span className="font-medium">
                  {formatNumber(service.setup_duration_minutes)} دقيقة
                </span>
              </div>
            ) : null}

            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">الكمية:</span>
              <span className="font-medium">
                من {formatNumber(service.min_quantity)}
                {service.max_quantity
                  ? ` إلى ${formatNumber(service.max_quantity)}`
                  : ""}{" "}
                {service.unit_label_ar}
              </span>
            </div>
          </section>

          {service.free_delivery_over ? (
            <p className="rounded-md bg-success/10 p-3 text-sm text-success">
              {ar.listing.freeDelivery} للطلبات فوق{" "}
              {formatSAR(service.free_delivery_over)}
            </p>
          ) : null}

          <Separator />

          <section>
            <h2 className="mb-3 text-lg font-semibold">{ar.listing.reviews}</h2>
            <ul className="space-y-4">
              {reviews.slice(0, 2).map((review) => (
                <li key={review.id} className="rounded-lg border border-border p-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="font-medium text-foreground">
                      {review.author_name}
                    </p>
                    <RatingStars rating={review.rating} />
                  </div>
                  <p className="text-sm leading-7 text-muted-foreground">
                    {review.body_ar}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <Card>
            <CardHeader>
              <CardTitle>
                {formatSAR(service.price)}
                <span className="ms-1 text-sm font-normal text-muted-foreground">
                  {priceUnitLabel(service.pricing_mode)}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <PriceBreakdown quote={quote} />

              <AddToCartButton
                item={{
                  serviceId: service.id,
                  slug: service.slug,
                  title_ar: service.title_ar,
                  imageUrl: service.cover_image_url,
                  hostId: service.host_id,
                  unitPrice: service.price,
                  pricingMode: service.pricing_mode,
                  unitLabel: service.unit_label_ar,
                  minQuantity: service.min_quantity,
                  maxQuantity: service.max_quantity,
                  requiresDelivery: service.requires_delivery,
                  deliveryStrategy: service.delivery_strategy,
                  deliveryFee: service.delivery_fee,
                  freeDeliveryOver: service.free_delivery_over,
                }}
              />

<FavoriteButton kind="service" id={service.id} variant="button" />
            </CardContent>
          </Card>
        </aside>
      </div>
    </PageShell>
  );
}
