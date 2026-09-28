import { expect, test, type Page } from "@playwright/test";

import { suggestedQuestions } from "../../lib/content/suggested-questions";
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

const SHOTS = "screenshots/phase-2";
const QUESTION = "ما الفرق بين الذكاء الاصطناعي والتعلّم الآلي؟";
const PLACEHOLDER_QUOTE = "[اقتباس تجريبي — يظهر هنا نص منقول حرفيًا من أحد المصادر]";
const NO_SOURCE_TEXT = "لم أجد في الإنترنت مصادر موثوقة تكفي للإجابة عن هذا السؤال.";

const input = (page: Page) => page.locator("#chat-input");
const sendButton = (page: Page) => page.getByRole("button", { name: "إرسال" });
const lastAssistant = (page: Page) => page.getByTestId("assistant-message").last();

async function ask(page: Page, text: string) {
  await input(page).fill(text);
  await input(page).press("Enter");
}

async function waitStatus(page: Page, status: string) {
  await expect(lastAssistant(page)).toHaveAttribute("data-status", status, { timeout: 15_000 });
}

const newChatButton = (page: Page) => page.getByTestId("new-chat").filter({ visible: true }).first();

async function newChat(page: Page) {
  await newChatButton(page).click();
  await expect(page.getByTestId("suggestion").first()).toBeVisible();
}

// ── 1) كل حالة × كل عرض: screenshots + console نظيف + صفر horizontal scroll ──
for (const vp of VIEWPORTS) {
  test(`states @${vp.name}: screenshots, clean console, no h-scroll`, async ({ page }) => {
    test.setTimeout(90_000);
    const issues = watchConsole(page);
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto("/", { waitUntil: "networkidle" });
    await waitForFonts(page);
    const shot = async (name: string) => {
      await page.waitForTimeout(250); // اكتمال انتقالات الألوان (150ms)
      await expectNoHorizontalScroll(page);
      await page.screenshot({ path: `${SHOTS}/${name}-${vp.name}.png` });
    };

    // الشاشة الفارغة + النصوص المعتمدة حرفيًا
    await expect(page.getByTestId("suggestion")).toHaveCount(4);
    await expect(page.getByTestId("disclaimer")).toHaveText(site.disclaimer);
    await shot("empty");

    // مربع كتابة متعدد الأسطر
    await input(page).fill(Array.from({ length: 9 }, (_, i) => `سطر رقم ${i + 1} من سؤال طويل`).join("\n"));
    await shot("composer-multiline");
    await input(page).fill("");

    // انتظار ← بث ← اكتمال
    await ask(page, QUESTION);
    await expect(page.getByTestId("waiting")).toBeVisible();
    await shot("waiting");
    await expect(page.locator("[data-part=quote]")).toContainText("اقتباس");
    await expect(page.getByTestId("stop")).toBeVisible();
    await shot("streaming");
    await waitStatus(page, "done");
    await page.getByTestId("source-card").last().scrollIntoViewIfNeeded();
    await shot("answer");

    // إيقاف
    await newChat(page);
    await ask(page, QUESTION);
    await expect(page.locator("[data-part=quote]")).toContainText("اقتباس");
    await page.getByTestId("stop").click();
    await waitStatus(page, "stopped");
    await shot("stopped");

    // خطأ
    await newChat(page);
    await ask(page, "سؤال تجريبي #error");
    await expect(page.getByTestId("error-state")).toBeVisible({ timeout: 10_000 });
    await shot("error");

    // لم أجد مصادر
    await newChat(page);
    await ask(page, "سؤال تجريبي #nosource");
    await expect(page.getByTestId("no-source")).toBeVisible({ timeout: 10_000 });
    await shot("nosource");

    // سؤال شرعي — خارج الاختصاص
    await newChat(page);
    await ask(page, "سؤال تجريبي #religious");
    await expect(page.getByTestId("out-of-scope")).toBeVisible({ timeout: 10_000 });
    await shot("out-of-scope");

    // صفحة /about بقسم "كيف يعمل" الجديد
    await page.goto("/about", { waitUntil: "networkidle" });
    await waitForFonts(page);
    await expectNoHorizontalScroll(page);
    await page.screenshot({ path: `${SHOTS}/about-${vp.name}.png`, fullPage: true });

    expect(issues, JSON.stringify(issues, null, 2)).toEqual([]);
  });
}

