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

const SHOTS = "screenshots/phase-3";

/** محادثات تجريبية (placeholders فقط) — الأحدث أولًا: c3 ثم c2 ثم c1. */
const SEED = [
  { id: "c1", title: "خطة رحلة إلى العُلا", ago: 3 },
  { id: "c2", title: "مقارنة بين لغات البرمجة", ago: 2 },
  { id: "c3", title: "نصائح لتحسين النوم", ago: 1 },
];

async function seed(page: Page, currentId: string | null = "c3") {
  await page.goto("/");
  await page.evaluate(
    ({ seedData, current }) => {
      const now = Date.now();
      const all: Record<string, unknown> = {};
      for (const c of seedData) {
        const t = now - c.ago * 3_600_000;
        all[c.id] = {
          id: c.id,
          title: c.title,
          createdAt: t,
          updatedAt: t,
          messages: [
            { id: `${c.id}-u`, role: "user", content: c.title, createdAt: t },
            {
              id: `${c.id}-a`,
              role: "assistant",
              status: "done",
              createdAt: t,
              parts: [{ type: "text", text: `[إجابة تجريبية للمحادثة: ${c.title}]` }],
              sources: [
                { id: "s1", title: "[عنوان الصفحة]", sourceLabel: "[اسم الموقع]", volume: null, page: null, url: "https://example.com/" },
              ],
            },
          ],
        };
      }
      localStorage.setItem("sanad:conversations:v1", JSON.stringify(all));
      if (current) localStorage.setItem("sanad:current:v1", current);
      else localStorage.removeItem("sanad:current:v1");
    },
    { seedData: SEED, current: currentId },
  );
  await page.reload();
  await waitForFonts(page);
}

const drawer = (page: Page) => page.getByTestId("drawer");
const items = (scope: Page | ReturnType<Page["getByTestId"]>) => scope.getByTestId("conversation-item");
const visibleSidebar = (page: Page) =>
  page.locator("[data-testid=sidebar], [data-testid=drawer][open]").filter({ visible: true }).first();

// ── 1) screenshots + console + h-scroll لكل عرض ──
for (const vp of VIEWPORTS) {
  test(`sidebar states @${vp.name}: screenshots, clean console, no h-scroll`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await seed(page);
    // المراقبة بعد التهيئة: إعادة التحميل فيها تُلغي طلبات prefetch عمدًا.
    const issues = watchConsole(page);
    const shot = async (name: string) => {
      await page.waitForTimeout(300); // اكتمال الانتقالات والحركة (200ms)
      await expectNoHorizontalScroll(page);
      await page.screenshot({ path: `${SHOTS}/${name}-${vp.name}.png` });
    };

    if (vp.name === "1440") {
      await expect(page.getByTestId("sidebar")).toBeVisible();
      await shot("sidebar-open");
      await page.getByRole("button", { name: "إخفاء قائمة المحادثات" }).click();
      await expect(page.getByTestId("sidebar")).toHaveCount(0);
      await shot("sidebar-collapsed");
      await page.getByTestId("sidebar-show").click();
      await expect(page.getByTestId("sidebar")).toBeVisible();
    } else {
      await expect(page.getByTestId("sidebar")).toBeHidden();
      await shot("chat-closed");
      await page.getByTestId("drawer-toggle").click();
      await expect(drawer(page)).toBeVisible();
      await shot("drawer-open");
    }

    // البحث بلا نتائج
    const search = visibleSidebar(page).getByRole("searchbox");
    await search.fill("كلمة غير موجودة");
    await expect(visibleSidebar(page).getByTestId("no-results")).toBeVisible();
    await shot("search-empty");
    await search.fill("");

    // إعادة التسمية
    await visibleSidebar(page).getByRole("button", { name: /إعادة تسمية: نصائح لتحسين النوم/ }).click();
    await expect(visibleSidebar(page).getByTestId("rename-input")).toBeFocused();
    await shot("rename");
    await page.keyboard.press("Escape");

    // تأكيد الحذف
    await visibleSidebar(page).getByRole("button", { name: /حذف: مقارنة بين لغات البرمجة/ }).click();
    await expect(page.getByTestId("confirm-dialog")).toBeVisible();
    await shot("delete-confirm");
    await page.getByRole("button", { name: "إلغاء" }).click();

    expect(issues, JSON.stringify(issues, null, 2)).toEqual([]);
  });
}

