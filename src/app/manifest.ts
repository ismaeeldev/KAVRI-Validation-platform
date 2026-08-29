import type { MetadataRoute } from "next";
import {
  PWA_APP_NAME,
  PWA_BACKGROUND_COLOR,
  PWA_DESCRIPTION,
  PWA_ICON_SIZES,
  PWA_SCOPE,
  PWA_SHORT_NAME,
  PWA_SHORTCUTS,
  PWA_START_URL,
  PWA_THEME_COLOR,
  pwaIconUrl,
} from "@/lib/pwa/config";

export default function manifest(): MetadataRoute.Manifest {
  const icons: MetadataRoute.Manifest["icons"] = [];

  for (const size of PWA_ICON_SIZES) {
    icons.push({
      src: pwaIconUrl(size),
      sizes: `${size}x${size}`,
      type: "image/png",
      purpose: "any",
    });
    icons.push({
      src: pwaIconUrl(size, true),
      sizes: `${size}x${size}`,
      type: "image/png",
      purpose: "maskable",
    });
  }

  return {
    id: "/owner",
    name: PWA_APP_NAME,
    short_name: PWA_SHORT_NAME,
    description: PWA_DESCRIPTION,
    start_url: PWA_START_URL,
    scope: PWA_SCOPE,
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone", "browser"],
    orientation: "any",
    background_color: PWA_BACKGROUND_COLOR,
    theme_color: PWA_THEME_COLOR,
    categories: ["business", "productivity"],
    prefer_related_applications: false,
    icons,
    shortcuts: PWA_SHORTCUTS.map((shortcut) => ({
      name: shortcut.name,
      short_name: shortcut.short_name,
      description: shortcut.description,
      url: shortcut.url,
      icons: [{ src: pwaIconUrl(192), sizes: "192x192", type: "image/png" }],
    })),
  };
}
