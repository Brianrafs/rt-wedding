import { defineConfig } from "@playwright/test";

// Allow checks against an explicitly selected, already-running local dev server.
const runningServer = process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/e2e/global-setup.ts",
  outputDir: "test-results/playwright",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: runningServer || "http://127.0.0.1:3100",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "mobile", use: { viewport: { width: 375, height: 812 } } },
    { name: "large-mobile", use: { viewport: { width: 430, height: 932 } } },
    { name: "tablet", use: { viewport: { width: 768, height: 1024 } } },
    { name: "desktop", use: { viewport: { width: 1280, height: 800 } } },
  ],
  webServer: runningServer ? undefined : {
    command: "npm run dev -- --hostname 127.0.0.1 --port 3100",
    url: "http://127.0.0.1:3100",
    env: {
      ...process.env,
      DATABASE_URL: "file:./test-results/e2e/e2e.db",
      RSVP_DEADLINE: "2099-12-01T23:59:59-03:00",
    },
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
