import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Shop Thrift Online | ThriftSpotter",
  description: "Can't find a thrift store near you? Shop secondhand clothing, furniture, and vintage finds online. Browse the best online thrift stores and resale platforms.",
  alternates: { canonical: "https://www.thriftspotter.com/shop-online" },
};

const PLATFORMS = [
  {
    name: "Depop",
    emoji: "👕",
    tagline: "Buy & sell vintage & streetwear",
    description: "Depop is the go-to app for Gen Z fashion lovers. Browse thousands of curated vintage clothing, streetwear, and designer pieces from independent sellers.",
    highlights: ["Vintage & streetwear", "100+ million items", "Buyer protection", "Easy returns"],
    color: "bg-blue-50 border-blue-200",
    accentColor: "bg-blue-600",
    textColor: "text-blue-700",
    url: "https://www.depop.com/?utm_source=thriftspotter",
    cta: "Shop Depop →",
  },
  {
    name: "Vinted",
    emoji: "🎨",
    tagline: "Secondhand marketplace for all",
    description: "Vinted is a community-powered secondhand marketplace with millions of items including clothing, shoes, and home goods at unbeatable prices.",
    highlights: ["All clothing categories", "Affordable prices", "Secure payments", "Fast shipping"],
    color: "bg-emerald-50 border-emerald-200",
    accentColor: "bg-emerald-600",
    textColor: "text-emerald-700",
    url: "https://www.vinted.com/?utm_source=thriftspotter",
    cta: "Shop Vinted →",
  },
  {
    name: "Mercari",
    emoji: "💎",
    tagline: "Buy & sell secondhand treasures",
    description: "Mercari is America's mobile marketplace for buying and selling secondhand items including fashion, collectibles, home goods, and more.",
    highlights: ["Fashion & electronics", "Great deals", "Buyer protection", "Free shipping on select items"],
    color: "bg-pink-50 border-pink-200",
    accentColor: "bg-pink-600",
    textColor: "text-pink-700",
    url: "https://www.mercari.com/?utm_source=thriftspotter",
    cta: "Shop Mercari →",
  },
  {
    name: "Etsy",
    emoji: "🎭",
    tagline: "Vintage, handmade & unique items",
    description: "Etsy is the largest marketplace for vintage goods, handmade items, and unique finds. Perfect for one-of-a-kind treasures and collectibles.",
    highlights: ["Vintage & handmade", "Unique & rare items", "Support independent sellers", "Global marketplace"],
    color: "bg-purple-50 border-purple-200",
    accentColor: "bg-purple-600",
    textColor: "text-purple-700",
    url: "https://www.etsy.com/search/vintage?utm_source=thriftspotter",
    cta: "Shop Etsy →",
  },
  {
    name: "Grailed",
    emoji: "👞",
    tagline: "Menswear & streetwear marketplace",
    description: "Grailed is the premier destination for designer menswear, vintage clothing, sneakers, and streetwear from sellers worldwide.",
    highlights: ["Designer menswear", "Sneakers & collectibles", "Auction & fixed price", "Authentication available"],
    color: "bg-slate-50 border-slate-200",
    accentColor: "bg-slate-700",
    textColor: "text-slate-700",
    url: "https://www.grailed.com/?utm_source=thriftspotter",
    cta: "Shop Grailed →",
  },
  {
    name: "The RealReal",
    emoji: "💼",
    tagline: "Luxury consignment & designer resale",
    description: "The RealReal is the leading online luxury consignment marketplace. Shop authenticated designer handbags, clothing, jewelry, and more.",
    highlights: ["Luxury designer items", "Authenticated goods", "Concierge service", "Free shipping over $250"],
    color: "bg-amber-50 border-amber-200",
    accentColor: "bg-amber-700",
    textColor: "text-amber-700",
    url: "https://www.therealreal.com/?utm_source=thriftspotter",
    cta: "Shop The RealReal →",
  },
  {
    name: "Vestiaire Collective",
    emoji: "✨",
    tagline: "Pre-owned fashion from around the world",
    description: "Vestiaire Collective is the global secondhand fashion marketplace with over 5 million items from luxury to everyday brands.",
    highlights: ["Designer fashion", "Global community", "Buyer protection", "Easy returns"],
    color: "bg-rose-50 border-rose-200",
    accentColor: "bg-rose-600",
    textColor: "text-rose-700",
    url: "https://www.vestiairecollective.com/?utm_source=thriftspotter",
    cta: "Shop Vestiaire →",
  },
  {
    name: "eBay",
    emoji: "🛒",
    tagline: "Vintage, antiques & secondhand finds",
    description: "eBay is one of the best places to find vintage clothing, antiques, collectibles, electronics, and unique secondhand items from sellers across the US.",
    highlights: ["Vintage & antiques", "Electronics & collectibles", "Auction & Buy It Now", "Buyer protection"],
    color: "bg-yellow-50 border-yellow-200",
    accentColor: "bg-yellow-500",
    textColor: "text-yellow-700",
    url: "https://ebay.com/sch/i.html?_nkw=vintage+secondhand&campid=7372111",
    cta: "Shop eBay →",
  },
  {
    name: "Amazon Second Chance",
    emoji: "📦",
    tagline: "Open-box, refurbished & pre-owned deals",
    description: "Amazon's Second Chance program offers pre-owned, refurbished, and open-box items across electronics, home goods, and more — all at significant discounts.",
    highlights: ["Electronics & gadgets", "Home & kitchen", "Amazon-verified condition", "Free shipping on eligible orders"],
    color: "bg-orange-50 border-orange-200",
    accentColor: "bg-orange-500",
    textColor: "text-orange-700",
    url: "https://www.amazon.com/second-chance?tag=thriftspotter-20",
    cta: "Shop Amazon →",
  },
];

