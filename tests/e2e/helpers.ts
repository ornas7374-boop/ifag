import { expect, type Page } from "@playwright/test";

/** نقاط الاختبار الأساسية (CLAUDE.md §2). */
export const VIEWPORTS = [
  { name: "375", width: 375, height: 812 },
  { name: "768", width: 768, height: 1024 },
  { name: "1440", width: 1440, height: 900 },
] as const;

export type ConsoleIssue = { type: string; text: string };

/** يلتقط كل errors/warnings وأخطاء الصفحة وطلبات الشبكة الفاشلة. */
export function watchConsole(page: Page) {
  const issues: ConsoleIssue[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error" || msg.type() === "warning") {
      issues.push({ type: msg.type(), text: msg.text() });
    }
  });
  page.on("pageerror", (err) => issues.push({ type: "pageerror", text: err.message }));
  page.on("requestfailed", (req) =>
    issues.push({ type: "requestfailed", text: `${req.url()} — ${req.failure()?.errorText}` }),
  );
  return issues;
}

/** صفر horizontal scroll: scrollWidth <= clientWidth. */
export async function expectNoHorizontalScroll(page: Page) {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth, `scrollWidth ${scrollWidth} > clientWidth ${clientWidth}`).toBeLessThanOrEqual(
    clientWidth,
  );
}

/** ينتظر تحميل الخطوط حتى لا تُلتقط الصور بخط بديل. */
export async function waitForFonts(page: Page) {
  await page.evaluate(() => document.fonts.ready);
}

/** العناصر التفاعلية الظاهرة (بدون رابط التخطي المخفي حتى التركيز). */
export const INTERACTIVE = "a[href], button, input, textarea, select, [tabindex]:not([tabindex='-1'])";
