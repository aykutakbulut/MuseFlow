import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PlayerProvider } from "../contexts/PlayerContext";
import { Player } from "../components/player/Player";
import { LibraryProvider } from "../contexts/LibraryContext";
import { ErrorBoundary } from "../components/ui/ErrorBoundary";
import { I18nProvider } from "../contexts/I18nContext";
import { PWAProvider } from "../contexts/PWAContext";
import { InstallBanner } from "../components/ui/InstallBanner";

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  manifest: "/manifest.json",
  title: "MuseFlow — Müzik Keşfet ve Dinle",
  description:
    "MuseFlow ile YouTube'dan müzik arayın, keşfedin ve dinleyin. Playlist oluşturun, favorilerinizi yönetin.",
  openGraph: {
    title: "MuseFlow — Müzik Keşfet ve Dinle",
    description:
      "MuseFlow ile YouTube'dan müzik arayın, keşfedin ve dinleyin. Playlist oluşturun, favorilerinizi yönetin.",
    type: "website",
    locale: "tr_TR",
    siteName: "MuseFlow",
  },
  twitter: {
    card: "summary_large_image",
    title: "MuseFlow — Müzik Keşfet ve Dinle",
    description:
      "MuseFlow ile YouTube'dan müzik arayın, keşfedin ve dinleyin.",
  },
  robots: {
    index: true,
    follow: true,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MuseFlow",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className="font-sans antialiased"
      >
        <I18nProvider>
          <PWAProvider>
            <ErrorBoundary>
              <PlayerProvider>
                <LibraryProvider>
                  {children}
                  <Player />
                  <InstallBanner />
                </LibraryProvider>
              </PlayerProvider>
            </ErrorBoundary>
          </PWAProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
