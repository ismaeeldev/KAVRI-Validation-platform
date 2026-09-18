// Reusable Tailwind utility strings for patterns that repeat across many
// sections of the "Held Charge" landing redesign (buttons, the eyebrow tag,
// the centered section heading block, page-section vertical rhythm, the
// content wrapper). Ported from the client-provided design's
// `styles/shared.ts`, adapted to reference `--kv-*` CSS variables directly
// via Tailwind v4 arbitrary values instead of a `tailwind.config.ts` color
// map (this project has no JS Tailwind config).
//
// These are plain string constants, not CSS classes — every component
// still styles itself with Tailwind utility classes directly in its JSX;
// this file just keeps the handful of exactly-repeated combinations from
// drifting out of sync.
export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** The shared content container. */
export const wrap = "max-w-[1180px] mx-auto px-8 max-600:px-[22px]";

/** Standard section vertical padding. */
export const sectionPadding = "pt-[100px] pb-[100px] max-700:pt-[68px] max-700:pb-[68px]";

/**
 * Base button styles, before a variant (primary/outline) and before
 * sizing. Sizing is split out (see `btnSizeDefault` / `btnSizeCompact`)
 * because Tailwind utility classes all share the same specificity —
 * composing two padding utilities in one className does not reliably let
 * the later one win. Pick exactly one size constant per button instance.
 */
export const btnBase =
  "inline-flex items-center justify-center gap-2 font-sans font-semibold rounded-full border border-transparent cursor-pointer whitespace-nowrap no-underline transition-[background-color,border-color,transform,color] duration-150 ease-in-out active:translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--kv-accent)] focus-visible:outline-offset-2";

/** Standard button size (padding: 13px 24px; font-size: 14.5px). */
export const btnSizeDefault = "py-[13px] px-6 text-[14.5px]";

/** Compact size used for the button in the sticky top bar. */
export const btnSizeCompact = "py-[10px] px-5 text-[13.5px]";

/** Primary (ignition-green) button fill. */
export const btnPrimary =
  "bg-[var(--kv-cta)] text-[var(--kv-cta-text)] hover:bg-[var(--kv-cta-deep)]";

/** Outline button on a light background. */
export const btnOutline =
  "bg-transparent text-[var(--kv-ink)] border-[rgba(25,28,43,0.3)] hover:border-[var(--kv-ink)]";

/** Outline button on a dark ("night") background. */
export const btnOutlineOnDark =
  "bg-transparent text-[var(--kv-night-text)] border-[rgba(240,238,231,0.4)] hover:border-[var(--kv-night-text)] focus-visible:outline-white";

/**
 * Eyebrow tag — two full variants (light / on-dark) rather than a base
 * plus a color override, for the same reason noted on `btnBase`: composing
 * two border-color utilities in one className leaves the winner up to
 * Tailwind's stylesheet order, not JSX order.
 */
const eyebrowShape =
  "inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.15em] uppercase pt-[6px] pb-[6px] pl-[10px] pr-[14px] border rounded-[3px]";
export const eyebrow = cx(eyebrowShape, "border-[var(--kv-line)] text-[var(--kv-ink-soft)]");
export const eyebrowOnDark = cx(
  eyebrowShape,
  "border-[var(--kv-night-line)] text-[var(--kv-night-text-soft)]"
);

/** The centered heading + supporting copy block. */
export const sectionHead = "max-w-[620px] mx-auto mb-[52px] text-center flex flex-col items-center gap-4";

export const sectionHeadP = "text-[var(--kv-ink-soft)] text-[16.5px] max-w-[460px]";
export const sectionHeadPOnDark = "text-[var(--kv-night-text-soft)] text-[16.5px] max-w-[460px]";

/** Status pill base, before a color variant. */
export const pillBase = "font-mono text-[10.5px] tracking-[0.03em] py-1 px-[10px] rounded-[3px]";

export const pillNeutral = "bg-[var(--kv-stone-deep)] text-[var(--kv-ink-soft)]";
export const pillAmber = "bg-[var(--kv-amber-bg)] text-[var(--kv-amber-text)]";
export const pillGreen = "bg-[var(--kv-green-bg)] text-[var(--kv-green-text)]";
export const pillCobalt = "bg-[var(--kv-accent-soft)] text-[var(--kv-accent-deep)]";

/**
 * The small faint brand-mark watermark next to an eyebrow. Two full
 * variants for the same reason noted on `btnBase`.
 */
const deviceCornerShape = "w-[15px] h-auto opacity-55 pointer-events-none flex-none max-300:hidden";
export const deviceCorner = cx(deviceCornerShape, "fill-[var(--kv-ink-faint)]");
export const deviceCornerOnDark = cx(deviceCornerShape, "fill-[var(--kv-night-text-soft)]");
