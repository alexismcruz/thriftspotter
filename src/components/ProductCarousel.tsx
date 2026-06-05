"use client";

import { useEffect, useState } from "react";

type Product = {
  id: number;
  title: string;
  description?: string;
  imageUrl?: string;
  price?: string;
  affiliate: string;
  affiliateUrl: string;
  source?: string;
  category?: string;
};

export default function ProductCarousel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || products.length === 0) return null;

  const itemsPerSlide = 2;
  const totalSlides = Math.ceil(products.length / itemsPerSlide);
  const currentSlide = Math.floor(currentIndex / itemsPerSlide);

  const next = () => {
    const nextIndex = currentIndex + itemsPerSlide;
    setCurrentIndex(nextIndex >= products.length ? 0 : nextIndex);
  };

  const prev = () => {
    setCurrentIndex(
      currentIndex - itemsPerSlide < 0
        ? Math.floor((products.length - 1) / itemsPerSlide) * itemsPerSlide
        : currentIndex - itemsPerSlide
    );
  };

  const visibleProducts = products.slice(currentIndex, currentIndex + itemsPerSlide);

  return (
    <section className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border border-amber-100 p-8 sm:p-12 mb-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 mb-1">✨ Deals of the Day</h2>
          <p className="text-sm text-stone-500">Fresh used & vintage finds from eBay</p>
        </div>
        <span className="text-xs bg-amber-200 text-amber-900 font-semibold px-3 py-1 rounded-full">
          Updated nightly
        </span>
      </div>

      {/* Carousel Container */}
      <div className="flex items-center gap-4 mb-8">
        {/* Prev button */}
        <button
          onClick={prev}
          className="shrink-0 w-10 h-10 rounded-full bg-white border border-amber-200 flex items-center justify-center hover:bg-amber-50 transition-colors text-stone-600 font-bold"
        >
          ←
        </button>

        {/* Products Grid - 2 per slide */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {visibleProducts.map((product) => (
            <a
              key={product.id}
              href={product.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="bg-white rounded-2xl border border-amber-200 overflow-hidden hover:border-amber-400 hover:shadow-lg transition-all group"
            >
              {/* Image Container */}
              <div className="bg-stone-100 h-40 sm:h-48 flex items-center justify-center overflow-hidden">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="text-stone-300 text-4xl">📦</div>
                )}
              </div>

              {/* Content */}
              <div className="p-4 sm:p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded whitespace-nowrap">
                    {product.source || "eBay"}
                  </span>
                  {product.price && (
                    <span className="text-lg font-bold text-brand-600">{product.price}</span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-stone-900 mb-2 line-clamp-2 group-hover:text-brand-600 transition-colors">
                  {product.title}
                </h3>

                {/* Description */}
                {product.description && (
                  <p className="text-xs text-stone-500 mb-3 line-clamp-2">
                    {product.description}
                  </p>
                )}

                {/* CTA Button */}
                <button className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2 rounded-lg text-xs transition-colors">
                  View Deal →
                </button>
              </div>
            </a>
          ))}
        </div>

        {/* Next button */}
        <button
          onClick={next}
          className="shrink-0 w-10 h-10 rounded-full bg-white border border-amber-200 flex items-center justify-center hover:bg-amber-50 transition-colors text-stone-600 font-bold"
        >
          →
        </button>
      </div>

      {/* Dots - showing slides not individual items */}
      {totalSlides > 1 && (
        <div className="flex items-center justify-center gap-2 mb-4">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i * itemsPerSlide)}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === currentSlide ? "bg-brand-600" : "bg-stone-300"
              }`}
            />
          ))}
        </div>
      )}

      {/* Disclosure */}
      <p className="text-xs text-stone-400 text-center">
        ThriftSpotter may earn a commission when you purchase via these links.
      </p>
    </section>
  );
}
