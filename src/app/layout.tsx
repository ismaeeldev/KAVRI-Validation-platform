import type { Metadata } from "next";
import { Manrope, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { MotionProvider } from "@/components/brand/motion-provider";
import { NetworkStatusBanner } from "@/components/brand/network-status-banner";
import { Toaster } from "sonner";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-lp-sans",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-lp-display",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-lp-mono",
  display: "swap",
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://kavri.co";
const SITE_TITLE = "KAVRI Validation Platform";
const SITE_DESCRIPTION = "Measured Performance Editorial & Verification Traceability System";
const OG_IMAGE = "/kavri-hero-paddles.jpg";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased font-sans ${manrope.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <MotionProvider>
          <NetworkStatusBanner />
          {children}
          <Toaster richColors position="top-right" />
        </MotionProvider>
      </body>
    </html>
  );
}
