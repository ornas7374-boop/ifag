import { expect, test, type Page } from "@playwright/test";

import {
  VIEWPORTS,
  checkHover,
  checkKeyboardFocus,
  checkTouchTargets,
  expectNoHorizontalScroll,
  waitForFonts,
  watchConsole,
} from "./helpers";

const SHOTS = "screenshots/phase-4";
const input = (page: Page) => page.locator("#chat-input");
const lastAssistant = (page: Page) => page.getByTestId("assistant-message").last();
const scroller = (page: Page) => page.locator("main#main");

async function ask(page: Page, text: string) {
  await input(page).fill(text);
  await input(page).press("Enter");
}
async function waitStatus(page: Page, status: string, timeout = 20_000) {
  await expect(lastAssistant(page)).toHaveAttribute("data-status", status, { timeout });
}
const distanceFromBottom = (page: Page) =>
  scroller(page).evaluate((el) => el.scrollHeight - el.scrollTop - el.clientHeight);

// ── 1) الرد الطويل جدًا ──
test("very long answer (2000+ words) with 4 sources renders without breaking layout", async ({ page }) => {
  await page.goto("/");
  await ask(page, "سؤال تجريبي #long");
  await waitStatus(page, "done");
  const words = await lastAssistant(page)
    .locator("[data-part]")
    .evaluateAll((els) => els.map((e) => e.textContent ?? "").join(" ").split(/\s+/).filter(Boolean).length);
  expect(words).toBeGreaterThanOrEqual(2000);
  await expect(page.getByTestId("source-card")).toHaveCount(4);
  await expectNoHorizontalScroll(page);
  console.log(`[long] ${words} words, 4 sources`);
});

// ── 2) رسائل وكلمات وروابط طويلة ──
for (const vp of VIEWPORTS) {
  test(`@${vp.name}: long user message, unbroken word and URL stay inside the layout`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto("/");
    const long =
      "سؤال طويل جدًا لاختبار الالتفاف. ".repeat(12) +
      "\nكلمة_طويلة_بلا_مسافات_" + "ـ".repeat(60) +
      "\nhttps://example.com/" + "a-very-long-path-segment-without-any-spaces/".repeat(8);
    await ask(page, long);
    await waitStatus(page, "done");
    await expectNoHorizontalScroll(page);
    const overflow = await scroller(page).evaluate((el) => el.scrollWidth - el.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    const bubble = await page.getByTestId("user-message").boundingBox();
    expect(bubble!.x).toBeGreaterThanOrEqual(0);
    expect(bubble!.x + bubble!.width).toBeLessThanOrEqual(vp.width);
  });
}

// ── 3) التمرير الذكي ──
test("auto-scroll follows the stream, pauses when the user scrolls up, resumes via the button", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await ask(page, "سؤال تجريبي #long");
  await expect(page.locator("h3").nth(2)).toBeVisible({ timeout: 10_000 }); // تجاوز الرد ارتفاع الشاشة
  expect(await distanceFromBottom(page)).toBeLessThan(80);
  await expect(page.getByTestId("scroll-to-bottom")).toHaveCount(0);

  // المستخدم يصعد ليقرأ
  await scroller(page).hover();
  await page.mouse.wheel(0, -1500);
  await expect(page.getByTestId("scroll-to-bottom")).toBeVisible();
  const top = await scroller(page).evaluate((el) => el.scrollTop);
  await page.waitForTimeout(600); // البث مستمر
  expect(await scroller(page).evaluate((el) => el.scrollTop)).toBe(top); // لم يُسحب للأسفل

  await page.getByTestId("scroll-to-bottom").click();
  await expect.poll(() => distanceFromBottom(page)).toBeLessThan(80);
  await expect(page.getByTestId("scroll-to-bottom")).toHaveCount(0);
  await waitStatus(page, "done");
  expect(await distanceFromBottom(page)).toBeLessThan(80); // تابع حتى النهاية
});

// ── 4) مؤشر الكتابة ──
test("typing indicator shows before the first chunk, then disappears", async ({ page }) => {
  await page.goto("/");
  await ask(page, "ما الفرق بين الذكاء الاصطناعي والتعلّم الآلي؟");
  const typing = page.getByTestId("waiting");
  await expect(typing).toBeVisible();
  await expect(typing).toHaveAttribute("role", "status");
  await expect(typing.locator("span[aria-hidden] > span")).toHaveCount(3);
  await expect(page.locator("[data-part]").first()).toBeVisible();
  await expect(typing).toHaveCount(0);
});

// ── 5) أخطاء مختلفة برسائل مختلفة ──
const ERRORS = [
  { trigger: "#offline", kind: "network", title: "لا يوجد اتصال بالإنترنت" },
  { trigger: "#timeout", kind: "timeout", title: "استغرق البحث وقتًا طويلًا" },
  { trigger: "#error", kind: "server", title: "تعذّر الحصول على الرد" },
];
for (const e of ERRORS) {
  test(`error ${e.kind}: specific message and retry`, async ({ page }) => {
    await page.goto("/");
    await ask(page, `سؤال تجريبي ${e.trigger}`);
    const state = page.getByTestId("error-state");
    await expect(state).toBeVisible({ timeout: 10_000 });
    await expect(state).toHaveAttribute("data-kind", e.kind);
    await expect(state).toContainText(e.title);
    await expect(state.getByRole("button", { name: "إعادة المحاولة" })).toBeEnabled();
  });
}

