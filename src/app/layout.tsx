import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.thriftspotter.com"),
  title: { default: "ThriftSpotter — Find Thrift Stores Near You", template: "%s | ThriftSpotter" },
  description: "Discover thrift stores, consignment shops, and secondhand stores across all 50 states. Free directory, no sign-up needed.",
  alternates: { canonical: "https://www.thriftspotter.com" },
  openGraph: {
    type: "website",
    siteName: "ThriftSpotter",
    title: "ThriftSpotter — Find Thrift Stores Near You",
    description: "Discover thrift stores, consignment shops, and secondhand stores across all 50 states. Free directory, no sign-up needed.",
    url: "https://www.thriftspotter.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "ThriftSpotter — Find Thrift Stores Near You",
    description: "Discover thrift stores, consignment shops, and secondhand stores across all 50 states. Free directory, no sign-up needed.",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans`}>
        <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-heading font-bold text-brand-600 tracking-tight text-xl">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" className="w-8 h-8 shrink-0">
                <rect width="240" height="240" rx="44" fill="#0d9488"/>
                <path d="M 80,28 Q 64,28 64,44 L 64,162 L 120,202 L 176,162 L 176,44 Q 176,28 160,28 Z" fill="white"/>
                <circle cx="120" cy="57" r="12" fill="#0d9488"/>
                <circle cx="111" cy="114" r="27" fill="none" stroke="#0d9488" stroke-width="11"/>
                <line x1="130" y1="133" x2="154" y2="157" stroke="#0d9488" stroke-width="11" stroke-linecap="round"/>
              </svg>
              ThriftSpotter
            </Link>
            <nav className="flex gap-6 text-sm text-stone-600">
              <Link href="/" className="hover:text-brand-600 transition-colors">Browse</Link>
              <Link href="/advertise" className="hover:text-brand-600 transition-colors font-medium text-brand-600">Advertise</Link>
              <Link href="/blog" className="hover:text-brand-600 transition-colors">Blog</Link>
              <Link href="/about" className="hover:text-brand-600 transition-colors">About</Link>
            </nav>
          </div>
        </header>

        <main>{children}</main>

        {/* Advertise CTA */}
        <section className="bg-gradient-to-r from-brand-600 to-brand-700 text-white py-10 px-4 mt-16">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div>
              <h3 className="text-xl font-bold mb-1">Own a business?</h3>
              <p className="text-brand-100 text-sm">Get featured on ThriftSpotter and drive more foot traffic to your business.</p>
            </div>
            <Link
              href="/advertise"
              className="shrink-0 bg-white text-brand-600 hover:bg-brand-50 font-semibold px-6 py-3 rounded-lg transition-colors text-sm"
            >
              Get Featured →
            </Link>
          </div>
        </section>

        <Footer />
        <Analytics />
        {/* Google Analytics */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-1S2P6TH1XT" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-1S2P6TH1XT');
          `}
        </Script>
      </body>
    </html>
  );
}
