import { createClient } from "@/lib/supabase/server";
import { halalas } from "@/lib/money";
import type {
  Addon,
  Amenity,
  Category,
  City,
  Place,
  Review,
  Service,
} from "@/types/domain";
import type { Tables } from "@/types/database";
import type { ListingFilters, ListResult } from "@/lib/data/contracts";

/**
 * التنفيذ الحقيقي لطبقة البيانات فوق Supabase.
 *
 * يطابق واجهة lib/data/contracts حرفيًا، فالانتقال إليه لا يتطلب
 * تعديل أي صفحة أو مكوّن — فقط توفّر متغيّرات البيئة.
 *
 * كل الاستعلامات تمر عبر عميل الخادم الذي يحمل جلسة المستخدم،
 * فسياسات RLS مطبَّقة تلقائيًا: العامة ترى المنشور فقط، وصاحب
 * المكان يرى مسوّداته.
 */

// ── محوّلات: صف قاعدة البيانات → نوع النطاق ──
// المبالغ تصل كأعداد صحيحة (هللات) لأن الأعمدة bigint وليست numeric.

function toPlace(
  row: Tables<"places"> & { cities?: { name_ar: string } | null },
  amenityIds: string[] = [],
  imageUrls: string[] = [],
): Place {
  return {
    id: row.id,
    slug: row.slug,
    host_id: row.host_id,
    title_ar: row.title_ar,
    description_ar: row.description_ar,
    place_kind: row.place_kind,
    status: row.status,
    city_id: row.city_id,
    city_name_ar: row.cities?.name_ar ?? "",
    district_id: row.district_id,
    address_text: row.address_text,
    location: { lat: row.latitude, lng: row.longitude },
    cover_image_url: imageUrls[0] ?? "/placeholder/kashta-1.svg",
    image_urls: imageUrls,
    amenity_ids: amenityIds,
    capacity_min: row.capacity_min,
    capacity_max: row.capacity_max,
    check_in_time: row.check_in_time,
    check_out_time: row.check_out_time,
    turnaround_minutes: row.turnaround_minutes,
    price_per_hour: row.price_per_hour === null ? null : halalas(row.price_per_hour),
    price_per_day: row.price_per_day === null ? null : halalas(row.price_per_day),
    price_per_night:
      row.price_per_night === null ? null : halalas(row.price_per_night),
    rating_avg: row.rating_avg,
    rating_count: row.rating_count,
    cancellation_policy_ar: row.cancellation_policy_ar,
    rules_ar: row.rules_ar,
    created_at: row.created_at,
  };
}

function toService(
  row: Tables<"services"> & { cities?: { name_ar: string } | null },
  imageUrls: string[] = [],
): Service {
  return {
    id: row.id,
    slug: row.slug,
    host_id: row.host_id,
    title_ar: row.title_ar,
    description_ar: row.description_ar,
    service_kind: row.service_kind,
    status: row.status,
    city_id: row.city_id,
    city_name_ar: row.cities?.name_ar ?? "",
    cover_image_url: imageUrls[0] ?? "/placeholder/tent-1.svg",
    image_urls: imageUrls,
    price: halalas(row.price),
    pricing_mode: row.pricing_mode,
    min_quantity: row.min_quantity,
    max_quantity: row.max_quantity,
    unit_label_ar: row.unit_label_ar,
    requires_delivery: row.requires_delivery,
    requires_setup: row.requires_setup,
    setup_duration_minutes: row.setup_duration_minutes,
    delivery_strategy: row.delivery_strategy,
    delivery_fee: halalas(row.delivery_fee),
    free_delivery_over:
      row.free_delivery_over === null ? null : halalas(row.free_delivery_over),
    max_distance_km: row.max_distance_km,
    rating_avg: row.rating_avg,
    rating_count: row.rating_count,
    created_at: row.created_at,
  };
}

/** ترتيب الاستعلام — يُترجم إلى ORDER BY في قاعدة البيانات لا في الذاكرة. */
function orderFor(sort: ListingFilters["sort"], priceColumn: string) {
  switch (sort) {
    case "price_asc":
      return { column: priceColumn, ascending: true };
    case "price_desc":
      return { column: priceColumn, ascending: false };
    case "rating":
      return { column: "rating_avg", ascending: false };
    case "newest":
      return { column: "created_at", ascending: false };
    default:
      return { column: "rating_avg", ascending: false };
  }
}

export async function listCities(): Promise<City[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cities")
    .select("id, slug, name_ar")
    .order("name_ar");
  if (error) throw error;
  return data ?? [];
}

