import { defineConfig, devices } from "@playwright/test";

// #region agent log
try {
  fetch("http://127.0.0.1:7683/ingest/9250a4a4-eabe-480a-9c5d-97ebeeafe803", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "6526e8" },
    body: JSON.stringify({
      sessionId: "6526e8",
      runId: "pre-fix",
      hypothesisId: "H1",
      location: "playwright.config.ts:4",
      message: "Playwright config loaded",
      data: {
        CI: process.env.CI ?? null,
        PLAYWRIGHT_BASE_URL: process.env.PLAYWRIGHT_BASE_URL ?? null,
        computedBaseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
        willUseWebServer: process.env.CI ? false : true,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
} catch {
  // ignore
}
// #endregion agent log

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: process.env.CI
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
      },
});
