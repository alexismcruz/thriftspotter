import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });

export const metadata: Metadata = {
  title: { default: "ThriftSpotter — Find Thrift Stores Near You", template: "%s | ThriftSpotter" },
  description: "Discover the best thrift stores, consignment shops, and secondhand stores across the United States.",
  keywords: ["thrift store", "secondhand", "consignment", "thrifting", "used clothing"],
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
            <Link href="/" className="text-xl font-heading font-bold text-brand-600 tracking-tight">
              🛍️ ThriftSpotter
            </Link>
            <nav className="flex gap-6 text-sm text-stone-600">
              <Link href="/" className="hover:text-brand-600 transition-colors">Browse</Link>
              <Link href="/advertise" className="hover:text-brand-600 transition-colors font-medium text-brand-600">Advertise</Link>
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

        <footer className="border-t border-stone-200 bg-white text-center py-8 text-sm text-stone-500">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3">
            <span>© {new Date().getFullYear()} ThriftSpotter</span>
            <div className="flex gap-6">
              <Link href="/about" className="hover:text-brand-600">About</Link>
              <Link href="/advertise" className="hover:text-brand-600">Advertise</Link>
              <a href="mailto:hello@thriftspotter.com" className="hover:text-brand-600">Contact</a>
            </div>
            <span>Data from OpenStreetMap</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
