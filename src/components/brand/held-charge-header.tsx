"use client";

import { useEffect, useState } from "react";
import { wrap, btnBase, btnPrimary, btnSizeCompact, cx } from "./held-charge-shared";

const NAV_LINKS = [
  { href: "#build", label: "Development" },
  { href: "#journey", label: "How We Test" },
  { href: "#log", label: "The Log" },
];

export function HeldChargeHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[rgba(14,15,18,0.88)] backdrop-blur-[10px] border-b border-[var(--kv-night-line)]">
      <div className={cx(wrap, "flex items-center justify-between h-[68px]")}>
        <a href="#top" className="flex items-center gap-3 min-w-0 flex-none" aria-label="KAVRI home">
          <svg
            className="h-[30px] w-auto block fill-[var(--kv-ignition)] flex-none max-[600px]:h-[21px]"
            viewBox="0 0 370 282"
          >
            <use href="#mk-02C" />
          </svg>
          <svg
            className="h-[21px] w-auto block fill-[var(--kv-night-text)] flex-none max-[600px]:h-[14.5px]"
            viewBox="0 0 1637 179"
          >
            <use href="#wm-B2" />
          </svg>
        </a>

        <nav className="flex items-center gap-[22px] max-[600px]:gap-[10px]">
          <div className="flex gap-[26px] max-[920px]:hidden">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[13.5px] font-semibold text-[var(--kv-night-text-soft)] no-underline tracking-[0.01em] hover:text-[var(--kv-night-text)]"
              >
                {link.label}
              </a>
            ))}
          </div>

          <a
            href="/login"
            className="inline-flex items-center gap-[6px] text-[13px] font-semibold text-[var(--kv-night-text-soft)] no-underline tracking-[0.01em] whitespace-nowrap opacity-85 hover:opacity-100 hover:text-[var(--kv-night-text)] max-[920px]:hidden"
          >
            <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.6} className="w-[14px] h-[14px] stroke-current flex-none">
              <use href="#i-lock" />
            </svg>
            Team Login
          </a>

          <a href="#form" className={cx(btnBase, btnPrimary, btnSizeCompact, "max-[360px]:py-2 max-[360px]:px-[11px]")}>
            <span className="max-[600px]:hidden">Follow the Build</span>
            <span className="hidden max-[600px]:inline">Follow</span>
          </a>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="held-charge-mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="hidden max-[920px]:flex items-center justify-center bg-transparent border-none text-[var(--kv-night-text)] w-9 h-9 max-[600px]:w-8 max-[600px]:h-8 max-[360px]:w-[30px] max-[360px]:h-[30px] cursor-pointer p-0 rounded-md flex-none [-webkit-tap-highlight-color:transparent] hover:bg-[rgba(240,238,231,0.1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--kv-accent)] focus-visible:outline-offset-2"
          >
            {menuOpen ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5 max-[600px]:w-[18px] max-[600px]:h-[18px] flex-none">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5 max-[600px]:w-[18px] max-[600px]:h-[18px] flex-none">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </nav>
      </div>

      <div
        id="held-charge-mobile-nav"
        className={cx(
          menuOpen ? "flex" : "hidden",
          "flex-col bg-[#0e0f12] border-b border-[var(--kv-night-line)] pt-1 pb-3 px-8 max-[600px]:px-[22px]"
        )}
      >
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={() => setMenuOpen(false)}
            className="py-[13px] text-[15px] font-semibold text-[var(--kv-night-text-soft)] no-underline border-b border-[var(--kv-night-line)] last:border-b-0 hover:text-[var(--kv-night-text)]"
          >
            {link.label}
          </a>
        ))}
        <a
          href="/login"
          onClick={() => setMenuOpen(false)}
          className="py-[13px] text-[15px] font-semibold text-[var(--kv-night-text-soft)] no-underline border-b border-[var(--kv-night-line)] last:border-b-0 hover:text-[var(--kv-night-text)]"
        >
          Team Login
        </a>
      </div>
    </header>
  );
}
