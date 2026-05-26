import Link from "next/link";
import { formatPhone, stateSlug, slugify } from "@/lib/utils";

type Shop = {
  id: number;
  name: string;
  slug: string;
  address: string;
  city: string;
  state: string;
  phone: string | null;
  website: string | null;
  rating: number | null;
  reviewCount: number | null;
  categories: string[];
  featured?: boolean;
};

export default function ShopCard({ shop }: { shop: Shop }) {
  const citySlug = slugify(shop.city);
  const stSlug = stateSlug(shop.state);

  return (
    <div className={`relative rounded-xl border p-5 hover:shadow-md transition-all flex flex-col gap-2 ${
      shop.featured
        ? "bg-brand-50 border-brand-200 shadow-sm"
        : "bg-white border-stone-200"
    }`}>
      {shop.featured && (
        <span className="absolute top-3 right-3 text-xs bg-brand-600 text-white font-semibold px-2 py-0.5 rounded-full">
          ⭐ Sponsored
        </span>
      )}

      <div className="flex items-start justify-between gap-2 pr-16">
        <Link href={`/shop/${shop.slug}`} className="font-semibold text-stone-900 hover:text-brand-600 leading-tight">
          {shop.name}
        </Link>
        {shop.rating && (
          <span className="shrink-0 text-xs bg-brand-50 text-brand-700 font-medium px-2 py-0.5 rounded-full border border-brand-200">
            ★ {shop.rating.toFixed(1)}
            {shop.reviewCount ? ` (${shop.reviewCount.toLocaleString()})` : ""}
          </span>
        )}
      </div>

      <p className="text-sm text-stone-500 leading-snug">{shop.address}</p>

      {shop.categories.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {shop.categories.slice(0, 3).map((cat) => (
            <span key={cat} className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
              {cat}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-3 mt-1 text-xs">
        {shop.phone && (
          <a href={`tel:${shop.phone}`} className="text-brand-600 hover:underline">
            {formatPhone(shop.phone)}
          </a>
        )}
        {shop.website && (
          <a href={shop.website} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline truncate">
            Website ↗
          </a>
        )}
      </div>

      <Link href={`/${stSlug}/${citySlug}`} className="text-xs text-stone-400 hover:text-brand-600 mt-auto">
        {shop.city}, {shop.state}
      </Link>
    </div>
  );
}
