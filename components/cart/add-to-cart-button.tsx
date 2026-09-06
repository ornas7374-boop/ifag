"use client";

import * as React from "react";
import { Check, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/cart/quantity-stepper";
import { useCart, type CartItem } from "@/lib/cart/cart-context";
import { ar } from "@/content/ar";

export function AddToCartButton({ item }: { item: Omit<CartItem, "quantity"> }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = React.useState(item.minQuantity || 1);
  const [added, setAdded] = React.useState(false);

  function handleAdd() {
    addItem(item, quantity);
    setAdded(true);
    // تأكيد بصري قصير بدل إشعار منبثق يقطع التدفق
    window.setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">{item.unitLabel}</span>
        <QuantityStepper
          value={quantity}
          onChange={(next) =>
            setQuantity(Math.max(item.minQuantity || 1, next))
          }
          max={item.maxQuantity}
          label={item.unitLabel}
        />
      </div>

      <Button size="lg" className="w-full" onClick={handleAdd}>
        {added ? <Check aria-hidden /> : <ShoppingCart aria-hidden />}
        {added ? "أُضيفت إلى السلة" : ar.common.addToCart}
      </Button>
    </div>
  );
}