export async function listCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name_ar, icon")
    .order("sort_order");
  if (error) throw error;
  return data ?? [];
}

export async function listAmenities(): Promise<Amenity[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("amenities")
    .select("id, slug, name_ar, icon")
    .order("name_ar");
  if (error) throw error;
  return data ?? [];
}

export async function getAmenitiesByIds(ids: string[]): Promise<Amenity[]> {
  if (ids.length === 0) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("amenities")
    .select("id, slug, name_ar, icon")
    .in("id", ids);
  if (error) throw error;
  return data ?? [];
}

export async function listPlaces(
  filters: ListingFilters = {},
): Promise<ListResult<Place>> {
  const supabase = await createClient();

  // count: "exact" يُرجع العدد الكلي قبل الحد، وهو ما تحتاجه صفحة النتائج
  let query = supabase
    .from("places")
    .select("*, cities(name_ar)", { count: "exact" })
    .eq("status", "published");

  if (filters.cityId) query = query.eq("city_id", filters.cityId);
  if (filters.minRating !== undefined) {
    query = query.gte("rating_avg", filters.minRating);
  }
  if (filters.query) {
    // البحث في العنوان والوصف معًا
    query = query.or(
      `title_ar.ilike.%${filters.query}%,description_ar.ilike.%${filters.query}%`,
    );
  }
  if (filters.minPrice !== undefined) {
    query = query.gte("price_per_night", filters.minPrice);
  }
  if (filters.maxPrice !== undefined) {
    query = query.lte("price_per_night", filters.maxPrice);
  }

  const order = orderFor(filters.sort, "price_per_night");
  query = query.order(order.column, { ascending: order.ascending });
  if (filters.limit) query = query.limit(filters.limit);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    data: (data ?? []).map((row) => toPlace(row)),
    count: count ?? 0,
  };
}

export async function getPlaceBySlug(slug: string): Promise<Place | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("places")
    .select("*, cities(name_ar), place_amenities(amenity_id), listing_images(storage_path, sort_order, is_cover)")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const amenityIds = (data.place_amenities ?? []).map(
    (a: { amenity_id: string }) => a.amenity_id,
  );

  // صورة الغلاف أولًا ثم البقية بترتيب العرض
  const images = [...(data.listing_images ?? [])].sort(
    (a, b) =>
      Number(b.is_cover) - Number(a.is_cover) || a.sort_order - b.sort_order,
  );

  return toPlace(data, amenityIds, images.map((i) => i.storage_path));
}

export async function listServices(
  filters: ListingFilters = {},
): Promise<ListResult<Service>> {
  const supabase = await createClient();

  let query = supabase
    .from("services")
    .select("*, cities(name_ar)", { count: "exact" })
    .eq("status", "published");

  if (filters.cityId) query = query.eq("city_id", filters.cityId);
  if (filters.minRating !== undefined) {
    query = query.gte("rating_avg", filters.minRating);
  }
  if (filters.query) {
    query = query.or(
      `title_ar.ilike.%${filters.query}%,description_ar.ilike.%${filters.query}%`,
    );
  }
  if (filters.minPrice !== undefined) query = query.gte("price", filters.minPrice);
  if (filters.maxPrice !== undefined) query = query.lte("price", filters.maxPrice);

  const order = orderFor(filters.sort, "price");
  query = query.order(order.column, { ascending: order.ascending });
  if (filters.limit) query = query.limit(filters.limit);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    data: (data ?? []).map((row) => toService(row)),
    count: count ?? 0,
  };
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("services")
    .select("*, cities(name_ar), listing_images(storage_path, sort_order, is_cover)")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const images = [...(data.listing_images ?? [])].sort(
    (a, b) =>
      Number(b.is_cover) - Number(a.is_cover) || a.sort_order - b.sort_order,
  );

  return toService(data, images.map((i) => i.storage_path));
}

export async function listAddonsForPlace(placeId: string): Promise<Addon[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("addons")
    .select("*")
    .eq("place_id", placeId)
    .eq("is_active", true);
  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    place_id: row.place_id,
    name_ar: row.name_ar,
    description_ar: row.description_ar,
    image_url: row.image_url,
    price: halalas(row.price),
    pricing_mode: row.pricing_mode,
  }));
}

