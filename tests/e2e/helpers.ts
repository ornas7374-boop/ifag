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

const PRIMARY_RGB = "rgb(30, 58, 95)";

/**
 * Tab عبر الصفحة: كل عنصر قابل للتركيز يُوصل إليه، وعليه إطار focus بلون الحبر.
 * استثناء: حقل الكتابة في المحادثة يُظهر التركيز على إطار الـ composer نفسه.
 * يرجع عدد العناصر التي وُصل إليها.
 */
export async function checkKeyboardFocus(page: Page) {
  // الظاهرة فقط (display:none لا تُركَّز)، والمفعّلة. العناصر الشفافة (opacity 0)
  // تُحسب لأنها تظهر عند التركيز. داخل dialog مفتوح: عناصره وحدها قابلة للتركيز.
  const expected = await page.evaluate((selector) => {
    const modal = [...document.querySelectorAll("dialog[open]")].at(-1);
    const scope = modal ?? document;
    return [...scope.querySelectorAll(selector)].filter(
      (e) => !(e as HTMLButtonElement).disabled && (e as HTMLElement).checkVisibility(),
    ).length;
  }, INTERACTIVE);
  const seen: string[] = [];
  for (let i = 0; i < expected + 3; i++) {
    await page.keyboard.press("Tab");
    await page.waitForTimeout(200); // transition-colors يشمل outline-color (150ms)
    const info = await page.evaluate((primary) => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) return null;
      if (el.dataset.focusSeen) return { key: el.dataset.focusSeen, dup: true, ok: true, why: "" };
      el.dataset.focusSeen = `${el.tagName}#${document.querySelectorAll("[data-focus-seen]").length}:${el.textContent?.trim() || el.getAttribute("aria-label") || ""}`;
      const r = el.getBoundingClientRect();
      if (r.width <= 1 || r.height <= 1) return { key: el.dataset.focusSeen, dup: false, ok: false, why: "invisible" };
      if (el.tagName === "TEXTAREA") {
        const box = el.closest("[data-testid=composer]") as HTMLElement | null;
        const color = box ? getComputedStyle(box).borderTopColor : "";
        return { key: el.dataset.focusSeen, dup: false, ok: color === primary, why: `composer border ${color}` };
      }
      const s = getComputedStyle(el);
      const ok = s.outlineStyle !== "none" && parseFloat(s.outlineWidth) >= 2 && s.outlineColor === primary;
      return { key: el.dataset.focusSeen, dup: false, ok, why: `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor}` };
    }, PRIMARY_RGB);
    if (!info || info.dup) continue;
    seen.push(info.key);
    expect(info.ok, `${info.key}: ${info.why}`).toBe(true);
  }
  expect(seen.length, `reached ${seen.length}/${expected}: ${seen.join(" | ")}`).toBe(expected);
  return seen.length;
}

/** كل عنصر تفاعلي ظاهر ومفعّل (عدا حقول الكتابة) يتغيّر شكله عند hover. */
export async function checkHover(page: Page) {
  const controls = page.locator("a[href], button");
  const n = await controls.count();
  const read = (el: Element) => {
    const s = getComputedStyle(el);
    return [s.color, s.backgroundColor, s.borderColor, s.textDecorationColor, s.opacity].join("|");
  };
  let checked = 0;
  for (let i = 0; i < n; i++) {
    const el = controls.nth(i);
    if (!(await el.isVisible()) || (await el.isDisabled())) continue;
    const blockedByModal = await el.evaluate((e) => {
      const modal = [...document.querySelectorAll("dialog[open]")].at(-1);
      return !!modal && !modal.contains(e);
    });
    if (blockedByModal) continue;
    if ((await el.getAttribute("href")) === "#main") continue; // رابط التخطي: مخفي حتى التركيز
    await page.mouse.move(0, 0);
    await page.waitForTimeout(200);
    const before = await el.evaluate(read);
    await el.hover();
    await page.waitForTimeout(250);
    const after = await el.evaluate(read);
    const label = (await el.textContent())?.trim() || (await el.getAttribute("aria-label"));
    expect(after, `no hover change: ${label}`).not.toBe(before);
    checked++;
  }
  return checked;
}

/** مساحة اللمس ≥ 44×44 لكل عنصر تفاعلي ظاهر. */
export async function checkTouchTargets(page: Page) {
  const controls = page.locator(INTERACTIVE);
  const n = await controls.count();
  for (let i = 0; i < n; i++) {
    const el = controls.nth(i);
    if (!(await el.isVisible())) continue;
    if (await el.evaluate((e) => { const m = [...document.querySelectorAll("dialog[open]")].at(-1); return !!m && !m.contains(e); })) continue;
    // رابط التخطي مخفي (sr-only) حتى يُركَّز عليه، فيُقاس في حالته الظاهرة
    if ((await el.getAttribute("href")) === "#main") await el.focus();
    const box = (await el.boundingBox())!;
    const label = (await el.textContent())?.trim() || (await el.getAttribute("aria-label"));
    expect(box.height, `height: ${label}`).toBeGreaterThanOrEqual(44);
    expect(box.width, `width: ${label}`).toBeGreaterThanOrEqual(44);
  }
}
