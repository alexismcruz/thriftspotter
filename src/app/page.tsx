import { prisma } from "@/lib/db";
import SearchBar from "@/components/SearchBar";
import StateGrid from "@/components/StateGrid";
import ShopCard from "@/components/ShopCard";

async function getStateCounts(): Promise<Record<string, number>> {
  const rows = await prisma.shop.groupBy({
    by: ["state"],
    where: { active: true },
    _count: { id: true },
  });
  return Object.fromEntries(rows.map((r) => [r.state, r._count.id]));
}

async function getFeaturedShops() {
  return prisma.shop.findMany({
    where: { active: true, featured: true },
    take: 6,
    orderBy: { rating: "desc" },
  });
}

export const revalidate = 3600;

export default async function HomePage() {
  const [counts, featured] = await Promise.all([getStateCounts(), getFeaturedShops()]);
  const totalShops = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 text-white py-12 sm:py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block bg-brand-500/40 text-brand-100 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-6">
            Free · No sign-up needed
          </span>
          <h1 className="text-4xl sm:text-6xl font-heading font-bold mb-5 leading-tight tracking-tight">
            Find Thrift Stores<br className="hidden sm:block" /> Near You
          </h1>
          <p className="text-brand-100 mb-8 text-lg max-w-xl mx-auto">
            {totalShops > 0
              ? `Discover ${totalShops.toLocaleString()}+ thrift shops, consignment stores, and secondhand finds across the US.`
              : "Discover thrift shops, consignment stores, and secondhand finds across the US."}
          </p>
          <div className="flex justify-center">
            <SearchBar />
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12 space-y-14">
        {/* Featured / Sponsored shops */}
        {featured.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Featured Shops</h2>
              <span className="text-xs text-stone-400 bg-stone-100 px-3 py-1 rounded-full">Sponsored</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featured.map((shop) => (
                <ShopCard key={shop.id} shop={{ ...shop, featured: true }} />
              ))}
            </div>
          </section>
        )}

        {/* Browse by state */}
        <section>
          <h2 className="text-2xl font-bold mb-2">Browse by State</h2>
          <p className="text-stone-500 text-sm mb-6">Click any state to explore thrift stores by city.</p>
          <StateGrid counts={counts} />
        </section>
      </div>
    </div>
  );
}
