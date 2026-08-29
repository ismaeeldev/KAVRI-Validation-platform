"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";

// Step 6: the tester header previously rendered a no-op server-action form wrapping a plain link
// to /login, which never actually cleared the session. Testers are magic-link users now, so
// sign-out must really end the session and return them to /tester/login.
export function TesterSignOutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  return (
    <button
      type="button"
      disabled={isSigningOut}
      onClick={async () => {
        setIsSigningOut(true);
        try {
          await signOut();
        } finally {
          router.push("/tester/login");
          router.refresh();
        }
      }}
      className="text-destructive hover:underline uppercase font-bold whitespace-nowrap"
    >
      {isSigningOut ? "Signing out" : "Sign Out"}
    </button>
  );
}
