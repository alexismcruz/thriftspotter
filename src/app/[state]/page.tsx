import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { US_STATES, stateFromSlug, slugify } from "@/lib/utils";
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

  const cities = await prisma.shop.groupBy({
    by: ["city"],
    where: { state: abbr, active: true },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  });

  if (cities.length === 0) notFound();

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
          <p className="text-stone-500 mt-1">{cities.reduce((a, c) => a + c._count.id, 0).toLocaleString()} shops across {cities.length} cities</p>
        </div>
        <SearchBar placeholder={`Search in ${stateName}…`} />
      </div>

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
    </div>
  );
}
