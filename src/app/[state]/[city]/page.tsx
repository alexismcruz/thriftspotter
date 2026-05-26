import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { US_STATES, stateFromSlug, stateSlug } from "@/lib/utils";
import ShopCard from "@/components/ShopCard";
import type { Metadata } from "next";

type Props = { params: { state: string; city: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const abbr = stateFromSlug(params.state)?.toUpperCase();
  const stateName = abbr ? US_STATES[abbr] : null;
  if (!stateName) return {};
  const cityName = params.city.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    title: `Thrift Stores in ${cityName}, ${abbr}`,
    description: `Find the best thrift stores and consignment shops in ${cityName}, ${stateName}.`,
  };
}

export const revalidate = 3600;

export default async function CityPage({ params }: Props) {
  const abbr = stateFromSlug(params.state)?.toUpperCase();
  if (!abbr || !US_STATES[abbr]) notFound();

  const stateName = US_STATES[abbr];
  const citySlugInput = params.city;

  const shops = await prisma.shop.findMany({
    where: {
      state: abbr,
      active: true,
      city: { equals: citySlugInput.replace(/-/g, " "), mode: "insensitive" },
    },
    orderBy: [{ featured: "desc" }, { rating: "desc" }],
  });

  if (shops.length === 0) notFound();

  const cityName = shops[0].city;
  const stSlug = stateSlug(abbr);

  return (
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {shops.map((shop) => (
          <ShopCard key={shop.id} shop={shop} />
        ))}
      </div>
    </div>
  );
}
