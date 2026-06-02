import { prisma } from "@/lib/db";
import SearchBar from "@/components/SearchBar";
import StateGrid from "@/components/StateGrid";
import ShopCard from "@/components/ShopCard";
import Link from "next/link";
import { stateSlug, slugify } from "@/lib/utils";

async function getStateCounts(): Promise<Record<string, number>> {
  const rows = await prisma.shop.groupBy({
    by: ["state"],
    where: { active: true },
    _count: { id: true },
  });
  return Object.fromEntries(rows.map((r) => [r.state, r._count.id]));
}

async function getFeaturedShops() {
  return prisma.shop.findMany({
    where: { active: true, featured: true },
    take: 6,
    orderBy: { rating: "desc" },
  });
}

async function getPopularCities() {
  return prisma.shop.groupBy({
    by: ["city", "state"],
    where: { active: true },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 8,
  });
}

async function getRecentShops() {
  return prisma.shop.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
    take: 6,
  });
}

export const revalidate = 3600;

const CATEGORIES = [
  { name: "Thrift Store",       emoji: "🛍️", color: "bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100",     slug: "thrift-store" },
  { name: "Clothing Resale",    emoji: "👗", color: "bg-violet-50 border-violet-200 text-violet-700 hover:bg-violet-100", slug: "clothing-resale" },
  { name: "Furniture & Home",   emoji: "🛋️", color: "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100",  slug: "furniture-home" },
  { name: "Vintage Store",      emoji: "✨", color: "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100",      slug: "vintage-store" },
  { name: "Books & Media",      emoji: "📚", color: "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100",      slug: "books-media" },
  { name: "Nonprofit Resale",   emoji: "💚", color: "bg-green-50 border-green-200 text-green-700 hover:bg-green-100",  slug: "nonprofit-resale" },
  { name: "Electronics",        emoji: "💻", color: "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100", slug: "electronics" },
  { name: "Consignment Shop",   emoji: "🏷️", color: "bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100", slug: "consignment-shop" },
];

