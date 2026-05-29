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
    },
  };
}

function renderContent(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (const line of lines) {
    if (line.startsWith("## ")) {
      elements.push(<h2 key={key++} className="text-xl font-bold text-stone-900 mt-8 mb-3">{line.slice(3)}</h2>);
    } else if (line.startsWith("**") && line.endsWith("**")) {
      elements.push(<p key={key++} className="font-semibold text-stone-800 mt-4 mb-1">{line.slice(2, -2)}</p>);
    } else if (line.startsWith("- ")) {
      elements.push(<li key={key++} className="ml-4 text-stone-600">{line.slice(2)}</li>);
    } else if (line.trim() === "") {
      elements.push(<div key={key++} className="h-2" />);
    } else {
      // Handle inline bold
      const parts = line.split(/\*\*(.*?)\*\*/g);
      const rendered = parts.map((part, i) =>
        i % 2 === 1 ? <strong key={i}>{part}</strong> : part
      );
      elements.push(<p key={key++} className="text-stone-600 leading-relaxed">{rendered}</p>);
    }
  }

  return elements;
}

export default function BlogPostPage({ params }: Props) {
  const post = getBlogPost(params.slug);
  if (!post) notFound();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    author: { "@type": "Organization", name: "ThriftSpotter" },
    publisher: { "@type": "Organization", name: "ThriftSpotter", url: "https://www.thriftspotter.com" },
    url: `https://www.thriftspotter.com/blog/${post.slug}`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <nav className="text-sm text-stone-500 mb-6">
          <Link href="/" className="hover:text-brand-600">Home</Link>
          <span className="mx-2">›</span>
          <Link href="/blog" className="hover:text-brand-600">Blog</Link>
          <span className="mx-2">›</span>
          <span className="text-stone-800 font-medium">{post.city}</span>
        </nav>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs bg-brand-50 text-brand-600 border border-brand-100 px-2 py-0.5 rounded-full font-medium">
              {post.city}, {post.state}
            </span>
            <span className="text-xs text-stone-400">
              {new Date(post.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-stone-900 mb-3">{post.title}</h1>
          <p className="text-stone-500 leading-relaxed">{post.description}</p>
        </div>

        <div className="prose max-w-none space-y-2">
          {renderContent(post.content)}
        </div>

        {/* CTA */}
        <div className="mt-12 bg-brand-50 border border-brand-100 rounded-2xl p-6 text-center">
          <h3 className="font-bold text-stone-900 mb-2">Find thrift stores in {post.city}</h3>
          <p className="text-stone-500 text-sm mb-4">Browse all listings, get directions, and discover new spots — free.</p>
          <Link
            href={`/${post.stateSlug}/${post.citySlug}`}
            className="inline-block bg-brand-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-brand-700 transition-colors text-sm"
          >
            Browse {post.city} thrift stores →
          </Link>
        </div>

        {/* Related posts */}
        <div className="mt-10 pt-8 border-t border-stone-200">
          <h3 className="font-bold text-stone-900 mb-4">More city guides</h3>
          <div className="space-y-3">
            {BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3).map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="flex items-center justify-between bg-white border border-stone-200 rounded-xl px-4 py-3 hover:border-brand-400 hover:text-brand-600 transition-colors group"
              >
                <span className="text-sm font-medium text-stone-800 group-hover:text-brand-600">{p.title}</span>
                <span className="text-stone-300 group-hover:text-brand-400">→</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <Link href="/blog" className="text-sm text-brand-600 hover:underline">← Back to Blog</Link>
        </div>
      </div>
    </>
  );
}
