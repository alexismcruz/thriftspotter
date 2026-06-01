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

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string; emoji: string; accent: string }> = {
  "Thrift Store":       { bg: "bg-teal-50",   text: "text-teal-700",   border: "border-teal-200",   emoji: "🛍️", accent: "bg-teal-500" },
  "Clothing Resale":    { bg: "bg-violet-50",  text: "text-violet-700", border: "border-violet-200", emoji: "👗", accent: "bg-violet-500" },
  "Furniture & Home":   { bg: "bg-amber-50",   text: "text-amber-700",  border: "border-amber-200",  emoji: "🛋️", accent: "bg-amber-500" },
  "Books & Media":      { bg: "bg-blue-50",    text: "text-blue-700",   border: "border-blue-200",   emoji: "📚", accent: "bg-blue-500" },
  "Vintage Store":      { bg: "bg-rose-50",    text: "text-rose-700",   border: "border-rose-200",   emoji: "✨", accent: "bg-rose-500" },
  "Nonprofit Resale":   { bg: "bg-green-50",   text: "text-green-700",  border: "border-green-200",  emoji: "💚", accent: "bg-green-500" },
  "Electronics":        { bg: "bg-indigo-50",  text: "text-indigo-700", border: "border-indigo-200", emoji: "💻", accent: "bg-indigo-500" },
  "Consignment Shop":   { bg: "bg-orange-50",  text: "text-orange-700", border: "border-orange-200", emoji: "🏷️", accent: "bg-orange-500" },
  "Building Materials": { bg: "bg-stone-100",  text: "text-stone-700",  border: "border-stone-300",  emoji: "🔨", accent: "bg-stone-500" },
  "Sports & Outdoors":  { bg: "bg-lime-50",    text: "text-lime-700",   border: "border-lime-200",   emoji: "⚽", accent: "bg-lime-500" },
  "Kids & Baby":        { bg: "bg-pink-50",    text: "text-pink-700",   border: "border-pink-200",   emoji: "👶", accent: "bg-pink-500" },
  "Jewelry & Accessories": { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", emoji: "💎", accent: "bg-purple-500" },
  "Pet":                { bg: "bg-yellow-50",  text: "text-yellow-700", border: "border-yellow-200", emoji: "🐾", accent: "bg-yellow-500" },
};

const DEFAULT_STYLE = { bg: "bg-stone-100", text: "text-stone-600", border: "border-stone-200", emoji: "🏪", accent: "bg-stone-400" };

function getCategoryStyle(categories: string[]) {
  // Pick first non-"Thrift Store" category for accent, fall back to Thrift Store
  const primary = categories.find(c => c !== "Thrift Store" && CATEGORY_STYLES[c]) ?? categories[0];
  return CATEGORY_STYLES[primary] ?? DEFAULT_STYLE;
}

export default function ShopCard({ shop }: { shop: Shop }) {
  const citySlug = slugify(shop.city);
  const stSlug = stateSlug(shop.state);
  const style = getCategoryStyle(shop.categories);
  const displayCats = shop.categories.slice(0, 3);

  return (
    <div className={`card-lift relative rounded-2xl border overflow-hidden flex flex-col ${
      shop.featured
        ? "bg-brand-50 border-brand-200 shadow-sm"
        : "bg-white border-stone-200"
    }`}>

      {/* Accent stripe + sponsored badge */}
      <div className={`h-1.5 w-full ${shop.featured ? "bg-brand-500" : style.accent} opacity-80`} />

      {shop.featured && (
        <span className="absolute top-4 right-3 text-xs bg-brand-600 text-white font-semibold px-2 py-0.5 rounded-full shadow-sm">
          ⭐ Sponsored
        </span>
      )}

      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Category emoji + name */}
        <div className="flex items-start gap-2">
          <span className="text-xl mt-0.5 shrink-0">{style.emoji}</span>
          <div className="flex-1 min-w-0">
            <Link
              href={`/shop/${shop.slug}`}
              className="font-bold text-stone-900 hover:text-brand-600 leading-tight block pr-12 transition-colors"
            >
              {shop.name}
            </Link>
            <Link
              href={`/${stSlug}/${citySlug}`}
              className="text-xs text-stone-400 hover:text-brand-500 mt-0.5 block transition-colors"
            >
              📍 {shop.city}, {shop.state}
            </Link>
          </div>
        </div>

        {/* Rating */}
        {shop.rating && (
          <div className="flex items-center gap-1.5">
            <div className="flex">
              {[1,2,3,4,5].map(s => (
                <span key={s} className={`text-xs ${s <= Math.round(shop.rating!) ? "text-amber-400" : "text-stone-200"}`}>★</span>
              ))}
            </div>
            <span className="text-xs font-semibold text-stone-700">{shop.rating.toFixed(1)}</span>
            {shop.reviewCount && (
              <span className="text-xs text-stone-400">({shop.reviewCount.toLocaleString()})</span>
            )}
          </div>
        )}

        {/* Address */}
        <p className="text-xs text-stone-500 leading-snug">{shop.address}</p>

        {/* Category badges */}
        {displayCats.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {displayCats.map((cat) => {
              const cs = CATEGORY_STYLES[cat] ?? DEFAULT_STYLE;
              return (
                <span key={cat} className={`text-xs px-2 py-0.5 rounded-full border font-medium ${cs.bg} ${cs.text} ${cs.border}`}>
                  {cs.emoji} {cat}
                </span>
              );
            })}
          </div>
        )}

        {/* Contact links */}
        <div className="flex gap-3 mt-auto pt-2 border-t border-stone-100">
          {shop.phone && (
            <a href={`tel:${shop.phone}`} className="text-xs text-brand-600 hover:underline font-medium flex items-center gap-1">
              📞 {formatPhone(shop.phone)}
            </a>
          )}
          {shop.website && (
            <a href={shop.website} target="_blank" rel="noopener noreferrer nofollow" className="text-xs text-brand-600 hover:underline font-medium flex items-center gap-1 ml-auto">
              🌐 Website ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
