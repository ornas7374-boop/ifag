/**
 * المفضلة كمخزن خارجي — نفس نمط السلة ولنفس السبب:
 * القراءة من localStorage داخل effect تُنتج وميضًا وعرضًا متتاليًا.
 *
 * المرحلة القادمة: يستبدل هذا الملف بجدول favorites في قاعدة البيانات
 * (نمط القوس الحصري)، وتبقى واجهة useFavorites كما هي.
 */
const STORAGE_KEY = "ifag.favorites.v1";

/** نميّز النوع في المفتاح لأن الأماكن والخدمات جدولان منفصلان. */
export type FavoriteKind = "place" | "service";
export type FavoriteKey = `${FavoriteKind}:${string}`;

export function favoriteKey(kind: FavoriteKind, id: string): FavoriteKey {
  return `${kind}:${id}`;
}

let cache: FavoriteKey[] = [];
let cachedRaw: string | null = null;
const listeners = new Set<() => void>();
const EMPTY: FavoriteKey[] = [];

function read(): FavoriteKey[] {
  if (typeof window === "undefined") return EMPTY;

  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return cache;
  }

  // مرجع ثابت ما لم تتغيّر البيانات، وإلا دخل React في حلقة عرض
  if (raw === cachedRaw) return cache;
  cachedRaw = raw;

  if (!raw) {
    cache = EMPTY;
    return cache;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    cache = Array.isArray(parsed)
      ? parsed.filter((v): v is FavoriteKey => typeof v === "string")
      : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache;
}

function write(next: FavoriteKey[]) {
  cache = next;
  try {
    cachedRaw = JSON.stringify(next);
    window.localStorage.setItem(STORAGE_KEY, cachedRaw);
  } catch {
    cachedRaw = null;
  }
  for (const l of listeners) l();
}

export const favoritesStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        cachedRaw = null;
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
  getServerSnapshot: () => EMPTY,

  toggle(key: FavoriteKey) {
    const current = read();
    write(
      current.includes(key)
        ? current.filter((k) => k !== key)
        : [...current, key],
    );
  },
};
