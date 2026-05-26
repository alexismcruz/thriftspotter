import Link from "next/link";
import { formatPhone } from "@/lib/utils";

type Shop = {
  id: number;
  name: string;
  slug: string;
  address: string;
  city: string;
  state: string;
  phone: string | null;
  website: string | null;
  description: string | null;
};

type Props = {
  shop?: Shop | null;
  locationLabel: string;
};

export default function FeaturedBanner({ shop, locationLabel }: Props) {
  if (!shop) {
    return (
      <div className="rounded-xl border-2 border-dashed border-accent-300 bg-accent-50 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-accent-600 uppercase tracking-wider">Featured Listing</span>
          <h3 className="text-lg font-bold text-stone-700 mt-1">Your business could be here</h3>
          <p className="text-sm text-stone-500 mt-0.5">
            Reach thrift shoppers searching in {locationLabel} right now.
          </p>
        </div>
        <Link
          href="/advertise"
          className="shrink-0 bg-accent-500 hover:bg-accent-600 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
        >
          Advertise here →
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-accent-300 bg-gradient-to-r from-accent-50 to-brand-50 p-6 flex flex-col sm:flex-row items-start justify-between gap-4">
      <div className="flex-1">
        <span className="text-xs font-bold text-accent-600 uppercase tracking-wider">⭐ Sponsored</span>
        <h3 className="text-xl font-bold text-stone-900 mt-1">{shop.name}</h3>
        <p className="text-sm text-stone-500 mt-0.5">{shop.address}</p>
        {shop.description && <p className="text-sm text-stone-600 mt-2 line-clamp-2">{shop.description}</p>}
        <div className="flex gap-4 mt-3 text-sm">
          {shop.phone && (
            <a href={`tel:${shop.phone}`} className="text-brand-600 hover:underline font-medium">
              {formatPhone(shop.phone)}
            </a>
          )}
          {shop.website && (
            <a href={shop.website} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline font-medium">
              Visit website ↗
            </a>
          )}
        </div>
      </div>
      <Link
        href={`/shop/${shop.slug}`}
        className="shrink-0 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
      >
        View Details →
      </Link>
    </div>
  );
}
