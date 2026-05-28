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

  const [shops, featuredShop] = await Promise.all([
    prisma.shop.findMany({
      where: { state: abbr, active: true, city: { equals: cityQuery, mode: "insensitive" } },
      orderBy: [{ featured: "desc" }, { rating: "desc" }],
    }),
    prisma.shop.findFirst({
      where: { state: abbr, active: true, featured: true, city: { equals: cityQuery, mode: "insensitive" } },
      select: { id: true, name: true, slug: true, address: true, city: true, state: true, phone: true, website: true, description: true },
    }),
  ]);

  if (shops.length === 0) notFound();

  const cityName = shops[0].city;
  const stSlug = stateSlug(abbr);
  const regularShops = shops.filter((s) => !s.featured);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.thriftspotter.com" },
      { "@type": "ListItem", position: 2, name: stateName, item: `https://www.thriftspotter.com/${stSlug}` },
      { "@type": "ListItem", position: 3, name: cityName },
    ],
  };
  const sponsoredShops = shops.filter((s) => s.featured);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
    <div className="max-w-6xl mx-auto px-4 py-10">
      <nav className="text-sm text-stone-500 mb-6">
        <Link href="/" className="hover:text-brand-600">Home</Link>
        <span className="mx-2">›</span>
        <Link href={`/${stSlug}`} className="hover:text-brand-600">{stateName}</Link>
        <span className="mx-2">›</span>
        <span className="text-stone-800 font-medium">{cityName}</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Thrift Stores in {cityName}, {abbr}</h1>
        <p className="text-stone-500 mt-1">{shops.length} shop{shops.length !== 1 ? "s" : ""} found</p>
      </div>

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
    </div>
    </>
  );
}