export async function listReviews(target?: {
  placeId?: string;
  serviceId?: string;
}): Promise<Review[]> {
  const supabase = await createClient();

  let query = supabase
    .from("reviews")
    .select("id, rating, body_ar, created_at, profiles(full_name, avatar_url)")
    .eq("is_hidden", false)
    .order("created_at", { ascending: false })
    .limit(20);

  if (target?.placeId) query = query.eq("place_id", target.placeId);
  if (target?.serviceId) query = query.eq("service_id", target.serviceId);

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row) => {
    const profile = row.profiles as unknown as
      | { full_name: string; avatar_url: string | null }
      | null;
    return {
      id: row.id,
      author_name: profile?.full_name ?? "مستخدم",
      author_avatar_url: profile?.avatar_url ?? null,
      rating: row.rating,
      body_ar: row.body_ar,
      created_at: row.created_at,
    };
  });
}

/**
 * فحص إتاحة المكان قبل الإرسال — للمعاينة في الواجهة.
 * ليس ضمانة: الضمانة الحقيقية هي قيد الاستبعاد في قاعدة البيانات.
 */
export async function checkPlaceAvailability(
  placeId: string,
  start: string,
  end: string,
): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("check_place_availability", {
    p_place_id: placeId,
    p_start: start,
    p_end: end,
  });
  if (error) throw error;
  return data ?? false;
}

// ── الحجوزات والطلبات ──

import type { Booking, CalendarEntry, Order } from "@/types/domain";
import type { BookingScope, OrderScope } from "@/lib/data/contracts";

/**
 * RLS تتكفّل بالنطاق: العميل يرى حجوزاته، وصاحب المكان يرى حجوزات
 * أماكنه. لا نمرّر معرّف المستخدم في الاستعلام لأن السياسة تقرأه من
 * الجلسة — تمريره يدويًا يفتح باب الخطأ.
 */
function toBooking(
  row: Tables<"bookings"> & { places?: { title_ar: string } | null },
): Booking {
  return {
    id: row.id,
    reference: row.reference,
    place_id: row.place_id,
    place_title_ar: row.places?.title_ar ?? "",
    customer_id: row.customer_id ?? "",
    host_id: row.host_id,
    status: row.status,
    payment_status: row.payment_status,
    rate_unit: row.rate_unit,
    booking_start: row.booking_start,
    booking_end: row.booking_end,
    preparation_start: row.preparation_start,
    actual_check_in: row.actual_check_in,
    actual_check_out: row.actual_check_out,
    available_again_at: row.available_again_at,
    guests: row.guests,
    base_amount: halalas(row.base_amount),
    addons_amount: halalas(row.addons_amount),
    discount_amount: halalas(row.discount_amount),
    commission_amount: halalas(row.commission_amount),
    total_amount: halalas(row.total_amount),
    created_at: row.created_at,
  };
}

export async function listBookings(scope: BookingScope): Promise<Booking[]> {
  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  let query = supabase
    .from("bookings")
    .select("*, places(title_ar)")
    .order("booking_start", { ascending: false });

  if (!scope.includeBlocks) query = query.eq("source", "customer");

  if (scope.when === "upcoming") {
    query = query
      .gte("booking_end", nowIso)
      .in("status", ["pending", "confirmed", "checked_in"]);
  } else if (scope.when === "past") {
    query = query.or(
      `booking_end.lt.${nowIso},status.in.(completed,cancelled)`,
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(toBooking);
}

export async function getBooking(id: string): Promise<Booking | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("*, places(title_ar)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? toBooking(data) : null;
}

export async function listOrders(scope: OrderScope): Promise<Order[]> {
  const supabase = await createClient();
  let query = supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });
  if (scope.status) {
    query = query.eq("status", scope.status as Tables<"orders">["status"]);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    reference: row.reference,
    customer_id: row.customer_id,
    host_id: row.host_id,
    status: row.status,
    payment_status: row.payment_status,
    items: (row.order_items ?? []).map((i) => ({
      id: i.id,
      order_id: i.order_id,
      service_id: i.service_id,
      service_title_ar: i.title_ar,
      quantity: i.quantity,
      unit_price: halalas(i.unit_price),
      line_total: halalas(i.line_total),
      pricing_mode: i.pricing_mode,
      service_at: i.service_at,
    })),
    delivery_address: null,
    services_amount: halalas(row.services_amount),
    delivery_fee: halalas(row.delivery_fee),
    extra_fees: halalas(row.extra_fees),
    discount_amount: halalas(row.discount_amount),
    commission_amount: halalas(row.commission_amount),
    total_amount: halalas(row.total_amount),
    created_at: row.created_at,
  }));
}

export async function getOrder(id: string): Promise<Order | null> {
  const all = await listOrders({ as: "customer" });
  return all.find((o) => o.id === id) ?? null;
}

