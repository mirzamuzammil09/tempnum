import type { Metadata } from "next";
import "./globals.css";
import Spotlight from "../components/Spotlight";
import Header from "../components/Header";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://tempnum.vercel.app'),
  title: {
    default: "TempNum | Public Virtual Phone Numbers & SMS Viewer",
    template: "%s | TempNum"
  },
  description: "Bypass verification securely with public virtual numbers. Test text routing, verify integrations, and inspect SMS delivery logs.",
  keywords: ["virtual numbers", "free otp receiver", "receive sms online", "bypass otp", "temp phone number", "disposable phone numbers", "privacy sms", "receive sms online free"],
  authors: [{ name: "TempNum Team" }],
  creator: "TempNum",
  publisher: "TempNum",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "TempNum | Public Virtual Phone Numbers & SMS Viewer",
    description: "Access virtual numbers to test SMS routing and verify integrations. Keep your personal numbers private.",
    type: "website",
    locale: "en_US",
    siteName: "TempNum",
  },
  twitter: {
    card: "summary_large_image",
    title: "TempNum | Public Virtual Phone Numbers & SMS Viewer",
    description: "Access virtual numbers to test SMS routing and verify integrations. Keep your personal numbers private.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="relative min-h-screen bg-zinc-950 font-sans text-zinc-100 antialiased selection:bg-zinc-850 selection:text-zinc-50">
        <Spotlight />
        
        {/* Background Gradients and Grid */}
        <div className="fixed inset-0 -z-50 pointer-events-none">
          <div className="absolute inset-0 dot-grid opacity-100" />
        </div>

        {/* Header navigation */}
        <Header />

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 min-h-[calc(100vh-180px)]">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-zinc-900 bg-zinc-950/80 py-8 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
            <p className="text-center text-xs text-zinc-500">
              &copy; {new Date().getFullYear()} TempNum. All rights reserved.
            </p>
            <div className="flex gap-6 text-xs text-zinc-500">
              <a href="/privacy" className="transition-colors hover:text-zinc-300">Privacy Policy</a>
              <a href="/terms" className="transition-colors hover:text-zinc-300">Terms of Service</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
