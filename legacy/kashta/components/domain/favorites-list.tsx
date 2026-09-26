"use client";

import Link from "next/link";

import { ListingGrid } from "@/components/domain/listing-card";
import { EmptyState } from "@/components/states/empty-state";
import { ListingGridSkeleton } from "@/components/states/listing-card-skeleton";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/lib/favorites/use-favorites";
import { ar } from "@/content/ar";
import type { ListingCardData } from "@/types/domain";

/**
 * كل البطاقات تُجلب في الخادم، والتصفية تتم هنا حسب المفضلة المحفوظة
 * في المتصفح. عند انتقال المفضلة إلى قاعدة البيانات يصبح الجلب مفلترًا
 * من المصدر وتُحذف هذه التصفية.
 */
export function FavoritesList({ all }: { all: ListingCardData[] }) {
  const { keys, isHydrated } = useFavorites();

  if (!isHydrated) return <ListingGridSkeleton count={4} />;

  const items = all.filter((item) => {
    const kind = item.href.startsWith("/services/") ? "service" : "place";
    return keys.includes(`${kind}:${item.id}`);
  });

  if (items.length === 0) {
    return (
      <EmptyState
        title="لا توجد عناصر في المفضلة"
        hint="اضغط ♥ على أي مكان أو خدمة لحفظها هنا."
        action={
          <Button asChild>
            <Link href="/search?kind=place">{ar.nav.places}</Link>
          </Button>
        }
      />
    );
  }

  return <ListingGrid items={items} />;
}
