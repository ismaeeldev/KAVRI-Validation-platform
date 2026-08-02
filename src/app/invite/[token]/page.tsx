import React from "react";
import type { Metadata } from "next";
import { verifyInvitation } from "@/server/services/invitation-service";
import { TesterInviteForm } from "@/components/brand/tester-invite-form";
import { KAVRIWordmark } from "@/components/brand/wordmark";

export const revalidate = 0;
export const metadata: Metadata = { robots: { index: false, follow: false } };

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function InviteAcceptancePage({ params }: PageProps) {
  const { token } = await params;
  let invitation;
  let errorMsg = null;

  try {
    invitation = await verifyInvitation(token);
  } catch (error: unknown) {
    const err = error as Error;
    errorMsg = err.message || "The security token verification check failed.";
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-kavri-paper text-kavri-ink dark:bg-background dark:text-foreground">
        <div className="mb-8 select-none">
          <KAVRIWordmark />
        </div>
        <div className="w-full max-w-md p-6 border border-destructive/20 bg-destructive/5 rounded-sm text-center space-y-4 font-mono text-xs">
          <h3 className="font-heading uppercase tracking-widest text-destructive font-bold">
            Portal Access Blocked
          </h3>
          <p className="text-kavri-ink dark:text-foreground leading-relaxed">
            {errorMsg}
          </p>
          <div className="pt-2">
            <a
              href="/login"
              className="text-kavri-signal hover:underline uppercase tracking-wider text-[10px]"
            >
              Return to Access Portal
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-kavri-paper text-kavri-ink dark:bg-background dark:text-foreground">
      <div className="mb-8 select-none">
        <KAVRIWordmark />
      </div>
      <TesterInviteForm
        token={token}
        initialName={invitation!.testerProfile.displayName}
        email={invitation!.testerProfile.emailNormalized}
      />
    </div>
  );
}
