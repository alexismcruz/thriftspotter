import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { US_STATES, stateFromSlug, stateSlug } from "@/lib/utils";
import ShopCard from "@/components/ShopCard";
import FeaturedBanner from "@/components/FeaturedBanner";
import type { Metadata } from "next";

const PAGE_SIZE = 21;

type Props = { params: { state: string; city: string }; searchParams?: { page?: string } };

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
    ...(shopCount < 3 ? { robots: { index: false, follow: true } } : {}),
  };
}

export const revalidate = 3600;

export default async function CityPage({ params, searchParams }: Props) {
  const abbr = stateFromSlug(params.state)?.toUpperCase();
  if (!abbr || !US_STATES[abbr]) notFound();

  const stateName = US_STATES[abbr];
  const citySlugInput = params.city;
  const cityQuery = citySlugInput.replace(/-/g, " ");

  const page = Math.max(1, parseInt(searchParams?.page ?? "1") || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const cityWhere = { state: abbr, active: true, city: { equals: cityQuery, mode: "insensitive" as const } };

  const [totalCount, featuredShops, regularShops, featuredShop, nearbyCities] = await Promise.all([
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
      where: { ...cityWhere, featured: true },
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
        <p className="text-stone-500 mt-1">{totalShops} shop{totalShops !== 1 ? "s" : ""} found</p>
      </div>

      {/* Intro paragraph — only on page 1 */}
      {page === 1 && (
        <p className="text-stone-600 text-sm leading-relaxed mb-8 max-w-3xl">
          {cityIntro}
        </p>
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
