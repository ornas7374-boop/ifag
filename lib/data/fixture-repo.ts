/**
 * تنفيذ طبقة البيانات فوق الملفات المؤقتة (المرحلة 1).
 *
 * لماذا هذه الطبقة موجودة أصلًا؟
 * لأن أسهل طريقة لإفساد المرحلة 2 هي أن تستورد الصفحات البيانات المؤقتة
 * مباشرة، فتُرتّب وتُصفّي داخل المكوّن. عندها ربط قاعدة البيانات لا يكون
 * "استبدال مصدر" بل إعادة كتابة كل صفحة.
 *
 * القواعد التي تجعل التبديل ميكانيكيًا:
 *  - كل دالة async وترجع صفوفًا بشكل Postgres (snake_case و null).
 *  - كل دالة قائمة تستقبل نفس كائن الفلاتر الذي ستترجمه المرحلة 2 لاستعلام.
 *  - لا تصفية ولا ترتيب داخل الصفحات — تُمرَّر الفلاتر إلى هنا.
 *
 * المرحلة 2: يتغيّر جسم الدوال أدناه ليقرأ من Supabase، وتبقى كل الصفحات
 * والمكونات دون أي تعديل.
 */
import {
  addons as addonsFixture,
  amenities as amenitiesFixture,
  categories as categoriesFixture,
  cities as citiesFixture,
  places as placesFixture,
  reviews as reviewsFixture,
  services as servicesFixture,
} from "@/lib/fixtures";
import type { ListingFilters, ListResult } from "@/lib/data/contracts";
import type {
  Addon,
  Amenity,
  Category,
  City,
  Place,
  Review,
  Service,
} from "@/types/domain";

function applySort<T extends { rating_avg: number; created_at: string }>(
  rows: T[],
  sort: ListingFilters["sort"],
  priceOf: (row: T) => number,
): T[] {
  const sorted = [...rows];
  switch (sort) {
    case "price_asc":
      return sorted.sort((a, b) => priceOf(a) - priceOf(b));
    case "price_desc":
      return sorted.sort((a, b) => priceOf(b) - priceOf(a));
    case "rating":
      return sorted.sort((a, b) => b.rating_avg - a.rating_avg);
    case "newest":
      return sorted.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    default:
      return sorted;
  }
}

function placeBasePrice(place: Place): number {
  return place.price_per_night ?? place.price_per_day ?? place.price_per_hour ?? 0;
}

export async function listCities(): Promise<City[]> {
  return citiesFixture;
}

export async function listCategories(): Promise<Category[]> {
  return categoriesFixture;
}

export async function listAmenities(): Promise<Amenity[]> {
  return amenitiesFixture;
}

export async function getAmenitiesByIds(ids: string[]): Promise<Amenity[]> {
  return amenitiesFixture.filter((a) => ids.includes(a.id));
}

export async function listPlaces(
  filters: ListingFilters = {},
): Promise<ListResult<Place>> {
  let rows = placesFixture.filter((p) => p.status === "published");

  if (filters.cityId) rows = rows.filter((p) => p.city_id === filters.cityId);
  if (filters.query) {
    const q = filters.query.trim();
    rows = rows.filter(
      (p) => p.title_ar.includes(q) || p.description_ar.includes(q),
    );
  }
  if (filters.minRating !== undefined) {
    rows = rows.filter((p) => p.rating_avg >= filters.minRating!);
  }
  if (filters.minPrice !== undefined) {
    rows = rows.filter((p) => placeBasePrice(p) >= filters.minPrice!);
  }
  if (filters.maxPrice !== undefined) {
    rows = rows.filter((p) => placeBasePrice(p) <= filters.maxPrice!);
  }
  if (filters.amenityIds?.length) {
    rows = rows.filter((p) =>
      filters.amenityIds!.every((id) => p.amenity_ids.includes(id)),
    );
  }

  const count = rows.length;
  rows = applySort(rows, filters.sort, placeBasePrice);
  if (filters.limit) rows = rows.slice(0, filters.limit);

  return { data: rows, count };
}

export async function getPlaceBySlug(slug: string): Promise<Place | null> {
  return placesFixture.find((p) => p.slug === slug) ?? null;
}

