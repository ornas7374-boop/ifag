/**
 * معرّف الرابط.
 *
 * العناوين عربية، ونقلها حرفيًا إلى الرابط ينتج مسارًا مُرمَّزًا
 * بنسبة مئوية طوله أضعاف الأصل ولا يُقرأ ولا يُنسخ. فنولّد معرّفًا
 * قصيرًا مستقرًا بدل ذلك، ويبقى العنوان العربي في `title_ar` حيث
 * يُعرض للمستخدم.
 */
export function randomSlug(prefix: string): string {
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${suffix}`;
}
