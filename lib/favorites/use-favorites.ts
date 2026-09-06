"use client";

import { useCallback, useSyncExternalStore } from "react";

import {
  favoriteKey,
  favoritesStore,
  type FavoriteKind,
} from "@/lib/favorites/favorites-store";

export function useFavorites() {
  const keys = useSyncExternalStore(
    favoritesStore.subscribe,
    favoritesStore.getSnapshot,
    favoritesStore.getServerSnapshot,
  );

  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const isFavorite = useCallback(
    (kind: FavoriteKind, id: string) => keys.includes(favoriteKey(kind, id)),
    [keys],
  );

  const toggle = useCallback(
    (kind: FavoriteKind, id: string) =>
      favoritesStore.toggle(favoriteKey(kind, id)),
    [],
  );

  return { keys, isFavorite, toggle, isHydrated, count: keys.length };
}
