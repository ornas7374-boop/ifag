import { SUPABASE_URL } from "@/lib/supabase/env";

/**
 * حاوية صور الإعلانات (أماكن وخدمات) — عامة القراءة، والكتابة
 * محصورة بصاحب الإعلان عبر سياسات storage.objects.
 * انظر supabase/migrations/0017_listing_images_storage.sql
 */
export const LISTING_IMAGES_BUCKET = "listings";

/**
 * مسار الصف في listing_images.storage_path نسبي داخل الحاوية
 * (مثال: places/<id>/<uuid>.jpg) لا رابطًا كاملًا — التحويل هنا فقط،
 * حتى يبقى تغيير اسم الحاوية أو النطاق تعديلًا في مكان واحد.
 */
export function listingImagePublicUrl(path: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${LISTING_IMAGES_BUCKET}/${path}`;
}
