import { notFound } from "next/navigation";
import Link from "next/link";
import { BLOG_POSTS, getBlogPost } from "@/lib/blog";
import type { Metadata } from "next";

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getBlogPost(params.slug);
  if (!post) return {};
  const canonical = `https://www.thriftspotter.com/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical },
    openGraph: {
      title: post.title,
      description: post.description,
      url: canonical,
      type: "article",
      images: post.imageUrl ? [{ url: post.imageUrl }] : [],
    },
  };
}

function renderInline(text: string, keyPrefix: number): React.ReactNode {
  const parts = text.split(/(\[.*?\]\(.*?\)|\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      const isAffiliate = linkMatch[2].includes("campid=") || linkMatch[2].includes("tag=") || linkMatch[2].includes("therealreal");
      return (
        <a
          key={`${keyPrefix}-${i}`}
          href={linkMatch[2]}
          target={linkMatch[2].startsWith("http") ? "_blank" : undefined}
          rel={isAffiliate ? "noopener noreferrer nofollow sponsored" : linkMatch[2].startsWith("http") ? "noopener noreferrer" : undefined}
          className="text-brand-600 font-medium underline hover:text-brand-700 transition-colors"
        >
          {linkMatch[1]}
        </a>
      );
    }
    const boldMatch = part.match(/^\*\*(.*?)\*\*$/);
    if (boldMatch) return <strong key={`${keyPrefix}-${i}`}>{boldMatch[1]}</strong>;
    return part;
  });
}

function renderContent(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;
  let listItems: React.ReactNode[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(<ul key={key++} className="list-disc ml-6 space-y-1 my-3">{listItems}</ul>);
      listItems = [];
    }
  };

  for (const line of lines) {
    if (line.startsWith("## ")) {
      flushList();
      elements.push(<h2 key={key++} className="text-2xl font-bold text-stone-900 mt-10 mb-3 pb-2 border-b border-stone-100">{line.slice(3)}</h2>);
    } else if (line.startsWith("### ")) {
      flushList();
      elements.push(<h3 key={key++} className="text-lg font-bold text-stone-800 mt-6 mb-2">{line.slice(4)}</h3>);
    } else if (line.startsWith("- ")) {
      listItems.push(<li key={listItems.length} className="text-stone-600 leading-relaxed">{renderInline(line.slice(2), key)}</li>);
    } else if (line.trim() === "") {
      flushList();
      elements.push(<div key={key++} className="h-3" />);
    } else if (line.startsWith("*affiliate-disclosure*")) {
      flushList();
      elements.push(
        <div key={key++} className="text-xs text-stone-400 italic bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 mb-6">
          📋 This post contains affiliate links. ThriftSpotter may earn a small commission at no extra cost to you. We only recommend products and platforms we genuinely believe in.
        </div>
      );
    } else {
      flushList();
      elements.push(<p key={key++} className="text-stone-600 leading-relaxed text-[15px]">{renderInline(line, key)}</p>);
    }
  }
  flushList();
  return elements;
}

const AFFILIATE_PRODUCTS = [
  {
    name: "Shop eBay Vintage",
    desc: "Millions of secondhand finds",
    emoji: "🛒",
    url: "https://ebay.com/sch/i.html?_nkw=vintage+secondhand&campid=7372111",
    color: "bg-yellow-50 border-yellow-200 hover:border-yellow-400",
    badge: "eBay",
    badgeColor: "bg-yellow-100 text-yellow-800",
  },
  {
    name: "Amazon Second Chance",
    desc: "Open-box & refurbished deals",
    emoji: "📦",
    url: "https://www.amazon.com/second-chance?tag=thriftspotter-20",
    color: "bg-orange-50 border-orange-200 hover:border-orange-400",
    badge: "Amazon",
    badgeColor: "bg-orange-100 text-orange-800",
  },
  {
    name: "The RealReal",
    desc: "Authenticated luxury consignment",
    emoji: "💼",
    url: "https://www.therealreal.com/?utm_source=thriftspotter",
    color: "bg-amber-50 border-amber-200 hover:border-amber-400",
    badge: "The RealReal",
    badgeColor: "bg-amber-100 text-amber-800",
  },
];

const POPULAR_CITIES = [
  { city: "Chicago", state: "IL", href: "/illinois/chicago" },
  { city: "Los Angeles", state: "CA", href: "/california/los-angeles" },
  { city: "Austin", state: "TX", href: "/texas/austin" },
  { city: "Portland", state: "OR", href: "/oregon/portland" },
  { city: "Phoenix", state: "AZ", href: "/arizona/phoenix" },
  { city: "Seattle", state: "WA", href: "/washington/seattle" },
];

export default function BlogPostPage({ params }: Props) {
  const post = getBlogPost(params.slug);
  if (!post) notFound();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    image: post.imageUrl,
    author: { "@type": "Organization", name: "ThriftSpotter" },
    publisher: { "@type": "Organization", name: "ThriftSpotter", url: "https://www.thriftspotter.com" },
    url: `https://www.thriftspotter.com/blog/${post.slug}`,
  };

  const relatedPosts = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 4);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      {/* Hero Image */}
      {post.imageUrl && (
        <div className="w-full h-64 sm:h-80 relative overflow-hidden bg-stone-200">
          <img
            src={post.imageUrl}
            alt={post.imageAlt ?? post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 max-w-6xl mx-auto">
            <span className="text-xs font-semibold text-white/80 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
              {post.city ? `${post.city}, ${post.state}` : (post.category ?? "Thrift Guide")}
            </span>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Breadcrumb */}
        <nav className="text-sm text-stone-500 mb-6">
          <Link href="/" className="hover:text-brand-600">Home</Link>
          <span className="mx-2">›</span>
          <Link href="/blog" className="hover:text-brand-600">Blog</Link>
          <span className="mx-2">›</span>
          <span className="text-stone-800 font-medium truncate">{post.title}</span>
        </nav>

        {/* 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* ── Main Content ─────────────────────────────────────────────── */}
          <article className="lg:col-span-2">
            {/* Post Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs bg-brand-50 text-brand-600 border border-brand-100 px-2 py-0.5 rounded-full font-medium">
                  {post.city ? `${post.city}, ${post.state}` : (post.category ?? "Thrift Guide")}
                </span>
                <span className="text-xs text-stone-400">
                  {new Date(post.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-4 leading-tight">{post.title}</h1>
              <p className="text-stone-500 leading-relaxed text-lg border-l-4 border-brand-200 pl-4">{post.description}</p>
            </div>

            {/* Content */}
            <div className="space-y-2">
              {renderContent(post.content)}
            </div>

            {/* CTA */}
            <div className="mt-12 bg-gradient-to-br from-brand-600 to-brand-700 rounded-2xl p-6 text-white text-center">
              {post.city && post.stateSlug && post.citySlug ? (
                <>
                  <h3 className="font-bold text-xl mb-2">Find thrift stores in {post.city}</h3>
                  <p className="text-brand-100 text-sm mb-4">Browse all listings, get directions, and discover new spots — free.</p>
                  <Link href={`/${post.stateSlug}/${post.citySlug}`}
                    className="inline-block bg-white text-brand-700 font-bold px-6 py-3 rounded-xl hover:bg-brand-50 transition-colors text-sm">
                    Browse {post.city} thrift stores →
                  </Link>
                </>
              ) : (
                <>
                  <h3 className="font-bold text-xl mb-2">Find thrift stores near you</h3>
                  <p className="text-brand-100 text-sm mb-4">Browse 5,600+ stores across all 50 US states — free, no sign-up needed.</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/" className="inline-block bg-white text-brand-700 font-bold px-6 py-3 rounded-xl hover:bg-brand-50 transition-colors text-sm">
                      Find stores near me →
                    </Link>
                    <Link href="/shop-online" className="inline-block border border-white/40 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors text-sm">
                      Shop thrift online →
                    </Link>
                  </div>
                </>
              )}
            </div>

            <div className="mt-8">
              <Link href="/blog" className="text-sm text-brand-600 hover:underline">← Back to Blog</Link>
            </div>
          </article>

          {/* ── Sidebar ──────────────────────────────────────────────────── */}
          <aside className="lg:col-span-1 space-y-6">

            {/* Sticky wrapper */}
            <div className="lg:sticky lg:top-20 space-y-6">

              {/* Shop Online */}
              <div className="bg-white rounded-2xl border border-stone-200 p-5">
                <h3 className="font-bold text-stone-900 mb-1 text-sm uppercase tracking-wide">🛍️ Shop Thrift Online</h3>
                <p className="text-xs text-stone-400 mb-4">Find deals from the comfort of home</p>
                <div className="space-y-3">
                  {AFFILIATE_PRODUCTS.map((p) => (
                    <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer nofollow sponsored"
                      className={`flex items-center gap-3 border rounded-xl p-3 transition-all ${p.color} group`}>
                      <span className="text-2xl">{p.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${p.badgeColor}`}>{p.badge}</span>
                        </div>
                        <p className="text-xs font-semibold text-stone-800 group-hover:text-brand-600 transition-colors truncate">{p.name}</p>
                        <p className="text-xs text-stone-400 truncate">{p.desc}</p>
                      </div>
                      <span className="text-stone-300 group-hover:text-brand-400 transition-colors shrink-0">→</span>
                    </a>
                  ))}
                </div>
                <p className="text-xs text-stone-300 mt-3 text-center">Affiliate links — we may earn a commission</p>
              </div>

              {/* Near Me */}
              <div className="bg-gradient-to-br from-brand-50 to-teal-50 rounded-2xl border border-brand-100 p-5 text-center">
                <div className="text-3xl mb-2">📍</div>
                <h3 className="font-bold text-stone-900 mb-1">Stores Near You</h3>
                <p className="text-xs text-stone-500 mb-3">5,600+ thrift stores across all 50 states</p>
                <Link href="/near-me"
                  className="block bg-brand-600 hover:bg-brand-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">
                  Find stores near me →
                </Link>
              </div>

              {/* Popular Cities */}
              <div className="bg-white rounded-2xl border border-stone-200 p-5">
                <h3 className="font-bold text-stone-900 mb-4 text-sm uppercase tracking-wide">🏙️ Popular Cities</h3>
                <div className="space-y-2">
                  {POPULAR_CITIES.map((c) => (
                    <Link key={c.city} href={c.href}
                      className="flex items-center justify-between text-sm text-stone-600 hover:text-brand-600 hover:bg-brand-50 px-3 py-2 rounded-lg transition-colors">
                      <span>{c.city}</span>
                      <span className="text-xs text-stone-400">{c.state} →</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Related Posts */}
              <div className="bg-white rounded-2xl border border-stone-200 p-5">
                <h3 className="font-bold text-stone-900 mb-4 text-sm uppercase tracking-wide">📖 More Guides</h3>
                <div className="space-y-3">
                  {relatedPosts.map((p) => (
                    <Link key={p.slug} href={`/blog/${p.slug}`}
                      className="block group">
                      {p.imageUrl && (
                        <div className="h-24 rounded-lg overflow-hidden mb-2 bg-stone-100">
                          <img src={p.imageUrl} alt={p.imageAlt ?? p.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </div>
                      )}
                      <p className="text-xs font-semibold text-stone-800 group-hover:text-brand-600 transition-colors leading-snug line-clamp-2">
                        {p.title}
                      </p>
                      <p className="text-xs text-stone-400 mt-0.5">
                        {new Date(p.publishedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>

            </div>
          </aside>

        </div>
      </div>
    </>
  );
}
