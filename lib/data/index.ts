/**
 * ★ نقطة الوصول الوحيدة للبيانات في كل المشروع ★
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
import type {
  Addon,
  Amenity,
  Category,
  City,
  Place,
  Review,
  Service,
} from "@/types/domain";

export interface ListingFilters {
  cityId?: string;
  categorySlug?: string;
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  amenityIds?: string[];
  sort?: "recommended" | "price_asc" | "price_desc" | "rating" | "newest";
  limit?: number;
}

export interface ListResult<T> {
  data: T[];
  count: number;
}

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
