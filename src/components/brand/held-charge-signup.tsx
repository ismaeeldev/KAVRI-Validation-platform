import Image from "next/image";
import { wrap, eyebrowOnDark, cx } from "./held-charge-shared";
import { WaitlistForm } from "./waitlist-form";

export function HeldChargeSignup() {
  return (
    <section id="form" className="bg-[var(--kv-night)] text-[var(--kv-night-text)] overflow-hidden relative">
      <svg
        aria-hidden="true"
        viewBox="0 0 370 282"
        className="absolute top-1/2 right-[2%] w-auto h-[110%] -translate-y-1/2 fill-[var(--kv-paper)] opacity-5 pointer-events-none z-0 max-[900px]:top-[72%] max-[900px]:right-[-8%] max-[900px]:h-[78%]"
      >
        <use href="#mk-02C" />
      </svg>

      <div
        className={cx(
          wrap,
          "relative z-[1] grid grid-cols-[1fr_0.9fr] gap-10 items-center pt-14 pb-[100px]",
          "max-[900px]:grid-cols-1 max-[900px]:pt-10 max-[900px]:pb-16"
        )}
      >
        <div>
          <span className={eyebrowOnDark}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-3 h-3 flex-none">
              <use href="#i-play-outline" />
            </svg>
            FOLLOW THE BUILD
          </span>
          <h2 className="font-heading text-white text-[clamp(30px,4vw,44px)] mt-5 mb-4">
            Follow what comes next.
          </h2>
          <p className="text-[var(--kv-night-text-soft)] text-base max-w-[420px] mb-[30px] font-sans">
            Get occasional updates when KAVRI reaches a meaningful development milestone.
          </p>

          <WaitlistForm ctaSource="update" variant="held-charge" />
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
