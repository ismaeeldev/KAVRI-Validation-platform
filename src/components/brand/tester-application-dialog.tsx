"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { TesterApplicationForm } from "@/components/brand/tester-application-form";
import { Button } from "@/components/ui/button";

// Two visual variants because this trigger renders against very different backgrounds:
// "light" (white nav bar) needs dark, high-contrast text; "dark" (the near-black Join the Build
// section) can use the lime accent color since it reads clearly there. Using the lime-on-
// transparent style unconditionally (the previous implementation) made the button hard to see
// wherever it sat on a light background - low contrast, easy to miss.
const TRIGGER_STYLES = {
  light:
    "border-kavri-line text-kavri-ink bg-kavri-surface hover:bg-kavri-surface-subtle hover:border-kavri-line-strong",
  // The base Button's outline variant defaults to bg-background (light theme colour) regardless
  // of page context - must override explicitly to bg-transparent here, otherwise this renders as
  // a pale box that clashes with the dark section instead of blending into it.
  // Hover inverts to a solid lime fill with dark ink text (same pattern as the primary "Join the
  // Build" button beside it) - a subtle lime-tinted transparent hover washed the lime text into
  // the lime background and was nearly unreadable while hovering.
  dark: "border-kavri-signal/40 text-kavri-signal bg-transparent hover:bg-kavri-signal hover:text-kavri-signal-ink hover:border-kavri-signal",
} as const;

interface TesterApplicationDialogProps {
  variant?: keyof typeof TRIGGER_STYLES;
}

export function TesterApplicationDialog({ variant = "light" }: TesterApplicationDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            className={`${TRIGGER_STYLES[variant]} font-mono text-xs uppercase tracking-wider h-11 px-6 min-h-[44px] font-black cursor-pointer rounded-sm`}
          />
        }
      >
        Apply to Test
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading uppercase tracking-wider text-sm">Apply to Test</DialogTitle>
          <DialogDescription className="text-xs">
            Tell us a bit about yourself and we will reach out about upcoming test rounds.
          </DialogDescription>
        </DialogHeader>
        <TesterApplicationForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
