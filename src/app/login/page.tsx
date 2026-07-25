"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { KAVRIWordmark } from "@/components/brand/wordmark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

import { Eye, EyeOff } from "lucide-react";

import { getCurrentUserRoleAction } from "@/server/actions/auth-actions";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await signIn.email({
        email,
        password,
      });

      if (response?.error) {
        toast.error(response.error.message || "Invalid credentials provided.");
      } else {
        // Query the role of the authenticated user to redirect correctly
        const roleData = await getCurrentUserRoleAction();
        toast.success("Logged in successfully.");
        if (roleData.role === "owner") {
          router.push("/owner");
        } else if (roleData.role === "tester") {
          router.push("/tester");
        } else {
          toast.error("Account profile role not assigned.");
        }
      }
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "An authentication error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-kavri-paper text-kavri-ink dark:bg-background dark:text-foreground">
      <div className="mb-8 select-none">
        <KAVRIWordmark />
      </div>

      <Card className="w-full max-w-md border-kavri-line bg-kavri-surface dark:bg-card">
        <CardHeader className="text-center">
          <CardTitle className="font-heading uppercase tracking-widest text-sm">Access Portal</CardTitle>
          <CardDescription className="text-xs">
            Log in to manage telemetry devices, active trials, and validation partners.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="font-mono text-xs"
                placeholder="e.g. name@domain.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="font-mono text-xs pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-kavri-muted hover:text-kavri-ink dark:hover:text-foreground cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 bg-kavri-ink text-kavri-paper dark:bg-foreground dark:text-background font-mono uppercase tracking-wider text-xs h-10"
            >
              {isLoading ? "Authenticating..." : "Log In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
