import { expect, test } from "@playwright/test";

import { site } from "../../lib/site";
import {
  INTERACTIVE,
  VIEWPORTS,
  expectNoHorizontalScroll,
  waitForFonts,
  watchConsole,
} from "./helpers";

const SHOTS = "screenshots/phase-1";
const PAGES = [
  { name: "home", path: "/" },
  { name: "about", path: "/about" },
  { name: "chat", path: "/chat" },
] as const;

// ── 1) كل صفحة × كل عرض: console، overflow، RTL، الخطوط، النصوص الثابتة، screenshot ──
for (const p of PAGES) {
  for (const vp of VIEWPORTS) {
    test(`${p.name} @${vp.name}: clean console, no h-scroll, RTL, fixed texts`, async ({ page }) => {
      const issues = watchConsole(page);
      await page.setViewportSize({ width: vp.width, height: vp.height });
      const res = await page.goto(p.path, { waitUntil: "networkidle" });
      expect(res?.status()).toBe(200);
      await waitForFonts(page);

      await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
      await expect(page.locator("html")).toHaveAttribute("lang", "ar");

      // النصوص المعتمدة حرفيًا
      await expect(page.getByTestId("disclaimer").first()).toHaveText(site.disclaimer);
      await expect(page.getByTestId("independence")).toHaveText(site.independence);

      // الخط العربي للواجهة محمّل فعلًا
      const plexLoaded = await page.evaluate(() =>
        [...document.fonts].some((f) => f.status === "loaded" && /plex/i.test(f.family)),
      );
      expect(plexLoaded, "IBM Plex Sans Arabic not loaded").toBe(true);

      await expectNoHorizontalScroll(page);
      await page.screenshot({ path: `${SHOTS}/${p.name}-${vp.name}.png`, fullPage: true });

      expect(issues, JSON.stringify(issues, null, 2)).toEqual([]);
    });
  }
}

// ── 2) خط النسخ محمّل في الـ mockup ──
test("home: hero mockup renders the fatwa placeholder in Naskh", async ({ page }) => {
  await page.goto("/");
  await waitForFonts(page);
  const family = await page
    .getByText("[إجابة تجريبية — ستُعرض هنا فتوى الشيخ ابن باز بنصها ورابطها]")
    .evaluate((el) => getComputedStyle(el).fontFamily);
  expect(family).toMatch(/naskh/i);
  const naskhLoaded = await page.evaluate(() =>
    [...document.fonts].some((f) => f.status === "loaded" && /naskh/i.test(f.family)),
  );
  expect(naskhLoaded).toBe(true);
});

// ── 3) كل الروابط ──
for (const p of PAGES) {
  test(`${p.name}: every link resolves`, async ({ page, request }) => {
    await page.goto(p.path);
    const links = await page.$$eval("a[href]", (as) =>
      as.map((a) => ({
        href: a.getAttribute("href")!,
        target: a.getAttribute("target"),
        rel: a.getAttribute("rel"),
        text: (a.textContent ?? "").trim(),
      })),
    );
    expect(links.length).toBeGreaterThan(0);

    for (const link of links) {
      if (link.href.startsWith("#")) {
        await expect(page.locator(link.href), `anchor ${link.href}`).toHaveCount(1);
      } else if (link.href.startsWith("/")) {
        const r = await request.get(link.href);
        expect(r.status(), `${link.href} (${link.text})`).toBe(200);
      } else {
        // خارجي: الموقع الرسمي فقط، ويفتح في تبويب جديد بأمان
        expect(link.href).toBe(site.source.url);
        expect(link.target).toBe("_blank");
        expect(link.rel).toContain("noopener");
      }
    }
    console.log(`[links] ${p.path}: ${links.length} links OK`);
  });
}

// ── 4) الـ CTA ينقل إلى /chat ──
test("hero CTA navigates to /chat", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("hero-cta").click();
  await expect(page).toHaveURL(/\/chat$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("header CTA navigates to /chat on mobile and desktop", async ({ page }) => {
  for (const vp of [VIEWPORTS[0], VIEWPORTS[2]]) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto("/about");
    await page.getByTestId("header-cta").click();
    await expect(page).toHaveURL(/\/chat$/);
  }
});

test("secondary CTA scrolls to how-it-works", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.getByRole("link", { name: "كيف يعمل؟" }).click();
  await expect(page).toHaveURL(/#how-it-works$/);
  await expect(page.getByRole("heading", { name: "كيف يعمل سَنَد؟" })).toBeInViewport();
});

// ── 5) focus: كل عنصر قابل للتركيز بلوحة المفاتيح وله outline واضح ──
for (const p of PAGES) {
  for (const vp of [VIEWPORTS[0], VIEWPORTS[2]]) {
    test(`${p.name} @${vp.name}: keyboard focus reaches every control with a visible ring`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(p.path);
      const expected = await page.locator(INTERACTIVE).count();

      const seen: string[] = [];
      for (let i = 0; i < expected + 2; i++) {
        await page.keyboard.press("Tab");
        await page.waitForTimeout(200); // transition-colors يشمل outline-color (150ms)
        const info = await page.evaluate(() => {
          const el = document.activeElement as HTMLElement | null;
          if (!el || el === document.body) return null;
          // هوية العنصر نفسه (لا نصه): رابطان بنفس النص والوجهة عنصران مختلفان
          if (el.dataset.focusSeen) return { key: el.dataset.focusSeen, dup: true, outline: "", color: "", width: 0, visible: true };
          el.dataset.focusSeen = `${el.tagName}#${document.querySelectorAll("[data-focus-seen]").length}:${el.textContent?.trim()}`;
          const s = getComputedStyle(el);
          const r = el.getBoundingClientRect();
          return {
            key: el.dataset.focusSeen,
            dup: false,
            outline: s.outlineStyle,
            color: s.outlineColor,
            width: parseFloat(s.outlineWidth),
            visible: r.width > 1 && r.height > 1,
          };
        });
        if (!info || info.dup) continue;
        seen.push(info.key);
        expect(info.outline, info.key).not.toBe("none");
        expect(info.width, info.key).toBeGreaterThanOrEqual(2);
        // لون الحبر الأساسي دائمًا — لا currentColor (كان أبيض على الأزرار الكحلية)
        expect(info.color, info.key).toBe("rgb(30, 58, 95)");
        expect(info.visible, `${info.key} focused but invisible`).toBe(true);
      }
      expect(seen.length, `reached ${seen.length}/${expected}`).toBe(expected);
      console.log(`[focus] ${p.path} @${vp.name}: ${seen.length}/${expected} focusable, all with ring`);
    });
  }
}

