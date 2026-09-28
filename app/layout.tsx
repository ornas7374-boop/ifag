import type { Metadata, Viewport } from "next";

import { fontVariables } from "./fonts";
import { site } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${site.name} | ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
};

// استثناء موثّق من قاعدة "لا hex خارج globals.css": themeColor لا يقبل متغيّر CSS.
export const viewport: Viewport = {
  themeColor: "#fbfaf7",
  // المحتوى يمتد تحت الـ notch (ونعوّضه بـ safe-area)، ولوحة المفاتيح تقلّص
  // الـ layout (dvh) بدل أن تغطي مربع الكتابة.
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" className={fontVariables}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