// ── 2) القائمة والتنقل ──
test("desktop: newest first, current highlighted, navigation switches conversation", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await seed(page);
  const sidebar = page.getByTestId("sidebar");
  await expect(items(sidebar)).toHaveCount(3);
  await expect(items(sidebar).first()).toContainText("نصائح لتحسين النوم");
  await expect(items(sidebar).last()).toContainText("خطة رحلة إلى العُلا");
  await expect(sidebar.locator("[aria-current=page]")).toHaveText("نصائح لتحسين النوم");

  await sidebar.getByRole("button", { name: "خطة رحلة إلى العُلا", exact: true }).click();
  await expect(page.getByTestId("user-message")).toHaveText("خطة رحلة إلى العُلا");
  await expect(sidebar.locator("[aria-current=page]")).toHaveText("خطة رحلة إلى العُلا");
  await page.reload();
  await expect(page.getByTestId("user-message")).toHaveText("خطة رحلة إلى العُلا"); // تبقى الحالية بعد التحديث
});

test("desktop: collapse persists across reload", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await seed(page);
  await page.getByRole("button", { name: "إخفاء قائمة المحادثات" }).click();
  await page.reload();
  await expect(page.getByTestId("sidebar")).toHaveCount(0);
  await expect(page.getByTestId("sidebar-show")).toBeVisible();
  await page.getByTestId("sidebar-show").click();
  await expect(page.getByTestId("sidebar")).toBeVisible();
});

test("new chat from the sidebar, first message becomes the title at the top", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await seed(page);
  const sidebar = page.getByTestId("sidebar");
  await sidebar.getByTestId("new-chat").click();
  await expect(page.getByTestId("suggestion").first()).toBeVisible();
  await expect(sidebar.locator("[aria-current=page]")).toHaveCount(0);
  await page.locator("#chat-input").fill("كيف أتعلم الطبخ في المنزل؟");
  await page.locator("#chat-input").press("Enter");
  await expect(items(sidebar)).toHaveCount(4);
  await expect(items(sidebar).first()).toContainText("كيف أتعلم الطبخ في المنزل؟");
  await expect(sidebar.locator("[aria-current=page]")).toHaveText("كيف أتعلم الطبخ في المنزل؟");
});

// ── 3) الـ Drawer على الجوال والتابلت ──
for (const vp of [VIEWPORTS[0], VIEWPORTS[1]]) {
  test(`drawer @${vp.name}: opens, closes by Esc / backdrop / close button / selection, locks scroll`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await seed(page);
    const toggle = page.getByTestId("drawer-toggle");
    const root = () => page.evaluate(() => document.documentElement.style.overflow);

    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await toggle.click();
    await expect(drawer(page)).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(await root()).toBe("hidden");

    // Esc — ويعود التركيز لزر الفتح
    await page.keyboard.press("Escape");
    await expect(drawer(page)).toBeHidden();
    await expect(toggle).toBeFocused();
    expect(await root()).toBe("");

    // النقر خارجها (على الخلفية، يسار الـ Drawer في RTL)
    await toggle.click();
    await expect(drawer(page)).toBeVisible();
    await page.mouse.click(10, vp.height / 2);
    await expect(drawer(page)).toBeHidden();

    // زر الإغلاق
    await toggle.click();
    await drawer(page).getByRole("button", { name: "إغلاق قائمة المحادثات" }).click();
    await expect(drawer(page)).toBeHidden();

    // اختيار محادثة يغلقها وينتقل إليها
    await toggle.click();
    await drawer(page).getByRole("button", { name: "مقارنة بين لغات البرمجة", exact: true }).click();
    await expect(drawer(page)).toBeHidden();
    await expect(page.getByTestId("user-message")).toHaveText("مقارنة بين لغات البرمجة");
  });
}

test("drawer traps focus while open", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await seed(page);
  await page.getByTestId("drawer-toggle").click();
  for (let i = 0; i < 25; i++) {
    await page.keyboard.press("Tab");
    const inside = await page.evaluate(() => {
      const a = document.activeElement;
      return !a || a === document.body || !!document.querySelector("[data-testid=drawer]")?.contains(a);
    });
    expect(inside, `focus escaped the drawer at Tab #${i + 1}`).toBe(true);
  }
});

test("drawer closes itself when the window widens to desktop", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await seed(page);
  await page.getByTestId("drawer-toggle").click();
  await expect(drawer(page)).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(drawer(page)).toBeHidden();
  await expect(page.getByTestId("sidebar")).toBeVisible();
  await page.getByTestId("sidebar").getByRole("button", { name: "خطة رحلة إلى العُلا", exact: true }).click(); // الصفحة ليست inert
  await expect(page.getByTestId("user-message")).toHaveText("خطة رحلة إلى العُلا");
});

