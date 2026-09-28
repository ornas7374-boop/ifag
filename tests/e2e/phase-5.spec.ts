import { expect, test, type Page } from "@playwright/test";

import { checkTouchTargets, waitForFonts, watchConsole } from "./helpers";

/**
 * PHASE 5 — تدقيق Responsive على 8 عروض.
 * كل حالة: صفر تمرير أفقي (للصفحة ولحاويات التمرير)، لا قص، مساحات لمس ≥ 44،
 * الـ composer ظاهر بالكامل، console نظيف، و screenshot.
 */
const SHOTS = "screenshots/phase-5";

const VIEWPORTS = [
  { name: "360", width: 360, height: 740, mobile: true },
  { name: "390", width: 390, height: 844, mobile: true },
  { name: "768", width: 768, height: 1024, mobile: true },
  { name: "1024", width: 1024, height: 768, mobile: false },
  { name: "1280", width: 1280, height: 800, mobile: false },
  { name: "1440", width: 1440, height: 900, mobile: false },
  { name: "1920", width: 1920, height: 1080, mobile: false },
  { name: "landscape", width: 844, height: 390, mobile: true },
] as const;

const input = (page: Page) => page.locator("#chat-input");
const lastAssistant = (page: Page) => page.getByTestId("assistant-message").last();

async function ask(page: Page, text: string) {
  await input(page).fill(text);
  await input(page).press("Enter");
}
async function waitStatus(page: Page, status: string) {
  await expect(lastAssistant(page)).toHaveAttribute("data-status", status, { timeout: 20_000 });
}
async function newChat(page: Page) {
  const header = page.getByTestId("new-chat").filter({ visible: true }).first();
  await header.click();
  await expect(page.getByTestId("suggestion").first()).toBeVisible();
}

/** الفحوص المشتركة لكل حالة. */
async function audit(page: Page, label: string, { composer = true }: { composer?: boolean } = {}) {
  await page.waitForTimeout(300);
  const report = await page.evaluate(() => {
    const doc = document.documentElement;
    const overflowing = [...document.querySelectorAll<HTMLElement>("main, dialog[open], dialog[open] nav, nav")]
      .filter((el) => el.checkVisibility() && el.scrollWidth > el.clientWidth + 1)
      .map((el) => `${el.tagName}#${el.id} ${el.scrollWidth}>${el.clientWidth}`);
    const main = document.querySelector("main");
    const mainBox = main?.getBoundingClientRect();
    const escaping = mainBox
      ? [...document.querySelectorAll<HTMLElement>("main [data-testid=source-card], main [data-testid=user-message], main pre")]
          .filter((el) => {
            const r = el.getBoundingClientRect();
            return r.left < mainBox.left - 1 || r.right > mainBox.right + 1;
          })
          .map((el) => el.dataset.testid ?? el.tagName)
      : [];
    const composer = document.querySelector("[data-testid=composer]")?.getBoundingClientRect();
    return {
      pageOverflow: doc.scrollWidth - doc.clientWidth,
      overflowing,
      escaping,
      composerBottom: composer ? composer.bottom : null,
      composerTop: composer ? composer.top : null,
      innerHeight: window.innerHeight,
    };
  });

  expect(report.pageOverflow, `${label}: page h-scroll`).toBeLessThanOrEqual(0);
  expect(report.overflowing, `${label}: scroll containers with h-overflow`).toEqual([]);
  expect(report.escaping, `${label}: elements escaping the conversation column`).toEqual([]);
  if (composer && report.composerBottom !== null) {
    expect(report.composerBottom, `${label}: composer cut off at the bottom`).toBeLessThanOrEqual(report.innerHeight);
    expect(report.composerTop!, `${label}: composer pushed off-screen`).toBeGreaterThanOrEqual(0);
  }
  await checkTouchTargets(page);
}

