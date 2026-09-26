"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart/cart-context";
import { ar } from "@/content/ar";
import { formatNumber } from "@/lib/format";

export function CartButton() {
  const { itemCount, isHydrated } = useCart();

  return (
    <Button variant="ghost" size="icon" asChild className="relative">
      <Link href="/cart" aria-label={`${ar.nav.cart}${itemCount > 0 ? ` (${itemCount})` : ""}`}>
        <ShoppingCart aria-hidden />
        {/* لا نعرض العدد قبل الترطيب: القيمة على الخادم صفر دائمًا،
            وعرضها ثم تصحيحها يُحدث وميضًا وتحذير hydration */}
        {isHydrated && itemCount > 0 ? (
          <span className="absolute -top-0.5 end-0 grid min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-bold text-accent-foreground">
            {formatNumber(itemCount)}
          </span>
        ) : null}
      </Link>
    </Button>
  );
}
