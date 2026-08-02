import type { MetadataRoute } from "next";

// M5: production domain not yet confirmed - falls back to NEXT_PUBLIC_APP_URL (localhost in this
// environment). Flag for confirmation before this ships.
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://kavri.co";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/owner",
        "/owner/",
        "/tester",
        "/tester/",
        "/login",
        "/account",
        "/account/",
        "/invite",
        "/invite/",
        "/forgot-password",
        "/reset-password",
        "/preview",
        "/preview/",
        "/api",
        "/api/",
      ],
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
