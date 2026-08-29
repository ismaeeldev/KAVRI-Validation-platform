"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

// Only same-origin, tester-portal paths may be used as a post-authentication destination -
// prevents an emailed ?next= from turning this into an open redirect.
function safeNext(raw: string | null): string {
  if (!raw) return "/tester";
  if (!raw.startsWith("/tester")) return "/tester";
  if (raw.startsWith("//")) return "/tester";
  if (raw.startsWith("/tester/login")) return "/tester";
  return raw;
}

export function TesterMagicLinkForm() {
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));
  const linkError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleRequestLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Enter the email address KAVRI has on file for you.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await signIn.magicLink({
        email: email.trim().toLowerCase(),
        // better-auth appends the one-time token to its own /api/auth/magic-link/verify route and
        // redirects here once the session cookie is set - so an emailed assignment deep-link
        // survives the sign-in round trip.
        callbackURL: next,
        errorCallbackURL: `/tester/login?error=link_invalid&next=${encodeURIComponent(next)}`,
      });

      if (response?.error) {
        // The email service failing (e.g. RESEND_API_KEY missing) surfaces here rather than
        // silently looking like a success - see sendMagicLinkEmail in src/lib/email.ts.
        toast.error(
          response.error.message ||
            "We couldn't send your sign-in link right now. Please try again shortly, or reply to your KAVRI assignment email for help."
        );
      } else {
        setSent(true);
      }
    } catch {
      toast.error(
        "We couldn't send your sign-in link right now. Please try again shortly, or reply to your KAVRI assignment email for help."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-kavri-line bg-kavri-surface dark:bg-card">
      <CardHeader className="text-center">
        <CardTitle className="font-heading uppercase tracking-widest text-sm">Tester Sign In</CardTitle>
        <CardDescription className="text-xs">
          No password needed. We&apos;ll email you a one-time link that signs you straight in.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {linkError && !sent && (
          <p className="mb-4 rounded-sm border border-destructive/30 bg-destructive/5 p-3 font-mono text-[11px] leading-relaxed text-destructive">
            That sign-in link is no longer valid - links work once and expire after 15 minutes.
            Request a fresh one below.
          </p>
        )}

        {sent ? (
          <div className="space-y-3 text-center font-mono text-xs leading-relaxed">
            <p className="font-bold uppercase tracking-wider text-kavri-ink dark:text-foreground">
              Check your email
            </p>
            <p className="text-kavri-muted break-words">
              If <span className="text-kavri-ink dark:text-foreground">{email}</span> is registered
              as a KAVRI tester, a sign-in link is on its way. It works once and expires in 15
              minutes.
            </p>
            <button
              type="button"
              onClick={() => setSent(false)}
              className="text-kavri-signal hover:underline uppercase tracking-wider text-[10px] min-h-[44px]"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleRequestLink} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tester-email">Email Address</Label>
              <Input
                id="tester-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full max-w-full font-mono text-xs h-11 min-h-[44px]"
                placeholder="e.g. name@domain.com"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-kavri-ink text-kavri-paper dark:bg-foreground dark:text-background font-mono uppercase tracking-wider text-xs h-11 min-h-[44px]"
            >
              {isLoading ? "Sending link..." : "Email me a sign-in link"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
