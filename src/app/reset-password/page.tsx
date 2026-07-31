import React from "react";
import Link from "next/link";
import { ResetPasswordForm } from "@/components/brand/reset-password-form";
import { KAVRIWordmark } from "@/components/brand/wordmark";

export const metadata = { robots: { index: false, follow: false } };

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string; error?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token, error } = await searchParams;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-kavri-paper text-kavri-ink dark:bg-background dark:text-foreground">
      <div className="mb-8 select-none">
        <KAVRIWordmark />
      </div>

      {!token || error ? (
        <div className="w-full max-w-md p-6 border border-destructive/20 bg-destructive/5 rounded-sm text-center space-y-4 font-mono text-xs">
          <h3 className="font-heading uppercase tracking-widest text-destructive font-bold">
            Reset Link Invalid or Expired
          </h3>
          <p className="text-kavri-ink dark:text-foreground leading-relaxed">
            Please request a new password reset link.
          </p>
          <div className="pt-2">
            <a href="/forgot-password" className="text-kavri-signal hover:underline uppercase tracking-wider text-[10px]">
              Request New Link
            </a>
          </div>
        </div>
      ) : (
        <ResetPasswordForm token={token} />
      )}

      <Link
        href="/"
        className="mt-6 font-mono text-[10px] uppercase tracking-wider text-kavri-muted hover:text-kavri-ink dark:hover:text-foreground transition-colors"
      >
        ← Return to KAVRI
      </Link>
    </div>
  );
}