// ── 4) البحث ──
test("search filters titles and ignores Arabic spelling variants", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await seed(page);
  const sidebar = page.getByTestId("sidebar");
  const search = sidebar.getByRole("searchbox", { name: "ابحث في المحادثات" });
  await search.fill("البرمجه"); // هاء بدل تاء مربوطة
  await expect(items(sidebar)).toHaveCount(1);
  await expect(items(sidebar)).toContainText("مقارنة بين لغات البرمجة");
  await search.fill("العلا"); // بلا ضمة
  await expect(items(sidebar)).toHaveCount(1);
  await search.fill("xyz");
  await expect(items(sidebar)).toHaveCount(0);
  await expect(sidebar.getByTestId("no-results")).toBeVisible();
  await search.fill("");
  await expect(items(sidebar)).toHaveCount(3);
});

// ── 5) إعادة التسمية ──
test("rename: Enter saves and persists, Escape cancels", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await seed(page);
  const sidebar = page.getByTestId("sidebar");

  await sidebar.getByRole("button", { name: "إعادة تسمية: خطة رحلة إلى العُلا" }).click();
  const input = sidebar.getByTestId("rename-input");
  await input.fill("رحلة العُلا — الخطة النهائية");
  await input.press("Enter");
  await expect(sidebar.getByRole("button", { name: "رحلة العُلا — الخطة النهائية", exact: true })).toBeVisible();
  await expect(sidebar.getByRole("button", { name: "إعادة تسمية: رحلة العُلا — الخطة النهائية" })).toBeFocused();

  await sidebar.getByRole("button", { name: "إعادة تسمية: نصائح لتحسين النوم" }).click();
  await sidebar.getByTestId("rename-input").fill("اسم لن يُحفظ");
  await sidebar.getByTestId("rename-input").press("Escape");
  await expect(sidebar.getByRole("button", { name: "نصائح لتحسين النوم", exact: true })).toBeVisible();
  await page.waitForTimeout(300);
  await expect(sidebar.getByText("اسم لن يُحفظ")).toHaveCount(0);

  await page.reload();
  await expect(page.getByTestId("sidebar").getByRole("button", { name: "رحلة العُلا — الخطة النهائية", exact: true })).toBeVisible();
});

// ── 6) الحذف ──
test("delete asks for confirmation; cancel keeps, confirm removes", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await seed(page);
  const sidebar = page.getByTestId("sidebar");
  const dialog = page.getByTestId("confirm-dialog");

  await sidebar.getByRole("button", { name: "حذف: خطة رحلة إلى العُلا" }).click();
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("«خطة رحلة إلى العُلا»");
  await expect(dialog.getByRole("button", { name: "إلغاء" })).toBeFocused(); // الخيار الآمن أولًا
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(items(sidebar)).toHaveCount(3);

  await sidebar.getByRole("button", { name: "حذف: خطة رحلة إلى العُلا" }).click();
  await page.getByTestId("confirm-delete").click();
  await expect(items(sidebar)).toHaveCount(2);
  await expect(page.getByTestId("user-message")).toHaveText("نصائح لتحسين النوم"); // الحالية لم تتأثر
  await page.reload();
  await expect(items(page.getByTestId("sidebar"))).toHaveCount(2);
});

test("deleting the current conversation shows the empty state", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await seed(page);
  const sidebar = page.getByTestId("sidebar");
  await sidebar.getByRole("button", { name: "حذف: نصائح لتحسين النوم" }).click();
  await page.getByTestId("confirm-delete").click();
  await expect(page.getByTestId("suggestion").first()).toBeVisible();
  await expect(items(sidebar)).toHaveCount(2);
  await expect(sidebar.locator("[aria-current=page]")).toHaveCount(0);
  await page.reload();
  await expect(page.getByTestId("suggestion").first()).toBeVisible();
});

test("deleting from the mobile drawer works (dialog over dialog)", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await seed(page);
  await page.getByTestId("drawer-toggle").click();
  await drawer(page).getByRole("button", { name: "حذف: مقارنة بين لغات البرمجة" }).click();
  await page.getByTestId("confirm-delete").click();
  await expect(items(drawer(page))).toHaveCount(2);
  await expect(drawer(page)).toBeVisible(); // الـ Drawer يبقى مفتوحًا
});

// ── 7) لوحة المفاتيح، hover، مساحات اللمس ──
test("a11y @1440: sidebar keyboard focus and hover", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await seed(page);
  const n = await checkKeyboardFocus(page);
  await checkHover(page);
  console.log(`[a11y] @1440 with sidebar: ${n} focusable controls, all focus-visible`);
});

test("a11y @375: drawer keyboard focus and touch targets", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await seed(page);
  await checkTouchTargets(page);
  await page.getByTestId("drawer-toggle").click();
  const n = await checkKeyboardFocus(page);
  await checkTouchTargets(page);
  console.log(`[a11y] @375 drawer: ${n} focusable controls, all focus-visible`);
});