const THRIFT_TOOLS = [
  {
    name: "Steamer for Clothes",
    desc: "Essential for freshening up thrift store finds",
    url: "https://www.amazon.com/s?k=clothes+steamer&tag=thriftspotter-20",
    emoji: "♨️",
  },
  {
    name: "Garment Rack",
    desc: "Organize your thrift hauls at home",
    url: "https://www.amazon.com/s?k=garment+rack&tag=thriftspotter-20",
    emoji: "🪝",
  },
  {
    name: "Fabric Shaver",
    desc: "Remove pilling from secondhand clothing",
    url: "https://www.amazon.com/s?k=fabric+shaver&tag=thriftspotter-20",
    emoji: "✂️",
  },
  {
    name: "Storage Bins",
    desc: "Sort and store your thrift finds",
    url: "https://www.amazon.com/s?k=storage+bins+closet&tag=thriftspotter-20",
    emoji: "📦",
  },
];

export default function ShopOnlinePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-stone-500 mb-6">
        <Link href="/" className="hover:text-brand-600">Home</Link>
        <span className="mx-2">›</span>
        <span className="text-stone-800 font-medium">Shop Online</span>
      </nav>

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-stone-900 mb-3">Shop Thrift Online</h1>
        <p className="text-stone-500 max-w-xl mx-auto leading-relaxed">
          Can&apos;t find a local thrift store near you? These online platforms carry millions of
          secondhand, vintage, and pre-owned items — delivered right to your door.
        </p>
      </div>

      {/* Platform cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {PLATFORMS.map((p) => (
          <div key={p.name} className={`rounded-2xl border p-6 flex flex-col ${p.color}`}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{p.emoji}</span>
              <div>
                <h2 className={`font-bold text-lg ${p.textColor}`}>{p.name}</h2>
                <p className="text-xs text-stone-500">{p.tagline}</p>
              </div>
            </div>
            <p className="text-stone-600 text-sm leading-relaxed mb-4">{p.description}</p>
            <ul className="space-y-1 mb-5">
              {p.highlights.map((h) => (
                <li key={h} className="text-xs text-stone-600 flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${p.accentColor}`} />
                  {h}
                </li>
              ))}
            </ul>
            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className={`mt-auto inline-block text-center text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-opacity hover:opacity-90 ${p.accentColor}`}
            >
              {p.cta}
            </a>
          </div>
        ))}
      </div>

      {/* Thrift tools section */}
      <section className="bg-brand-50 border border-brand-100 rounded-3xl p-8 mb-12">
        <h2 className="text-2xl font-bold text-stone-900 mb-2">Thrifter&apos;s Toolkit</h2>
        <p className="text-stone-500 text-sm mb-6">Essential products to care for and organize your thrift finds.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {THRIFT_TOOLS.map((t) => (
            <a
              key={t.name}
              href={t.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="bg-white rounded-xl border border-brand-100 p-4 hover:border-brand-400 hover:shadow-sm transition-all text-center group"
            >
              <div className="text-3xl mb-2">{t.emoji}</div>
              <p className="font-semibold text-stone-800 text-xs group-hover:text-brand-600 transition-colors">{t.name}</p>
              <p className="text-xs text-stone-400 mt-1 leading-tight">{t.desc}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Find local stores CTA */}
      <section className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-3xl p-8 text-white text-center">
        <h2 className="text-2xl font-bold mb-2">Prefer shopping in person?</h2>
        <p className="text-brand-100 mb-6 max-w-md mx-auto text-sm">
          ThriftSpotter lists 5,600+ thrift stores across all 50 US states. Find one near you — free.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="bg-white text-brand-700 font-bold px-6 py-3 rounded-xl hover:bg-brand-50 transition-colors text-sm"
          >
            Find stores near me →
          </Link>
          <Link
            href="/near-me"
            className="border border-white/40 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors text-sm"
          >
            📍 Use my location
          </Link>
        </div>
      </section>

      {/* Disclosure */}
      <p className="text-xs text-stone-400 text-center mt-8 leading-relaxed">
        ThriftSpotter may earn a commission when you click links on this page and make a purchase.
        This helps keep ThriftSpotter free for everyone. We only recommend platforms we genuinely believe in.
      </p>
    </div>
  );
}
