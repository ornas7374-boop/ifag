import localFont from "next/font/local";

/**
 * الخطوط تُخدم محليًا من حزم @fontsource عبر next/font/local بدل next/font/google:
 * لا تنزيل من Google وقت البناء (أسرع وأثبت في CI)، ونفس الـ subsetting.
 *
 * كل عائلة مقسومة إلى ملفين (عربي/لاتيني) مع unicode-range، فلا يُنزّل المتصفح
 * الملف اللاتيني إلا إذا ظهر نص لاتيني. ملاحظة: next/font يشترط قيمًا حرفية
 * (literals) في الخيارات، لذلك تتكرر نطاقات الـ unicode ولا توضع في ثابت.
 */

export const plexArabic = localFont({
  src: [
    { path: "../node_modules/@fontsource/ibm-plex-sans-arabic/files/ibm-plex-sans-arabic-arabic-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../node_modules/@fontsource/ibm-plex-sans-arabic/files/ibm-plex-sans-arabic-arabic-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../node_modules/@fontsource/ibm-plex-sans-arabic/files/ibm-plex-sans-arabic-arabic-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../node_modules/@fontsource/ibm-plex-sans-arabic/files/ibm-plex-sans-arabic-arabic-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-plex-ar",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
  declarations: [
    { prop: "unicode-range", value: "U+0600-06FF, U+0750-077F, U+0870-08FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE70-FEFC" },
  ],
});

export const plexLatin = localFont({
  src: [
    { path: "../node_modules/@fontsource/ibm-plex-sans-arabic/files/ibm-plex-sans-arabic-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../node_modules/@fontsource/ibm-plex-sans-arabic/files/ibm-plex-sans-arabic-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../node_modules/@fontsource/ibm-plex-sans-arabic/files/ibm-plex-sans-arabic-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../node_modules/@fontsource/ibm-plex-sans-arabic/files/ibm-plex-sans-arabic-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-plex-latin",
  display: "swap",
  preload: false,
  declarations: [
    { prop: "unicode-range", value: "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+20AC, U+2122, U+2212, U+FEFF, U+FFFD" },
  ],
});

export const naskhArabic = localFont({
  src: "../node_modules/@fontsource-variable/noto-naskh-arabic/files/noto-naskh-arabic-arabic-wght-normal.woff2",
  weight: "400 700",
  style: "normal",
  variable: "--font-naskh-ar",
  display: "swap",
  fallback: ["serif"],
  declarations: [
    { prop: "unicode-range", value: "U+0600-06FF, U+0750-077F, U+0870-08FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE70-FEFC" },
  ],
});

export const naskhLatin = localFont({
  src: "../node_modules/@fontsource-variable/noto-naskh-arabic/files/noto-naskh-arabic-latin-wght-normal.woff2",
  weight: "400 700",
  style: "normal",
  variable: "--font-naskh-latin",
  display: "swap",
  preload: false,
  declarations: [
    { prop: "unicode-range", value: "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+20AC, U+2122, U+2212, U+FEFF, U+FFFD" },
  ],
});

export const fontVariables = [
  plexArabic.variable,
  plexLatin.variable,
  naskhArabic.variable,
  naskhLatin.variable,
].join(" ");
