import type { MetadataRoute } from "next";

// M5: production domain not yet confirmed - falls back to NEXT_PUBLIC_APP_URL.
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://kavri.co";

// Only the root route exists as a standalone public page today - no legal pages and no
// individually-addressable public update route exist yet (Step 13's public preview is a
// token-gated /preview/updates/[id], not a permanent indexable URL). Flagged as a gap for a
// future revision rather than inventing a route that doesn't exist.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: APP_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}
