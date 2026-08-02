"use client";

import React, { useState } from "react";
import Link from "next/link";
import { KAVRIWordmark } from "./wordmark";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-kavri-line bg-kavri-paper/90 backdrop-blur-md select-none">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/">
          <KAVRIWordmark />
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/login"
            className="text-xs font-mono uppercase tracking-wider text-kavri-ink dark:text-foreground border border-kavri-line-strong hover:bg-kavri-ink hover:text-kavri-paper dark:hover:bg-foreground dark:hover:text-background px-3 py-1.5 rounded-sm transition-colors"
          >
            Access Portal
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="w-full border-t border-kavri-line bg-kavri-surface dark:bg-card py-8 select-none">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <KAVRIWordmark />
        <p className="text-[10px] font-mono uppercase tracking-wider text-kavri-muted">
          &copy; {new Date().getFullYear()} KAVRI. All rights reserved. Measured Performance Editorial.
        </p>
      </div>
    </footer>
  );
}

import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  ShoppingBag,
  Box,
  UserCheck,
  FileSpreadsheet,
  Rss,
  List,
  ShieldAlert,
  Menu,
  X,
  ClipboardList,
  AlertTriangle
} from "lucide-react";

const OWNER_NAV_LINKS = [
  { name: "Overview", href: "/owner", icon: LayoutDashboard },
  { name: "Suppliers", href: "/owner/suppliers", icon: Building2 },
  { name: "Products", href: "/owner/products", icon: ShoppingBag },
  { name: "Samples", href: "/owner/samples", icon: Box },
  { name: "Testers", href: "/owner/testers", icon: UserCheck },
  { name: "Rounds", href: "/owner/rounds", icon: ClipboardList },
  { name: "Assignments", href: "/owner/assignments", icon: FileSpreadsheet },
  { name: "Issues", href: "/owner/issues", icon: AlertTriangle },
  { name: "Public Updates", href: "/owner/updates", icon: Rss },
  { name: "Waitlist", href: "/owner/waitlist", icon: List },
];

export function OwnerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-kavri-surface border-r border-kavri-line h-screen sticky top-0 z-40">
      {/* Brand area - logo always routes back to the dashboard (UX-01) */}
      <Link
        href="/owner"
        className="h-16 flex flex-col justify-center px-6 border-b border-kavri-line select-none focus-visible:outline-2 focus-visible:outline-kavri-signal focus-visible:outline-offset-[-2px]"
      >
        <KAVRIWordmark />
        <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-kavri-muted mt-0.5">
          Owner Workspace
        </span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {OWNER_NAV_LINKS.map((link) => {
          const Icon = link.icon;
          const isActive = link.href === "/owner" 
            ? pathname === "/owner" 
            : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-3 px-4 py-2.5 text-xs font-sans font-medium rounded-md transition-all duration-150 group relative focus-visible:outline-2 focus-visible:outline-kavri-signal focus-visible:outline-offset-1 ${
                isActive
                  ? "bg-kavri-signal-soft text-kavri-ink font-semibold"
                  : "text-kavri-muted hover:text-kavri-ink hover:bg-kavri-surface-subtle"
              }`}
            >
              {/* Active vertical bar indicator */}
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-1 bg-kavri-signal rounded-r-full" />
              )}
              <Icon 
                className={`h-4 w-4 shrink-0 transition-colors ${
                  isActive ? "text-kavri-ink" : "text-kavri-muted-light group-hover:text-kavri-ink"
                }`} 
              />
              <span className="leading-none">{link.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Area / Security settings */}
      <div className="p-4 border-t border-kavri-line bg-[#fafaf8]">
        <Link
          href="/account/security"
          className="flex items-center justify-center gap-2 w-full py-2.5 text-xs font-sans font-medium text-kavri-muted hover:text-kavri-ink hover:bg-kavri-surface-subtle rounded-md border border-kavri-line transition-all focus-visible:outline-2 focus-visible:outline-kavri-signal"
        >
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>Security Settings</span>
        </Link>
      </div>
    </aside>
  );
}

export function OwnerMobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden w-full bg-kavri-surface border-b border-kavri-line sticky top-0 z-40 select-none">
      <div className="h-16 px-4 flex items-center justify-between">
        <Link href="/owner" className="flex flex-col focus-visible:outline-2 focus-visible:outline-kavri-signal" onClick={() => setIsOpen(false)}>
          <KAVRIWordmark />
          <span className="font-mono text-[7px] uppercase tracking-widest text-kavri-muted">
            Owner Workspace
          </span>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-kavri-ink focus:outline-none rounded-md focus:ring-2 focus:ring-kavri-signal"
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isOpen}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isOpen && (
        <nav className="px-3 pt-2 pb-5 space-y-1 border-t border-kavri-line bg-kavri-surface shadow-md">
          {OWNER_NAV_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = link.href === "/owner" 
              ? pathname === "/owner" 
              : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 text-xs font-sans font-medium rounded-md ${
                  isActive
                    ? "bg-kavri-signal-soft text-kavri-ink font-semibold"
                    : "text-kavri-muted hover:text-kavri-ink"
                }`}
              >
                <Icon className="h-4 w-4 text-current" />
                <span>{link.name}</span>
              </Link>
            );
          })}
          <div className="pt-4 border-t border-kavri-line mt-3">
            <Link
              href="/account/security"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 text-xs font-sans font-medium text-kavri-muted hover:text-kavri-ink hover:bg-kavri-surface-subtle rounded-md border border-kavri-line"
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Security Settings</span>
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
}

export function TesterHeader() {
  return (
    <header className="w-full bg-kavri-surface border-b border-kavri-line select-none">
      <div className="mx-auto max-w-lg px-4 h-16 flex items-center justify-between">
        <KAVRIWordmark />
        <Link
          href="/account/security"
          className="text-xs font-sans font-medium text-kavri-muted hover:text-kavri-ink transition-colors focus-visible:outline-2 focus-visible:outline-kavri-signal rounded-sm"
        >
          Security
        </Link>
      </div>
    </header>
  );
}
