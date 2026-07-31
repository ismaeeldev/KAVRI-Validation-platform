import type { Metadata } from "next";
import "./globals.css";

// M5: production domain not yet confirmed - falls back to NEXT_PUBLIC_APP_URL (localhost in this
// environment). Flag for confirmation before this ships.
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://kavri.co";
const SITE_TITLE = "KAVRI Validation Platform";
const SITE_DESCRIPTION = "Measured Performance Editorial & Verification Traceability System";
// M6: final Open Graph social-preview image not yet provided - using the existing hero asset as
// a placeholder. Flag for a final asset before this ships.
const OG_IMAGE = "/paddle-hero.png";

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  metadataBase: new URL(APP_URL),
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: APP_URL,
    siteName: "KAVRI",
    images: [{ url: OG_IMAGE }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
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
