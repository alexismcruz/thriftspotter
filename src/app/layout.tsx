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
  verification: {
    yandex: "0dd9cc69ad01a924",
    other: {
      "msvalidate.01": ["5A05CE81891A60CA87B2515CD7F821CA"],
    },
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
                <path d="M 120,90 C 120,66 134,50 152,48 C 170,46 181,61 175,76 C 169,89 155,92 140,90" fill="none" stroke="white" strokeWidth="13" strokeLinecap="round"/>
                <path d="M 120,90 Q 74,112 32,185" fill="none" stroke="white" strokeWidth="13" strokeLinecap="round"/>
                <path d="M 120,90 Q 166,112 208,185" fill="none" stroke="white" strokeWidth="13" strokeLinecap="round"/>
                <line x1="23" y1="185" x2="217" y2="185" stroke="white" strokeWidth="13" strokeLinecap="round"/>
                <line x1="120" y1="90" x2="120" y2="115" stroke="white" strokeWidth="5" strokeDasharray="3,3"/>
                <rect x="108" y="115" width="24" height="18" rx="3" fill="white"/>
                <circle cx="120" cy="115" r="3" fill="#0d9488"/>
              </svg>
              ThriftSpotter
            </Link>
            <nav className="flex gap-6 text-sm text-stone-600">
              <Link href="/" className="hover:text-brand-600 transition-colors">Browse</Link>
              <Link href="/shop-online" className="hover:text-brand-600 transition-colors">Shop Online</Link>
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
