"use client";

import { useCallback, useSyncExternalStore } from "react";

/** يطابق media query في المتصفح (false على الخادم). */
export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

const FLAG_EVENT = "sanad:flag-change";

/**
 * قيمة منطقية محفوظة في localStorage لكل زائر (راحة شخصية فقط، مثل طي القائمة).
 * كل وصول داخل try/catch: التخزين قد يكون معطّلًا فتعود القيمة الافتراضية.
 */
export function usePersistentFlag(key: string, fallback = false) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const handler = (e: Event) => {
        if (!(e instanceof CustomEvent) || e.detail === key) onChange();
      };
      window.addEventListener(FLAG_EVENT, handler);
      window.addEventListener("storage", handler);
      return () => {
        window.removeEventListener(FLAG_EVENT, handler);
        window.removeEventListener("storage", handler);
      };
    },
    [key],
  );

  const value = useSyncExternalStore(
    subscribe,
    () => {
      try {
        const raw = localStorage.getItem(key);
        return raw === null ? fallback : raw === "1";
      } catch {
        return fallback;
      }
    },
    () => fallback,
  );

  const setValue = useCallback(
    (next: boolean) => {
      try {
        localStorage.setItem(key, next ? "1" : "0");
      } catch {
        /* التخزين غير متاح */
      }
      window.dispatchEvent(new CustomEvent(FLAG_EVENT, { detail: key }));
    },
    [key],
  );

  return [value, setValue] as const;
}
