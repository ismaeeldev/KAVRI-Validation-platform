import { OfflinePageContent } from "@/components/pwa/offline-page-content";

export const metadata = {
  title: "Offline — KAVRI",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return <OfflinePageContent />;
}
