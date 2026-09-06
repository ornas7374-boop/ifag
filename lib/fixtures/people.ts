/**
 * مستخدمون وإشعارات ومدفوعات وعناوين تجريبية.
 * أسماء وأرقام مُختلقة بالكامل — لا بيانات شخصية حقيقية (المتطلب 27).
 */
import { halalas } from "@/lib/money";
import type {
  DeliveryAddress,
  NotificationItem,
  PaymentRecord,
  Profile,
} from "@/types/domain";

const DAY = 24 * 60 * 60 * 1000;
const ago = (d: number) => new Date(Date.now() - d * DAY).toISOString();

export const profiles: Profile[] = [
  { id: "u-cust-1", full_name: "سعد الحربي", role: "customer", avatar_url: null, phone: "0500000001" },
  { id: "u-cust-2", full_name: "لمياء الشمري", role: "customer", avatar_url: null, phone: "0500000002" },
  { id: "u-cust-3", full_name: "ماجد القحطاني", role: "customer", avatar_url: null, phone: "0500000003" },
  { id: "u-host-1", full_name: "خالد العتيبي", role: "host", avatar_url: null, phone: "0500000010" },
  { id: "u-host-2", full_name: "منى الدوسري", role: "host", avatar_url: null, phone: "0500000011" },
  { id: "u-host-3", full_name: "تجهيزات الصحراء", role: "host", avatar_url: null, phone: "0500000012" },
  { id: "u-admin-1", full_name: "إدارة المنصة", role: "admin", avatar_url: null, phone: null },
];

export const notifications: NotificationItem[] = [
  { id: "n-1", user_id: "u-cust-1", title_ar: "تم تأكيد حجزك", body_ar: "كشتة الرمال الذهبية — بعد 6 أيام.", link: "/account/bookings", is_read: false, created_at: ago(0.2) },
  { id: "n-2", user_id: "u-cust-1", title_ar: "طلبك خرج للتوصيل", body_ar: "خيمة مجهّزة + طاولات في الطريق إليك.", link: "/account/orders", is_read: false, created_at: ago(1) },
  { id: "n-3", user_id: "u-cust-1", title_ar: "قيّم تجربتك", body_ar: "شاركنا رأيك في بر السودة المطل.", link: "/account/reviews", is_read: true, created_at: ago(18) },
];

export const payments: PaymentRecord[] = [
  { id: "pay-1", reference: "KSH-24081", kind: "booking", customer_name: "سعد الحربي", amount: halalas(128000), commission: halalas(12800), status: "paid", provider: "moyasar", created_at: ago(3) },
  { id: "pay-2", reference: "ORD-5521", kind: "order", customer_name: "سعد الحربي", amount: halalas(110000), commission: halalas(11000), status: "paid", provider: "moyasar", created_at: ago(2) },
  { id: "pay-3", reference: "KSH-24063", kind: "booking", customer_name: "لمياء الشمري", amount: halalas(65000), commission: halalas(6500), status: "paid", provider: "moyasar", created_at: ago(8) },
  { id: "pay-4", reference: "ORD-5498", kind: "order", customer_name: "ماجد القحطاني", amount: halalas(160000), commission: halalas(16000), status: "paid", provider: "moyasar", created_at: ago(14) },
  { id: "pay-5", reference: "KSH-23990", kind: "booking", customer_name: "سعد الحربي", amount: halalas(200000), commission: halalas(20000), status: "refunded", provider: "moyasar", created_at: ago(27) },
];

export const addresses: DeliveryAddress[] = [
  { id: "da-1", label_ar: "موقع الكشتة", city_id: "c-ryd", district_id: null, address_text: "طريق الثمامة، بعد مخرج 12", location: { lat: 24.9312, lng: 46.8451 }, notes: "الاتصال قبل الوصول بنصف ساعة" },
  { id: "da-2", label_ar: "المنزل", city_id: "c-ryd", district_id: null, address_text: "حي الملقا، الرياض", location: { lat: 24.7742, lng: 46.6231 }, notes: null },
];
