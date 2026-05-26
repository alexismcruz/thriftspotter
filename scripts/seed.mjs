/**
 * Seeds the database from scripts/data/overpass.json (GeoJSON or raw Overpass format).
 * Run: node scripts/seed.mjs
 * Requires DATABASE_URL in .env
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const __dirname = dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

const STATE_ABBR = {
  "Alabama":"AL","Alaska":"AK","Arizona":"AZ","Arkansas":"AR","California":"CA",
  "Colorado":"CO","Connecticut":"CT","Delaware":"DE","Florida":"FL","Georgia":"GA",
  "Hawaii":"HI","Idaho":"ID","Illinois":"IL","Indiana":"IN","Iowa":"IA",
  "Kansas":"KS","Kentucky":"KY","Louisiana":"LA","Maine":"ME","Maryland":"MD",
  "Massachusetts":"MA","Michigan":"MI","Minnesota":"MN","Mississippi":"MS","Missouri":"MO",
  "Montana":"MT","Nebraska":"NE","Nevada":"NV","New Hampshire":"NH","New Jersey":"NJ",
  "New Mexico":"NM","New York":"NY","North Carolina":"NC","North Dakota":"ND","Ohio":"OH",
  "Oklahoma":"OK","Oregon":"OR","Pennsylvania":"PA","Rhode Island":"RI","South Carolina":"SC",
  "South Dakota":"SD","Tennessee":"TN","Texas":"TX","Utah":"UT","Vermont":"VT",
  "Virginia":"VA","Washington":"WA","West Virginia":"WV","Wisconsin":"WI","Wyoming":"WY",
};

const US_STATE_ABBRS = new Set(Object.values(STATE_ABBR));

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
}

function makeUniqueSlug(base, seen) {
  let slug = base;
  let i = 2;
  while (seen.has(slug)) slug = `${base}-${i++}`;
  seen.add(slug);
  return slug;
}

function normalizeState(raw) {
  if (!raw) return null;
  const upper = raw.trim().toUpperCase();
  if (US_STATE_ABBRS.has(upper)) return upper;
  return STATE_ABBR[raw.trim()] ?? null;
}

function parseStateFromAddr(addr) {
  const m = addr.match(/,\s*([A-Z]{2})\s*(\d{5})?/);
  if (m && US_STATE_ABBRS.has(m[1])) return m[1];
  for (const [name, abbr] of Object.entries(STATE_ABBR)) {
    if (addr.includes(name)) return abbr;
  }
  return null;
}

function extractShops(data) {
  // GeoJSON FeatureCollection format (from overpass-turbo export)
  if (data.type === "FeatureCollection" && Array.isArray(data.features)) {
    return data.features.map((f) => {
      const tags = f.properties ?? {};
      const [lng, lat] = f.geometry?.coordinates ?? [null, null];
      return { tags, lat, lng };
    });
  }
  // Raw Overpass API format
  if (Array.isArray(data.elements)) {
    return data.elements.map((el) => ({
      tags: el.tags ?? {},
      lat: el.lat ?? el.center?.lat ?? null,
      lng: el.lon ?? el.center?.lon ?? null,
    }));
  }
  return [];
}

async function seed() {
  const raw = JSON.parse(readFileSync(join(__dirname, "data/overpass.json"), "utf8"));
  const items = extractShops(raw);

  console.log(`Processing ${items.length} elements…`);

  const seen = new Set();
  const shops = [];
  let skipped = 0;

  for (const { tags, lat, lng } of items) {
    const name = tags.name;
    if (!name) { skipped++; continue; }

    const city = tags["addr:city"];
    const state = normalizeState(tags["addr:state"]) ??
      (tags["addr:country"] === "US" || !tags["addr:country"]
        ? parseStateFromAddr([tags["addr:city"], tags["addr:state"], tags["addr:postcode"]].filter(Boolean).join(", "))
        : null);

    if (!city || !state) { skipped++; continue; }

    const addr = [
      tags["addr:housenumber"],
      tags["addr:street"],
      city,
      state,
      tags["addr:postcode"],
    ].filter(Boolean).join(", ");

    const slug = makeUniqueSlug(slugify(`${name}-${city}-${state}`), seen);

    shops.push({
      name,
      slug,
      address: addr || `${city}, ${state}`,
      city,
      state,
      zip: tags["addr:postcode"] ?? null,
      phone: tags.phone ?? tags["contact:phone"] ?? null,
      website: tags.website ?? tags["contact:website"] ?? null,
      lat: typeof lat === "number" ? lat : null,
      lng: typeof lng === "number" ? lng : null,
      categories: ["Thrift Store"],
      active: true,
    });
  }

  console.log(`Valid shops: ${shops.length} | Skipped (no name/city/state): ${skipped}`);
  console.log(`Upserting into database…`);

  let inserted = 0;
  for (const shop of shops) {
    await prisma.shop.upsert({
      where: { slug: shop.slug },
      update: shop,
      create: shop,
    });
    inserted++;
    if (inserted % 100 === 0) console.log(`  ${inserted}/${shops.length}`);
  }

  console.log(`\nDone! ${inserted} shops seeded into the database.`);
  await prisma.$disconnect();
}

seed().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
