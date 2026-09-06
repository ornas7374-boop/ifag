import Image from "next/image";
import { notFound } from "next/navigation";
import { Clock, Heart, MessageCircle, Users } from "lucide-react";

import { PageShell } from "@/components/layout/page-shell";
import { MapView } from "@/components/map/map-view";
import { PriceBreakdown } from "@/components/domain/price-breakdown";
import { RatingStars } from "@/components/domain/rating-stars";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ar } from "@/content/ar";
import { formatNumber, formatSAR } from "@/lib/format";
import {
  getAmenitiesByIds,
  getPlaceBySlug,
  listAddonsForPlace,
  listReviews,
} from "@/lib/data";
import { priceUnitLabel } from "@/lib/adapters";
import {
  buildQuote,
  DEFAULT_COMMISSION_RATE,
  placeRate,
} from "@/lib/pricing";
import { halalas } from "@/lib/money";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const place = await getPlaceBySlug(slug);
  return { title: place?.title_ar ?? ar.states.notFoundTitle };
}

export default async function PlacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const place = await getPlaceBySlug(slug);
  if (!place) notFound();

  const [amenities, addons, reviews] = await Promise.all([
    getAmenitiesByIds(place.amenity_ids),
    listAddonsForPlace(place.id),
    listReviews(),
  ]);

  const nightly = placeRate(place, "night") ?? halalas(0);

  // معاينة سعر لليلة واحدة. الحساب النهائي يتم في الخادم عند الحجز.
  const quote = buildQuote({
    lines: [{ label: `${ar.booking.nightly} × 1`, amount: nightly }],
    commissionRate: DEFAULT_COMMISSION_RATE,
  });

  return (
    <PageShell>
      {/* معرض الصور */}
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted sm:col-span-2">
          <Image
            src={place.cover_image_url}
            alt={place.title_ar}
            fill
            sizes="(max-width: 640px) 100vw, 66vw"
            className="object-cover"
            priority
          />
        </div>
        <div className="grid gap-3">
          {place.image_urls.slice(0, 2).map((url, i) => (
            <div
              key={url + i}
              className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted"
            >
              <Image
                src={url}
                alt={`${place.title_ar} — صورة ${i + 2}`}
                fill
                sizes="33vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <header className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{place.city_name_ar}</Badge>
              {place.turnaround_minutes > 0 ? (
                <Badge variant="outline">
                  تجهيز {formatNumber(place.turnaround_minutes)} دقيقة بين الحجوزات
                </Badge>
              ) : null}
            </div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              {place.title_ar}
            </h1>
            <RatingStars rating={place.rating_avg} count={place.rating_count} />
          </header>

          <section>
            <h2 className="mb-2 text-lg font-semibold">{ar.listing.about}</h2>
            <p className="leading-8 text-muted-foreground">
              {place.description_ar}
            </p>
          </section>

          <Separator />

          <section className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-2 text-sm">
              <Users className="size-4 text-primary" aria-hidden />
              <span className="text-muted-foreground">{ar.listing.capacity}:</span>
              <span className="font-medium">
                {formatNumber(place.capacity_min)}–{formatNumber(place.capacity_max)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="size-4 text-primary" aria-hidden />
              <span className="text-muted-foreground">{ar.listing.checkIn}:</span>
              <span className="font-medium">{place.check_in_time}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="size-4 text-primary" aria-hidden />
              <span className="text-muted-foreground">{ar.listing.checkOut}:</span>
              <span className="font-medium">{place.check_out_time}</span>
            </div>
          </section>

          <Separator />

          <section>
            <h2 className="mb-3 text-lg font-semibold">{ar.listing.amenities}</h2>
            <ul className="flex flex-wrap gap-2">
              {amenities.map((amenity) => (
                <li key={amenity.id}>
                  <Badge variant="outline" className="px-3 py-1.5">
                    {amenity.name_ar}
                  </Badge>
                </li>
              ))}
            </ul>
          </section>

          {addons.length > 0 ? (
            <>
              <Separator />
              <section>
                <h2 className="mb-3 text-lg font-semibold">{ar.listing.addons}</h2>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {addons.map((addon) => (
                    <li
                      key={addon.id}
                      className="flex items-start justify-between gap-4 rounded-lg border border-border p-4"
                    >
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">{addon.name_ar}</p>
                        {addon.description_ar ? (
                          <p className="text-sm text-muted-foreground">
                            {addon.description_ar}
                          </p>
                        ) : null}
                      </div>
                      <p className="shrink-0 text-sm font-semibold">
                        {formatSAR(addon.price)}
                        <span className="block text-xs font-normal text-muted-foreground">
                          {priceUnitLabel(addon.pricing_mode)}
                        </span>
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            </>
          ) : null}

          <Separator />

          <section>
            <h2 className="mb-3 text-lg font-semibold">{ar.listing.location}</h2>
            <p className="mb-3 text-sm text-muted-foreground">
              {place.address_text}
            </p>
            <MapView center={place.location} label={place.title_ar} />
          </section>

          <Separator />

          <section>
            <h2 className="mb-3 text-lg font-semibold">{ar.listing.policies}</h2>
            <p className="text-sm leading-7 text-muted-foreground">
              {place.cancellation_policy_ar}
            </p>
            {place.rules_ar ? (
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                {place.rules_ar}
              </p>
            ) : null}
          </section>

          <Separator />

          <section>
            <h2 className="mb-3 text-lg font-semibold">{ar.listing.reviews}</h2>
            <ul className="space-y-4">
              {reviews.map((review) => (
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

        {/* أداة الحجز — لاصقة على الشاشات الكبيرة */}
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <Card>
            <CardHeader>
              <CardTitle>
                {formatSAR(nightly)}
                <span className="ms-1 text-sm font-normal text-muted-foreground">
                  {priceUnitLabel("night")}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <PriceBreakdown quote={quote} />

              <Button size="lg" className="w-full">
                {ar.common.bookNow}
              </Button>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <MessageCircle aria-hidden />
                  {ar.common.contactHost}
                </Button>
                <Button variant="outline" size="icon" aria-label={ar.common.addToFavorites}>
                  <Heart aria-hidden />
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                {ar.states.phasePlaceholder}
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </PageShell>
  );
}
