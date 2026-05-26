import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "ThriftSpotter — Find Thrift Stores Near You", template: "%s | ThriftSpotter" },
  description: "Discover the best thrift stores, consignment shops, and secondhand stores across the United States.",
  keywords: ["thrift store", "secondhand", "consignment", "thrifting", "used clothing"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-brand-600 tracking-tight">
              🛍️ ThriftSpotter
            </Link>
            <nav className="flex gap-6 text-sm text-stone-600">
              <Link href="/" className="hover:text-brand-600 transition-colors">Browse</Link>
              <Link href="/about" className="hover:text-brand-600 transition-colors">About</Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="mt-16 border-t border-stone-200 bg-white text-center py-8 text-sm text-stone-500">
          © {new Date().getFullYear()} ThriftSpotter · Data from OpenStreetMap &amp; Yelp
        </footer>
      </body>
    </html>
  );
}
