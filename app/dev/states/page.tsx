import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { StatesGallery } from "@/components/dev/states-gallery";

export const metadata: Metadata = {
  title: "حالات الواجهة (تطوير)",
  robots: { index: false, follow: false },
};

// يُقرأ المتغيّر وقت الطلب لا وقت البناء.
export const dynamic = "force-dynamic";

/**
 * كل حالات المحادثة في صفحة واحدة للمراجعة البصرية.
 * متاحة في وضع التطوير فقط، أو عند SANAD_DEV_STATES=1 (لاختبارات بناء الإنتاج).
 */
export default function DevStatesPage() {
  if (process.env.NODE_ENV !== "development" && process.env.SANAD_DEV_STATES !== "1") notFound();
  return <StatesGallery />;
}
