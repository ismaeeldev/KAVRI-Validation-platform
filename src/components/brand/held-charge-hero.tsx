import Image from "next/image";
import { wrap, eyebrowOnDark, btnBase, btnPrimary, btnOutlineOnDark, btnSizeDefault, cx } from "./held-charge-shared";

export function HeldChargeHero() {
  return (
    <section className="bg-[var(--kv-night)] text-[var(--kv-night-text)] overflow-hidden border-b border-[var(--kv-night-line)]">
      <div
        className={cx(
          wrap,
          "grid grid-cols-[1.08fr_0.92fr] items-center gap-12 pt-16 pb-14",
          "max-[900px]:grid-cols-1 max-[900px]:pt-11"
        )}
      >
        <div>
          <span className={cx(eyebrowOnDark, "mb-[22px]")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-3 h-3 flex-none">
              <use href="#i-broadcast" />
            </svg>
            BUILDING IN PUBLIC
          </span>

          <h1 className="font-heading text-[clamp(26px,4.4vw,44px)] leading-[1.05] mb-5">
            A paddle is a hundred decisions.
            <br />
            We&apos;re publishing ours.
          </h1>

          <p className="text-[17.5px] text-[var(--kv-night-text-soft)] max-w-[460px] mb-8 font-sans">
            KAVRI is a pickleball brand developing its first paddle through measured testing, real
            play, and documented decisions.
          </p>

          <div className="flex gap-3 flex-wrap mb-7">
            <a href="#form" className={cx(btnBase, btnPrimary, btnSizeDefault)}>
              Follow the Build
            </a>
            <a href="#build" className={cx(btnBase, btnOutlineOnDark, btnSizeDefault)}>
              Explore Current Testing
            </a>
          </div>
        </div>

        <div className="relative h-[430px] max-[900px]:h-[320px] before:content-[''] before:absolute before:inset-[-12%] before:pointer-events-none before:bg-[radial-gradient(ellipse_at_56%_36%,rgba(82,104,201,0.32)_0%,rgba(38,42,69,0.2)_46%,transparent_72%)]">
          <Image
            src="/held-charge/paddle-flat.webp"
            alt="KAVRI paddle, front view"
            fill
            priority
            sizes="(max-width: 900px) 90vw, 45vw"
            className="relative object-contain [filter:drop-shadow(0_26px_34px_rgba(0,0,0,0.55))]"
          />
        </div>
      </div>
    </section>
  );
}