test("real offline browser shows the network error immediately", async ({ page, context }) => {
  await page.goto("/");
  await context.setOffline(true);
  await ask(page, "سؤال عادي أثناء انقطاع الاتصال");
  await expect(page.getByTestId("error-state")).toHaveAttribute("data-kind", "network", { timeout: 3_000 });
  await context.setOffline(false);
  await page.getByRole("button", { name: "إعادة المحاولة" }).click();
  await waitStatus(page, "done");
});

// ── 6) النسخ مع المصادر ──
test("copy puts the answer and its source links on the clipboard", async ({ page }) => {
  await page.goto("/");
  await ask(page, "ما الفرق بين الذكاء الاصطناعي والتعلّم الآلي؟");
  await expect(page.getByTestId("copy")).toHaveCount(0); // لا نسخ أثناء البث
  await waitStatus(page, "done");
  await page.getByTestId("copy").click();
  await expect(page.getByTestId("copy")).toContainText("تم النسخ");
  const text = await page.evaluate(() => navigator.clipboard.readText());
  expect(text).toContain("[إجابة تجريبية]");
  expect(text).toContain("> [اقتباس تجريبي");
  expect(text).toContain("المصادر:");
  expect(text).toContain("1. [عنوان الصفحة الأولى] — [اسم الموقع]");
  expect(text).toContain("https://example.com/source-1");
  expect(text).toContain("https://example.com/source-2");
  await expect(page.getByTestId("copy")).toContainText("نسخ الإجابة", { timeout: 3_000 });
});

// ── 7) Skeleton ──
test("skeletons render with an accessible loading label", async ({ page }) => {
  await page.goto("/dev/states");
  await expect(page.getByTestId("chat-skeleton")).toBeVisible();
  await expect(page.getByTestId("chat-skeleton")).toHaveAttribute("role", "status");
  await expect(page.getByTestId("sidebar-skeleton")).toContainText("جارٍ تحميل المحادثات…");
});

// ── 8) /dev/states + screenshots لكل عرض ──
for (const vp of VIEWPORTS) {
  test(`@${vp.name}: /dev/states and live states — screenshots, clean console, no h-scroll`, async ({ page }) => {
    test.setTimeout(90_000);
    const issues = watchConsole(page);
    await page.setViewportSize({ width: vp.width, height: vp.height });

    await page.goto("/dev/states", { waitUntil: "networkidle" });
    await waitForFonts(page);
    await expectNoHorizontalScroll(page);
    await page.screenshot({ path: `${SHOTS}/dev-states-${vp.name}.png`, fullPage: true });

    await page.goto("/", { waitUntil: "networkidle" });
    await ask(page, "سؤال تجريبي #long");
    await expect(page.getByTestId("waiting")).toBeVisible();
    await page.screenshot({ path: `${SHOTS}/typing-${vp.name}.png` });
    await expect(page.locator("h3").nth(2)).toBeVisible({ timeout: 10_000 });
    await scroller(page).hover();
    await page.mouse.wheel(0, -1200);
    await expect(page.getByTestId("scroll-to-bottom")).toBeVisible();
    await page.waitForTimeout(250);
    await expectNoHorizontalScroll(page);
    await page.screenshot({ path: `${SHOTS}/scroll-button-${vp.name}.png` });
    await waitStatus(page, "done");
    await page.getByTestId("scroll-to-bottom").click();
    await expect.poll(() => distanceFromBottom(page)).toBeLessThan(80);
    await page.getByTestId("copy").click();
    await page.waitForTimeout(250);
    await page.screenshot({ path: `${SHOTS}/long-answer-copied-${vp.name}.png` });

    expect(issues, JSON.stringify(issues, null, 2)).toEqual([]);
  });
}

// ── 9) الوصول للعناصر الجديدة ──
test("a11y: scroll button, copy and retry are keyboard-reachable, hoverable, 44px", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await ask(page, "سؤال تجريبي #long");
  await waitStatus(page, "done");
  await scroller(page).hover();
  await page.mouse.wheel(0, -1500);
  await expect(page.getByTestId("scroll-to-bottom")).toBeVisible();
  await checkHover(page); // hover لا يحرّك التمرير، فالزر يبقى ظاهرًا

  // الزر يسبق مربع الكتابة مباشرة: Shift+Tab من الحقل يصل إليه، وعليه إطار التركيز.
  await scroller(page).hover();
  await page.mouse.wheel(0, -1500); // hover السابق مرّر لآخر المصادر
  await expect(page.getByTestId("scroll-to-bottom")).toBeVisible();
  await input(page).focus();
  await page.keyboard.press("Shift+Tab");
  await page.waitForTimeout(200);
  const button = page.getByTestId("scroll-to-bottom");
  await expect(button).toBeFocused();
  expect(await button.evaluate((e) => getComputedStyle(e).outlineColor)).toBe("rgb(30, 58, 95)");
  await page.keyboard.press("Enter");
  await expect.poll(() => distanceFromBottom(page)).toBeLessThan(80);

  // باقي العناصر (النسخ، روابط المصادر…) بلوحة المفاتيح
  await page.locator("body").click({ position: { x: 1, y: 1 } });
  const n = await checkKeyboardFocus(page);
  await page.setViewportSize({ width: 375, height: 812 });
  await checkTouchTargets(page);
  console.log(`[a11y] long answer: ${n} focusable controls; scroll button reachable via keyboard`);
});
