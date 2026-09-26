import Link from "next/link";
import Image from "next/image";
import { Pencil } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RatingStars } from "@/components/domain/rating-stars";
import { formatSAR } from "@/lib/format";
import { priceUnitLabel } from "@/lib/adapters";
import type { ListingStatus, PricingMode, RateUnit } from "@/types/domain";
import type { Halalas } from "@/lib/money";

/** مُصدَّرة لاستخدامها أيضًا في شاشات تعديل الإعلان (صور المكان/الخدمة). */
export const LISTING_STATUS_LABEL: Record<
  ListingStatus,
  { label: string; variant: "success" | "warning" | "secondary" | "destructive" }
> = {
  draft: { label: "مسودة", variant: "secondary" },
  pending: { label: "قيد المراجعة", variant: "warning" },
  published: { label: "منشور", variant: "success" },
  rejected: { label: "مرفوض", variant: "destructive" },
  suspended: { label: "معلّق", variant: "destructive" },
};

/** صف إدارة موحّد للأماكن والخدمات في لوحة المزوّد. */
export function ListingManageRow({
  title,
  imageUrl,
  city,
  status,
  price,
  priceUnit,
  rating,
  ratingCount,
  viewHref,
  editHref,
}: {
  title: string;
  imageUrl: string;
  city: string;
  status: ListingStatus;
  price: Halalas;
  priceUnit: PricingMode | RateUnit;
  rating: number;
  ratingCount: number;
  viewHref: string;
  editHref: string;
}) {
  const badge = LISTING_STATUS_LABEL[status];

  return (
    <Card>
      <CardContent className="flex flex-wrap items-center gap-4 p-4">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-muted">
          <Image src={imageUrl} alt={title} fill sizes="64px" className="object-cover" />
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <Link href={viewHref} className="font-semibold hover:underline">
            {title}
          </Link>
          <p className="text-sm text-muted-foreground">
            {city} · {formatSAR(price)} {priceUnitLabel(priceUnit)}
          </p>
          {ratingCount > 0 ? <RatingStars rating={rating} count={ratingCount} /> : null}
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={badge.variant}>{badge.label}</Badge>
          <Button size="sm" variant="outline" asChild>
            <Link href={editHref}>
              <Pencil aria-hidden />
              {"تعديل"}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
