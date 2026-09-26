"use client";

import * as React from "react";

import { cartStore, type CartItem } from "@/lib/cart/cart-store";
import { halalas } from "@/lib/money";
import {
  buildQuote,
  DEFAULT_COMMISSION_RATE,
  deliveryFee,
  lineAmount,
  type PricingContext,
  type Quote,
} from "@/lib/pricing";

export type { CartItem };

/**
 * السلة كقراءة من مخزن خارجي.
 *
 * useSyncExternalStore يتكفّل بالترطيب: لقطة الخادم فارغة دائمًا،
 * ثم يعيد React العرض بمحتوى localStorage بعد الترطيب دون وميض
 * ودون setState داخل effect.
 */

/**
 * سياق تسعير افتراضي لعرض السلة.
 * الخدمات المسعّرة بالساعة/اليوم تُعرض هنا بتقدير قياسي؛ القيم
 * الفعلية تُحدَّد عند إتمام الطلب حين يختار العميل الوقت والموقع.
 */
const CART_PREVIEW_CONTEXT: Omit<PricingContext, "quantity"> = {
  hours: 4,
  days: 1,
  nights: 1,
  persons: 1,
  distanceKm: 15,
};

function itemAmount(item: CartItem) {
  return lineAmount(item.unitPrice, item.pricingMode, {
    ...CART_PREVIEW_CONTEXT,
    quantity: item.quantity,
  });
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (serviceId: string) => void;
  setQuantity: (serviceId: string, quantity: number) => void;
  clear: () => void;
  itemCount: number;
  quote: Quote;
  isHydrated: boolean;
}

const CartContext = React.createContext<CartState | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = React.useSyncExternalStore(
    cartStore.subscribe,
    cartStore.getSnapshot,
    cartStore.getServerSnapshot,
  );

  // بعد الترطيب فقط نثق بالعدد المعروض — قبله لقطة الخادم صفر.
  const isHydrated = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const quote = React.useMemo<Quote>(() => {
    const lines = items.map((item) => ({
      label:
        item.quantity > 1 ? `${item.title_ar} × ${item.quantity}` : item.title_ar,
      amount: itemAmount(item),
    }));

    const itemsSubtotal = halalas(lines.reduce((sum, l) => sum + l.amount, 0));

    /*
     * التوصيل يُحسب لكل مزوّد على حدة ثم يُجمع.
     * السبب: لكل مزوّد استراتيجيته وحدّه للتوصيل المجاني، فجمع كل
     * السلة ومقارنتها بحدّ مزوّد واحد يمنح توصيلًا مجانيًا لا يستحقه.
     */
    const byHost = new Map<string, CartItem[]>();
    for (const item of items) {
      if (!item.requiresDelivery) continue;
      byHost.set(item.hostId, [...(byHost.get(item.hostId) ?? []), item]);
    }

    let totalDelivery = 0;
    for (const hostItems of byHost.values()) {
      // مجموع طلب المزوّد كاملًا — هو ما يُقارن بحدّ التوصيل المجاني
      const hostSubtotal = halalas(
        hostItems.reduce((sum, item) => sum + itemAmount(item), 0),
      );

      /*
       * رحلة توصيل واحدة لكل مزوّد، لكن برسوم أعلى عنصر لا أول عنصر.
       *
       * الفرق ليس تجميليًا: لو كان لدى المزوّد خدمة بتوصيل مجاني وأخرى
       * برسوم مسافة، فاعتماد أول عنصر في السلة يُلغي الرسوم كليًا حسب
       * ترتيب الإضافة — أي أن المبلغ يتغيّر بتغيّر ترتيب النقر، وتخسر
       * المنصة رسومًا مستحقة.
       */
      let hostFee = 0;
      for (const item of hostItems) {
        hostFee = Math.max(
          hostFee,
          deliveryFee({
            strategy: item.deliveryStrategy,
            fee: item.deliveryFee,
            freeOver: item.freeDeliveryOver,
            distanceKm: CART_PREVIEW_CONTEXT.distanceKm,
            itemsSubtotal: hostSubtotal,
          }),
        );
      }
      totalDelivery += hostFee;
    }

    const total = halalas(itemsSubtotal + totalDelivery);
    const commission = halalas(Math.round(total * DEFAULT_COMMISSION_RATE));

    return {
      ...buildQuote({ lines, commissionRate: DEFAULT_COMMISSION_RATE }),
      deliveryFee: halalas(totalDelivery),
      total,
      commission,
      hostNet: halalas(total - commission),
    };
  }, [items]);

  const value = React.useMemo<CartState>(
    () => ({
      items,
      addItem: (item, quantity = item.minQuantity || 1) =>
        cartStore.addItem(item, quantity),
      removeItem: cartStore.removeItem,
      setQuantity: cartStore.setQuantity,
      clear: cartStore.clear,
      itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
      quote,
      isHydrated,
    }),
    [items, quote, isHydrated],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartState {
  const context = React.useContext(CartContext);
  if (!context) {
    throw new Error("useCart يجب أن يُستدعى داخل CartProvider");
  }
  return context;
}