for (const vp of VIEWPORTS) {
  test.describe(`@${vp.name}`, () => {
    test.use({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.mobile,
      hasTouch: vp.mobile,
    });

    test("chat states", async ({ page }) => {
      test.setTimeout(120_000);
      const issues = watchConsole(page);
      const shot = async (state: string) => page.screenshot({ path: `${SHOTS}/${state}-${vp.name}.png` });

      await page.goto("/", { waitUntil: "networkidle" });
      await waitForFonts(page);
      await expect(page.getByTestId("suggestion").first()).toBeVisible();
      await audit(page, "empty");
      // الأسئلة المقترحة ظاهرة دون تمرير — حتى على الجوال الأفقي
      if (vp.name === "landscape" || vp.width >= 768) {
        await expect(page.getByTestId("suggestion").last()).toBeInViewport({ ratio: 1 });
      }
      await page.getByTestId("suggestion").last().scrollIntoViewIfNeeded();
      await expect(page.getByTestId("suggestion").last()).toBeInViewport();
      await page.locator("main#main").evaluate((el) => el.scrollTo(0, 0));
      await shot("empty");

      await ask(page, "ما الفرق بين الذكاء الاصطناعي والتعلّم الآلي؟");
      await waitStatus(page, "done");
      await audit(page, "answer");
      await shot("answer");

      await newChat(page);
      await ask(page, "سؤال تجريبي #long");
      await waitStatus(page, "done");
      await audit(page, "long");
      await page.getByTestId("source-card").last().scrollIntoViewIfNeeded();
      await shot("long-sources");

      await newChat(page);
      await ask(page, "سؤال تجريبي #error");
      await expect(page.getByTestId("error-state")).toBeVisible({ timeout: 10_000 });
      await audit(page, "error");
      await shot("error");

      await newChat(page);
      await ask(page, "سؤال تجريبي #religious");
      await expect(page.getByTestId("out-of-scope")).toBeVisible({ timeout: 10_000 });
      await audit(page, "out-of-scope");

      expect(issues, JSON.stringify(issues, null, 2)).toEqual([]);
    });

    test("sidebar, dialogs, static pages", async ({ page }) => {
      const issues = watchConsole(page);
      const shot = async (state: string, fullPage = false) =>
        page.screenshot({ path: `${SHOTS}/${state}-${vp.name}.png`, fullPage });

      await page.goto("/", { waitUntil: "networkidle" });
      await ask(page, "سؤال لإنشاء محادثة في القائمة بعنوان طويل نسبيًا لاختبار القص");
      await waitStatus(page, "done");

      const desktop = vp.width >= 1024;
      if (desktop) {
        await expect(page.getByTestId("sidebar")).toBeVisible();
      } else {
        await page.getByTestId("drawer-toggle").click();
        const drawer = page.getByTestId("drawer");
        await expect(drawer).toBeVisible();
        // الـ Drawer بارتفاع الشاشة، وأسفله (الإعدادات) ظاهر
        const box = (await drawer.boundingBox())!;
        expect(Math.round(box.height)).toBeLessThanOrEqual(vp.height);
        await expect(drawer.getByRole("button", { name: /الإعدادات/ })).toBeInViewport();
      }
      await audit(page, "sidebar", { composer: desktop });
      await shot("sidebar");

      const scope = desktop ? page.getByTestId("sidebar") : page.getByTestId("drawer");
      await scope.getByRole("button", { name: /^حذف:/ }).first().click();
      const dialog = page.getByTestId("confirm-dialog");
      await expect(dialog).toBeVisible();
      const d = (await dialog.boundingBox())!;
      expect(d.x).toBeGreaterThanOrEqual(0);
      expect(d.x + d.width).toBeLessThanOrEqual(vp.width);
      expect(d.y + d.height).toBeLessThanOrEqual(vp.height);
      await shot("delete-confirm");
      await page.getByRole("button", { name: "إلغاء" }).click();

      await page.goto("/about", { waitUntil: "networkidle" });
      await audit(page, "about", { composer: false });
      await shot("about", true);

      await page.goto("/no-such-page");
      await audit(page, "404", { composer: false });

      const unexpected = issues.filter((i) => !/status of 404/.test(i.text));
      expect(unexpected, JSON.stringify(unexpected, null, 2)).toEqual([]);
    });
  });
}

// ── لوحة مفاتيح الجوال: تقلّص الـ viewport لا يُخفي الـ composer ──
test.describe("mobile keyboard", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("composer stays visible when the keyboard shrinks the viewport", async ({ page }) => {
    await page.goto("/");
    await ask(page, "ما الفرق بين الذكاء الاصطناعي والتعلّم الآلي؟");
    await waitStatus(page, "done");
    await input(page).focus();
    await page.setViewportSize({ width: 390, height: 460 }); // لوحة المفاتيح مفتوحة
    await page.waitForTimeout(300);
    await expect(page.getByTestId("composer")).toBeInViewport({ ratio: 1 });
    await expect(page.locator("header").first()).toBeInViewport();
    await audit(page, "keyboard-open");
    await page.screenshot({ path: `${SHOTS}/keyboard-open-390.png` });
  });

  test("viewport meta enables safe-area and keyboard resizing", async ({ page }) => {
    await page.goto("/");
    const content = await page.locator('meta[name="viewport"]').getAttribute("content");
    expect(content).toContain("viewport-fit=cover");
    expect(content).toContain("interactive-widget=resizes-content");
    const pad = await page
      .getByTestId("composer")
      .evaluate((el) => getComputedStyle(el.parentElement!.parentElement!).paddingBottom);
    expect(parseFloat(pad)).toBeGreaterThanOrEqual(12);
  });
});
