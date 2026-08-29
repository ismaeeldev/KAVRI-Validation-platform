/** KAVRI PWA brand tokens — shared by manifest, icons, and install UI. */
export const PWA_APP_NAME = "KAVRI Validation Platform";
export const PWA_SHORT_NAME = "KAVRI";
export const PWA_DESCRIPTION =
  "Owner workspace for validation traceability — suppliers, samples, assignments, and public updates.";

/** Desktop owner dashboard is the primary install entry point. */
export const PWA_START_URL = "/owner";
export const PWA_SCOPE = "/";

export const PWA_THEME_COLOR = "#0a1004";
export const PWA_BACKGROUND_COLOR = "#f9f9f7";
export const PWA_ACCENT_COLOR = "#b8ff2e";

export const PWA_SW_URL = "/serwist/sw.js";

export const PWA_SHORTCUTS = [
  { name: "Dashboard", short_name: "Dashboard", url: "/owner", description: "Owner overview" },
  {
    name: "Assignments",
    short_name: "Assignments",
    url: "/owner/assignments",
    description: "Active testing briefs",
  },
  { name: "Samples", short_name: "Samples", url: "/owner/samples", description: "Physical sample registry" },
  { name: "Issues", short_name: "Issues", url: "/owner/issues", description: "Defect triage" },
] as const;

export const PWA_ICON_SIZES = [72, 96, 128, 144, 180, 192, 256, 384, 512] as const;

export function pwaIconUrl(size: number, maskable = false) {
  const base = `/pwa/icon/${size}`;
  return maskable ? `${base}?maskable=1` : base;
}
