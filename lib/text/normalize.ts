/**
 * تطبيع نص عربي للبحث فقط (لا للعرض): إزالة التشكيل والتطويل، وتوحيد
 * الألف والتاء المربوطة والألف المقصورة، وتصغير اللاتيني.
 */
export function normalizeForSearch(text: string) {
  return text
    .normalize("NFKC")
    .replace(/[ً-ٰٟـ]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .toLowerCase()
    .trim();
}
