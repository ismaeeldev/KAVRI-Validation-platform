import type { ReactNode } from "react";
import { HeldChargeIconSprite } from "./held-charge-icon-sprite";
import { HeldChargeHeader } from "./held-charge-header";
import { HeldChargeFooter } from "./held-charge-footer";
import { wrap } from "./held-charge-shared";

interface HeldChargeLegalPageProps {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}

/**
 * Shared shell for the public legal pages (Privacy Policy, Terms of Use).
 * Reuses the same header/footer/design tokens as the landing page so
 * navigating here from the footer doesn't feel like a different site.
 */
export function HeldChargeLegalPage({ title, lastUpdated, children }: HeldChargeLegalPageProps) {
  return (
    <div className="landing-held-charge min-h-screen flex flex-col antialiased">
      <HeldChargeIconSprite />
      <HeldChargeHeader />

      <main className="flex-1 bg-[var(--kv-paper)] text-[var(--kv-ink)]">
        <div className={wrap}>
          <div className="max-w-[760px] mx-auto py-16 max-[700px]:py-10">
            <h1 className="font-heading text-[clamp(28px,4vw,42px)] mb-2">{title}</h1>
            <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--kv-ink-faint)] mb-10">
              Last Updated: {lastUpdated}
            </p>

            <div className="legal-prose space-y-6 text-[15px] leading-[1.7] text-[var(--kv-ink-soft)]">
              {children}
            </div>
          </div>
        </div>
      </main>

      <HeldChargeFooter />
    </div>
  );
}
