import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { US_STATES, stateFromSlug, slugify } from "@/lib/utils";
import { STATE_CENTERS, getStateZoom } from "@/lib/state-centers";
import ShopMapWrapper from "@/components/ShopMapWrapper";
import FeaturedBanner from "@/components/FeaturedBanner";
import BusinessRequestModal from "@/components/BusinessRequestModal";
import SearchBar from "@/components/SearchBar";
import type { Metadata } from "next";

type Props = { params: { state: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const abbr = stateFromSlug(params.state)?.toUpperCase();
  const stateName = abbr ? US_STATES[abbr] : null;
  if (!stateName) return {};
  return {
    title: `Thrift Stores in ${stateName}`,
    description: `Browse thrift stores and consignment shops across ${stateName}.`,
  };
}

export const revalidate = 3600;

export default async function StatePage({ params }: Props) {
  const abbr = stateFromSlug(params.state)?.toUpperCase();
  if (!abbr || !US_STATES[abbr]) notFound();

  const stateName = US_STATES[abbr];

  const [cities, shopsWithCoords, featuredShop] = await Promise.all([
    prisma.shop.groupBy({
      by: ["city"],
      where: { state: abbr, active: true },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),
    prisma.shop.findMany({
      where: { state: abbr, active: true, lat: { not: null }, lng: { not: null } },
      select: { id: true, name: true, slug: true, address: true, city: true, state: true, lat: true, lng: true },
    }),
    prisma.shop.findFirst({
      where: { state: abbr, active: true, featured: true },
      select: { id: true, name: true, slug: true, address: true, city: true, state: true, phone: true, website: true, description: true },
    }),
  ]);

  const center = STATE_CENTERS[abbr] ?? [39.5, -98.35];
  const zoom = getStateZoom(abbr);
  const pins = shopsWithCoords.filter((s) => s.lat !== null && s.lng !== null) as {
    id: number; name: string; slug: string; address: string; city: string; state: string; lat: number; lng: number;
  }[];

  const totalShops = cities.reduce((a, c) => a + c._count.id, 0);
  const isEmpty = cities.length === 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <nav className="text-sm text-stone-500 mb-6">
        <Link href="/" className="hover:text-brand-600">Home</Link>
        <span className="mx-2">›</span>
        <span className="text-stone-800 font-medium">{stateName}</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Thrift Stores in {stateName}</h1>
          <p className="text-stone-500 mt-1">
            {isEmpty ? "Listings coming soon" : `${totalShops.toLocaleString()} shops across ${cities.length} cities`}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <SearchBar placeholder={`Search in ${stateName}…`} />
          <BusinessRequestModal stateName={stateName} stateAbbr={abbr} />
        </div>
      </div>

      {/* Featured banner */}
      <div className="mb-8">
        <FeaturedBanner shop={featuredShop} locationLabel={stateName} />
      </div>

      {/* Interactive map */}
      <div className="mb-10 h-[300px] sm:h-[420px] lg:h-[500px] rounded-xl overflow-hidden border border-stone-200 shadow-sm">
        <ShopMapWrapper shops={pins} center={center} zoom={zoom} />
      </div>

      {isEmpty ? (
        <div className="text-center py-16 bg-white rounded-xl border border-stone-200">
          <p className="text-4xl mb-4">🛍️</p>
          <h2 className="text-xl font-semibold text-stone-700 mb-2">No listings yet for {stateName}</h2>
          <p className="text-stone-500 text-sm mb-6">We&apos;re working on adding shops in this state. Check back soon!</p>
          <Link href="/" className="inline-block bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors">
            Browse other states
          </Link>
        </div>
      ) : (
        <>
          <h2 className="text-xl font-semibold mb-4">Browse by City</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {cities.map(({ city, _count }) => (
              <Link
                key={city}
                href={`/${params.state}/${slugify(city)}`}
                className="bg-white rounded-lg border border-stone-200 px-4 py-3 hover:border-brand-400 hover:bg-brand-50 transition-colors"
              >
                <span className="font-medium block text-stone-900">{city}</span>
                <span className="text-xs text-stone-500">{_count.id} shop{_count.id !== 1 ? "s" : ""}</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
