import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { US_STATES, stateFromSlug, stateSlug, slugify } from "@/lib/utils";
import ShopCard from "@/components/ShopCard";
import FeaturedBanner from "@/components/FeaturedBanner";
import type { Metadata } from "next";

const PAGE_SIZE = 21;

type Props = { params: { state: string; city: string }; searchParams?: { page?: string; category?: string } };

const CATEGORY_EMOJIS: Record<string, string> = {
  "Thrift Store": "🛍️",
  "Clothing Resale": "👗",
  "Furniture & Home": "🪑",
  "Vintage Store": "✨",
  "Books & Media": "📚",
  "Nonprofit Resale": "💚",
  "Electronics": "💻",
  "Consignment Shop": "🏷️",
  "Sports & Outdoors": "⚽",
  "Kids & Baby": "👶",
  "Jewelry & Accessories": "💎",
  "Building Materials": "🔨",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const abbr = stateFromSlug(params.state)?.toUpperCase();
  const stateName = abbr ? US_STATES[abbr] : null;
  if (!stateName) return {};
  // Resolve real city name by slug match (handles punctuation like "Lee's Summit")
  const citiesInState = await prisma.shop.findMany({
    where: { state: abbr, active: true },
    select: { city: true },
    distinct: ["city"],
  });
  const matchedCity = citiesInState.find((c) => slugify(c.city) === params.city)?.city;
  const cityName = matchedCity ?? params.city.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const shopCount = matchedCity
    ? await prisma.shop.count({ where: { state: abbr, active: true, city: { equals: matchedCity, mode: "insensitive" } } })
    : 0;
  const canonical = `https://www.thriftspotter.com/${params.state}/${params.city}`;
  return {
    title: `Thrift Stores in ${cityName}, ${abbr}`,
    description: `Find ${shopCount} thrift stores and consignment shops in ${cityName}, ${stateName}. Browse secondhand stores, view hours, addresses, and directions — free.`,
    alternates: { canonical },
    openGraph: {
      title: `Thrift Stores in ${cityName}, ${abbr} | ThriftSpotter`,
      description: `Find ${shopCount} thrift stores and consignment shops in ${cityName}, ${stateName}.`,
      url: canonical,
    },
    ...(shopCount < 3 ? { robots: { index: false, follow: true } } : {}),
  };
}

export const revalidate = 3600;

