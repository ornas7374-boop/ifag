import type { Halalas } from "@/lib/money";

/**
 * أنواع النطاق. الحقول بصيغة snake_case عن قصد لتطابق أعمدة Postgres
 * حرفيًا — فحين تصل بيانات Supabase الحقيقية في المرحلة 2 لا يحتاج أي
 * مكوّن إلى تعديل. نفس السبب وراء استخدام null بدل undefined.
 */

export type Role = "customer" | "host" | "admin";

export type ListingStatus =
  | "draft"
  | "pending"
  | "published"
  | "rejected"
  | "suspended";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "checked_in"
  | "checked_out"
  | "completed"
  | "cancelled";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "completed"
  | "cancelled";

export type PaymentStatus = "unpaid" | "paid" | "failed" | "refunded";

/** طرق التسعير — مشتركة بين الخدمات والإضافات، ويقرأها محرّك تسعير واحد. */
export type PricingMode =
  | "fixed"
  | "per_booking"
  | "per_hour"
  | "per_day"
  | "per_night"
  | "per_person"
  | "per_unit"
  | "per_km";

export type RateUnit = "hour" | "day" | "night";

export type DeliveryFeeStrategy =
  | "free"
  | "flat"
  | "per_city"
  | "per_district"
  | "per_distance";

/** أنواع الخدمات — قابلة للتوسعة بإضافة قيمة واحدة هنا وفي الـ enum بالـ SQL. */
export type ServiceKind = "setup" | "product" | "labor";

export type PlaceKind = "kashta" | "camp" | "wild";

export interface City {
  id: string;
  name_ar: string;
  slug: string;
}

export interface District {
  id: string;
  city_id: string;
  name_ar: string;
}

export interface Category {
  id: string;
  slug: string;
  name_ar: string;
  icon: string | null;
}

export interface Amenity {
  id: string;
  slug: string;
  name_ar: string;
  icon: string | null;
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Profile {
  id: string;
  full_name: string;
  role: Role;
  avatar_url: string | null;
  phone: string | null;
}

/** الحقول المشتركة في البطاقات — تسمح لمكوّن ListingCard واحد بخدمة النوعين. */
export interface ListingCardData {
  id: string;
  slug: string;
  title_ar: string;
  cover_image_url: string;
  city_name_ar: string;
  rating_avg: number;
  rating_count: number;
  /** السعر الأساسي بالهللة */
  base_price: Halalas;
  /** وحدة السعر لعرض اللاحقة الصحيحة: "لليلة" / "للقطعة" … */
  price_unit: PricingMode | RateUnit;
  badges: string[];
  href: string;
}

export interface Place {
  id: string;
  slug: string;
  host_id: string;
  title_ar: string;
  description_ar: string;
  place_kind: PlaceKind;
  status: ListingStatus;
  city_id: string;
  city_name_ar: string;
  district_id: string | null;
  address_text: string;
  location: GeoPoint;
  cover_image_url: string;
  image_urls: string[];
  amenity_ids: string[];
  capacity_min: number;
  capacity_max: number;
  check_in_time: string;
  check_out_time: string;
  /** دقائق التجهيز بين حجزين — تُشتق منها القيمة الافتراضية لـ available_again_at */
  turnaround_minutes: number;
  price_per_hour: Halalas | null;
  price_per_day: Halalas | null;
  price_per_night: Halalas | null;
  rating_avg: number;
  rating_count: number;
  cancellation_policy_ar: string;
  rules_ar: string | null;
  created_at: string;
}

/** صف واحد من listing_images — تستخدمها لوحة المضيف عند إدارة الصور. */
export interface ListingImage {
  id: string;
  /** مسار نسبي داخل حاوية Storage، مثل places/<id>/<file>.jpg — لا رابط كامل. */
  storage_path: string;
  url: string;
  sort_order: number;
  is_cover: boolean;
}

export interface Service {
  id: string;
  slug: string;
  host_id: string;
  title_ar: string;
  description_ar: string;
  service_kind: ServiceKind;
  status: ListingStatus;
  city_id: string;
  city_name_ar: string;
  cover_image_url: string;
  image_urls: string[];
  price: Halalas;
  pricing_mode: PricingMode;
  min_quantity: number;
  max_quantity: number | null;
  unit_label_ar: string;
  requires_delivery: boolean;
  requires_setup: boolean;
  setup_duration_minutes: number | null;
  delivery_strategy: DeliveryFeeStrategy;
  delivery_fee: Halalas;
  free_delivery_over: Halalas | null;
  max_distance_km: number | null;
  rating_avg: number;
  rating_count: number;
  created_at: string;
}

export interface Addon {
  id: string;
  place_id: string;
  name_ar: string;
  description_ar: string | null;
  image_url: string | null;
  price: Halalas;
  pricing_mode: PricingMode;
}

export interface Booking {
  id: string;
  reference: string;
  place_id: string;
  place_title_ar: string;
  customer_id: string;
  host_id: string;
  status: BookingStatus;
  payment_status: PaymentStatus;
  rate_unit: RateUnit;
  /** الفترة المتعاقد عليها — لا تتغيّر أبدًا بعد التأكيد، ومنها يُحسب السعر. */
  booking_start: string;
  booking_end: string;
  /** أوقات تشغيلية — واقع ما حدث، لا تُستخدم في التسعير إطلاقًا. */
  preparation_start: string | null;
  actual_check_in: string | null;
  actual_check_out: string | null;
  /** يحدده صاحب المكان. هو من يقرر متى ينتهي حجب التقويم. */
  available_again_at: string | null;
  guests: number;
  base_amount: Halalas;
  addons_amount: Halalas;
  discount_amount: Halalas;
  commission_amount: Halalas;
  total_amount: Halalas;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  service_id: string;
  service_title_ar: string;
  quantity: number;
  unit_price: Halalas;
  line_total: Halalas;
  pricing_mode: PricingMode;
  service_at: string | null;
}

export interface DeliveryAddress {
  id: string;
  label_ar: string | null;
  city_id: string;
  district_id: string | null;
  address_text: string;
  location: GeoPoint;
  notes: string | null;
}

export interface Order {
  id: string;
  reference: string;
  customer_id: string;
  host_id: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  items: OrderItem[];
  delivery_address: DeliveryAddress | null;
  services_amount: Halalas;
  delivery_fee: Halalas;
  extra_fees: Halalas;
  discount_amount: Halalas;
  commission_amount: Halalas;
  total_amount: Halalas;
  created_at: string;
}

export interface Review {
  id: string;
  author_name: string;
  author_avatar_url: string | null;
  rating: number;
  body_ar: string;
  created_at: string;
}

/** عنصر في تقويم المزوّد — يشمل حجوزات العملاء وحجب الصيانة. */
export interface CalendarEntry {
  id: string;
  reference: string;
  place_title_ar: string;
  source: "customer" | "host_block" | "maintenance";
  status: BookingStatus;
  booking_start: string;
  booking_end: string;
  available_again_at: string | null;
  guests: number;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title_ar: string;
  body_ar: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export interface PaymentRecord {
  id: string;
  reference: string;
  kind: "booking" | "order";
  customer_name: string;
  amount: Halalas;
  commission: Halalas;
  status: PaymentStatus;
  provider: string;
  created_at: string;
}
