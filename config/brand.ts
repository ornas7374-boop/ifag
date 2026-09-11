import { cache } from "react";

import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { BrandConfig, ColorScheme } from "@/types/brand";

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

interface BrandColorOverrides {
  light?: Partial<ColorScheme>;
  dark?: Partial<ColorScheme>;
}

/**
 * تُقرأ مرة واحدة لكل طلب حتى لو استدعتها عدة مكونات (التخطيط الجذري
 * والفوتر والشعار كلها تستدعي getBrand()) — cache من React تُذيب
 * الاستدعاءات المتكررة ضمن نفس شجرة العرض إلى طلب شبكة واحد.
 *
 * تفشل بصمت إلى null عند أي خطأ: هوية المنصة لا يجوز أن تُسقط الموقع
 * كله لمجرد تعطّل القراءة من platform_settings.
 */
const fetchPlatformSettings = cache(async () => {
  if (!isSupabaseConfigured) return null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("platform_settings").select("*").maybeSingle();
    return data;
  } catch {
    return null;
  }
});

function mergeBrand(
  base: BrandConfig,
  row: Awaited<ReturnType<typeof fetchPlatformSettings>>,
): BrandConfig {
  if (!row) return base;

  const overrides = (row.brand_colors ?? {}) as BrandColorOverrides;

  return {
    ...base,
    appName: row.app_name || base.appName,
    logoUrl: row.logo_url || base.logoUrl,
    faviconUrl: row.favicon_url || base.faviconUrl,
    fontFamily: row.font_family || base.fontFamily,
    radius: row.border_radius || base.radius,
    colors: {
      light: { ...base.colors.light, ...overrides.light },
      dark: { ...base.colors.dark, ...overrides.dark },
    },
  };
}

/**
 * ★ نقطة التبديل التي وُعد بها منذ اليوم الأول ★
 *
 * تقرأ صف platform_settings وتدمجه فوق الثوابت أعلاه — أي قيمة
 * فارغة في الصف (لم يعدّلها المدير بعد) تبقى على افتراضيها من
 * brandDefaults. لوحة الإدارة (admin/settings) هي ما يكتب هذا الصف.
 *
 * async منذ اليوم الأول تحديدًا حتى لا يحتاج أي مستدعٍ لتعديل نفسه
 * الآن بعد ربطها فعليًا.
 */
export async function getBrand(): Promise<BrandConfig> {
  const row = await fetchPlatformSettings();
  return mergeBrand(brandDefaults, row);
}
