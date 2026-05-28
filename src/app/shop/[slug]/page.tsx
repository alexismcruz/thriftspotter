import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { US_STATES, stateSlug, slugify, formatPhone } from "@/lib/utils";
import ShopMapWrapper from "@/components/ShopMapWrapper";
import ShopCard from "@/components/ShopCard";
import ClaimListingButton from "@/components/ClaimListingButton";
import type { Metadata } from "next";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const shop = await prisma.shop.findUnique({ where: { slug: params.slug } });
  if (!shop) return {};
  return {
    title: `${shop.name} — ${shop.city}, ${shop.state}`,
    description: shop.description ?? `Thrift store in ${shop.city}, ${shop.state}.`,
  };
}

export const revalidate = 3600;

export default async function ShopPage({ params }: Props) {
  const shop = await prisma.shop.findUnique({ where: { slug: params.slug } });
  if (!shop || !shop.active) notFound();

  const stName = US_STATES[shop.state] ?? shop.state;
  const stSlug = stateSlug(shop.state);
  const citySlug = slugify(shop.city);
  const hours = shop.hours as Record<string, string> | null;

  // Nearby shops in same city
  const nearbyShops = await prisma.shop.findMany({
    where: { active: true, city: shop.city, state: shop.state, slug: { not: shop.slug } },
    orderBy: [{ featured: "desc" }, { rating: "desc" }],
    take: 3,
  });

  const mapPin = shop.lat && shop.lng
    ? [{ id: shop.id, name: shop.name, slug: shop.slug, address: shop.address, city: shop.city, state: shop.state, lat: shop.lat, lng: shop.lng }]
    : [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav className="text-sm text-stone-500 mb-6 flex flex-wrap items-center gap-x-1 gap-y-1">
        <Link href="/" className="hover:text-brand-600 shrink-0">Home</Link>
        <span className="shrink-0">›</span>
        <Link href={`/${stSlug}`} className="hover:text-brand-600 shrink-0">{stName}</Link>
        <span className="shrink-0">›</span>
        <Link href={`/${stSlug}/${citySlug}`} className="hover:text-brand-600 shrink-0">{shop.city}</Link>
        <span className="shrink-0">›</span>
        <span className="text-stone-800 font-medium truncate">{shop.name}</span>
      </nav>

      {/* Main card */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden mb-6">

        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-stone-100">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight">{shop.name}</h1>
              <p className="text-stone-500 text-sm mt-1">📍 {shop.city}, {stName}</p>
            </div>
            {shop.rating && (
              <div className="shrink-0 text-center bg-brand-50 border border-brand-200 rounded-xl px-4 py-2">
                <div className="text-2xl font-bold text-brand-600">{shop.rating.toFixed(1)}</div>
                <div className="text-xs text-stone-500">
                  {shop.reviewCount ? `${shop.reviewCount.toLocaleString()} reviews` : "rating"}
                </div>
              </div>
            )}
          </div>

          {shop.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {shop.categories.map((cat) => (
                <span key={cat} className="text-xs bg-brand-50 text-brand-700 border border-brand-100 px-3 py-1 rounded-full">
                  {cat}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        {shop.description && (
          <div className="px-6 sm:px-8 py-5 border-b border-stone-100">
            <p className="text-stone-600 leading-relaxed">{shop.description}</p>
          </div>
        )}

        {/* Contact & Hours */}
        <div className="px-6 sm:px-8 py-6 grid sm:grid-cols-2 gap-8 border-b border-stone-100">
          <div className="space-y-3">
            <h2 className="font-semibold text-stone-800 text-sm uppercase tracking-wide">Contact & Location</h2>
            <div className="space-y-2 text-sm">
              <p className="flex gap-2 text-stone-600">
                <span>🏠</span>
                <span>{shop.address}, {shop.city}, {shop.state} {shop.zip ?? ""}</span>
              </p>
              {shop.phone && (
                <a href={`tel:${shop.phone}`} className="flex gap-2 text-brand-600 hover:underline">
                  <span>📞</span>
                  <span>{formatPhone(shop.phone)}</span>
                </a>
              )}
              {shop.website && (
                <a href={shop.website} target="_blank" rel="noopener noreferrer" className="flex gap-2 text-brand-600 hover:underline">
                  <span>🌐</span>
                  <span className="break-all">{shop.website.replace(/^https?:\/\//, "")}</span>
                </a>
              )}
              {shop.lat && shop.lng && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${shop.lat},${shop.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  <span>↗</span> Open in Google Maps
                </a>
              )}
            </div>
          </div>

          {hours && Object.keys(hours).length > 0 && (
            <div className="space-y-3">
              <h2 className="font-semibold text-stone-800 text-sm uppercase tracking-wide">Hours</h2>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                {Object.entries(hours).map(([day, time]) => (
                  <>
                    <dt key={`dt-${day}`} className="text-stone-500">{day}</dt>
                    <dd key={`dd-${day}`} className="text-stone-700 font-medium">{time}</dd>
                  </>
                ))}
              </dl>
            </div>
          )}
        </div>

        {/* Map */}
        {mapPin.length > 0 && (
          <div className="h-[280px] sm:h-[340px]">
            <ShopMapWrapper shops={mapPin} center={[shop.lat!, shop.lng!]} zoom={15} />
          </div>
        )}
      </div>

      {/* Nearby shops */}
      {nearbyShops.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">More in {shop.city}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {nearbyShops.map((s) => (
              <ShopCard key={s.id} shop={s} />
            ))}
          </div>
          <Link
            href={`/${stSlug}/${citySlug}`}
            className="inline-block mt-4 text-sm text-brand-600 hover:underline"
          >
            View all shops in {shop.city} →
          </Link>
        </div>
      )}

      {/* Is this your business? */}
      <div className="bg-terra-50 border border-terra-100 rounded-2xl p-6 sm:p-8 text-center">
        <p className="text-2xl mb-3">🏪</p>
        <h3 className="font-bold text-stone-900 text-lg mb-2">Is this your business?</h3>
        <p className="text-stone-500 text-sm mb-5 max-w-md mx-auto">
          Claim your listing to update your info and get featured at the top of search results in {shop.city}.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <ClaimListingButton shopName={shop.name} shopSlug={shop.slug} />
          <Link
            href="/advertise"
            className="border border-stone-300 text-stone-600 hover:bg-stone-50 font-medium px-6 py-2.5 rounded-lg transition-colors text-sm"
          >
            View listing options
          </Link>
        </div>
      </div>
    </div>
  );
}
