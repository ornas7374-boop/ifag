import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { RatingStars } from "@/components/domain/rating-stars";
import { ar } from "@/content/ar";
import { formatSAR } from "@/lib/format";
import { priceUnitLabel } from "@/lib/adapters";
import { cn } from "@/lib/utils";
import type { ListingCardData } from "@/types/domain";

/**
 * بطاقة واحدة تخدم الأماكن والخدمات معًا عبر ListingCardData.
 * البيانات تصل جاهزة من lib/adapters — البطاقة لا تعرف الفرق بينهما.
 */
export function ListingCard({
  item,
  className,
}: {
  item: ListingCardData;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md",
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <Image
          src={item.cover_image_url}
          alt={item.title_ar}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* start-3 منطقي: يمين في RTL، يسار في LTR — لا تستخدم left/right */}
        <button
          type="button"
          aria-label={ar.common.addToFavorites}
          className="absolute end-3 top-3 grid size-9 cursor-pointer place-items-center rounded-full bg-card/90 text-foreground backdrop-blur transition-colors hover:text-destructive"
        >
          <Heart className="size-4" aria-hidden />
        </button>

        {item.badges.length > 0 ? (
          <div className="absolute start-3 top-3 flex flex-wrap gap-1.5">
            {item.badges.map((badge) => (
              <Badge key={badge} variant="secondary">
                {badge}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>

      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold leading-snug text-foreground">
            {/* الرابط يغطي البطاقة كاملة مع بقاء زر المفضلة قابلًا للنقر */}
            <Link href={item.href} className="after:absolute after:inset-0">
              {item.title_ar}
            </Link>
          </h3>
        </div>

        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-4 shrink-0" aria-hidden />
          {item.city_name_ar}
        </p>

        <RatingStars rating={item.rating_avg} count={item.rating_count} />

        <p className="pt-1 text-base font-bold text-foreground">
          {formatSAR(item.base_price)}
          <span className="ms-1 text-sm font-normal text-muted-foreground">
            {priceUnitLabel(item.price_unit)}
          </span>
        </p>
      </div>
    </article>
  );
}

export function ListingGrid({ items }: { items: ListingCardData[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <ListingCard key={item.id} item={item} />
      ))}
    </div>
  );
}
