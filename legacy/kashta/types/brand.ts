/**
 * عقد الهوية البصرية للمنصة.
 *
 * كل قيمة هنا قابلة للتبديل دون إعادة بناء المشروع (المتطلب 26).
 * لا تكتب أي لون أو اسم منصة داخل المكونات — اقرأها من هنا فقط.
 */

/** مفاتيح الألوان الدلالية. نفس المفاتيح تتكرر في الوضع الفاتح والداكن. */
export type ColorToken =
  | "background"
  | "foreground"
  | "card"
  | "cardForeground"
  | "popover"
  | "popoverForeground"
  | "primary"
  | "primaryForeground"
  | "secondary"
  | "secondaryForeground"
  | "muted"
  | "mutedForeground"
  | "accent"
  | "accentForeground"
  | "destructive"
  | "destructiveForeground"
  | "success"
  | "successForeground"
  | "warning"
  | "warningForeground"
  | "border"
  | "input"
  | "ring"
  /*
   * ألوان المخططات منفصلة عن ألوان الواجهة عن قصد.
   * اللون الأساسي للواجهة (#1F5C4A) يرسب في فحص المخططات: داكن أكثر
   * من اللازم وتشبّعه منخفض فيُقرأ رماديًا داخل الرسم. هذه الدرجات
   * مشتقة من نفس العائلة لكنها مُدرّجة حتى تجتاز فحوص العمى اللوني
   * والتباين في الوضعين معًا.
   */
  | "chartSeries1"
  | "chartSeries2";

export type ColorScheme = Record<ColorToken, string>;

export interface BrandConfig {
  /** اسم المنصة كما يظهر في الهيدر و <title> وكل النصوص. */
  appName: string;
  /** وصف قصير يستخدم في الميتاداتا. */
  appDescription: string;
  /** شعار المنصة. */
  logoUrl: string;
  faviconUrl: string;
  /** الألوان لكل وضع. الوضع الداكن ليس اختياريًا — الواجهة تدعم الاثنين. */
  colors: {
    light: ColorScheme;
    dark: ColorScheme;
  };
  /**
   * عائلة الخط. القيمة الافتراضية تشير إلى متغيّر next/font.
   * تغيير الخط لعائلة جديدة كليًا يتطلب تحميلها في app/layout.tsx أولًا
   * (قيد في next/font: الخطوط تُحمّل وقت البناء وليس وقت التشغيل).
   */
  fontFamily: string;
  /** انحناء الحواف الأساسي — تشتق منه بقية المقاسات. */
  radius: string;
  /** روابط التواصل، تظهر في الفوتر. اتركها فارغة لإخفائها. */
  social: {
    x?: string;
    instagram?: string;
    tiktok?: string;
    whatsapp?: string;
  };
  /** معلومات التواصل. */
  contact: {
    email?: string;
    phone?: string;
  };
}
