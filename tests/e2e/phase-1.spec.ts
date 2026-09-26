import { expect, test } from "@playwright/test";

import { site } from "../../lib/site";
import {
  VIEWPORTS,
  checkHover,
  checkKeyboardFocus,
  checkTouchTargets,
  expectNoHorizontalScroll,
  waitForFonts,
  watchConsole,
} from "./helpers";

/**
 * PHASE 1 — اختبارات انحدار للصفحات الثابتة.
 * الرئيسية أصبحت شاشة المحادثة في PHASE 2 (تُختبر في phase-2.spec.ts).
 * صور PHASE 1 في screenshots/phase-1/ سجل تاريخي ولا يُعاد توليدها.
 */

for (const vp of VIEWPORTS) {
  test(`about @${vp.name}: clean console, no h-scroll, RTL, fixed texts`, async ({ page }) => {
    const issues = watchConsole(page);
    await page.setViewportSize({ width: vp.width, height: vp.height });
    const res = await page.goto("/about", { waitUntil: "networkidle" });
    expect(res?.status()).toBe(200);
    await waitForFonts(page);

    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.getByTestId("disclaimer").first()).toHaveText(site.disclaimer);
    await expect(page.getByTestId("independence")).toHaveText(site.independence);
    await expectNoHorizontalScroll(page);
    expect(issues, JSON.stringify(issues, null, 2)).toEqual([]);
  });
}

test("about: every link resolves", async ({ page, request }) => {
  await page.goto("/about");
  const links = await page.$$eval("a[href]", (as) =>
    as.map((a) => ({ href: a.getAttribute("href")!, target: a.getAttribute("target"), rel: a.getAttribute("rel") })),
  );
  for (const link of links) {
    if (link.href.startsWith("#")) {
      await expect(page.locator(link.href)).toHaveCount(1);
    } else if (link.href.startsWith("/")) {
      expect((await request.get(link.href)).status(), link.href).toBe(200);
    } else {
      expect(link.href).toBe(site.source.url);
      expect(link.target).toBe("_blank");
      expect(link.rel).toContain("noopener");
    }
  }
});

test("header CTA and logo lead to the chat home", async ({ page }) => {
  for (const vp of [VIEWPORTS[0], VIEWPORTS[2]]) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto("/about");
    await page.getByTestId("header-cta").click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByTestId("composer")).toBeVisible();
  }
});

test("about: keyboard focus, hover, touch targets", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/about");
  await checkKeyboardFocus(page);
  await checkHover(page);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/about");
  await checkKeyboardFocus(page);
  await checkTouchTargets(page);
});

test("404 page is Arabic and links home", async ({ page }) => {
  const res = await page.goto("/no-such-page");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("لم نجد هذه الصفحة");
  await expectNoHorizontalScroll(page);
  await page.getByRole("link", { name: "العودة إلى الرئيسية" }).click();
  await expect(page).toHaveURL(/\/$/);
});
