import { wrap, sectionPadding, eyebrow, btnBase, btnOutline, btnSizeDefault, cx } from "./held-charge-shared";

interface AttrCardProps {
  icon: string;
  title: string;
  description: string;
}

function AttrCard({ icon, title, description }: AttrCardProps) {
  return (
    <div className="flex gap-[14px] items-start">
      <span className="w-11 h-11 rounded-md bg-[var(--kv-paper)] border border-[var(--kv-line)] flex items-center justify-center flex-none">
        <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.6} className="w-[19px] h-[19px] stroke-[var(--kv-accent)]">
          <use href={`#${icon}`} />
        </svg>
      </span>
      <div>
        <h4 className="text-[14.5px] font-bold mb-[3px]">{title}</h4>
        <p className="text-[13px] text-[var(--kv-ink-soft)]">{description}</p>
      </div>
    </div>
  );
}

export function HeldChargePaddleArchitecture() {
  return (
    <section className={cx("bg-[var(--kv-stone)] relative overflow-hidden", sectionPadding)}>
      <svg
        viewBox="0 0 370 282"
        aria-hidden="true"
        className="absolute top-[56%] left-[2%] h-[82%] w-auto -translate-y-1/2 fill-[var(--kv-ink)] opacity-[0.028] pointer-events-none z-0 max-[900px]:top-[19%] max-[900px]:left-[-4%] max-[900px]:h-[44%] max-[900px]:opacity-[0.035]"
      >
        <use href="#mk-02C" />
      </svg>

      <div className={wrap}>
        <div className="relative z-[1] grid grid-cols-[0.95fr_1.05fr] gap-14 items-center max-[900px]:grid-cols-1">
          <div className="flex justify-center">
            <svg viewBox="-30 -20 380 340" className="w-full max-w-[380px] h-auto">
              <g stroke="rgba(25,28,43,0.22)" fill="none" strokeDasharray="2 4">
                <circle cx="160" cy="150" r="42" />
                <circle cx="160" cy="150" r="76" />
                <circle cx="160" cy="150" r="110" />
              </g>
              <g stroke="rgba(25,28,43,0.36)">
                <line x1="160" y1="150" x2="160" y2="40" />
                <line x1="160" y1="150" x2="270" y2="150" />
                <line x1="160" y1="150" x2="160" y2="260" />
                <line x1="160" y1="150" x2="50" y2="150" />
              </g>
              <text x="160" y="20" textAnchor="middle" className="font-mono text-[11px] tracking-[.06em] fill-[var(--kv-ink)] uppercase">
                Surface
              </text>
              <text x="288" y="154" textAnchor="start" className="font-mono text-[11px] tracking-[.06em] fill-[var(--kv-ink)] uppercase">
                Core
              </text>
              <text x="160" y="298" textAnchor="middle" className="font-mono text-[11px] tracking-[.06em] fill-[var(--kv-ink)] uppercase">
                Handle
              </text>
              <text x="32" y="154" textAnchor="end" className="font-mono text-[11px] tracking-[.06em] fill-[var(--kv-ink)] uppercase">
                Frame
              </text>
              <defs>
                <radialGradient id="sweetSpotGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#5268C9" stopOpacity={0.62} />
                  <stop offset="55%" stopColor="#5268C9" stopOpacity={0.26} />
                  <stop offset="100%" stopColor="#5268C9" stopOpacity={0} />
                </radialGradient>
              </defs>
              <image
                href="/held-charge/paddle-flat.webp"
                x={131.75}
                y={90.0}
                width={56.5}
                height={190.0}
                opacity={0.16}
                preserveAspectRatio="xMidYMid meet"
              />
              <circle cx="160" cy="150" r="40" fill="url(#sweetSpotGlow)" />
            </svg>
          </div>

          <div>
            <span className={cx(eyebrow, "mb-[18px]")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-3 h-3 flex-none">
                <use href="#i-axis" />
              </svg>
              WHAT WE EVALUATE
            </span>
            <h2 className="font-heading text-[clamp(26px,3.2vw,36px)] mb-[14px]">
              Four areas. One connected system.
            </h2>
            <p className="text-[var(--kv-ink-soft)] text-base max-w-[440px] mb-[30px] font-sans">
              KAVRI examines how the surface, core, frame, and handle work together—and how changes
              in one area affect the complete paddle.
            </p>

            <div className="grid grid-cols-2 gap-x-5 gap-y-[18px] mb-[30px]">
              <AttrCard
                icon="i-carbon"
                title="Surface — Ball interaction"
                description="Texture and construction are evaluated for feel, consistency, and durability."
              />
              <AttrCard
                icon="i-foam"
                title="Core — Response"
                description="Core behavior is reviewed across touch, pace, comfort, and repeat use."
              />
              <AttrCard
                icon="i-frame"
                title="Frame — Stability"
                description="Perimeter construction is assessed for stability, balance, and structural consistency."
              />
              <AttrCard
                icon="i-grip"
                title="Handle — Connection"
                description="Length, shape, and grip construction are evaluated for comfort, control, and confidence."
              />
            </div>

            <a href="#learn" className={cx(btnBase, btnOutline, btnSizeDefault)}>
              Read our approach
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-[14px] h-[14px]">
                <use href="#i-arrow-r" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
