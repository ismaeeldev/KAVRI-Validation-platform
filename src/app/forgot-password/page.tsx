import React from "react";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/brand/forgot-password-form";
import { KAVRIWordmark } from "@/components/brand/wordmark";

export const metadata = { robots: { index: false, follow: false } };

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-kavri-paper text-kavri-ink dark:bg-background dark:text-foreground">
      <div className="mb-8 select-none">
        <KAVRIWordmark />
      </div>
      <ForgotPasswordForm />
      <Link
        href="/"
        className="mt-6 font-mono text-[10px] uppercase tracking-wider text-kavri-muted hover:text-kavri-ink dark:hover:text-foreground transition-colors"
      >
        ← Return to KAVRI
      </Link>
    </div>
  );
}
