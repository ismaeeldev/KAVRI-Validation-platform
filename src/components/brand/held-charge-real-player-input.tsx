import Image from "next/image";
import { wrap, eyebrowOnDark, btnBase, btnOutlineOnDark, btnSizeDefault, cx } from "./held-charge-shared";

export function HeldChargeRealPlayerInput() {
  return (
    <section id="apply" className="bg-[var(--kv-night)] text-[var(--kv-night-text)] overflow-hidden">
      <div
        className={cx(
          wrap,
          "grid grid-cols-[1fr_0.9fr] gap-10 items-center py-24",
          "max-[900px]:grid-cols-1 max-[900px]:py-16"
        )}
      >
        <div>
          <span className={eyebrowOnDark}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-3 h-3 flex-none">
              <use href="#i-court" />
            </svg>
            REAL PLAYER INPUT
          </span>
          <h2 className="font-heading text-white text-[clamp(30px,4vw,46px)] mt-5 mb-4">
            Testing in the real world.
          </h2>
          <p className="text-[var(--kv-night-text-soft)] text-[16.5px] max-w-[440px] mb-7 font-sans">
            Selected players test assigned prototypes during real play. Their structured feedback
            helps KAVRI compare versions, identify issues, and decide what needs more work.
          </p>
          <div className="flex gap-3 flex-wrap">
            <a href="#form" className={cx(btnBase, btnOutlineOnDark, btnSizeDefault)}>
              Follow the Build
            </a>
          </div>
          <p className="text-[13px] text-[var(--kv-night-text-soft)] mt-4">
            Testing participation is currently by invitation.
          </p>
        </div>

        <div
          aria-hidden="true"
          className="relative h-[270px] min-w-0 before:content-[''] before:absolute before:inset-[-14%] before:pointer-events-none before:bg-[radial-gradient(ellipse_at_54%_42%,rgba(82,104,201,0.3)_0%,rgba(38,42,69,0.18)_46%,transparent_72%)]"
        >
          <Image
            src="/held-charge/paddle-tilt.webp"
            alt="KAVRI paddle, angled view"
            fill
            sizes="(max-width: 900px) 90vw, 45vw"
            className="relative object-contain [filter:drop-shadow(0_20px_28px_rgba(0,0,0,0.55))]"
          />
        </div>
      </div>
    </section>
  );
}
