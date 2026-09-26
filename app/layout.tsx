import type { Metadata, Viewport } from "next";

import { fontVariables } from "./fonts";
import { site } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${site.name} | مساعد البحث في فتاوى ابن باز`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
};

// استثناء موثّق من قاعدة "لا hex خارج globals.css": themeColor لا يقبل متغيّر CSS.
export const viewport: Viewport = {
  themeColor: "#fbfaf7",
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
