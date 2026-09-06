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
    "منصة سعودية لحجز الكشتات والمخيمات والشاليهات، وطلب خدمات التجهيز والتوصيل لموقعك.",
  logoUrl: process.env.NEXT_PUBLIC_LOGO_URL ?? "/brand/logo.svg",
  faviconUrl: process.env.NEXT_PUBLIC_FAVICON_URL ?? "/brand/logo.svg",

  colors: {
    light: {
      background: "#FBF8F4",
      foreground: "#1C1917",
      card: "#FFFFFF",
      cardForeground: "#1C1917",
      popover: "#FFFFFF",
      popoverForeground: "#1C1917",
      primary: "#1F5C4A",
      primaryForeground: "#FFFFFF",
      secondary: "#F0EAE1",
      secondaryForeground: "#3A342D",
      muted: "#F0EAE1",
      mutedForeground: "#6B6259",
      accent: "#A65A2A",
      accentForeground: "#FFFFFF",
      destructive: "#B42318",
      destructiveForeground: "#FFFFFF",
      success: "#2F6F4E",
      successForeground: "#FFFFFF",
      warning: "#B4690E",
      warningForeground: "#FFFFFF",
      border: "#E3DACD",
      input: "#E3DACD",
      ring: "#1F5C4A",
      chartSeries1: "#2FA07E",
      chartSeries2: "#CE7A2E",
    },
    dark: {
      background: "#14120F",
      foreground: "#F5F0E8",
      card: "#1E1B17",
      cardForeground: "#F5F0E8",
      popover: "#1E1B17",
      popoverForeground: "#F5F0E8",
      primary: "#4E9E84",
      primaryForeground: "#0B1F19",
      secondary: "#292420",
      secondaryForeground: "#EDE7DD",
      muted: "#292420",
      mutedForeground: "#A79E92",
      accent: "#D68C52",
      accentForeground: "#1A0F06",
      destructive: "#E5675A",
      destructiveForeground: "#1A0605",
      success: "#5CB98C",
      successForeground: "#08150F",
      warning: "#E0A458",
      warningForeground: "#1A1105",
      border: "#332E27",
      input: "#332E27",
      ring: "#4E9E84",
      chartSeries1: "#2FA07E",
      chartSeries2: "#CE7A2E",
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
