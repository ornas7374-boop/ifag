import type { BrandConfig } from "@/types/brand";

/**
 * ★ مصدر الحقيقة الوحيد لهوية المنصة ★
 *
 * غيّر أي قيمة هنا فيتغيّر كل شيء في المشروع: الاسم، الشعار، الألوان،
 * الخط، انحناء الحواف، عنوان الصفحة، والأيقونة.
 *
 * كل قيمة تقبل تجاوزًا عبر متغيّرات البيئة حتى تختلف الهوية بين
 * بيئة التطوير والإنتاج دون تعديل الكود.
 */
export const brandDefaults: BrandConfig = {
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "كشتة",
  appDescription:
    process.env.NEXT_PUBLIC_APP_DESCRIPTION ??
    "منصة سعودية لحجز الكشتات والمخيمات والأماكن البرية، وطلب خدمات التجهيز والتوصيل لموقعك.",
  logoUrl: process.env.NEXT_PUBLIC_LOGO_URL ?? "/brand/logo.jpg",
  faviconUrl: process.env.NEXT_PUBLIC_FAVICON_URL ?? "/brand/logo.jpg",

  colors: {
    light: {
      background: "#FDFCF7",
      foreground: "#1C1917",
      card: "#FFFFFF",
      cardForeground: "#1C1917",
      popover: "#FFFFFF",
      popoverForeground: "#1C1917",
      // نحاسي اللوقو — 5.10:1 مع الأبيض
      primary: "#A65A2A",
      primaryForeground: "#FFFFFF",
      secondary: "#F3EDE4",
      secondaryForeground: "#3A342D",
      muted: "#F3EDE4",
      mutedForeground: "#6B6259",
      // عنّابي مركز اللوقو — 9.23:1 مع الأبيض
      accent: "#7A3024",
      accentForeground: "#FFFFFF",
      destructive: "#B42318",
      destructiveForeground: "#FFFFFF",
      success: "#2F6F4E",
      successForeground: "#FFFFFF",
      warning: "#B4690E",
      warningForeground: "#FFFFFF",
      border: "#E6DCCC",
      input: "#E6DCCC",
      ring: "#A65A2A",
      chartSeries1: "#1F9BAB",
      chartSeries2: "#B8703C",
    },
    dark: {
      background: "#14120F",
      foreground: "#F5F0E8",
      card: "#1E1B17",
      cardForeground: "#F5F0E8",
      popover: "#1E1B17",
      popoverForeground: "#F5F0E8",
      // نحاسي مُفتَّح للخلفية الداكنة — 5.38:1 على سطح البطاقة
      primary: "#C87F4A",
      primaryForeground: "#1A0F06",
      secondary: "#2B2521",
      secondaryForeground: "#EDE7DD",
      muted: "#2B2521",
      mutedForeground: "#A79E92",
      // عنّابي مُفتَّح — 4.53:1 على سطح البطاقة
      accent: "#CE6449",
      accentForeground: "#1A0605",
      destructive: "#E5675A",
      destructiveForeground: "#1A0605",
      success: "#5CB98C",
      successForeground: "#08150F",
      warning: "#E0A458",
      warningForeground: "#1A1105",
      border: "#3A332B",
      input: "#3A332B",
      ring: "#C87F4A",
      chartSeries1: "#1F9BAB",
      chartSeries2: "#B8703C",
    },
  },

  // يشير إلى متغيّر next/font المحمّل في app/layout.tsx
  fontFamily: process.env.NEXT_PUBLIC_BRAND_FONT ?? "var(--font-plex-arabic)",
  radius: process.env.NEXT_PUBLIC_BRAND_RADIUS ?? "0.875rem",

  social: {
    x: process.env.NEXT_PUBLIC_SOCIAL_X,
    instagram: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM,
    tiktok: process.env.NEXT_PUBLIC_SOCIAL_TIKTOK,
    whatsapp: process.env.NEXT_PUBLIC_SOCIAL_WHATSAPP,
  },
  contact: {
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
    phone: process.env.NEXT_PUBLIC_CONTACT_PHONE,
  },
};

/**
 * ★ نقطة التبديل المستقبلية ★
 *
 * كل المشروع يستدعي getBrand() ولا يستورد brandDefaults مباشرة.
 *
 * المرحلة 1  : ترجع الثوابت أعلاه.
 * المرحلة 11 : تقرأ صف platform_settings من قاعدة البيانات وتدمجه فوق
 *              الثوابت — عندها يتغيّر جسم هذه الدالة فقط، وصفر مكوّن.
 *
 * async منذ اليوم الأول تحديدًا حتى لا تحتاج المرحلة 11 لتعديل أي مستدعٍ.
 */
export async function getBrand(): Promise<BrandConfig> {
  return brandDefaults;
}