// ── 2) الإدخال ──
test("Enter sends, clears the input and keeps focus", async ({ page }) => {
  await page.goto("/");
  await ask(page, QUESTION);
  await expect(page.getByTestId("user-message")).toHaveText(QUESTION);
  await expect(input(page)).toHaveValue("");
  await expect(input(page)).toBeFocused();
});

test("rapid double Enter or double-click on a suggestion sends only once", async ({ page }) => {
  await page.goto("/");
  await input(page).fill(QUESTION);
  await input(page).evaluate((el) => {
    for (let i = 0; i < 2; i++) el.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  });
  await page.waitForTimeout(300);
  await expect(page.getByTestId("user-message")).toHaveCount(1);

  await newChat(page);
  await page.getByTestId("suggestion").first().dblclick();
  await page.waitForTimeout(300);
  await expect(page.getByTestId("user-message")).toHaveCount(1);
});

test("Shift+Enter inserts a new line without sending", async ({ page }) => {
  await page.goto("/");
  await input(page).fill("السطر الأول");
  await input(page).press("Shift+Enter");
  await input(page).pressSequentially("السطر الثاني");
  await expect(input(page)).toHaveValue("السطر الأول\nالسطر الثاني");
  await expect(page.getByTestId("user-message")).toHaveCount(0);
});

test("Enter during IME composition does not send", async ({ page }) => {
  await page.goto("/");
  await input(page).fill("نص قيد التركيب");
  await input(page).evaluate((el) => {
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, isComposing: true }));
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, keyCode: 229 }));
  });
  await page.waitForTimeout(300);
  await expect(page.getByTestId("user-message")).toHaveCount(0);
  await expect(input(page)).toHaveValue("نص قيد التركيب");
});

test("empty or whitespace-only input cannot be sent", async ({ page }) => {
  await page.goto("/");
  await expect(sendButton(page)).toBeDisabled();
  await input(page).fill("   \n  ");
  await expect(sendButton(page)).toBeDisabled();
  await input(page).press("Enter");
  await page.waitForTimeout(300);
  await expect(page.getByTestId("user-message")).toHaveCount(0);
  await input(page).fill("سؤال");
  await expect(sendButton(page)).toBeEnabled();
});

test("send is disabled while waiting and streaming", async ({ page }) => {
  await page.goto("/");
  await ask(page, QUESTION);
  await input(page).fill("سؤال ثانٍ");
  await expect(sendButton(page)).toBeDisabled();
  await input(page).press("Enter");
  await expect(page.getByTestId("user-message")).toHaveCount(1);
  await waitStatus(page, "done");
  await expect(sendButton(page)).toBeEnabled();
  await expect(input(page)).toHaveValue("سؤال ثانٍ"); // لم يضع ما كتبه المستخدم
});

test("textarea grows up to ~6 lines then scrolls internally", async ({ page }) => {
  await page.goto("/");
  const height = () => input(page).evaluate((el) => el.clientHeight);
  const oneLine = await height();
  await input(page).fill("1\n2\n3");
  const threeLines = await height();
  expect(threeLines).toBeGreaterThan(oneLine);
  await input(page).fill(Array.from({ length: 15 }, (_, i) => `${i + 1}`).join("\n"));
  const { client, scroll } = await input(page).evaluate((el) => ({ client: el.clientHeight, scroll: el.scrollHeight }));
  expect(client).toBeLessThanOrEqual(170);
  expect(scroll).toBeGreaterThan(client);
});

