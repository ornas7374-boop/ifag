/**
 * حجوزات وطلبات تجريبية للمرحلة الحالية — تُحذف مع بقية lib/fixtures
 * عند وصول بيانات Supabase.
 *
 * التواريخ نسبية لوقت التشغيل حتى تبقى "القادمة" قادمة فعلًا مهما
 * طال الوقت، بدل أن تصبح كلها ماضية بعد أسبوع.
 */
import { halalas } from "@/lib/money";
import type { Booking, Order } from "@/types/domain";

const DAY = 24 * 60 * 60 * 1000;

/** تاريخ مزاح بأيام عن الآن، بساعة محددة بتوقيت الرياض. */
function at(offsetDays: number, hour: number, minute = 0): string {
  const d = new Date(Date.now() + offsetDays * DAY);
  // نبني اللحظة بتوقيت +03:00 صراحةً بدل الاعتماد على منطقة الخادم
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const hh = String(hour).padStart(2, "0");
  const mm = String(minute).padStart(2, "0");
  return new Date(`${y}-${m}-${day}T${hh}:${mm}:00+03:00`).toISOString();
}

export const bookings: Booking[] = [
  {
    id: "b-1",
    reference: "KSH-24081",
    place_id: "p-1",
    place_title_ar: "كشتة الرمال الذهبية",
    customer_id: "u-cust-1",
    host_id: "u-host-1",
    status: "confirmed",
    payment_status: "paid",
    rate_unit: "night",
    booking_start: at(6, 16),
    booking_end: at(7, 12),
    preparation_start: null,
    actual_check_in: null,
    actual_check_out: null,
    available_again_at: at(7, 13),
    guests: 12,
    base_amount: halalas(120000),
    addons_amount: halalas(8000),
    discount_amount: halalas(0),
    commission_amount: halalas(12800),
    total_amount: halalas(128000),
    created_at: at(-3, 10),
  },
  {
    // ★ الحالة المرجعية من المتطلبات: خروج مبكر وتحرير المكان قبل نهاية العقد
    id: "b-2",
    reference: "KSH-24063",
    place_id: "p-1",
    place_title_ar: "كشتة الرمال الذهبية",
    customer_id: "u-cust-1",
    host_id: "u-host-1",
    status: "checked_out",
    payment_status: "paid",
    rate_unit: "hour",
    booking_start: at(-1, 16),
    booking_end: at(-1, 20),
    preparation_start: null,
    actual_check_in: at(-1, 16, 15),
    actual_check_out: at(-1, 19),
    available_again_at: at(-1, 19, 30),
    guests: 8,
    base_amount: halalas(60000),
    addons_amount: halalas(5000),
    discount_amount: halalas(0),
    commission_amount: halalas(6500),
    total_amount: halalas(65000),
    created_at: at(-8, 9),
  },
  {
    id: "b-3",
    reference: "KSH-23990",
    place_id: "p-4",
    place_title_ar: "بر السودة المطل",
    customer_id: "u-cust-1",
    host_id: "u-host-2",
    status: "completed",
    payment_status: "paid",
    rate_unit: "night",
    booking_start: at(-20, 16),
    booking_end: at(-19, 13),
    preparation_start: null,
    actual_check_in: at(-20, 16, 40),
    actual_check_out: at(-19, 12, 30),
    available_again_at: at(-19, 16),
    guests: 6,
    base_amount: halalas(220000),
    addons_amount: halalas(0),
    discount_amount: halalas(20000),
    commission_amount: halalas(20000),
    total_amount: halalas(200000),
    created_at: at(-27, 14),
  },
  {
    // حجب صيانة ينشئه صاحب المكان — يشارك نفس الجدول ونفس قيد التداخل
    id: "b-4",
    reference: "BLK-0012",
    place_id: "p-1",
    place_title_ar: "كشتة الرمال الذهبية",
    customer_id: "",
    host_id: "u-host-1",
    status: "confirmed",
    payment_status: "unpaid",
    rate_unit: "day",
    booking_start: at(10, 0),
    booking_end: at(11, 0),
    preparation_start: null,
    actual_check_in: null,
    actual_check_out: null,
    available_again_at: null,
    guests: 1,
    base_amount: halalas(0),
    addons_amount: halalas(0),
    discount_amount: halalas(0),
    commission_amount: halalas(0),
    total_amount: halalas(0),
    created_at: at(-1, 8),
  },
];

export const orders: Order[] = [
  {
    id: "o-1",
    reference: "ORD-5521",
    customer_id: "u-cust-1",
    host_id: "u-host-3",
    status: "out_for_delivery",
    payment_status: "paid",
    items: [
      {
        id: "oi-1",
        order_id: "o-1",
        service_id: "s-1",
        service_title_ar: "خيمة مجهّزة كاملة",
        quantity: 1,
        unit_price: halalas(50000),
        line_total: halalas(50000),
        pricing_mode: "per_booking",
        service_at: at(1, 15),
      },
      {
        id: "oi-2",
        order_id: "o-1",
        service_id: "s-2",
        service_title_ar: "طاولة + 6 كراسي",
        quantity: 3,
        unit_price: halalas(15000),
        line_total: halalas(45000),
        pricing_mode: "per_unit",
        service_at: at(1, 15),
      },
    ],
    delivery_address: {
      id: "da-1",
      label_ar: "موقع الكشتة",
      city_id: "c-ryd",
      district_id: null,
      address_text: "طريق الثمامة، بعد مخرج 12",
      location: { lat: 24.9312, lng: 46.8451 },
      notes: "الاتصال قبل الوصول بنصف ساعة",
    },
    services_amount: halalas(95000),
    delivery_fee: halalas(15000),
    extra_fees: halalas(0),
    discount_amount: halalas(0),
    commission_amount: halalas(11000),
    total_amount: halalas(110000),
    created_at: at(-2, 11),
  },
  {
    id: "o-2",
    reference: "ORD-5498",
    customer_id: "u-cust-1",
    host_id: "u-host-3",
    status: "completed",
    payment_status: "paid",
    items: [
      {
        id: "oi-3",
        order_id: "o-2",
        service_id: "s-3",
        service_title_ar: "صبّاب قهوة",
        quantity: 2,
        unit_price: halalas(20000),
        line_total: halalas(160000),
        pricing_mode: "per_hour",
        service_at: at(-12, 17),
      },
    ],
    delivery_address: {
      id: "da-2",
      label_ar: null,
      city_id: "c-ryd",
      district_id: null,
      address_text: "حي الملقا، الرياض",
      location: { lat: 24.7742, lng: 46.6231 },
      notes: null,
    },
    services_amount: halalas(160000),
    delivery_fee: halalas(0),
    extra_fees: halalas(0),
    discount_amount: halalas(0),
    commission_amount: halalas(16000),
    total_amount: halalas(160000),
    created_at: at(-14, 13),
  },
];
