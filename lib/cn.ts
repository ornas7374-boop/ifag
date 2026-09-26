/** يدمج أسماء الأصناف ويتجاهل القيم الفارغة. */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