// ── 3) البث والإيقاف والأخطاء ──
test("stop generation keeps the partial answer and its source", async ({ page }) => {
  await page.goto("/");
  await ask(page, QUESTION);
  await expect(page.locator("[data-part=quote]")).toContainText("اقتباس");
  await page.getByTestId("stop").click();
  await waitStatus(page, "stopped");
  await expect(page.getByTestId("stopped")).toHaveText("أُوقف التوليد.");
  await expect(page.getByTestId("stop")).toHaveCount(0);
  await expect(input(page)).toBeFocused(); // التركيز لا يضيع بعد اختفاء الزر
  const length = await lastAssistant(page).innerText();
  await page.waitForTimeout(700);
  expect(await lastAssistant(page).innerText()).toBe(length);
  await expect(page.getByTestId("source-card")).toHaveCount(2); // لا نص بلا مصادره
});

test("#error shows an error with retry; retry re-runs the request", async ({ page }) => {
  await page.goto("/");
  await ask(page, "سؤال تجريبي #error");
  await expect(page.getByTestId("error-state")).toBeVisible({ timeout: 10_000 });
  await page.getByRole("button", { name: "إعادة المحاولة" }).click();
  await expect(page.getByTestId("waiting")).toBeVisible();
  await expect(page.getByTestId("error-state")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByTestId("assistant-message")).toHaveCount(1); // استبدال لا تكرار
});

test("#error-once: retry recovers with a full answer", async ({ page }) => {
  await page.goto("/");
  await ask(page, "سؤال تجريبي #error-once");
  await expect(page.getByTestId("error-state")).toBeVisible({ timeout: 10_000 });
  await page.getByRole("button", { name: "إعادة المحاولة" }).click();
  await expect(input(page)).toBeFocused();
  await waitStatus(page, "done");
  await expect(page.getByTestId("source-card")).toHaveCount(2);
  await expect(page.getByTestId("error-state")).toHaveCount(0);
});

test("#nosource shows the calm no-fatwa state without a source card", async ({ page }) => {
  await page.goto("/");
  await ask(page, "سؤال تجريبي #nosource");
  await waitStatus(page, "no-source");
  await expect(page.getByTestId("no-source")).toContainText(NO_SOURCE_TEXT);
  await expect(page.getByTestId("source-card")).toHaveCount(0);
  await expect(page.getByTestId("no-source")).not.toHaveAttribute("role", "alert");
});

test("#religious: religious questions are declined calmly", async ({ page }) => {
  await page.goto("/");
  await ask(page, "سؤال تجريبي #religious");
  await waitStatus(page, "out-of-scope");
  await expect(page.getByTestId("out-of-scope")).toContainText("خارج اختصاص سَنَد");
  await expect(page.getByTestId("source-card")).toHaveCount(0);
});

// ── 4) المحتوى والعرض ──
test("answer: verbatim quote, Markdown rendered, source cards complete", async ({ page }) => {
  await page.goto("/");
  await ask(page, QUESTION);
  await waitStatus(page, "done");
  await waitForFonts(page);

  const quote = page.locator("[data-part=quote]");
  await expect(quote).toHaveText(PLACEHOLDER_QUOTE);

  const answer = lastAssistant(page);
  await expect(answer.locator("strong")).toHaveCount(1);
  await expect(answer.locator("h3")).toHaveCount(1);
  await expect(answer.locator("ul li")).toHaveCount(2);
  await expect(answer.locator("blockquote")).toHaveCount(2); // الاقتباس الحرفي + اقتباس Markdown

  const cards = page.getByTestId("source-card");
  await expect(cards).toHaveCount(2);
  await expect(cards.first()).toContainText("[عنوان الصفحة الأولى]");
  await expect(cards.first()).toContainText("[اسم الموقع]");
  await expect(cards.first()).toContainText("example.com");
  await expect(answer.getByText("المصادر", { exact: true })).toBeVisible();
});

test("source link opens the original page in a new tab", async ({ page, context }) => {
  await page.goto("/");
  await ask(page, QUESTION);
  await waitStatus(page, "done");
  const link = page.getByRole("link", { name: /افتح المصدر/ }).first();
  await expect(link).toHaveAttribute("target", "_blank");
  await expect(link).toHaveAttribute("rel", /noopener/);
  await expect(link).toHaveAttribute("href", "https://example.com/source-1");

  const requested: string[] = [];
  context.on("request", (r) => requested.push(r.url()));
  const [popup] = await Promise.all([page.waitForEvent("popup"), link.click()]);
  await popup.waitForTimeout(500);
  expect(requested.some((u) => u.startsWith("https://example.com/source-1"))).toBe(true);
  expect(page.url()).toMatch(/\/$/); // الصفحة الأصلية لم تتغيّر
});

