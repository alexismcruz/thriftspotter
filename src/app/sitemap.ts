import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { stateSlug, slugify } from "@/lib/utils";

const BASE_URL = "https://www.thriftspotter.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/advertise`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
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
