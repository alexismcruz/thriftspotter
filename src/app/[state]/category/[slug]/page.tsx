import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import ShopCard from "@/components/ShopCard";
import { US_STATES, stateFromSlug } from "@/lib/utils";
import type { Metadata } from "next";

type Props = { params: { state: string; slug: string } };

const CATEGORY_MAP: Record<string, { name: string; emoji: string }> = {
  "thrift-store":        { name: "Thrift Store",         emoji: "🛍️" },
  "clothing-resale":     { name: "Clothing Resale",       emoji: "👗" },
  "furniture-home":      { name: "Furniture & Home",      emoji: "🪑" },
  "vintage-store":       { name: "Vintage Store",         emoji: "✨" },
  "books-media":         { name: "Books & Media",         emoji: "📚" },
  "consignment-shop":    { name: "Consignment Shop",      emoji: "🏷️" },
  "nonprofit-resale":    { name: "Nonprofit Resale",      emoji: "💚" },
  "electronics":         { name: "Electronics",           emoji: "💻" },
  "sports-outdoors":     { name: "Sports & Outdoors",     emoji: "⚽" },
  "building-materials":  { name: "Building Materials",    emoji: "🔨" },
  "kids-baby":           { name: "Kids & Baby",           emoji: "👶" },
  "jewelry-accessories": { name: "Jewelry & Accessories", emoji: "💎" },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const abbr = stateFromSlug(params.state)?.toUpperCase();
  const stateName = abbr ? US_STATES[abbr] : null;
  const cat = CATEGORY_MAP[params.slug];
  if (!stateName || !cat) return {};
  return {
    title: `${cat.name} Stores in ${stateName}`,
    description: `Find ${cat.name.toLowerCase()} stores in ${stateName}. Browse secondhand shops near you — free, no sign-up needed.`,
    alternates: { canonical: `https://www.thriftspotter.com/${params.state}/category/${params.slug}` },
  };
}

export const revalidate = 3600;

export default async function StateCategoryPage({ params }: Props) {
  const abbr = stateFromSlug(params.state)?.toUpperCase();
  if (!abbr || !US_STATES[abbr]) notFound();

  const cat = CATEGORY_MAP[params.slug];
  if (!cat) notFound();

  const stateName = US_STATES[abbr];

  const shops = await prisma.shop.findMany({
    where: {
      state: abbr,
      active: true,
      categories: { has: cat.name },
    },
    orderBy: [{ featured: "desc" }, { rating: "desc" }],
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav className="text-sm text-stone-500 mb-6">
        <Link href="/" className="hover:text-brand-600">Home</Link>
        <span className="mx-2">›</span>
        <Link href={`/${params.state}`} className="hover:text-brand-600">{stateName}</Link>
        <span className="mx-2">›</span>
        <span className="text-stone-800 font-medium">{cat.emoji} {cat.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900 mb-2">
          {cat.emoji} {cat.name} Stores in {stateName}
        </h1>
        <p className="text-stone-500">
          {shops.length} store{shops.length !== 1 ? "s" : ""} found in {stateName}
        </p>
      </div>

      {/* Results */}
      {shops.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shops.map((shop) => <ShopCard key={shop.id} shop={shop} />)}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-stone-200">
          <p className="text-4xl mb-4">{cat.emoji}</p>
          <h2 className="text-xl font-semibold text-stone-700 mb-2">No {cat.name} stores found in {stateName}</h2>
          <p className="text-stone-500 text-sm mb-6">Try browsing all stores in {stateName} or explore other categories.</p>
          <Link href={`/${params.state}`}
            className="inline-block bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors">
            Browse all {stateName} stores →
          </Link>
        </div>
      )}

      {/* Back link */}
      <div className="mt-10">
        <Link href={`/${params.state}`} className="text-sm text-brand-600 hover:underline">
          ← Back to all {stateName} stores
        </Link>
      </div>
    </div>
  );
}
