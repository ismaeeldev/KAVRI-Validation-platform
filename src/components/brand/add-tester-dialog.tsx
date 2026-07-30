"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { TesterCreateForm } from "@/components/brand/tester-create-form";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

export function AddTesterDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button className="bg-kavri-ink text-white hover:bg-neutral-800 font-sans text-xs font-bold h-10 px-4 rounded-lg flex items-center gap-1.5" />}
      >
        <UserPlus className="h-4 w-4" />
        <span>Add Tester</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading uppercase tracking-wider text-sm">Register Tester</DialogTitle>
          <DialogDescription className="text-xs">
            Onboard a pending play-tester by registering their details.
          </DialogDescription>
        </DialogHeader>
        <TesterCreateForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