export async function listServices(
  filters: ListingFilters = {},
): Promise<ListResult<Service>> {
  let rows = servicesFixture.filter((s) => s.status === "published");

  if (filters.cityId) rows = rows.filter((s) => s.city_id === filters.cityId);
  if (filters.query) {
    const q = filters.query.trim();
    rows = rows.filter(
      (s) => s.title_ar.includes(q) || s.description_ar.includes(q),
    );
  }
  if (filters.minRating !== undefined) {
    rows = rows.filter((s) => s.rating_avg >= filters.minRating!);
  }
  if (filters.minPrice !== undefined) {
    rows = rows.filter((s) => s.price >= filters.minPrice!);
  }
  if (filters.maxPrice !== undefined) {
    rows = rows.filter((s) => s.price <= filters.maxPrice!);
  }

  const count = rows.length;
  rows = applySort(rows, filters.sort, (s) => s.price);
  if (filters.limit) rows = rows.slice(0, filters.limit);

  return { data: rows, count };
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  return servicesFixture.find((s) => s.slug === slug) ?? null;
}

export async function listAddonsForPlace(placeId: string): Promise<Addon[]> {
  return addonsFixture.filter((a) => a.place_id === placeId);
}

export async function listReviews(): Promise<Review[]> {
  return reviewsFixture;
}

// ── الحجوزات والطلبات ──

import { bookings as bookingsFixture, orders as ordersFixture } from "@/lib/fixtures/bookings";
import type { Booking, CalendarEntry, Order } from "@/types/domain";
import type { BookingScope, OrderScope } from "@/lib/data/contracts";

export async function listBookings(scope: BookingScope): Promise<Booking[]> {
  const now = Date.now();
  let rows = bookingsFixture;

  // صفوف الحجب ليست حجوزات عملاء — تُخفى عن لوحة العميل
  if (!scope.includeBlocks) {
    rows = rows.filter((b) => b.customer_id !== "");
  }

  if (scope.when === "upcoming") {
    rows = rows.filter(
      (b) =>
        new Date(b.booking_end).getTime() >= now &&
        b.status !== "cancelled" &&
        b.status !== "completed",
    );
  } else if (scope.when === "past") {
    rows = rows.filter(
      (b) =>
        new Date(b.booking_end).getTime() < now ||
        b.status === "completed" ||
        b.status === "cancelled",
    );
  }

  return [...rows].sort(
    (a, b) =>
      new Date(b.booking_start).getTime() - new Date(a.booking_start).getTime(),
  );
}

export async function getBooking(id: string): Promise<Booking | null> {
  return bookingsFixture.find((b) => b.id === id) ?? null;
}

export async function listOrders(scope: OrderScope): Promise<Order[]> {
  let rows = ordersFixture;
  if (scope.status) rows = rows.filter((o) => o.status === scope.status);
  return [...rows].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export async function getOrder(id: string): Promise<Order | null> {
  return ordersFixture.find((o) => o.id === id) ?? null;
}

export async function listCalendar(hostId: string): Promise<CalendarEntry[]> {
  return bookingsFixture
    .filter((b) => b.host_id === hostId && b.status !== "cancelled")
    .map((b) => ({
      id: b.id,
      reference: b.reference,
      place_title_ar: b.place_title_ar,
      source: b.customer_id === "" ? ("host_block" as const) : ("customer" as const),
      status: b.status,
      booking_start: b.booking_start,
      booking_end: b.booking_end,
      available_again_at: b.available_again_at,
      guests: b.guests,
    }))
    .sort(
      (a, b) =>
        new Date(a.booking_start).getTime() - new Date(b.booking_start).getTime(),
    );
}

// ── المستخدمون والإشعارات والمدفوعات والعناوين ──

import {
  addresses as addressesFixture,
  notifications as notificationsFixture,
  payments as paymentsFixture,
  profiles as profilesFixture,
} from "@/lib/fixtures/people";
import type {
  DeliveryAddress,
  NotificationItem,
  PaymentRecord,
  Profile,
  Role,
} from "@/types/domain";

export async function listProfiles(role?: Role): Promise<Profile[]> {
  return role ? profilesFixture.filter((p) => p.role === role) : profilesFixture;
}

export async function listNotifications(userId: string): Promise<NotificationItem[]> {
  return notificationsFixture
    .filter((n) => n.user_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function listPayments(): Promise<PaymentRecord[]> {
  return [...paymentsFixture].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export async function listAddresses(): Promise<DeliveryAddress[]> {
  return addressesFixture;
}

export async function listHostDueActions(hostId: string) {
  const now = Date.now();
  const rows = bookingsFixture.filter(
    (b) => b.host_id === hostId && b.customer_id !== "",
  );

  return {
    needsCheckIn: rows.filter(
      (b) =>
        b.status === "confirmed" &&
        !b.actual_check_in &&
        new Date(b.booking_start).getTime() <= now &&
        new Date(b.booking_end).getTime() >= now,
    ),
    needsCheckOut: rows.filter(
      (b) =>
        b.actual_check_in &&
        !b.actual_check_out &&
        new Date(b.booking_end).getTime() <= now,
    ),
  };
}
