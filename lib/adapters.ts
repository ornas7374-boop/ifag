import type { ListingCardData, Place, PricingMode, RateUnit, Service } from "@/types/domain";
import { ar } from "@/content/ar";

/** لاحقة السعر المعروضة: "لليلة" / "للقطعة" / "للساعة" … */
export function priceUnitLabel(unit: PricingMode | RateUnit): string {
  switch (unit) {
    case "hour":
    case "per_hour":
      return ar.common.perHour;
    case "day":
    case "per_day":
      return ar.common.perDay;
    case "night":
    case "per_night":
      return ar.common.perNight;
    case "per_person":
      return ar.common.perPerson;
    case "per_unit":
      return ar.common.perUnit;
    case "per_km":
      return ar.common.perKm;
    case "per_booking":
    case "fixed":
      return ar.common.perBooking;
  }
}

const PLACE_KIND_LABEL: Record<Place["place_kind"], string> = {
  kashta: "كشتة",
  camp: "مخيم",
  chalet: "شاليه",
  wild: "مكان بري",
};

const SERVICE_KIND_LABEL: Record<Service["service_kind"], string> = {
  setup: "خدمة تجهيز",
  product: "معدات",
  labor: "عمالة",
};

/**
 * محوّلات تُنتج نفس الشكل للنوعين، فتخدمهما بطاقة واحدة.
 * هذا ما يمنع تكرار الكود رغم أن الجدولين منفصلان في قاعدة البيانات.
 */
export function placeToCard(place: Place): ListingCardData {
  const price =
    place.price_per_night ?? place.price_per_day ?? place.price_per_hour;
  const unit: RateUnit = place.price_per_night
    ? "night"
    : place.price_per_day
      ? "day"
      : "hour";

  return {
    id: place.id,
    slug: place.slug,
    title_ar: place.title_ar,
    cover_image_url: place.cover_image_url,
    city_name_ar: place.city_name_ar,
    rating_avg: place.rating_avg,
    rating_count: place.rating_count,
    base_price: price!,
    price_unit: unit,
    badges: [PLACE_KIND_LABEL[place.place_kind]],
    href: `/places/${place.slug}`,
  };
}

export function serviceToCard(service: Service): ListingCardData {
  const badges = [SERVICE_KIND_LABEL[service.service_kind]];
  if (service.requires_delivery) badges.push(ar.listing.requiresDelivery);

  return {
    id: service.id,
    slug: service.slug,
    title_ar: service.title_ar,
    cover_image_url: service.cover_image_url,
    city_name_ar: service.city_name_ar,
    rating_avg: service.rating_avg,
    rating_count: service.rating_count,
    base_price: service.price,
    price_unit: service.pricing_mode,
    badges,
    href: `/services/${service.slug}`,
  };
}
