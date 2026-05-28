import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { US_STATES, stateFromSlug, stateSlug } from "@/lib/utils";
import ShopCard from "@/components/ShopCard";
import FeaturedBanner from "@/components/FeaturedBanner";
import type { Metadata } from "next";

type Props = { params: { state: string; city: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const abbr = stateFromSlug(params.state)?.toUpperCase();
  const stateName = abbr ? US_STATES[abbr] : null;
  if (!stateName) return {};
  const cityName = params.city.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const shopCount = await prisma.shop.count({
    where: { state: abbr, active: true, city: { equals: params.city.replace(/-/g, " "), mode: "insensitive" } },
  });
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
  };
}

export const revalidate = 3600;

export default async function CityPage({ params }: Props) {
  const abbr = stateFromSlug(params.state)?.toUpperCase();
  if (!abbr || !US_STATES[abbr]) notFound();

  const stateName = US_STATES[abbr];
  const citySlugInput = params.city;
  const cityQuery = citySlugInput.replace(/-/g, " ");

  const [shops, featuredShop, nearbyCities] = await Promise.all([
    prisma.shop.findMany({
      where: { state: abbr, active: true, city: { equals: cityQuery, mode: "insensitive" } },
      orderBy: [{ featured: "desc" }, { rating: "desc" }],
    }),
    prisma.shop.findFirst({
      where: { state: abbr, active: true, featured: true, city: { equals: cityQuery, mode: "insensitive" } },
      select: { id: true, name: true, slug: true, address: true, city: true, state: true, phone: true, website: true, description: true },
    }),
    prisma.shop.groupBy({
      by: ["city"],
      where: { state: abbr, active: true, NOT: { city: { equals: cityQuery, mode: "insensitive" } } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 6,
    }),
  ]);

  if (shops.length === 0) notFound();

  const cityName = shops[0].city;
  const stSlug = stateSlug(abbr);
  const regularShops = shops.filter((s) => !s.featured);

  // Aggregate top categories from all shops in this city
  const allCategories = shops.flatMap((s) => s.categories);
  const categoryCounts = allCategories.reduce<Record<string, number>>((acc, cat) => {
    acc[cat] = (acc[cat] ?? 0) + 1;
    return acc;
  }, {});
  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat]) => cat);

  // Build unique intro paragraph from real data
  const storeWord = shops.length === 1 ? "store" : "stores";
  const catText = topCategories.length >= 2
    ? ` — from ${topCategories[0].toLowerCase()} to ${topCategories[1].toLowerCase()}`
    : topCategories.length === 1 ? ` specialising in ${topCategories[0].toLowerCase()}` : "";
  const sizeText = shops.length >= 20
    ? `${cityName} is one of ${stateName}'s top thrifting destinations, with ${shops.length} thrift ${storeWord} and consignment shops${catText} listed on ThriftSpotter.`
    : `${cityName}, ${stateName} has ${shops.length} secondhand ${storeWord}${catText} listed on ThriftSpotter.`;
  const cityIntro = `${sizeText} Browse below to find addresses, phone numbers, hours, and directions — all free, no sign-up needed.`;

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
    numberOfItems: shops.length,
    itemListElement: shops.slice(0, 10).map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: s.name,
      url: `https://www.thriftspotter.com/shop/${s.slug}`,
    })),
  };

  const sponsoredShops = shops.filter((s) => s.featured);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
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
        <p className="text-stone-500 mt-1">{shops.length} shop{shops.length !== 1 ? "s" : ""} found</p>
      </div>

      {/* Intro paragraph — unique per city, keyword-rich for SEO */}
      <p className="text-stone-600 text-sm leading-relaxed mb-8 max-w-3xl">
        {cityIntro}
      </p>

      {/* Featured banner */}
      <div className="mb-8">
        <FeaturedBanner shop={featuredShop} locationLabel={`${cityName}, ${abbr}`} />
      </div>

      {/* Sponsored cards at top */}
      {sponsoredShops.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Sponsored</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sponsoredShops.map((shop) => (
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
