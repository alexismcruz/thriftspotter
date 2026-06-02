import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { stateSlug, slugify } from "@/lib/utils";
import { BLOG_POSTS } from "@/lib/blog";

const BASE_URL = "https://www.thriftspotter.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/advertise`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/near-me`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    // Category pages
    ...["thrift-store","clothing-resale","furniture-home","vintage-store","books-media",
        "nonprofit-resale","electronics","consignment-shop","building-materials",
        "sports-outdoors","kids-baby","jewelry-accessories","pet"].map((slug) => ({
      url: `${BASE_URL}/category/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...BLOG_POSTS.map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];

  const [states, cities, shops] = await Promise.all([
    prisma.shop.findMany({
      where: { active: true },
      select: { state: true },
      distinct: ["state"],
    }),
    prisma.shop.findMany({
      where: { active: true },
      select: { state: true, city: true },
      distinct: ["state", "city"],
    }),
    prisma.shop.findMany({
      where: { active: true },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const statePages: MetadataRoute.Sitemap = states.map(({ state }) => ({
    url: `${BASE_URL}/${stateSlug(state)}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const cityPages: MetadataRoute.Sitemap = cities.map(({ state, city }) => ({
    url: `${BASE_URL}/${stateSlug(state)}/${slugify(city)}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const shopPages: MetadataRoute.Sitemap = shops.map(({ slug, updatedAt }) => ({
    url: `${BASE_URL}/shop/${slug}`,
    lastModified: updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...statePages, ...cityPages, ...shopPages];
}
