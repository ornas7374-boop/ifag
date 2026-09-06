import type { DeliveryFeeStrategy, PricingMode } from "@/types/domain";
import type { Halalas } from "@/lib/money";

export interface CartItem {
  serviceId: string;
  slug: string;
  title_ar: string;
  imageUrl: string;
  hostId: string;
  unitPrice: Halalas;
  pricingMode: PricingMode;
  unitLabel: string;
  quantity: number;
  minQuantity: number;
  maxQuantity: number | null;
  requiresDelivery: boolean;
  deliveryStrategy: DeliveryFeeStrategy;
  deliveryFee: Halalas;
  freeDeliveryOver: Halalas | null;
}

const STORAGE_KEY = "ifag.cart.v1";

/**
 * مخزن السلة خارج React.
 *
 * لماذا مخزن خارجي بدل useState + useEffect؟
 * لأن localStorage نظام خارجي، وقراءته داخل useEffect ثم استدعاء
 * setState تُنتج عرضًا متتاليًا (cascading render) — وهو ما يمنعه
 * قواعد React، ويسبب وميض السلة الفارغة قبل ظهور محتواها.
 *
 * useSyncExternalStore هو الأداة المخصصة لهذا: له لقطة منفصلة للخادم
 * فلا ينكسر الترطيب، ويشترك في التحديثات بدل انتظارها.
 *
 * فائدة إضافية مجانية: الاشتراك في حدث storage يزامن السلة بين
 * تبويبات المتصفح المفتوحة.
 */

let cache: CartItem[] = [];
let cachedRaw: string | null = null;

const listeners = new Set<() => void>();
const EMPTY: CartItem[] = [];

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.serviceId === "string" &&
    typeof v.quantity === "number" &&
    typeof v.unitPrice === "number"
  );
}

function read(): CartItem[] {
  if (typeof window === "undefined") return EMPTY;

  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // تخزين معطّل (تصفح خاص أو منع الكوكيز) — سلة في الذاكرة فقط
    return cache;
  }

  // getSnapshot يجب أن يُرجع نفس المرجع ما لم تتغيّر البيانات فعلًا،
  // وإلا دخل React في حلقة إعادة عرض لا تنتهي.
  if (raw === cachedRaw) return cache;

  cachedRaw = raw;
  if (!raw) {
    cache = EMPTY;
    return cache;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    cache = Array.isArray(parsed) ? parsed.filter(isCartItem) : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache;
}

function write(items: CartItem[]) {
  cache = items;
  try {
    cachedRaw = JSON.stringify(items);
    window.localStorage.setItem(STORAGE_KEY, cachedRaw);
  } catch {
    // امتلاء التخزين أو منعه — نبقي التغيير في الذاكرة بدل فقدانه
    cachedRaw = null;
  }
  for (const listener of listeners) listener();
}

export const cartStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    // حدث storage يقع في التبويبات الأخرى فقط، فيزامنها معنا
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        cachedRaw = null; // إجبار إعادة القراءة
        listener();
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  },

  getSnapshot: read,

  /** على الخادم السلة فارغة دائمًا — لا وجود لـ localStorage هناك. */
  getServerSnapshot: () => EMPTY,

  addItem(item: Omit<CartItem, "quantity">, quantity: number) {
    const current = read();
    const existing = current.find((i) => i.serviceId === item.serviceId);

    if (!existing) {
      write([...current, { ...item, quantity }]);
      return;
    }

    // الخدمة موجودة: نزيد الكمية بدل تكرار السطر
    const next = existing.quantity + quantity;
    const capped =
      existing.maxQuantity === null
        ? next
        : Math.min(next, existing.maxQuantity);
    write(
      current.map((i) =>
        i.serviceId === item.serviceId ? { ...i, quantity: capped } : i,
      ),
    );
  },

  removeItem(serviceId: string) {
    write(read().filter((i) => i.serviceId !== serviceId));
  },

  setQuantity(serviceId: string, quantity: number) {
    write(
      read().flatMap((item) => {
        if (item.serviceId !== serviceId) return [item];
        const min = item.minQuantity || 1;
        // النزول تحت الحد الأدنى يعني الحذف — أوضح من تعطيل الزر
        if (quantity < min) return [];
        const capped =
          item.maxQuantity === null
            ? quantity
            : Math.min(quantity, item.maxQuantity);
        return [{ ...item, quantity: capped }];
      }),
    );
  },

  clear() {
    write([]);
  },
};
