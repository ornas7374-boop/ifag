import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, Tajawal } from "next/font/google";

import { getBrand } from "@/config/brand";
import { brandToCssVars } from "@/config/theme";
import { AppProviders } from "@/components/providers";
import "./globals.css";

/**
 * الخطوط تُحمّل وقت البناء (قيد next/font). لذلك نحمّل عائلتين عربيتين
 * مسبقًا، وتختار config/brand.ts بينهما عبر متغيّر --brand-font-sans.
 * إضافة عائلة ثالثة جديدة تمامًا تتطلب سطرًا هنا.
 *
 * ملاحظة: لا نستخدم أوزانًا أقل من 400 — الخط العربي الرفيع يُقرأ بصعوبة
 * في أحجام النصوص العادية.
 */
const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-arabic",
  display: "swap",
});

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700"],
  variable: "--font-tajawal",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrand();
  return {
    title: {
      default: brand.appName,
      template: `%s | ${brand.appName}`,
    },
    description: brand.appDescription,
    icons: { icon: brand.faviconUrl },
    openGraph: {
      title: brand.appName,
      description: brand.appDescription,
      locale: "ar_SA",
      type: "website",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const brand = await getBrand();

  // الهوية تُحقن كمتغيّرات CSS على <html> — من هنا تتغذّى كل الأصناف.
  const themeVars = brandToCssVars(brand) as React.CSSProperties;

  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${plexArabic.variable} ${tajawal.variable}`}
      style={themeVars}
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