export default async function HomePage() {
  const [counts, featured, popularCities, recentShops] = await Promise.all([
    getStateCounts(),
    getFeaturedShops(),
    getPopularCities(),
    getRecentShops(),
  ]);
  const totalShops = Object.values(counts).reduce((a, b) => a + b, 0);
  const totalStates = Object.keys(counts).length;

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ThriftSpotter",
    url: "https://www.thriftspotter.com",
    description: `Free directory of ${totalShops.toLocaleString()}+ thrift stores and consignment shops across all 50 US states.`,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: "https://www.thriftspotter.com/?q={search_term_string}" },
      "query-input": "required name=search_term_string",
    },
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ThriftSpotter",
    url: "https://www.thriftspotter.com",
    description: "Free online directory helping shoppers find thrift stores, consignment shops, and secondhand stores across the United States.",
    email: "hello@thriftspotter.com",
    sameAs: ["https://www.thriftspotter.com"],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
    <div>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 text-white py-20 sm:py-32 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(rgba(255,255,255,0.6) 1.5px, transparent 1.5px)', backgroundSize: '22px 22px'}} />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <span className="inline-block bg-white/20 text-white text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
            Free · No sign-up needed
          </span>
          <h1 className="text-5xl sm:text-7xl font-heading font-bold mb-5 leading-tight tracking-tight">
            Find Thrift Stores<br className="hidden sm:block" /> Near You
          </h1>
          <p className="text-brand-100 mb-10 text-xl max-w-xl mx-auto leading-relaxed">
            {totalShops > 0
              ? `${totalShops.toLocaleString()}+ thrift shops across all ${totalStates} states — free to search, no sign-up.`
              : "Discover thrift shops, consignment stores, and secondhand finds across the US."}
          </p>
          <div className="flex justify-center px-4">
            <SearchBar />
          </div>
          <p className="text-brand-200 text-sm mt-5">
            Popular: <Link href="/illinois/chicago" className="underline hover:text-white transition-colors">Chicago</Link> · <Link href="/california/los-angeles" className="underline hover:text-white transition-colors">Los Angeles</Link> · <Link href="/texas/austin" className="underline hover:text-white transition-colors">Austin</Link> · <Link href="/oregon/portland" className="underline hover:text-white transition-colors">Portland</Link>
          </p>
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-white border-b border-stone-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6 grid grid-cols-3 divide-x divide-stone-200 text-center">
          {[
            { stat: `${totalShops.toLocaleString()}+`, label: "Businesses listed", emoji: "🏪" },
            { stat: `${totalStates}`, label: "States covered", emoji: "🗺️" },
            { stat: "100%", label: "Free to use", emoji: "💸" },
          ].map(({ stat, label, emoji }) => (
            <div key={label} className="px-4">
              <div className="text-2xl mb-1">{emoji}</div>
              <div className="text-2xl font-bold text-brand-600">{stat}</div>
              <div className="text-xs text-stone-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-14 space-y-20">

        {/* Browse by Category */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">What are you looking for?</h2>
            <p className="text-stone-500">Browse by the type of secondhand store near you</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CATEGORIES.map(({ name, emoji, color, slug }) => (
              <Link
                key={name}
                href={`/category/${slug}`}
                className={`card-lift flex flex-col items-center gap-2 px-4 py-5 rounded-2xl border text-center font-semibold text-sm transition-all ${color}`}
              >
                <span className="text-3xl">{emoji}</span>
                <span>{name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured / Sponsored shops */}
        {featured.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Featured Businesses</h2>
                <p className="text-stone-500 text-sm mt-1">Sponsored listings from local business owners</p>
              </div>
              <span className="text-xs text-terra-600 bg-terra-50 border border-terra-100 px-3 py-1 rounded-full font-medium">⭐ Sponsored</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featured.map((shop) => (
                <ShopCard key={shop.id} shop={{ ...shop, featured: true }} />
              ))}
            </div>
          </section>
        )}

        {/* Recently added */}
        {recentShops.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Recently Added</h2>
                <p className="text-stone-500 text-sm mt-1">New stores added to the directory</p>
              </div>
              <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full font-medium">🆕 New</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentShops.map((shop) => (
                <ShopCard key={shop.id} shop={shop} />
              ))}
            </div>
          </section>
        )}

        {/* How it works */}
        <section className="bg-gradient-to-br from-brand-50 to-teal-50 rounded-3xl p-8 sm:p-12 border border-brand-100">
          <h2 className="text-2xl font-bold text-center mb-10">How ThriftSpotter works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              { emoji: "🔍", title: "Search your area", desc: "Type your city or state to instantly find nearby thrift stores and consignment shops." },
              { emoji: "📍", title: "Explore listings", desc: "Browse shop details, addresses, phone numbers, descriptions and open in Google Maps." },
              { emoji: "🛍️", title: "Go thrifting", desc: "Find your next great deal. New businesses are added regularly across all 50 states." },
            ].map(({ emoji, title, desc }) => (
              <div key={title} className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-3xl mb-4 border border-brand-100">
                  {emoji}
                </div>
                <h3 className="font-bold text-stone-900 mb-2">{title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Popular cities */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Popular Cities</h2>
              <p className="text-stone-500 text-sm mt-1">Most active thrifting destinations</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {popularCities.map(({ city, state, _count }) => (
              <Link
                key={`${city}-${state}`}
                href={`/${stateSlug(state)}/${slugify(city)}`}
                className="card-lift bg-white rounded-2xl border border-stone-200 px-4 py-5 hover:border-brand-400 hover:bg-brand-50 transition-all group"
              >
                <div className="text-2xl mb-2">🏙️</div>
                <div className="font-bold text-stone-900 group-hover:text-brand-700 leading-tight">{city}</div>
                <div className="text-xs text-stone-400 mt-0.5">{state} · {_count.id} shops</div>
              </Link>
            ))}
          </div>
        </section>

        {/* Browse by state */}
        <section>
          <h2 className="text-2xl font-bold mb-2">Browse by State</h2>
          <p className="text-stone-500 text-sm mb-6">Click any state to explore thrift stores by city. The bar shows relative shop density.</p>
          <StateGrid counts={counts} />
        </section>

        {/* SEO content block */}
        <section className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12">
          <h2 className="text-2xl font-bold mb-4">Find Thrift Stores Across the US — Free</h2>
          <div className="prose prose-stone max-w-none text-stone-600 text-sm leading-relaxed space-y-4">
            <p>
              ThriftSpotter is a free online directory of thrift stores, consignment shops, vintage stores, and secondhand
              retailers across all 50 US states. Whether you&apos;re hunting for vintage clothing, affordable furniture,
              used books, or everyday household items at a fraction of retail price — ThriftSpotter helps you find the
              best local spots without any sign-up or fees.
            </p>
            <p>
              With over {totalShops.toLocaleString()} businesses listed across {totalStates} states, ThriftSpotter covers
              everything from large national chains like Goodwill and Salvation Army to hidden-gem independent thrift
              boutiques in your neighborhood. Each listing includes the store&apos;s address, phone number, website, and
              a direct link to Google Maps so you can get directions instantly.
            </p>
            <p>
              Thrift shopping is one of the best ways to save money, reduce waste, and find one-of-a-kind items you
              won&apos;t see anywhere else. Inventory at thrift stores rotates constantly — which means visiting
              regularly always turns up something new. Use ThriftSpotter to discover stores you never knew existed
              in your city or state.
            </p>
            <p>
              Are you a thrift store or resale shop owner? <a href="/advertise" className="text-brand-600 hover:underline font-medium">Get your business listed for free</a> on
              ThriftSpotter and get in front of thousands of shoppers actively searching for secondhand stores near them.
            </p>
          </div>
        </section>

        {/* Business owner CTA */}
        <section className="bg-gradient-to-r from-terra-400 to-terra-500 rounded-3xl p-8 sm:p-12 text-white text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Own a thrift or resale business?</h2>
          <p className="text-terra-100 mb-6 max-w-xl mx-auto">
            Get your business in front of thousands of shoppers actively looking for stores in your area. Free to list, no sign-up required.
          </p>
          <Link
            href="/advertise"
            className="inline-block bg-white text-terra-600 hover:bg-terra-50 font-bold px-8 py-4 rounded-xl transition-colors text-sm shadow-sm"
          >
            View listing options →
          </Link>
        </section>

      </div>
    </div>
    </>
  );
}
