import type { BrandConfig, ColorScheme, ColorToken } from "@/types/brand";

/** ColorToken (camelCase) -> اسم متغيّر CSS (kebab-case) */
const CSS_VAR_NAME: Record<ColorToken, string> = {
  background: "background",
  foreground: "foreground",
  card: "card",
  cardForeground: "card-foreground",
  popover: "popover",
  popoverForeground: "popover-foreground",
  primary: "primary",
  primaryForeground: "primary-foreground",
  secondary: "secondary",
  secondaryForeground: "secondary-foreground",
  muted: "muted",
  mutedForeground: "muted-foreground",
  accent: "accent",
  accentForeground: "accent-foreground",
  destructive: "destructive",
  destructiveForeground: "destructive-foreground",
  success: "success",
  successForeground: "success-foreground",
  warning: "warning",
  warningForeground: "warning-foreground",
  border: "border",
  input: "input",
  ring: "ring",
};

function schemeToVars(scheme: ColorScheme, suffix: "light" | "dark") {
  const out: Record<string, string> = {};
  for (const [token, value] of Object.entries(scheme) as [ColorToken, string][]) {
    out[`--brand-${CSS_VAR_NAME[token]}-${suffix}`] = value;
  }
  return out;
}

/**
 * يحوّل إعدادات الهوية إلى متغيّرات CSS تُحقن على عنصر <html>.
 *
 * لماذا نحقن `-light` و `-dark` منفصلين بدل حقن اللون النهائي مباشرة؟
 * لأن الـ inline style على <html> أقوى من أي قاعدة CSS، فلو حقنّا
 * `--brand-primary` مباشرة لما استطاع الوضع الداكن تجاوزه أبدًا.
 * بهذا الفصل يبقى القرار في globals.css:
 *   :root { --brand-primary: var(--brand-primary-light) }
 *   .dark { --brand-primary: var(--brand-primary-dark) }
 */
export function brandToCssVars(brand: BrandConfig): Record<string, string> {
  return {
    ...schemeToVars(brand.colors.light, "light"),
    ...schemeToVars(brand.colors.dark, "dark"),
    "--brand-radius": brand.radius,
    "--brand-font-sans": brand.fontFamily,
  };
}
