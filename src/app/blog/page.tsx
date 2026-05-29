import Link from "next/link";
import { BLOG_POSTS } from "@/lib/blog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thrift Store Blog | ThriftSpotter",
  description: "Tips, guides, and city-by-city breakdowns for thrift store shoppers across the US. Find the best secondhand deals in your city.",
  alternates: { canonical: "https://www.thriftspotter.com/blog" },
};

export default function BlogPage() {
  const sorted = [...BLOG_POSTS].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <nav className="text-sm text-stone-500 mb-6">
        <Link href="/" className="hover:text-brand-600">Home</Link>
        <span className="mx-2">›</span>
        <span className="text-stone-800 font-medium">Blog</span>
      </nav>

      <h1 className="text-3xl font-bold text-stone-900 mb-2">ThriftSpotter Blog</h1>
      <p className="text-stone-500 mb-10">City guides, tips, and everything secondhand.</p>

      <div className="space-y-6">
        {sorted.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block bg-white border border-stone-200 rounded-2xl p-6 hover:border-brand-400 hover:shadow-sm transition-all group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs bg-brand-50 text-brand-600 border border-brand-100 px-2 py-0.5 rounded-full font-medium">
                    {post.city}, {post.state}
                  </span>
                  <span className="text-xs text-stone-400">
                    {new Date(post.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-stone-900 group-hover:text-brand-600 transition-colors mb-2">
                  {post.title}
                </h2>
                <p className="text-stone-500 text-sm leading-relaxed line-clamp-2">{post.description}</p>
              </div>
              <span className="text-stone-300 group-hover:text-brand-400 transition-colors text-xl shrink-0">→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
