import { halalasToSar, type Halalas } from "@/lib/money";

/**
 * ★ المكان الوحيد المسموح فيه باستخدام Intl ★
 *
 * فخّان حقيقيان في التوطين العربي، كلاهما صامت:
 *
 * 1. Intl.NumberFormat('ar-SA')   -> أرقام هندية (٠١٢٣)
 *    المتاجر السعودية تعرض الأسعار بأرقام لاتينية. الحل: -u-nu-latn
 *
 * 2. Intl.DateTimeFormat('ar-SA') -> تقويم أم القرى الهجري
 *    تواريخ الحجز ستظهر هجرية دون أن يطلب أحد ذلك. الحل: -u-ca-gregory
 *
 * وكذلك timeZone صريحة دائمًا، وإلا اختلف الخادم عن المتصفح وانكسر الـ
 * hydration في React.
 */
const NUMBER_LOCALE = "ar-SA-u-nu-latn";
const DATE_LOCALE = "ar-SA-u-ca-gregory-nu-latn";
const HIJRI_LOCALE = "ar-SA-u-ca-islamic-umalqura-nu-latn";
export const TIME_ZONE = "Asia/Riyadh";

const numberFormatter = new Intl.NumberFormat(NUMBER_LOCALE, {
  maximumFractionDigits: 0,
});

const currencyFormatter = new Intl.NumberFormat(NUMBER_LOCALE, {
  style: "currency",
  currency: "SAR",
  maximumFractionDigits: 0,
});

const currencyWithFractionFormatter = new Intl.NumberFormat(NUMBER_LOCALE, {
  style: "currency",
  currency: "SAR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** رقم عادي بفواصل آلاف وأرقام لاتينية. */
export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

/**
 * المبلغ الوحيد المعتمد للعرض. يستقبل هللات دائمًا — لا ريالات.
 * إن كان المبلغ ريالات صحيحة نخفي الكسور لأن معظم الأسعار كذلك.
 */
export function formatSAR(value: Halalas): string {
  const sar = halalasToSar(value);
  return Number.isInteger(sar)
    ? currencyFormatter.format(sar)
    : currencyWithFractionFormatter.format(sar);
}

const dateFormatter = new Intl.DateTimeFormat(DATE_LOCALE, {
  timeZone: TIME_ZONE,
  day: "numeric",
  month: "long",
  year: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat(DATE_LOCALE, {
  timeZone: TIME_ZONE,
  day: "numeric",
  month: "short",
});

const timeFormatter = new Intl.DateTimeFormat(DATE_LOCALE, {
  timeZone: TIME_ZONE,
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

const hijriFormatter = new Intl.DateTimeFormat(HIJRI_LOCALE, {
  timeZone: TIME_ZONE,
  day: "numeric",
  month: "long",
  year: "numeric",
});

function toDate(value: Date | string): Date {
  return typeof value === "string" ? new Date(value) : value;
}

/** ٣ مارس ٢٠٢٦ -> "3 مارس 2026" (ميلادي، أرقام لاتينية) */
export function formatDate(value: Date | string): string {
  return dateFormatter.format(toDate(value));
}

export function formatShortDate(value: Date | string): string {
  return shortDateFormatter.format(toDate(value));
}

/** "4:00 م" */
export function formatTime(value: Date | string): string {
  return timeFormatter.format(toDate(value));
}

export function formatDateTime(value: Date | string): string {
  const date = toDate(value);
  return `${formatDate(date)} — ${formatTime(date)}`;
}

/** التاريخ الهجري، يُعرض كسطر ثانوي اختياري فقط. */
export function formatHijriDate(value: Date | string): string {
  return hijriFormatter.format(toDate(value));
}

/**
 * فترة الحجز. تُقصّر العرض إذا كانت في نفس اليوم:
 * "3 مارس 2026، 4:00 م – 8:00 م" بدل تكرار التاريخ مرتين.
 */
export function formatDateRange(
  start: Date | string,
  end: Date | string,
): string {
  const startDate = toDate(start);
  const endDate = toDate(end);
  const sameDay = formatDate(startDate) === formatDate(endDate);

  return sameDay
    ? `${formatDate(startDate)}، ${formatTime(startDate)} – ${formatTime(endDate)}`
    : `${formatDateTime(startDate)} ← ${formatDateTime(endDate)}`;
}

/** "٣ ليالٍ" وما شابه — صياغة عربية سليمة للمفرد والمثنى والجمع. */
export function pluralizeAr(
  count: number,
  forms: { one: string; two: string; few: string; many: string },
): string {
  if (count === 1) return forms.one;
  if (count === 2) return forms.two;
  if (count >= 3 && count <= 10) return `${formatNumber(count)} ${forms.few}`;
  return `${formatNumber(count)} ${forms.many}`;
}
