import React from "react";
import type { Metadata } from "next";

// login/page.tsx is a "use client" component, which cannot export metadata directly - this
// layout is the noindex gate for it.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
