import { defineConfig } from "@playwright/test";

const PORT = 3100;

/**
 * الاختبارات تعمل على بناء الإنتاج (next start) لا خادم التطوير،
 * حتى تعكس النتائج ما سيراه المستخدم فعلًا.
 * شغّل `npm run build` قبل `npm run test:e2e`.
 */
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    browserName: "chromium",
    locale: "ar-SA",
  },
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
