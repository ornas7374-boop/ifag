"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Star, Trash2, UploadCloud } from "lucide-react";

import {
  attachListingImage,
  removeListingImage,
  setCoverImage,
} from "@/app/(host)/host/actions";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { LISTING_IMAGES_BUCKET } from "@/lib/storage";
import type { ListingImage } from "@/types/domain";

const MAX_IMAGES = 10;
const MAX_FILE_MB = 5;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * رفع صور الإعلان — مباشرة من المتصفح إلى Storage (انظر التعليق
 * على attachListingImage لسبب تجاوز الخادم)، ثم تسجيل الصف عبر
 * إجراء خادم صغير. الحذف بنفس الترتيب معكوسًا.
 */
export function ImageManager({
  target,
  targetId,
  images,
}: {
  target: "place" | "service";
  targetId: string;
  images: ListingImage[];
}) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [busyLabel, setBusyLabel] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const busy = busyLabel !== null;

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError(null);

    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      setError(`الحد الأقصى ${MAX_IMAGES} صور لهذا الإعلان.`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const supabase = createClient();
    const files = [...fileList].slice(0, remaining);
    let hasCover = images.some((i) => i.is_cover);

    for (const file of files) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("الصيغة غير مدعومة — JPG أو PNG أو WEBP فقط.");
        continue;
      }
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        setError(`"${file.name}" أكبر من ${MAX_FILE_MB} ميغابايت.`);
        continue;
      }

      setBusyLabel(`جارٍ رفع ${file.name}…`);
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${target}s/${targetId}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(LISTING_IMAGES_BUCKET)
        .upload(path, file, { upsert: false, contentType: file.type });

      if (uploadError) {
        setError(`تعذّر رفع "${file.name}".`);
        continue;
      }

      const result = await attachListingImage({
        target,
        targetId,
        storagePath: path,
        isCover: !hasCover,
      });

      if (!result.ok) {
        // نظّف الملف اليتيم حتى لا يبقى بلا صف يشير إليه
        await supabase.storage.from(LISTING_IMAGES_BUCKET).remove([path]);
        setError(result.error);
      } else {
        hasCover = true;
      }
    }

    setBusyLabel(null);
    if (inputRef.current) inputRef.current.value = "";
    router.refresh();
  }

  async function handleDelete(image: ListingImage) {
    setError(null);
    setBusyLabel("جارٍ الحذف…");

    const supabase = createClient();
    const { error: removeError } = await supabase.storage
      .from(LISTING_IMAGES_BUCKET)
      .remove([image.storage_path]);

    if (removeError) {
      setError("تعذّر حذف الصورة.");
      setBusyLabel(null);
      return;
    }

    const result = await removeListingImage(image.id, target, targetId);
    if (!result.ok) setError(result.error);
    setBusyLabel(null);
    router.refresh();
  }

  async function handleSetCover(image: ListingImage) {
    setError(null);
    setBusyLabel("جارٍ التحديث…");
    const result = await setCoverImage(image.id, target, targetId);
    if (!result.ok) setError(result.error);
    setBusyLabel(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {images.length === 0 ? (
        <p className="rounded-md bg-warning/10 p-3 text-sm text-warning">
          لا صور بعد. أضف صورة واحدة على الأقل — الإعلانات بلا صور يتجاهلها
          العملاء.
        </p>
      ) : null}

      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="overflow-hidden rounded-lg border border-border"
            >
              <div className="relative aspect-square bg-secondary">
                <Image
                  src={img.url}
                  alt=""
                  fill
                  sizes="200px"
                  className="object-cover"
                />
                {img.is_cover ? (
                  <span className="absolute right-2 top-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                    الغلاف
                  </span>
                ) : null}
              </div>
              <div className="flex items-center gap-1 p-1.5">
                {!img.is_cover ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={busy}
                    onClick={() => handleSetCover(img)}
                    className="flex-1 text-xs"
                  >
                    <Star className="size-3.5" aria-hidden />
                    غلاف
                  </Button>
                ) : (
                  <span className="flex-1" />
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={busy}
                  onClick={() => handleDelete(img)}
                  className="size-8 text-destructive hover:text-destructive"
                  aria-label="حذف الصورة"
                >
                  <Trash2 className="size-3.5" aria-hidden />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {error ? (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Button
          type="button"
          variant="outline"
          disabled={busy || images.length >= MAX_IMAGES}
          onClick={() => inputRef.current?.click()}
        >
          <UploadCloud className="size-4" aria-hidden />
          {busyLabel ?? "رفع صور"}
        </Button>
        <p className="mt-2 text-xs text-muted-foreground">
          حتى {MAX_IMAGES} صور، بحد أقصى {MAX_FILE_MB} ميغابايت لكل صورة — JPG
          أو PNG أو WEBP.
        </p>
      </div>
    </div>
  );
}
