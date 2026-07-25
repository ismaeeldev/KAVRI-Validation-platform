import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KAVRI Validation Platform",
  description: "Measured Performance Editorial & Verification Traceability System",
};

import { MotionProvider } from "@/components/brand/motion-provider";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased font-sans"
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <MotionProvider>
          {children}
          <Toaster richColors position="top-right" />
        </MotionProvider>
      </body>
    </html>
  );
}
