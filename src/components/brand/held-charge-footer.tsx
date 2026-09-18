import { wrap, cx } from "./held-charge-shared";

export function HeldChargeFooter() {
  return (
    <footer className="bg-[var(--kv-paper)] border-t border-[var(--kv-line)]">
      <div className={wrap}>
        <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-8 pt-[60px] pb-11 max-[640px]:grid-cols-2 max-[460px]:grid-cols-1">
          <div>
            <div className="flex items-center gap-3 min-w-0 flex-none">
              <svg viewBox="0 0 370 282" className="h-9 w-auto block fill-[var(--kv-ink)] flex-none">
                <use href="#mk-02C" />
              </svg>
              <svg viewBox="0 0 1637 179" className="h-[25px] w-auto block fill-[var(--kv-ink)] flex-none">
                <use href="#wm-B2" />
              </svg>
            </div>
            <p className="text-[var(--kv-ink-soft)] text-sm mt-[10px] max-w-[220px] font-sans">
              A pickleball brand built in the open.
            </p>
          </div>

          <div>
            <h5 className="font-mono text-[11px] tracking-[.08em] uppercase text-[var(--kv-ink-faint)] mb-4">
              Explore
            </h5>
            <ul className="list-none m-0 p-0 flex flex-col gap-[11px]">
              <li>
                <a href="#top" className="text-sm no-underline text-[var(--kv-ink-soft)] inline-flex items-center gap-2 hover:text-[var(--kv-ink)]">
                  Home
                </a>
              </li>
              <li>
                <a href="#build" className="text-sm no-underline text-[var(--kv-ink-soft)] inline-flex items-center gap-2 hover:text-[var(--kv-ink)]">
                  Development
                </a>
              </li>
              <li>
                <a href="#journey" className="text-sm no-underline text-[var(--kv-ink-soft)] inline-flex items-center gap-2 hover:text-[var(--kv-ink)]">
                  How We Test
                </a>
              </li>
              <li>
                <a href="#log" className="text-sm no-underline text-[var(--kv-ink-soft)] inline-flex items-center gap-2 hover:text-[var(--kv-ink)]">
                  The Log
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-mono text-[11px] tracking-[.08em] uppercase text-[var(--kv-ink-faint)] mb-4">
              Connect
            </h5>
            <ul className="list-none m-0 p-0 flex flex-col gap-[11px]">
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm no-underline text-[var(--kv-ink-soft)] inline-flex items-center gap-2 hover:text-[var(--kv-ink)]"
                >
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.5} className="w-[15px] h-[15px] stroke-[var(--kv-ink-soft)] flex-none">
                    <use href="#i-ig" />
                  </svg>
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@kavri.com"
                  className="text-sm no-underline text-[var(--kv-ink-soft)] inline-flex items-center gap-2 hover:text-[var(--kv-ink)]"
                >
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.5} className="w-[15px] h-[15px] stroke-[var(--kv-ink-soft)] flex-none">
                    <use href="#i-mail" />
                  </svg>
                  hello@kavri.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[var(--kv-line)] py-5 flex justify-between flex-wrap gap-3 text-[12.5px] text-[var(--kv-ink-faint)]">
          <div className="inline-flex items-center gap-[9px]">
            <span>© {new Date().getFullYear()} KAVRI. All rights reserved.</span>
            <svg aria-hidden="true" viewBox="0 0 370 282" className="w-3 h-auto opacity-45 pointer-events-none flex-none fill-[var(--kv-ink-faint)]">
              <use href="#mk-02C" />
            </svg>
          </div>
          <div>
            <a href="#" className="text-[var(--kv-ink-faint)] no-underline ml-[18px] hover:text-[var(--kv-ink-soft)]">
              Privacy Policy
            </a>
            <a href="#" className="text-[var(--kv-ink-faint)] no-underline ml-[18px] hover:text-[var(--kv-ink-soft)]">
              Terms of Use
            </a>
            <a href="/login" className={cx("text-[var(--kv-ink-faint)] no-underline ml-[18px] hover:text-[var(--kv-ink-soft)]")}>
              Team Login
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
