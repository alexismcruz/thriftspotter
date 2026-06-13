import Link from "next/link";
import { prisma } from "@/lib/db";
import ShopCard from "@/components/ShopCard";
import SearchInput from "@/components/SearchInput";
import type { Metadata } from "next";

type Props = { searchParams: { q?: string } };

export function generateMetadata({ searchParams }: Props): Metadata {
  return { title: searchParams.q ? `"${searchParams.q}" — Search` : "Search" };
}

export default async function SearchPage({ searchParams }: Props) {
  const q = (searchParams.q ?? "").trim();

  const shops = q
    ? await prisma.shop.findMany({
        where: {
          active: true,
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { city: { contains: q, mode: "insensitive" } },
            { state: { contains: q, mode: "insensitive" } },
            { zip: { contains: q } },
            { address: { contains: q, mode: "insensitive" } },
            { categories: { has: q } },
            { categories: { hasSome: [q, q.charAt(0).toUpperCase() + q.slice(1).toLowerCase()] } },
          ],
        },
        orderBy: [{ featured: "desc" }, { rating: "desc" }],
        take: 50,
      })
    : [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <Link href="/" className="text-sm text-stone-500 hover:text-brand-600 mb-4 inline-block">← Back</Link>
        <SearchInput defaultValue={q} />
      </div>

      {q && (
        <p className="text-stone-500 mb-6 text-sm">
          {shops.length} result{shops.length !== 1 ? "s" : ""} for <strong>"{q}"</strong>
        </p>
      )}

      {shops.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shops.map((shop) => <ShopCard key={shop.id} shop={shop} />)}
        </div>
      ) : q ? (
        <div className="text-center py-20 text-stone-500">
          <p className="text-lg font-medium mb-2">No shops found for "{q}"</p>
          <p className="text-sm">Try a different city name or zip code.</p>
        </div>
      ) : null}
    </div>
  );
}
