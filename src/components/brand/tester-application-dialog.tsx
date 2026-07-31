"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { TesterApplicationForm } from "@/components/brand/tester-application-form";
import { Button } from "@/components/ui/button";

export function TesterApplicationDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            className="border-kavri-signal/40 text-kavri-signal hover:bg-kavri-signal/10 font-mono text-xs uppercase tracking-wider h-11 px-6 min-h-[44px] font-black cursor-pointer rounded-sm"
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