test("clicking a suggested question sends it", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("suggestion").nth(1).click();
  await expect(page.getByTestId("user-message")).toHaveText(suggestedQuestions[1]);
  await waitStatus(page, "done");
});

// ── 5) الحفظ ──
test("refresh keeps the conversation", async ({ page }) => {
  await page.goto("/");
  await ask(page, QUESTION);
  await waitStatus(page, "done");
  await page.reload();
  await expect(page.getByTestId("user-message")).toHaveText(QUESTION);
  await expect(lastAssistant(page)).toHaveAttribute("data-status", "done");
  await expect(page.locator("[data-part=quote]")).toHaveText(PLACEHOLDER_QUOTE);
  await expect(page.getByTestId("source-card")).toHaveCount(2);
});

test("refresh mid-stream recovers the answer as stopped", async ({ page }) => {
  await page.goto("/");
  await ask(page, QUESTION);
  // انتظر حتى يُحفظ الرد وهو ما يزال يُبث وفيه نص، ثم حدّث الصفحة فورًا.
  await page.waitForFunction(() => {
    const all = JSON.parse(localStorage.getItem("sanad:conversations:v1") ?? "{}");
    const last = (Object.values(all)[0] as { messages: { status?: string; parts?: { text: string }[] }[] })
      ?.messages?.at(-1);
    return last?.status === "streaming" && !!last.parts?.some((p) => p.text.trim());
  });
  await page.reload();
  await expect(lastAssistant(page)).toHaveAttribute("data-status", /stopped|error/);
  await expect(page.getByTestId("stop")).toHaveCount(0);
  await expect(sendButton(page)).toBeDisabled(); // الحقل فارغ، ولا طلب عالق
  await input(page).fill("سؤال جديد");
  await expect(sendButton(page)).toBeEnabled();
});

test("new chat starts empty and keeps the previous conversation stored", async ({ page }) => {
  await page.goto("/");
  await expect(newChatButton(page)).toBeDisabled();
  await ask(page, QUESTION);
  await waitStatus(page, "done");
  await newChat(page);
  await expect(page.getByTestId("user-message")).toHaveCount(0);
  const stored = await page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem("sanad:conversations:v1") ?? "{}")).length);
  expect(stored).toBe(1);
  await page.reload();
  await expect(page.getByTestId("suggestion").first()).toBeVisible(); // المحادثة الجديدة هي الحالية
});

test("/chat redirects to the chat home", async ({ page }) => {
  await page.goto("/chat");
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByTestId("composer")).toBeVisible();
});

// ── 6) لوحة المفاتيح، hover، مساحات اللمس ──
for (const vp of [VIEWPORTS[0], VIEWPORTS[2]]) {
  test(`a11y @${vp.name}: empty state and answer`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto("/");
    await expect(page.getByTestId("suggestion")).toHaveCount(4); // بعد تحميل المحادثة من التخزين
    const emptyCount = await checkKeyboardFocus(page);
    await checkTouchTargets(page);
    if (vp.name === "1440") await checkHover(page);

    await page.reload();
    await expect(page.getByTestId("suggestion")).toHaveCount(4);
    await ask(page, QUESTION);
    await waitStatus(page, "done");
    await page.locator("body").click({ position: { x: 1, y: 1 } });
    const answerCount = await checkKeyboardFocus(page);
    await checkTouchTargets(page);
    if (vp.name === "1440") await checkHover(page);

    await newChat(page);
    await ask(page, "سؤال تجريبي #error");
    await expect(page.getByTestId("error-state")).toBeVisible({ timeout: 10_000 });
    await checkTouchTargets(page);
    if (vp.name === "1440") await checkHover(page);
    console.log(`[a11y] @${vp.name}: empty ${emptyCount} controls, answer ${answerCount} controls — all focus-visible`);
  });
}
