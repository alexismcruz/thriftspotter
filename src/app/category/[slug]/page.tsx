import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import ShopCard from "@/components/ShopCard";
import type { Metadata } from "next";

const CATEGORY_MAP: Record<string, { name: string; emoji: string; description: string }> = {
  "thrift-store":       { name: "Thrift Store",        emoji: "🛍️", description: "General thrift stores with rotating donated goods at affordable prices." },
  "clothing-resale":    { name: "Clothing Resale",      emoji: "👗", description: "Secondhand clothing, shoes, and accessories for the whole family." },
  "furniture-home":     { name: "Furniture & Home",     emoji: "🛋️", description: "Used furniture, home décor, kitchenware, and household goods." },
  "vintage-store":      { name: "Vintage Store",        emoji: "✨", description: "Curated vintage and collectible items from past decades." },
  "books-media":        { name: "Books & Media",        emoji: "📚", description: "Used books, vinyl records, DVDs, CDs, and other media." },
  "nonprofit-resale":   { name: "Nonprofit Resale",     emoji: "💚", description: "Charity thrift stores where purchases support a local cause." },
  "electronics":        { name: "Electronics",          emoji: "💻", description: "Used electronics, computers, phones, and gadgets." },
  "consignment-shop":   { name: "Consignment Shop",     emoji: "🏷️", description: "Upscale resale shops where sellers earn from their items." },
  "building-materials": { name: "Building Materials",   emoji: "🔨", description: "Surplus and donated building materials, appliances, and fixtures." },
  "sports-outdoors":    { name: "Sports & Outdoors",    emoji: "⚽", description: "Used sporting goods, outdoor gear, and athletic equipment." },
  "kids-baby":          { name: "Kids & Baby",          emoji: "👶", description: "Secondhand children's clothing, toys, and baby gear." },
  "jewelry-accessories":{ name: "Jewelry & Accessories",emoji: "💎", description: "Pre-owned jewelry, accessories, and fashion items." },
  "pet":                { name: "Pet",                  emoji: "🐾", description: "Pet supplies and accessories at secondhand prices." },
};

const PAGE_SIZE = 24;

type Props = { params: { slug: string }; searchParams?: { page?: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cat = CATEGORY_MAP[params.slug];
  if (!cat) return {};
  return {
    title: `${cat.name} Shops | ThriftSpotter`,
    description: `Browse ${cat.name.toLowerCase()} stores across the US. Find addresses, phone numbers, and directions — free on ThriftSpotter.`,
    alternates: { canonical: `https://www.thriftspotter.com/category/${params.slug}` },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const cat = CATEGORY_MAP[params.slug];
  if (!cat) notFound();

  const page = Math.max(1, parseInt(searchParams?.page ?? "1") || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const [total, shops] = await Promise.all([
    prisma.shop.count({ where: { active: true, categories: { has: cat.name } } }),
    prisma.shop.findMany({
      where: { active: true, categories: { has: cat.name } },
      orderBy: [{ featured: "desc" }, { rating: "desc" }],
      skip,
      take: PAGE_SIZE,
    }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const baseUrl = `/category/${params.slug}`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav className="text-sm text-stone-500 mb-6">
        <Link href="/" className="hover:text-brand-600">Home</Link>
        <span className="mx-2">›</span>
        <span className="text-stone-800 font-medium">{cat.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">{cat.emoji}</span>
          <h1 className="text-3xl font-bold">{cat.name} Shops</h1>
        </div>
        <p className="text-stone-500 text-sm mb-1">{cat.description}</p>
        <p className="text-stone-400 text-xs">{total.toLocaleString()} shops listed across the US</p>
      </div>

      {/* Grid */}
      {shops.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shops.map((shop) => (
            <ShopCard key={shop.id} shop={shop} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-stone-500">
          <p className="text-lg font-medium mb-2">No shops found in this category yet.</p>
          <Link href="/" className="text-brand-600 hover:underline text-sm">Browse all stores →</Link>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          {page > 1 && (
            <Link href={`${baseUrl}${page - 1 === 1 ? "" : `?page=${page - 1}`}`}
              className="px-4 py-2 rounded-lg border border-stone-200 text-sm hover:border-brand-400 hover:text-brand-600 transition-colors">
              ← Previous
            </Link>
          )}
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
            <Link key={p} href={`${baseUrl}${p === 1 ? "" : `?page=${p}`}`}
              className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm border transition-colors ${
                p === page ? "bg-brand-600 text-white border-brand-600 font-semibold" : "border-stone-200 hover:border-brand-400 hover:text-brand-600"
              }`}>
              {p}
            </Link>
          ))}
          {page < totalPages && (
            <Link href={`${baseUrl}?page=${page + 1}`}
              className="px-4 py-2 rounded-lg border border-stone-200 text-sm hover:border-brand-400 hover:text-brand-600 transition-colors">
              Next →
            </Link>
          )}
        </div>
      )}

      {/* Browse more */}
      <div className="mt-14 pt-8 border-t border-stone-200 text-center">
        <p className="text-stone-500 text-sm mb-4">Looking for something else?</p>
        <Link href="/" className="inline-block bg-brand-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-brand-700 transition-colors text-sm">
          Browse all categories →
        </Link>
      </div>
    </div>
  );
}