export async function listCalendar(): Promise<CalendarEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("id, reference, source, status, booking_start, booking_end, available_again_at, guests, places(title_ar)")
    .neq("status", "cancelled")
    .order("booking_start");
  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    reference: row.reference,
    place_title_ar:
      (row.places as unknown as { title_ar: string } | null)?.title_ar ?? "",
    source: row.source,
    status: row.status,
    booking_start: row.booking_start,
    booking_end: row.booking_end,
    available_again_at: row.available_again_at,
    guests: row.guests,
  }));
}

// ── المستخدمون والإشعارات والمدفوعات والعناوين ──

import type {
  DeliveryAddress,
  NotificationItem,
  PaymentRecord,
  Profile,
  Role,
} from "@/types/domain";

export async function listProfiles(role?: Role): Promise<Profile[]> {
  const supabase = await createClient();
  let query = supabase.from("profiles").select("id, full_name, role, avatar_url, phone");
  if (role) query = query.eq("role", role);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function listNotifications(): Promise<NotificationItem[]> {
  // RLS تقصر النتيجة على إشعارات المستخدم الحالي
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data ?? [];
}

export async function listPayments(): Promise<PaymentRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payments")
    .select("id, amount, status, provider, created_at, booking_id, order_id")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    reference: row.booking_id ?? row.order_id ?? row.id,
    kind: row.booking_id ? ("booking" as const) : ("order" as const),
    customer_name: "",
    amount: halalas(row.amount),
    commission: halalas(0),
    status: row.status,
    provider: row.provider,
    created_at: row.created_at,
  }));
}

export async function listAddresses(): Promise<DeliveryAddress[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("delivery_addresses").select("*");
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    label_ar: row.label_ar,
    city_id: row.city_id,
    district_id: row.district_id,
    address_text: row.address_text,
    location: { lat: row.latitude, lng: row.longitude },
    notes: row.notes,
  }));
}

export async function listHostDueActions() {
  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  // RLS تقصر النتيجة على حجوزات أماكن هذا المزوّد
  const [checkIn, checkOut] = await Promise.all([
    supabase
      .from("bookings")
      .select("*, places(title_ar)")
      .eq("source", "customer")
      .eq("status", "confirmed")
      .is("actual_check_in", null)
      .lte("booking_start", nowIso)
      .gte("booking_end", nowIso),
    supabase
      .from("bookings")
      .select("*, places(title_ar)")
      .eq("source", "customer")
      .not("actual_check_in", "is", null)
      .is("actual_check_out", null)
      .lte("booking_end", nowIso),
  ]);

  if (checkIn.error) throw checkIn.error;
  if (checkOut.error) throw checkOut.error;

  return {
    needsCheckIn: (checkIn.data ?? []).map(toBooking),
    needsCheckOut: (checkOut.data ?? []).map(toBooking),
  };
}

const MONTHS_AR = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

export async function listMonthlyEarnings() {
  const supabase = await createClient();
  const since = new Date();
  since.setMonth(since.getMonth() - 5);
  since.setDate(1);

  const [bookings, orders] = await Promise.all([
    supabase
      .from("bookings")
      .select("booking_start, total_amount, commission_amount")
      .eq("payment_status", "paid")
      .gte("booking_start", since.toISOString()),
    supabase
      .from("orders")
      .select("created_at, total_amount, commission_amount")
      .eq("payment_status", "paid")
      .gte("created_at", since.toISOString()),
  ]);
  if (bookings.error) throw bookings.error;
  if (orders.error) throw orders.error;

  const now = new Date();
  const buckets = new Map<
    string,
    { label: string; gross: number; commission: number; bookings: number; orders: number }
  >();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.set(`${d.getFullYear()}-${d.getMonth()}`, {
      label: MONTHS_AR[d.getMonth()]!,
      gross: 0,
      commission: 0,
      bookings: 0,
      orders: 0,
    });
  }

  const add = (iso: string, total: number, commission: number, kind: "b" | "o") => {
    const d = new Date(iso);
    const bucket = buckets.get(`${d.getFullYear()}-${d.getMonth()}`);
    if (!bucket) return;
    bucket.gross += total;
    bucket.commission += commission;
    if (kind === "b") bucket.bookings += 1;
    else bucket.orders += 1;
  };

  for (const b of bookings.data ?? []) {
    add(b.booking_start, b.total_amount, b.commission_amount, "b");
  }
  for (const o of orders.data ?? []) {
    add(o.created_at, o.total_amount, o.commission_amount, "o");
  }

  return [...buckets.values()].map((b) => ({ ...b, net: b.gross - b.commission }));
}
