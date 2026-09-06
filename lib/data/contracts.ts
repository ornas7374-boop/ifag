import type {
  Addon,
  Amenity,
  Category,
  City,
  Place,
  Review,
  Service,
} from "@/types/domain";

/**
 * العقد المشترك بين تنفيذَي طبقة البيانات.
 *
 * كلا التنفيذين (البيانات المؤقتة و Supabase) يلتزم به حرفيًا،
 * فالتبديل بينهما لا يمس أي صفحة.
 */

export interface ListingFilters {
  cityId?: string;
  categorySlug?: string;
  query?: string;
  /** بالهللة */
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  amenityIds?: string[];
  sort?: "recommended" | "price_asc" | "price_desc" | "rating" | "newest";
  limit?: number;
}

export interface ListResult<T> {
  data: T[];
  /** العدد الكلي قبل تطبيق limit — تحتاجه صفحة النتائج. */
  count: number;
}

export interface ReviewTarget {
  placeId?: string;
  serviceId?: string;
}

export interface DataRepository {
  listCities(): Promise<City[]>;
  listCategories(): Promise<Category[]>;
  listAmenities(): Promise<Amenity[]>;
  getAmenitiesByIds(ids: string[]): Promise<Amenity[]>;
  listPlaces(filters?: ListingFilters): Promise<ListResult<Place>>;
  getPlaceBySlug(slug: string): Promise<Place | null>;
  listServices(filters?: ListingFilters): Promise<ListResult<Service>>;
  getServiceBySlug(slug: string): Promise<Service | null>;
  listAddonsForPlace(placeId: string): Promise<Addon[]>;
  listReviews(target?: ReviewTarget): Promise<Review[]>;
}
