import React from "react";
import type { PublicProductDTO, PublicWhatChangedDTO } from "@/server/services/public-queries-service";

const EVIDENCE_STRENGTH_LABELS: Record<string, { label: string; tone: string }> = {
  early_signal: { label: "Early Signal", tone: "bg-[#f0f0ed] text-kavri-muted border-kavri-line" },
  directional_evidence: { label: "Directional Evidence", tone: "bg-[#fff8e8] text-[#8a6200] border-[#f0d880]" },
  repeated_observation: { label: "Repeated Observation", tone: "bg-[#eef4ff] text-[#3b5fc0] border-[#c0d0f0]" },
  strong_internal_confidence: { label: "Strong Internal Confidence", tone: "bg-[#e8f7e8] text-[#2a6b2a] border-[#b8e0b8]" },
};

export function EvidenceStrengthBadge({ evidenceStrength }: { evidenceStrength: string | null }) {
  const entry = evidenceStrength ? EVIDENCE_STRENGTH_LABELS[evidenceStrength] : null;
  if (!entry) return null;
  return (
    <span className={`inline-block font-mono text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border ${entry.tone}`}>
      {entry.label}
    </span>
  );
}

interface LandingWhatWeAreBuildingProps {
  products: PublicProductDTO[];
}

export function LandingWhatWeAreBuilding({ products }: LandingWhatWeAreBuildingProps) {
  const featured = products[0] ?? null;

  return (
    <section className="bg-[#f7f7f3] border-b border-kavri-line px-6 md:px-10 py-16 md:py-24">
      <div className="max-w-[1280px] mx-auto space-y-10">
        <div className="max-w-2xl space-y-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-kavri-muted font-semibold">
            The Direction
          </p>
          <h2 className="font-heading font-black uppercase text-kavri-ink leading-[1.05]" style={{ fontSize: "clamp(28px, 3.5vw, 46px)" }}>
            What We Are Building
          </h2>
          <p className="text-[15px] text-kavri-muted leading-relaxed font-sans">
            Premium hardware, developed with the player in mind at every step. Here is the public
            direction of the product currently moving through validation.
          </p>
        </div>

        {!featured ? (
          <div className="border border-dashed border-kavri-line rounded-xl bg-kavri-surface py-14 text-center">
            <p className="font-mono text-xs text-kavri-muted">A public product direction has not been published yet.</p>
          </div>
        ) : (
          <div className="border border-kavri-line rounded-2xl bg-kavri-surface shadow-[0_4px_24px_rgba(0,0,0,0.07)] p-8 md:p-10 space-y-4">
            <h3 className="font-heading font-black uppercase text-kavri-ink text-[20px] tracking-tight">
              {featured.publicAlias}
            </h3>
            <p className="text-sm text-kavri-muted leading-relaxed max-w-2xl font-sans">
              {featured.publicSummary}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

const VALIDATION_STEPS = [
  { step: "01", title: "Inspect", desc: "Every incoming sample is logged and visually inspected before it earns the right to be tested." },
  { step: "02", title: "Assign", desc: "Approved, vetted testers are matched to samples for structured, real-world play." },
  { step: "03", title: "Play", desc: "Testers log first-impression and follow-up evaluations from real sessions, not lab conditions." },
  { step: "04", title: "Compare", desc: "Results are compared against target specs and prior revisions to see what actually changed." },
  { step: "05", title: "Decide", desc: "A recorded decision — advance, modify, reject, or gather more evidence — closes the loop." },
];

export function LandingHowWeValidate() {
  return (
    <section id="how-we-test" className="bg-kavri-surface border-b border-kavri-line px-6 md:px-10 py-16 md:py-24">
      <div className="max-w-[1280px] mx-auto space-y-10">
        <div className="max-w-2xl space-y-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-kavri-muted font-semibold">
            The Process
          </p>
          <h2 className="font-heading font-black uppercase text-kavri-ink leading-[1.05]" style={{ fontSize: "clamp(28px, 3.5vw, 46px)" }}>
            How KAVRI Validates
          </h2>
        </div>

        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {VALIDATION_STEPS.map(({ step, title, desc }) => (
            <li key={step} className="border border-kavri-line rounded-xl bg-kavri-surface p-6 space-y-3">
              <span className="font-mono text-[11px] font-black text-kavri-muted tracking-wider select-none">
                {step}
              </span>
              <h3 className="font-heading font-black uppercase text-[15px] text-kavri-ink tracking-wide">
                {title}
              </h3>
              <p className="text-[13px] text-kavri-muted leading-relaxed font-sans">{desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

interface LandingWhatChangedAndWhyProps {
  decisions: PublicWhatChangedDTO[];
}

export function LandingWhatChangedAndWhy({ decisions }: LandingWhatChangedAndWhyProps) {
  if (decisions.length === 0) return null;

  return (
    <section className="bg-[#f7f7f3] border-b border-kavri-line px-6 md:px-10 py-16 md:py-24">
      <div className="max-w-[1280px] mx-auto space-y-10">
        <div className="max-w-2xl space-y-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-kavri-muted font-semibold">
            Recorded Decisions
          </p>
          <h2 className="font-heading font-black uppercase text-kavri-ink leading-[1.05]" style={{ fontSize: "clamp(28px, 3.5vw, 46px)" }}>
            What Changed and Why
          </h2>
        </div>

        <div className="space-y-5">
          {decisions.map((decision) => (
            <div key={decision.id} className="border border-kavri-line rounded-xl bg-kavri-surface p-6 md:p-7 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <EvidenceStrengthBadge evidenceStrength={decision.evidenceStrength} />
                <time
                  dateTime={new Date(decision.decisionDate).toISOString()}
                  className="font-mono text-[10px] text-kavri-muted"
                >
                  {new Date(decision.decisionDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </time>
              </div>
              <p className="text-sm text-kavri-ink leading-relaxed font-sans">{decision.publicVersion}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LandingAboutKavri() {
  return (
    <section id="about-kavri" className="bg-kavri-surface border-b border-kavri-line px-6 md:px-10 py-16 md:py-24">
      <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        <div className="space-y-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-kavri-muted font-semibold">
            Who We Are
          </p>
          <h2 className="font-heading font-black uppercase text-kavri-ink leading-[1.05]" style={{ fontSize: "clamp(28px, 3.5vw, 46px)" }}>
            About KAVRI
          </h2>
        </div>
        <p className="text-[15px] text-kavri-muted leading-relaxed font-sans max-w-xl">
          KAVRI builds premium hardware for players who care how a product performs, not just how
          it&apos;s marketed. We publish our validation process because we believe accountability
          makes better products — every design decision on this page is backed by real testing,
          not a press release.
        </p>
      </div>
    </section>
  );
}
