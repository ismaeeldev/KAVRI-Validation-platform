import type { Metadata, Viewport } from "next";
import {
  Manrope,
  Space_Grotesk,
  JetBrains_Mono,
  Big_Shoulders,
  Inter,
  IBM_Plex_Mono,
} from "next/font/google";
import "./globals.css";
import { MotionProvider } from "@/components/brand/motion-provider";
import { NetworkStatusBanner } from "@/components/brand/network-status-banner";
import { PwaRootProvider } from "@/components/pwa/pwa-root-provider";
import {
  PWA_APP_NAME,
  PWA_BACKGROUND_COLOR,
  PWA_DESCRIPTION,
  PWA_SHORT_NAME,
  PWA_THEME_COLOR,
  pwaIconUrl,
} from "@/lib/pwa/config";
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

// "Held Charge" redesign typefaces (client-provided landing page redesign).
// Google Fonts ships "Big Shoulders Display" as a width axis on the base
// "Big Shoulders" family; next/font/google in this Next.js version exposes
// the family itself (no separate per-width export), which renders the same
// display-weight glyphs the client's design specifies.
const bigShouldersDisplay = Big_Shoulders({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-kv-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-kv-body",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-kv-mono",
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
  applicationName: PWA_APP_NAME,
  appleWebApp: {
    capable: true,
    title: PWA_SHORT_NAME,
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      {
        url: "/KAVRI_02C_favicon_light-mode.png",
        media: "(prefers-color-scheme: light)",
        type: "image/png",
      },
      {
        url: "/KAVRI_02C_favicon_dark-mode.png",
        media: "(prefers-color-scheme: dark)",
        type: "image/png",
      },
      { url: pwaIconUrl(192), sizes: "192x192", type: "image/png" },
      { url: pwaIconUrl(512), sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: pwaIconUrl(180), sizes: "180x180", type: "image/png" }],
  },
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

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: PWA_BACKGROUND_COLOR },
    { media: "(prefers-color-scheme: dark)", color: PWA_THEME_COLOR },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased font-sans ${manrope.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} ${bigShouldersDisplay.variable} ${inter.variable} ${ibmPlexMono.variable}`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <PwaRootProvider>
          <MotionProvider>
            <NetworkStatusBanner />
            {children}
            <Toaster richColors position="top-right" />
          </MotionProvider>
        </PwaRootProvider>
      </body>
    </html>
  );
}