export default async function CityPage({ params, searchParams }: Props) {
  const abbr = stateFromSlug(params.state)?.toUpperCase();
  if (!abbr || !US_STATES[abbr]) notFound();

  const stateName = US_STATES[abbr];
  const citySlugInput = params.city;

  // Resolve the real city name by slug match. slugify() strips punctuation
  // (periods, apostrophes), so a naive dash→space reversal misses cities like
  // "Lee's Summit" (lees-summit) or "St. Chico" (st-chico) and 404s them.
  const citiesInState = await prisma.shop.findMany({
    where: { state: abbr, active: true },
    select: { city: true },
    distinct: ["city"],
  });
  const matchedCity = citiesInState.find((c) => slugify(c.city) === citySlugInput)?.city;
  if (!matchedCity) notFound();
  const cityQuery = matchedCity;

  const page = Math.max(1, parseInt(searchParams?.page ?? "1") || 1);
  const skip = (page - 1) * PAGE_SIZE;
  const activeCategory = searchParams?.category ?? null;

  const cityWhere = {
    state: abbr,
    active: true,
    city: { equals: cityQuery, mode: "insensitive" as const },
    ...(activeCategory ? { categories: { has: activeCategory } } : {}),
  };

  const [totalCount, featuredShops, regularShops, featuredShop, nearbyCities, allCityShops] = await Promise.all([
    prisma.shop.count({ where: { ...cityWhere, featured: false } }),
    page === 1
      ? prisma.shop.findMany({ where: { ...cityWhere, featured: true }, orderBy: { rating: "desc" } })
      : Promise.resolve([]),
    prisma.shop.findMany({
      where: { ...cityWhere, featured: false },
      orderBy: { rating: "desc" },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.shop.findFirst({
      where: { state: abbr, active: true, city: { equals: cityQuery, mode: "insensitive" }, featured: true },
      select: { id: true, name: true, slug: true, address: true, city: true, state: true, phone: true, website: true, description: true },
    }),
    prisma.shop.groupBy({
      by: ["city"],
      where: { state: abbr, active: true, NOT: { city: { equals: cityQuery, mode: "insensitive" } } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 6,
    }),
    // Fetch all categories for this city (unfiltered) for the filter pills
    prisma.shop.findMany({
      where: { state: abbr, active: true, city: { equals: cityQuery, mode: "insensitive" } },
      select: { categories: true },
    }),
  ]);

  // Build available category list from all city shops
  const allCategoryCounts = allCityShops.flatMap((s) => s.categories).reduce<Record<string, number>>((acc, cat) => {
    acc[cat] = (acc[cat] ?? 0) + 1;
    return acc;
  }, {});
  const availableCategories = Object.entries(allCategoryCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, count]) => ({ cat, count }));

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const totalShops = totalCount + featuredShops.length;

  if (totalShops === 0) notFound();

  const cityName = regularShops[0]?.city || featuredShops[0]?.city || cityQuery.replace(/\b\w/g, c => c.toUpperCase());
  const stSlug = stateSlug(abbr);

  // Aggregate top categories from all fetched shops
  const allCategories = [...featuredShops, ...regularShops].flatMap((s) => s.categories);
  const categoryCounts = allCategories.reduce<Record<string, number>>((acc, cat) => {
    acc[cat] = (acc[cat] ?? 0) + 1;
    return acc;
  }, {});
  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat]) => cat);

  // Build unique intro paragraph (page 1 only)
  const topShopNames = [...featuredShops, ...regularShops].slice(0, 3).map(s => s.name);
  const uniqueCategories = Array.from(new Set([...featuredShops, ...regularShops].flatMap(s => s.categories))).filter(c => c !== "Thrift Store").slice(0, 2);
  const catText = uniqueCategories.length > 0
    ? ` including ${uniqueCategories.map(c => c.toLowerCase()).join(" and ")}`
    : "";
  const shopNameText = topShopNames.length >= 2
    ? ` Popular spots include ${topShopNames.slice(0, -1).join(", ")} and ${topShopNames.at(-1)}.`
    : topShopNames.length === 1 ? ` ${topShopNames[0]} is the go-to spot for secondhand finds in the area.` : "";
  const storeWord = totalShops === 1 ? "store" : "stores";
  const sizeText = totalShops >= 20
    ? `${cityName} is one of ${stateName}'s top thrifting destinations, with ${totalShops} thrift ${storeWord} and consignment shops${catText} listed on ThriftSpotter.`
    : totalShops >= 5
    ? `${cityName}, ${stateName} has ${totalShops} thrift ${storeWord} and secondhand shops${catText} listed on ThriftSpotter.`
    : `${cityName}, ${stateName} has ${totalShops} secondhand ${storeWord} listed on ThriftSpotter.`;
  const cityIntro = `${sizeText}${shopNameText} Browse below to find addresses, phone numbers, hours, and directions — all free, no sign-up needed.`;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.thriftspotter.com" },
      { "@type": "ListItem", position: 2, name: stateName, item: `https://www.thriftspotter.com/${stSlug}` },
      { "@type": "ListItem", position: 3, name: cityName },
    ],
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Thrift Stores in ${cityName}, ${abbr}`,
    numberOfItems: totalShops,
    itemListElement: [...featuredShops, ...regularShops].slice(0, 10).map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: s.name,
      url: `https://www.thriftspotter.com/shop/${s.slug}`,
    })),
  };

  const baseUrl = `/${stSlug}/${citySlugInput}`;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `How many thrift stores are in ${cityName}, ${abbr}?`,
        acceptedAnswer: { "@type": "Answer", text: `There are ${totalShops} thrift stores and secondhand shops listed in ${cityName}, ${stateName} on ThriftSpotter.` },
      },
      {
        "@type": "Question",
        name: `Where can I find thrift stores in ${cityName}, ${stateName}?`,
        acceptedAnswer: { "@type": "Answer", text: `ThriftSpotter lists all thrift stores, consignment shops, and secondhand retailers in ${cityName}, ${abbr}. Browse all ${totalShops} locations, get directions via Google Maps, and find contact information — free.` },
      },
      {
        "@type": "Question",
        name: `Are thrift stores in ${cityName} free to browse on ThriftSpotter?`,
        acceptedAnswer: { "@type": "Answer", text: `Yes — ThriftSpotter is completely free. No sign-up, no account, no fees. Simply browse thrift store listings in ${cityName} and go thrifting.` },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    <div className="max-w-6xl mx-auto px-4 py-10">
      <nav className="text-sm text-stone-500 mb-6">
        <Link href="/" className="hover:text-brand-600">Home</Link>
        <span className="mx-2">›</span>
        <Link href={`/${stSlug}`} className="hover:text-brand-600">{stateName}</Link>
        <span className="mx-2">›</span>
        <span className="text-stone-800 font-medium">{cityName}</span>
      </nav>

      <div className="mb-4">
        <h1 className="text-3xl font-bold">Thrift Stores in {cityName}, {abbr}</h1>
        <p className="text-stone-500 mt-1">{totalShops} shop{totalShops !== 1 ? "s" : ""} found</p>
      </div>

      {/* Intro paragraph — only on page 1 */}
      {page === 1 && (
        <p className="text-stone-600 text-sm leading-relaxed mb-6 max-w-3xl">
          {cityIntro}
        </p>
      )}

      {/* Category filter pills */}
      {availableCategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <Link
            href={`/${params.state}/${citySlugInput}`}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
              !activeCategory
                ? "bg-brand-600 text-white border-brand-600"
                : "bg-white text-stone-600 border-stone-200 hover:border-brand-400 hover:text-brand-600"
            }`}
          >
            All
          </Link>
          {availableCategories.map(({ cat, count }) => (
            <Link
              key={cat}
              href={`/${params.state}/${citySlugInput}?category=${encodeURIComponent(cat)}`}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                activeCategory === cat
                  ? "bg-brand-600 text-white border-brand-600"
                  : "bg-white text-stone-600 border-stone-200 hover:border-brand-400 hover:text-brand-600"
              }`}
            >
              {CATEGORY_EMOJIS[cat] ?? "🏪"} {cat}
              <span className={`text-xs ${activeCategory === cat ? "text-brand-200" : "text-stone-400"}`}>({count})</span>
            </Link>
          ))}
        </div>
      )}

      {/* Featured banner — only on page 1 */}
      {page === 1 && (
        <div className="mb-8">
          <FeaturedBanner shop={featuredShop} locationLabel={`${cityName}, ${abbr}`} />
        </div>
      )}

      {/* Sponsored cards — only on page 1 */}
      {page === 1 && featuredShops.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Sponsored</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredShops.map((shop) => (
              <ShopCard key={shop.id} shop={{ ...shop, featured: true }} />
            ))}
          </div>
          <hr className="my-6 border-stone-200" />
        </div>
      )}

      {/* Regular listings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {regularShops.map((shop) => (
          <ShopCard key={shop.id} shop={shop} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          {page > 1 && (
            <Link
              href={`${baseUrl}${page - 1 === 1 ? "" : `?page=${page - 1}`}`}
              className="px-4 py-2 rounded-lg border border-stone-200 text-sm hover:border-brand-400 hover:text-brand-600 transition-colors"
            >
              ← Previous
            </Link>
          )}

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`${baseUrl}${p === 1 ? "" : `?page=${p}`}`}
              className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm border transition-colors ${
                p === page
                  ? "bg-brand-600 text-white border-brand-600 font-semibold"
                  : "border-stone-200 hover:border-brand-400 hover:text-brand-600"
              }`}
            >
              {p}
            </Link>
          ))}

          {page < totalPages && (
            <Link
              href={`${baseUrl}?page=${page + 1}`}
              className="px-4 py-2 rounded-lg border border-stone-200 text-sm hover:border-brand-400 hover:text-brand-600 transition-colors"
            >
              Next →
            </Link>
          )}
        </div>
      )}

      {/* SEO content + FAQ — only on page 1 */}
      {page === 1 && (
        <div className="mt-14 space-y-10">

          {/* Keyword-rich summary block */}
          <section className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-3">Thrift Stores in {cityName}, {abbr} — Free Directory</h2>
            <div className="text-stone-600 text-sm leading-relaxed space-y-3">
              <p>
                ThriftSpotter lists {totalShops} thrift {totalShops === 1 ? "store" : "stores"} and secondhand shops in {cityName}, {stateName}.
                Each listing includes the store address, phone number, website, and a direct link to Google Maps so you can get directions instantly — all free, no sign-up needed.
              </p>
              <p>
                Whether you&apos;re looking for gently used clothing, affordable furniture, vintage finds, books, electronics, or everyday household items,
                {cityName}&apos;s thrift scene has something for every budget. Inventory at thrift stores rotates constantly, so visiting regularly always turns up something new.
              </p>
              <p>
                Own a thrift store or resale shop in {cityName}? <Link href="/advertise" className="text-brand-600 hover:underline font-medium">Get your business listed for free</Link> and
                get in front of shoppers actively searching for secondhand stores in your area.
              </p>
            </div>
          </section>

          {/* FAQ section */}
          <section>
            <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {[
                {
                  q: `How many thrift stores are in ${cityName}, ${abbr}?`,
                  a: `There are ${totalShops} thrift ${totalShops === 1 ? "store" : "stores"} and secondhand shops listed in ${cityName}, ${stateName} on ThriftSpotter. Browse all listings above for addresses, phone numbers, and directions.`,
                },
                {
                  q: `Where can I find thrift stores in ${cityName}, ${stateName}?`,
                  a: `ThriftSpotter lists all the thrift stores, consignment shops, and secondhand retailers in ${cityName}, ${abbr}. You can browse all ${totalShops} locations above, get directions via Google Maps, and find contact information — completely free.`,
                },
                {
                  q: `What types of secondhand stores are in ${cityName}?`,
                  a: `${cityName} has a variety of secondhand stores including ${Array.from(new Set([...featuredShops, ...regularShops].flatMap(s => s.categories))).slice(0, 4).join(", ") || "thrift stores, consignment shops, and vintage stores"}. Browse the listings above to find the type of store you're looking for.`,
                },
                {
                  q: `Are thrift stores in ${cityName} free to browse on ThriftSpotter?`,
                  a: `Yes — ThriftSpotter is completely free to use. No sign-up, no account, no fees. Simply browse thrift store listings in ${cityName}, get directions, and go thrifting.`,
                },
              ].map(({ q, a }) => (
                <details key={q} className="group bg-white border border-stone-200 rounded-xl overflow-hidden">
                  <summary className="flex items-center justify-between px-5 py-4 cursor-pointer font-medium text-stone-800 text-sm hover:bg-stone-50 transition-colors list-none">
                    {q}
                    <span className="text-stone-400 group-open:rotate-180 transition-transform shrink-0 ml-3">▾</span>
                  </summary>
                  <div className="px-5 pb-4 text-sm text-stone-600 leading-relaxed border-t border-stone-100 pt-3">
                    {a}
                  </div>
                </details>
              ))}
            </div>
          </section>

        </div>
      )}

      {/* Nearby cities — internal linking */}
      {nearbyCities.length > 0 && (
        <div className="mt-14 pt-10 border-t border-stone-200">
          <h2 className="text-lg font-bold text-stone-900 mb-1">More thrift stores in {stateName}</h2>
          <p className="text-stone-500 text-sm mb-4">Browse other cities near {cityName}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {nearbyCities.map(({ city, _count }) => (
              <Link
                key={city}
                href={`/${stSlug}/${city.toLowerCase().replace(/\s+/g, "-")}`}
                className="bg-white rounded-lg border border-stone-200 px-4 py-3 hover:border-brand-400 hover:bg-brand-50 transition-colors"
              >
                <span className="font-medium block text-stone-900 text-sm">{city}</span>
                <span className="text-xs text-stone-400">{_count.id} shop{_count.id !== 1 ? "s" : ""}</span>
              </Link>
            ))}
          </div>
          <Link href={`/${stSlug}`} className="inline-block mt-4 text-sm text-brand-600 hover:underline">
            View all cities in {stateName} →
          </Link>
        </div>
      )}
    </div>
    </>
  );
}
