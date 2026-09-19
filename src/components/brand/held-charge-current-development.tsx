import type { PublicProductDTO } from "@/server/services/public-queries-service";
import { wrap, sectionPadding, eyebrowOnDark, sectionHead, sectionHeadPOnDark, deviceCornerOnDark, pillBase, pillNeutral, pillCobalt, cx } from "./held-charge-shared";
import { HeldChargeReveal } from "./held-charge-reveal";

interface HeldChargeCurrentDevelopmentProps {
  products: PublicProductDTO[];
}

// Literal Tailwind class names so the compiler can statically discover them
// — a template-interpolated `grid-cols-${n}` string is invisible to
// Tailwind's build-time scanner and would silently generate no CSS.
const GRID_COLS_CLASS: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: "grid-cols-1",
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
};

const STAGE_LABELS: Record<string, string> = {
  concept: "Concept",
  prototype: "Prototype",
  sampling: "Sampling",
  testing: "Testing",
  refinement: "Refinement",
  final_review: "Final Review",
  released: "Released",
};

function stageLabel(stage: string) {
  return STAGE_LABELS[stage] ?? stage.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * The small build/review/test progress diagram shown on every card. Ported
 * unchanged from the client-provided design — a schematic of "a variant
 * moves through these stages," not a per-card differing status graphic.
 */
function StageArt() {
  return (
    <div className="h-[92px] flex items-center justify-center">
      <svg viewBox="0 0 240 92" role="img" aria-label="Development stage progress" className="w-full h-full">
        <line x1="30" y1="34" x2="210" y2="34" className="stroke-[var(--kv-night-line)]" strokeWidth={1.5} />
        <circle cx="30" cy="34" r="8" className="fill-none stroke-[var(--kv-accent)]" strokeWidth={1} opacity={0.4} />
        <circle cx="30" cy="34" r="5" className="fill-[var(--kv-accent)] stroke-[var(--kv-accent)]" strokeWidth={1.5} />
        <text x="30" y="60" textAnchor="middle" className="fill-[var(--kv-night-text)] font-mono text-[8px] tracking-[.08em] uppercase font-bold">
          BUILD
        </text>
        <circle cx="120" cy="34" r="5" className="fill-[var(--kv-night-surface)] stroke-[var(--kv-night-line)]" strokeWidth={1.5} />
        <text x="120" y="60" textAnchor="middle" className="fill-[var(--kv-night-text-soft)] font-mono text-[8px] tracking-[.08em] uppercase font-normal">
          REVIEW
        </text>
        <circle cx="210" cy="34" r="5" className="fill-[var(--kv-night-surface)] stroke-[var(--kv-night-line)]" strokeWidth={1.5} />
        <text x="210" y="60" textAnchor="middle" className="fill-[var(--kv-night-text-soft)] font-mono text-[8px] tracking-[.08em] uppercase font-normal">
          TEST
        </text>
      </svg>
    </div>
  );
}

interface RevisionCardProps {
  variantName: string;
  stage: string;
  summary: string;
}

function RevisionCard({ variantName, stage, summary }: RevisionCardProps) {
  return (
    <article className="border border-[var(--kv-night-line)] rounded-lg pt-[22px] px-[22px] pb-[26px] flex flex-col gap-[18px] bg-[var(--kv-night-surface)] transition-[border-color,box-shadow] duration-150 ease-in-out">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-[6px] font-mono text-xs text-[var(--kv-night-text-soft)]">
          <span className="w-[6px] h-[6px] rounded-full bg-[var(--kv-ignition)]" />
          {variantName}
        </span>
        <span className={cx(pillBase, pillCobalt)}>{stageLabel(stage)}</span>
      </div>
      <StageArt />
      <h3 className="text-[16.5px] font-bold text-[var(--kv-night-text)]">{stageLabel(stage)}</h3>
      <p className="text-[var(--kv-night-text-soft)] text-[13.5px] font-sans">{summary}</p>
    </article>
  );
}

function EmptyStateCard() {
  return (
    <article className="border border-[var(--kv-night-line)] rounded-lg pt-[22px] px-[22px] pb-[26px] flex flex-col gap-[18px] bg-[var(--kv-night-surface)] col-span-full">
      <div className="flex items-center gap-[6px] font-mono text-xs text-[var(--kv-night-text-soft)]">
        <span className="w-[6px] h-[6px] rounded-full bg-[var(--kv-ink-faint)]" />
        No public revisions yet
      </div>
      <p className="text-[var(--kv-night-text-soft)] text-[13.5px] font-sans max-w-[420px]">
        KAVRI hasn&apos;t published a variant for public review yet. Follow the build to be notified
        the moment the first round is approved for sharing.
      </p>
      <span className={cx(pillBase, pillNeutral, "self-start")}>Coming soon</span>
    </article>
  );
}

export function HeldChargeCurrentDevelopment({ products }: HeldChargeCurrentDevelopmentProps) {
  const revisionCards = products.flatMap((product) =>
    product.revisions.map((revision) => ({
      key: revision.id,
      variantName: revision.publicTitle,
      stage: revision.developmentStage,
      summary: revision.publicSummary,
    }))
  );

  return (
    <section id="build" className={cx("bg-[var(--kv-night)] text-[var(--kv-night-text)] overflow-hidden relative", sectionPadding)}>
      <div className={wrap}>
        <div className={sectionHead}>
          <div className="inline-flex items-center gap-[11px]">
            <span className={eyebrowOnDark}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-3 h-3 flex-none">
                <use href="#i-pipeline" />
              </svg>
              CURRENT DEVELOPMENT
            </span>
            <svg viewBox="0 0 370 282" aria-hidden="true" className={deviceCornerOnDark}>
              <use href="#mk-02C" />
            </svg>
          </div>
          <h2 className="font-heading text-[clamp(28px,3.6vw,42px)]">The first KAVRI paddle is in development.</h2>
          <p className={sectionHeadPOnDark}>
            Multiple variants are moving through inspection, measurement, and real-player testing.
            Explore the public record as each round progresses.
          </p>
        </div>

        <HeldChargeReveal
          stagger
          className={cx(
            "grid gap-[18px] max-[980px]:grid-cols-2 max-[560px]:grid-cols-1",
            GRID_COLS_CLASS[Math.min(revisionCards.length, 4) as 0 | 1 | 2 | 3 | 4]
          )}
        >
          {revisionCards.length > 0 ? (
            revisionCards.map((card) => (
              <RevisionCard key={card.key} variantName={card.variantName} stage={card.stage} summary={card.summary} />
            ))
          ) : (
            <EmptyStateCard />
          )}
        </HeldChargeReveal>
      </div>
    </section>
  );
}
