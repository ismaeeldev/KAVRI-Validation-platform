import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Playwright's webServer drives the dev server via 127.0.0.1 (see playwright.config.ts
  // baseURL); Next 16 treats that as a distinct dev origin from its own default and blocks
  // HMR/client-asset requests from it without this allowlist, which breaks client hydration
  // (e.g. login form submit silently no-ops) for every E2E test run.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