// ── 6) hover: كل عنصر تفاعلي ظاهر يتغيّر شكله ──
for (const p of PAGES) {
  test(`${p.name}: every visible control has a hover state`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(p.path);
    const controls = page.locator(`header ${INTERACTIVE}, main ${INTERACTIVE}, footer ${INTERACTIVE}`);
    const n = await controls.count();
    const read = (el: Element) => {
      const s = getComputedStyle(el);
      return [s.color, s.backgroundColor, s.borderColor, s.textDecorationColor, s.opacity].join("|");
    };
    let checked = 0;
    for (let i = 0; i < n; i++) {
      const el = controls.nth(i);
      if (!(await el.isVisible())) continue;
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
    console.log(`[hover] ${p.path}: ${checked} controls`);
  });
}

// ── 7) مساحة اللمس ≥ 44px ──
for (const p of PAGES) {
  test(`${p.name} @375: touch targets ≥ 44px`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(p.path);
    const controls = page.locator(INTERACTIVE);
    const n = await controls.count();
    for (let i = 0; i < n; i++) {
      const el = controls.nth(i);
      if (!(await el.isVisible())) continue;
      // رابط التخطي مخفي (sr-only) حتى يُركَّز عليه، فيُقاس في حالته الظاهرة
      if ((await el.getAttribute("href")) === "#main") await el.focus();
      const box = (await el.boundingBox())!;
      const label = (await el.textContent())?.trim();
      expect(box.height, `height: ${label}`).toBeGreaterThanOrEqual(44);
      expect(box.width, `width: ${label}`).toBeGreaterThanOrEqual(44);
    }
  });
}

// ── 8) صور الحالات: focus و hover و 404 ──
test("state screenshots", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await waitForFonts(page);

  await page.getByTestId("hero-cta").hover();
  await page.waitForTimeout(250);
  await page.screenshot({ path: `${SHOTS}/state-hover-hero-cta-1440.png` });

  // التركيز بلوحة المفاتيح فعليًا (Tab) حتى يظهر :focus-visible كما يراه المستخدم
  const tabTo = async (testId: string) => {
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press("Tab");
      if (await page.getByTestId(testId).evaluate((el) => el === document.activeElement)) {
        await page.waitForTimeout(250); // اكتمال انتقال لون الإطار
        return;
      }
    }
    throw new Error(`could not tab to ${testId}`);
  };

  await page.goto("/");
  await waitForFonts(page);
  await page.keyboard.press("Tab"); // رابط التخطي
  await page.screenshot({ path: `${SHOTS}/state-focus-skip-link-1440.png` });
  await tabTo("hero-cta");
  await page.screenshot({ path: `${SHOTS}/state-focus-hero-cta-1440.png` });

  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await waitForFonts(page);
  await tabTo("header-cta");
  await page.screenshot({ path: `${SHOTS}/state-focus-header-cta-375.png` });
});

test("404 page is Arabic and links home", async ({ page }) => {
  for (const vp of VIEWPORTS) {
    const issues = watchConsole(page);
    await page.setViewportSize({ width: vp.width, height: vp.height });
    const res = await page.goto("/no-such-page");
    expect(res?.status()).toBe(404);
    await waitForFonts(page);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("لم نجد هذه الصفحة");
    await expectNoHorizontalScroll(page);
    await page.screenshot({ path: `${SHOTS}/state-404-${vp.name}.png`, fullPage: true });
    // المتوقع الوحيد: إعلان المتصفح عن حالة 404 للمستند نفسه
    const unexpected = issues.filter((i) => !/status of 404/.test(i.text));
    expect(unexpected, JSON.stringify(unexpected)).toEqual([]);
    page.removeAllListeners("console");
    page.removeAllListeners("pageerror");
    page.removeAllListeners("requestfailed");
  }
  await page.getByRole("link", { name: "العودة إلى الرئيسية" }).click();
  await expect(page).toHaveURL(/\/$/);
});
