"use client";

import { Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useFavorites } from "@/lib/favorites/use-favorites";
import { ar } from "@/content/ar";
import { cn } from "@/lib/utils";
import type { FavoriteKind } from "@/lib/favorites/favorites-store";

export function FavoriteButton({
  kind,
  id,
  variant = "floating",
  className,
}: {
  kind: FavoriteKind;
  id: string;
  variant?: "floating" | "button";
  className?: string;
}) {
  const { isFavorite, toggle, isHydrated } = useFavorites();
  // قبل الترطيب نعرض الحالة غير المفضّلة: لقطة الخادم فارغة دائمًا
  const active = isHydrated && isFavorite(kind, id);
  const label = active ? ar.common.removeFromFavorites : ar.common.addToFavorites;

  if (variant === "button") {
    return (
      <Button
        variant="outline"
        className={cn("w-full", className)}
        onClick={() => toggle(kind, id)}
        aria-pressed={active}
      >
        <Heart className={cn(active && "fill-destructive text-destructive")} aria-hidden />
        {label}
      </Button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggle(kind, id)}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "grid size-9 cursor-pointer place-items-center rounded-full bg-card/90 text-foreground backdrop-blur transition-colors hover:text-destructive",
        className,
      )}
    >
      <Heart
        className={cn("size-4", active && "fill-destructive text-destructive")}
        aria-hidden
      />
    </button>
  );
}
