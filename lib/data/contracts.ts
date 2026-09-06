import type {
  Addon,
  Amenity,
  Booking,
  CalendarEntry,
  Category,
  City,
  DeliveryAddress,
  NotificationItem,
  Order,
  PaymentRecord,
  Place,
  Profile,
  Role,
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

  listBookings(scope: BookingScope): Promise<Booking[]>;
  getBooking(id: string): Promise<Booking | null>;
  listOrders(scope: OrderScope): Promise<Order[]>;
  getOrder(id: string): Promise<Order | null>;
  listCalendar(hostId: string): Promise<CalendarEntry[]>;

  listProfiles(role?: Role): Promise<Profile[]>;
  listNotifications(userId: string): Promise<NotificationItem[]>;
  listPayments(): Promise<PaymentRecord[]>;
  listAddresses(userId: string): Promise<DeliveryAddress[]>;
  listHostDueActions(hostId: string): Promise<DueActions>;
}

/**
 * الإجراءات المستحقة على صاحب المكان الآن.
 *
 * تُحسب هنا لا في الصفحة: المقارنة بالوقت الحالي دالة غير نقية،
 * ووجودها في مكوّن React يُنتج نتائج غير مستقرة عند إعادة العرض.
 * وهي أيضًا منطق أعمال، ومكانه طبقة البيانات لا الواجهة.
 */
export interface DueActions {
  /** بدأ حجزهم ولم يُسجَّل دخولهم بعد. */
  needsCheckIn: Booking[];
  /** انتهى حجزهم ولم يُسجَّل خروجهم — المكان ما زال محجوبًا بلا داعٍ. */
  needsCheckOut: Booking[];
}

export interface BookingScope {
  /** "customer" لحجوزاتي، و"host" لحجوزات أماكني. */
  as: "customer" | "host";
  /** upcoming = القادمة فقط، past = المنتهية، all = الكل. */
  when?: "upcoming" | "past" | "all";
  /** يستبعد صفوف الحجب الإداري من عرض العميل. */
  includeBlocks?: boolean;
}

export interface OrderScope {
  as: "customer" | "host";
  status?: string;
}
