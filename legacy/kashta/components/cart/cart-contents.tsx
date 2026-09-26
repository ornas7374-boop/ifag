"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuantityStepper } from "@/components/cart/quantity-stepper";
import { PriceBreakdown } from "@/components/domain/price-breakdown";
import { EmptyState } from "@/components/states/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/lib/cart/cart-context";
import { ar } from "@/content/ar";
import { formatSAR } from "@/lib/format";
import { priceUnitLabel } from "@/lib/adapters";
import { lineAmount } from "@/lib/pricing";

export function CartContents() {
  const { items, setQuantity, removeItem, quote, isHydrated, clear } = useCart();

  // قبل قراءة التخزين المحلي نعرض هيكلًا بنفس الأبعاد، لا سلة فارغة —
  // وإلا ومض "سلتك فارغة" لمن سلته ممتلئة.
  if (!isHydrated) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title={ar.order.emptyCart}
        hint={ar.order.emptyCartHint}
        action={
          <Button asChild>
            <Link href="/search?kind=service">{ar.nav.services}</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <ul className="space-y-4">
        {items.map((item) => {
          const lineTotal = lineAmount(item.unitPrice, item.pricingMode, {
            hours: 4,
            days: 1,
            nights: 1,
            persons: 1,
            quantity: item.quantity,
            distanceKm: 0,
          });

          return (
            <li key={item.serviceId}>
              <Card>
                <CardContent className="flex gap-4 p-4">
                  <div className="relative size-24 shrink-0 overflow-hidden rounded-md bg-muted">
                    <Image
                      src={item.imageUrl}
                      alt={item.title_ar}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        href={`/services/${item.slug}`}
                        className="font-medium text-foreground hover:underline"
                      >
                        {item.title_ar}
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeItem(item.serviceId)}
                        aria-label={`حذف ${item.title_ar}`}
                      >
                        <Trash2 aria-hidden />
                      </Button>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {formatSAR(item.unitPrice)} {priceUnitLabel(item.pricingMode)}
                      {item.requiresDelivery ? " · يشمل التوصيل" : ""}
                    </p>

                    <div className="mt-auto flex items-center justify-between gap-3">
                      <QuantityStepper
                        value={item.quantity}
                        onChange={(next) => setQuantity(item.serviceId, next)}
                        max={item.maxQuantity}
                        label={item.unitLabel}
                      />
                      <span className="font-bold text-foreground">
                        {formatSAR(lineTotal)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ul>

      <aside className="lg:sticky lg:top-24 lg:h-fit">
        <Card>
          <CardHeader>
            <CardTitle>{ar.order.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <PriceBreakdown quote={quote} />

            <Button size="lg" className="w-full" asChild>
              <Link href="/checkout">{ar.order.checkout}</Link>
            </Button>

            <Button variant="ghost" className="w-full" onClick={clear}>
              إفراغ السلة
            </Button>

            <p className="text-xs text-muted-foreground">
              رسوم التوصيل تقديرية وتُحسب نهائيًا بعد تحديد موقعك عند إتمام الطلب.
            </p>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
