import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { US_STATES, stateSlug, slugify, formatPhone } from "@/lib/utils";
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

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <nav className="text-sm text-stone-500 mb-6 flex flex-wrap items-center gap-x-1 gap-y-1">
        <Link href="/" className="hover:text-brand-600 shrink-0">Home</Link>
        <span className="shrink-0">›</span>
        <Link href={`/${stSlug}`} className="hover:text-brand-600 shrink-0">{stName}</Link>
        <span className="shrink-0">›</span>
        <Link href={`/${stSlug}/${citySlug}`} className="hover:text-brand-600 shrink-0">{shop.city}</Link>
        <span className="shrink-0">›</span>
        <span className="text-stone-800 font-medium truncate">{shop.name}</span>
      </nav>

      <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-8 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight">{shop.name}</h1>
          {shop.rating && (
            <div className="shrink-0 text-center">
              <div className="text-2xl font-bold text-brand-600">{shop.rating.toFixed(1)}</div>
              <div className="text-xs text-stone-500">
                {shop.reviewCount ? `${shop.reviewCount.toLocaleString()} reviews` : "rating"}
              </div>
            </div>
          )}
        </div>

        {shop.categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {shop.categories.map((cat) => (
              <span key={cat} className="text-sm bg-stone-100 text-stone-600 px-3 py-1 rounded-full">{cat}</span>
            ))}
          </div>
        )}

        {shop.description && <p className="text-stone-600 leading-relaxed">{shop.description}</p>}

        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <h2 className="font-semibold text-stone-700">Location</h2>
            <p className="text-stone-600">{shop.address}</p>
            <p className="text-stone-600">{shop.city}, {shop.state} {shop.zip ?? ""}</p>
          </div>

          <div className="space-y-2">
            <h2 className="font-semibold text-stone-700">Contact</h2>
            {shop.phone && (
              <a href={`tel:${shop.phone}`} className="block text-brand-600 hover:underline">
                {formatPhone(shop.phone)}
              </a>
            )}
            {shop.website && (
              <a href={shop.website} target="_blank" rel="noopener noreferrer" className="block text-brand-600 hover:underline break-all">
                {shop.website.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>
        </div>

        {hours && Object.keys(hours).length > 0 && (
          <div className="space-y-2 text-sm">
            <h2 className="font-semibold text-stone-700">Hours</h2>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-1">
              {Object.entries(hours).map(([day, time]) => (
                <>
                  <dt key={`dt-${day}`} className="text-stone-500">{day}</dt>
                  <dd key={`dd-${day}`} className="text-stone-700">{time}</dd>
                </>
              ))}
            </dl>
          </div>
        )}

        {(shop.lat && shop.lng) && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${shop.lat},${shop.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            Open in Google Maps ↗
          </a>
        )}
      </div>
    </div>
  );
}
