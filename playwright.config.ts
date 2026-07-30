import { defineConfig, devices } from "@playwright/test";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  // Every page in this app queries a remote Neon Postgres instance over a
  // WebSocket connection pool (@neondatabase/serverless); a cold connection
  // can take several seconds. The default 5s assertion timeout produces
  // false failures under normal latency, not actual bugs - raise it globally
  // rather than patching individual assertions.
  expect: {
    timeout: 15000,
  },
  use: {
    // Must match NEXT_PUBLIC_APP_URL (.env.local) exactly. auth-client.ts calls better-auth
    // with an ABSOLUTE baseURL of NEXT_PUBLIC_APP_URL; if Playwright navigates the browser to
    // a different host (e.g. 127.0.0.1 while NEXT_PUBLIC_APP_URL is localhost), the browser
    // treats every auth fetch as cross-origin and silently fails with "Failed to fetch",
    // which looks like a login bug but is purely a test-origin mismatch.
    baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 12"] },
    },
  ],
  webServer: {
    command: "pnpm dev",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    reuseExistingServer: false,
    timeout: 120000,
  },
});
