import Image from "next/image";
import { wrap, eyebrowOnDark, cx } from "./held-charge-shared";

interface SubCardProps {
  icon: string;
  title: string;
  description: string;
}

function SubCard({ icon, title, description }: SubCardProps) {
  return (
    <div className="border-t border-[var(--kv-night-line)] pt-4">
      <span className="block w-8 h-8 mb-[14px]">
        <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.5} className="w-full h-full stroke-[var(--kv-accent)]">
          <use href={`#${icon}`} />
        </svg>
      </span>
      <h4 className="text-[14px] font-bold mb-1">{title}</h4>
      {/* Matches the client-provided design exactly: this paragraph keeps its
          light-background color even on this dark section — preserved
          deliberately, not a bug, per the "exact design" brief. */}
      <p className="text-[12.5px] text-[var(--kv-ink-soft)]">{description}</p>
    </div>
  );
}

export function HeldChargeWhyKavri() {
  return (
    <section
      id="learn"
      className="bg-[var(--kv-night)] text-[var(--kv-night-text)] overflow-hidden relative pt-[100px] pb-14 max-[700px]:pt-[68px] max-[700px]:pb-10"
    >
      <div className={wrap}>
        <div className="grid grid-cols-[0.85fr_1.15fr] gap-[60px] items-start max-[900px]:grid-cols-1">
          <div
            aria-hidden="true"
            className="relative h-[330px] min-w-0 before:content-[''] before:absolute before:inset-[-14%] before:pointer-events-none before:bg-[radial-gradient(ellipse_at_46%_40%,rgba(82,104,201,0.26)_0%,rgba(38,42,69,0.16)_46%,transparent_72%)]"
          >
            <Image
              src="/held-charge/paddle-flat.webp"
              alt="KAVRI paddle, front view"
              fill
              sizes="(max-width: 900px) 90vw, 45vw"
              className="relative object-contain [filter:drop-shadow(0_18px_24px_rgba(0,0,0,0.5))]"
            />
          </div>

          <div>
            <span className={cx(eyebrowOnDark, "mb-[18px]")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-3 h-3 flex-none">
                <use href="#i-users" />
              </svg>
              WHY KAVRI BUILDS THIS WAY
            </span>
            <h2 className="font-heading text-[clamp(26px,3.2vw,36px)]">
              Built around the decisions players feel.
            </h2>
            <p className="text-[var(--kv-night-text-soft)] text-base max-w-[480px] mt-[14px] mb-[26px] font-sans">
              KAVRI combines careful partner selection, documented development, and structured
              real-play feedback to make better-informed product decisions.
            </p>

            <div className="grid grid-cols-3 gap-[18px] mt-[34px] max-[700px]:grid-cols-1">
              <SubCard
                icon="i-badge"
                title="Partner selection"
                description="We look for manufacturing partners who can deliver consistent work and support continued refinement."
              />
              <SubCard
                icon="i-craft"
                title="Documented development"
                description="Each testable version is identified, measured, and reviewed."
              />
              <SubCard
                icon="i-court"
                title="Real-player evaluation"
                description="Instrumented checks and structured playtesting answer different questions. KAVRI uses both."
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
