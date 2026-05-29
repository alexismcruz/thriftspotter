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

export const revalidate = 3600;

export default async function HomePage() {
  const [counts, featured, popularCities] = await Promise.all([
    getStateCounts(),
    getFeaturedShops(),
    getPopularCities(),
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
      <section className="bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 text-white py-16 sm:py-28 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block bg-brand-500/40 text-brand-100 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-6">
            Free · No sign-up needed
          </span>
          <h1 className="text-4xl sm:text-6xl font-heading font-bold mb-5 leading-tight tracking-tight">
            Find Thrift Stores<br className="hidden sm:block" /> Near You
          </h1>
          <p className="text-brand-100 mb-8 text-lg max-w-xl mx-auto">
            {totalShops > 0
              ? `Discover ${totalShops.toLocaleString()}+ thrift shops, consignment stores, and secondhand finds across all ${totalStates} states.`
              : "Discover thrift shops, consignment stores, and secondhand finds across the US."}
          </p>
          <div className="flex justify-center">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-white border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-4 py-6 grid grid-cols-3 divide-x divide-stone-200 text-center">
          {[
            { stat: `${totalShops.toLocaleString()}+`, label: "Businesses listed" },
            { stat: `${totalStates}`, label: "States covered" },
            { stat: "100%", label: "Free to use" },
          ].map(({ stat, label }) => (
            <div key={label} className="px-4">
              <div className="text-2xl font-bold text-brand-600">{stat}</div>
              <div className="text-xs text-stone-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">

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

        {/* How it works */}
        <section className="bg-brand-50 rounded-2xl p-8 sm:p-12">
          <h2 className="text-2xl font-bold text-center mb-10">How ThriftSpotter works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              { emoji: "🔍", title: "Search your area", desc: "Type your city or state to instantly find nearby thrift stores and consignment shops." },
              { emoji: "📍", title: "Explore listings", desc: "Browse shop details, addresses, phone numbers, descriptions and open in Google Maps." },
              { emoji: "🛍️", title: "Go thrifting", desc: "Find your next great deal. New businesses are added regularly across all 50 states." },
            ].map(({ emoji, title, desc }) => (
              <div key={title}>
                <div className="text-4xl mb-4">{emoji}</div>
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
                className="bg-white rounded-xl border border-stone-200 px-4 py-4 hover:border-brand-400 hover:bg-brand-50 transition-colors group"
              >
                <div className="font-semibold text-stone-900 group-hover:text-brand-700 leading-tight">{city}</div>
                <div className="text-xs text-stone-400 mt-0.5">{state} · {_count.id} shops</div>
              </Link>
            ))}
          </div>
        </section>

        {/* Browse by state */}
        <section>
          <h2 className="text-2xl font-bold mb-2">Browse by State</h2>
          <p className="text-stone-500 text-sm mb-6">Click any state to explore thrift stores by city.</p>
          <StateGrid counts={counts} />
        </section>

        {/* SEO content block */}
        <section className="bg-white rounded-2xl border border-stone-200 p-8 sm:p-12">
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
        <section className="bg-gradient-to-r from-terra-400 to-terra-500 rounded-2xl p-8 sm:p-12 text-white text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Own a thrift or resale business?</h2>
          <p className="text-terra-100 mb-6 max-w-xl mx-auto">
            Get your business in front of thousands of shoppers actively looking for stores in your area. Free to list, no sign-up required.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/advertise"
              className="bg-white text-terra-600 hover:bg-terra-50 font-bold px-6 py-3 rounded-xl transition-colors text-sm"
            >
              View listing options →
            </Link>
          </div>
        </section>

      </div>
    </div>
    </>
  );
}
