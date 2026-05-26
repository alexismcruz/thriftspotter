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
      <section className="bg-gradient-to-br from-brand-600 to-brand-700 text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
            Find Thrift Stores Near You
          </h1>
          <p className="text-brand-100 mb-8 text-lg">
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
        {/* Featured shops */}
        {featured.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6">Featured Shops</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featured.map((shop) => (
                <ShopCard key={shop.id} shop={shop} />
              ))}
            </div>
          </section>
        )}

        {/* Browse by state */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Browse by State</h2>
          <StateGrid counts={counts} />
        </section>
      </div>
    </div>
  );
}
