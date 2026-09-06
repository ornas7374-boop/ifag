import {
  addH,
  clampMinZero,
  halalas,
  mulH,
  pctH,
  subH,
  ZERO,
  type Halalas,
} from "@/lib/money";
import type {
  Addon,
  DeliveryFeeStrategy,
  PricingMode,
  RateUnit,
  Service,
} from "@/types/domain";

/**
 * ★ محرّك التسعير — التنفيذ الوحيد في المشروع ★
 *
 * رغم أن الأماكن والخدمات في جدولين منفصلين، منطق الحساب واحد لأنه
 * مبني على `pricing_mode` كبيانات لا كشيفرة. إضافة طريقة تسعير جديدة
 * مستقبلًا = قيمة في الـ enum + حالة واحدة هنا، ولا شيء غير ذلك.
 *
 * تحذير: في المرحلة 12 يعمل هذا الملف على الخادم فقط عند الكتابة.
 * ما تحسبه الواجهة هو معاينة للعميل، والخادم يعيد الحساب قبل الحفظ.
 * لا يُقبل أي مبلغ قادم من المتصفح.
 */

/** المتغيّرات التي قد تحتاجها أي طريقة تسعير. */
export interface PricingContext {
  hours: number;
  days: number;
  nights: number;
  persons: number;
  quantity: number;
  distanceKm: number;
}

export const defaultPricingContext: PricingContext = {
  hours: 0,
  days: 0,
  nights: 0,
  persons: 1,
  quantity: 1,
  distanceKm: 0,
};

/**
 * كم "وحدة" يُضرب فيها السعر حسب طريقة التسعير.
 *
 * ★ الكمية بُعد مستقل عن الزمن ★
 * صبّابان لأربع ساعات = السعر × 4 ساعات × 2 صبّاب، لا × 4 فقط.
 * إهمال الكمية هنا يعني تحصيل أجر عامل واحد مهما طلب العميل.
 *
 * الاستثناء الوحيد `fixed`: سعر مقطوع لا يتأثر بشيء — وهذا معنى الاسم.
 * و`per_unit` كميته هي مضاعِفه أصلًا، فلا تُضرب مرتين.
 */
function multiplierFor(mode: PricingMode, ctx: PricingContext): number {
  const quantity = Math.max(1, ctx.quantity);

  switch (mode) {
    case "fixed":
      return 1;
    case "per_booking":
      return quantity;
    case "per_hour":
      return Math.max(1, ctx.hours) * quantity;
    case "per_day":
      return Math.max(1, ctx.days) * quantity;
    case "per_night":
      return Math.max(1, ctx.nights) * quantity;
    case "per_person":
      return Math.max(1, ctx.persons) * quantity;
    case "per_unit":
      return quantity;
    case "per_km":
      return Math.max(0, ctx.distanceKm) * quantity;
  }
}

/**
 * سعر بند واحد. التقريب يقع هنا — على مستوى البند — ثم تُجمع البنود.
 * لو جمعنا ثم قرّبنا لاختلف الإجمالي عن مجموع ما يراه العميل.
 */
export function lineAmount(
  unitPrice: Halalas,
  mode: PricingMode,
  ctx: PricingContext,
): Halalas {
  return mulH(unitPrice, multiplierFor(mode, ctx));
}

export function addonAmount(addon: Addon, ctx: PricingContext): Halalas {
  return lineAmount(addon.price, addon.pricing_mode, ctx);
}

/** سعر الليلة/اليوم/الساعة حسب نوع الحجز المختار. */
export function placeRate(
  rates: {
    price_per_hour: Halalas | null;
    price_per_day: Halalas | null;
    price_per_night: Halalas | null;
  },
  unit: RateUnit,
): Halalas | null {
  if (unit === "hour") return rates.price_per_hour;
  if (unit === "day") return rates.price_per_day;
  return rates.price_per_night;
}

export interface DeliveryInput {
  strategy: DeliveryFeeStrategy;
  fee: Halalas;
  freeOver: Halalas | null;
  distanceKm: number;
  /** قيمة الخدمات قبل التوصيل — تُقارن بـ freeOver. */
  itemsSubtotal: Halalas;
}

/** رسوم التوصيل حسب الاستراتيجية التي اختارها مقدّم الخدمة. */
export function deliveryFee(input: DeliveryInput): Halalas {
  if (input.strategy === "free") return ZERO;

  // التوصيل المجاني فوق مبلغ معيّن يتجاوز كل الاستراتيجيات
  if (input.freeOver !== null && input.itemsSubtotal >= input.freeOver) {
    return ZERO;
  }

  switch (input.strategy) {
    case "flat":
    case "per_city":
    case "per_district":
      return input.fee;
    case "per_distance":
      return mulH(input.fee, Math.max(1, Math.ceil(input.distanceKm / 10)));
  }
}

export interface QuoteLine {
  label: string;
  amount: Halalas;
}

export interface Quote {
  lines: QuoteLine[];
  itemsSubtotal: Halalas;
  deliveryFee: Halalas;
  discount: Halalas;
  /** ما يدفعه العميل. */
  total: Halalas;
  /** عمولة المنصة — تُخفى عن العميل وتُعرض للمزوّد والإدارة. */
  commission: Halalas;
  /** صافي المزوّد بعد العمولة. */
  hostNet: Halalas;
}

export interface QuoteInput {
  lines: QuoteLine[];
  delivery?: DeliveryInput;
  discount?: Halalas;
  /** نسبة العمولة (0.10 = 10%). تأتي من إعدادات المنصة، وليست ثابتة في الكود. */
  commissionRate: number;
}

export function buildQuote(input: QuoteInput): Quote {
  const itemsSubtotal = addH(...input.lines.map((l) => l.amount), ZERO);
  const fee = input.delivery
    ? deliveryFee({ ...input.delivery, itemsSubtotal })
    : ZERO;
  const discount = input.discount ?? ZERO;

  const total = clampMinZero(subH(addH(itemsSubtotal, fee), discount));
  const commission = pctH(total, input.commissionRate);

  return {
    lines: input.lines,
    itemsSubtotal,
    deliveryFee: fee,
    discount,
    total,
    commission,
    hostNet: subH(total, commission),
  };
}

/** عرض تقديري لسطر خدمة في السلة. */
export function serviceLine(
  service: Service,
  quantity: number,
  ctx: Partial<PricingContext> = {},
): QuoteLine {
  const context: PricingContext = {
    ...defaultPricingContext,
    ...ctx,
    quantity,
  };
  return {
    label: service.title_ar,
    amount: lineAmount(service.price, service.pricing_mode, context),
  };
}

/** نسبة العمولة الافتراضية — تُقرأ من platform_settings في المرحلة 11. */
export const DEFAULT_COMMISSION_RATE = Number(
  process.env.NEXT_PUBLIC_DEFAULT_COMMISSION_RATE ?? "0.10",
);

export { halalas };
