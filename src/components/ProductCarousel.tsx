"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

  const next = () => setCurrentIndex((i) => (i + 1) % products.length);
  const prev = () => setCurrentIndex((i) => (i - 1 + products.length) % products.length);
  const product = products[currentIndex];

  return (
    <section className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border border-amber-100 p-8 sm:p-12 mb-16">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 mb-1">✨ Deal of the Day</h2>
          <p className="text-sm text-stone-500">Fresh used & vintage finds from eBay & Amazon</p>
        </div>
        <span className="text-xs bg-amber-200 text-amber-900 font-semibold px-3 py-1 rounded-full">
          Updated nightly
        </span>
      </div>

      {/* Carousel */}
      <div className="flex items-center gap-4">
        {/* Prev button */}
        <button
          onClick={prev}
          className="shrink-0 w-10 h-10 rounded-full bg-white border border-amber-200 flex items-center justify-center hover:bg-amber-50 transition-colors text-stone-600"
        >
          ←
        </button>

        {/* Product card */}
        <div className="flex-1 bg-white rounded-2xl border border-amber-200 p-6 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
            {/* Image */}
            {product.imageUrl && (
              <div className="sm:col-span-1 flex items-center justify-center bg-stone-100 rounded-xl p-4 h-48">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="max-w-full max-h-full object-contain rounded"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}

            {/* Content */}
            <div className={product.imageUrl ? "sm:col-span-2" : "sm:col-span-3"}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded">
                  {product.source || (product.affiliate === "ebay" ? "eBay" : "Amazon")}
                </span>
                {product.price && (
                  <span className="text-lg font-bold text-brand-600">{product.price}</span>
                )}
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-2 line-clamp-2">
                {product.title}
              </h3>
              {product.description && (
                <p className="text-sm text-stone-600 mb-4 line-clamp-2">{product.description}</p>
              )}
              <a
                href={product.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
              >
                View Deal →
              </a>
            </div>
          </div>
        </div>

        {/* Next button */}
        <button
          onClick={next}
          className="shrink-0 w-10 h-10 rounded-full bg-white border border-amber-200 flex items-center justify-center hover:bg-amber-50 transition-colors text-stone-600"
        >
          →
        </button>
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-2 mt-6">
        {products.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === currentIndex ? "bg-brand-600" : "bg-stone-300"
            }`}
          />
        ))}
      </div>

      {/* Disclosure */}
      <p className="text-xs text-stone-400 text-center mt-4">
        ThriftSpotter may earn a commission when you purchase via these links.
      </p>
    </section>
  );
}
