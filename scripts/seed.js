/**
 * Seeds the database from scripts/data/overpass.json.
 * Run: node scripts/seed.js
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

function parseStateFromAddr(addr) {
  for (const [name, abbr] of Object.entries(STATE_ABBR)) {
    if (addr.includes(`, ${name}`) || addr.includes(`, ${abbr},`) || addr.endsWith(`, ${abbr}`)) {
      return abbr;
    }
  }
  const m = addr.match(/,\s*([A-Z]{2})\s*\d{5}/);
  return m ? m[1] : null;
}

async function seed() {
  const raw = JSON.parse(readFileSync(join(__dirname, "data/overpass.json"), "utf8"));
  const elements = raw.elements ?? [];

  console.log(`Processing ${elements.length} elements…`);

  const seen = new Set();
  const shops = [];

  for (const el of elements) {
    const tags = el.tags ?? {};
    const name = tags.name;
    if (!name) continue;

    const addr = [
      tags["addr:housenumber"],
      tags["addr:street"],
      tags["addr:city"],
      tags["addr:state"],
      tags["addr:postcode"],
    ].filter(Boolean).join(", ");

    const city = tags["addr:city"];
    const stateRaw = tags["addr:state"];
    const state = stateRaw
      ? (STATE_ABBR[stateRaw] ?? stateRaw.toUpperCase().slice(0, 2))
      : parseStateFromAddr(addr);

    if (!city || !state) continue;

    const lat = el.lat ?? el.center?.lat ?? null;
    const lng = el.lon ?? el.center?.lon ?? null;

    const slug = makeUniqueSlug(
      slugify(`${name}-${city}-${state}`),
      seen
    );

    shops.push({
      name,
      slug,
      address: addr || `${city}, ${state}`,
      city,
      state,
      zip: tags["addr:postcode"] ?? null,
      phone: tags.phone ?? tags["contact:phone"] ?? null,
      website: tags.website ?? tags["contact:website"] ?? null,
      lat,
      lng,
      categories: ["Thrift Store"],
      active: true,
    });
  }

  console.log(`Upserting ${shops.length} shops…`);

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

  console.log(`Done. ${inserted} shops seeded.`);
  await prisma.$disconnect();
}

seed().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
