/**
 * Fetches vintage + consignment shops state by state to avoid Overpass timeouts.
 * Run: node --env-file=.env scripts/fetch-by-state.mjs
 */

import { writeFileSync, unlinkSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { execSync } from "child_process";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const STATES = {
  AL:"Alabama", AK:"Alaska", AZ:"Arizona", AR:"Arkansas", CA:"California",
  CO:"Colorado", CT:"Connecticut", DE:"Delaware", FL:"Florida", GA:"Georgia",
  HI:"Hawaii", ID:"Idaho", IL:"Illinois", IN:"Indiana", IA:"Iowa",
  KS:"Kansas", KY:"Kentucky", LA:"Louisiana", ME:"Maine", MD:"Maryland",
  MA:"Massachusetts", MI:"Michigan", MN:"Minnesota", MS:"Mississippi", MO:"Missouri",
  MT:"Montana", NE:"Nebraska", NV:"Nevada", NH:"New Hampshire", NJ:"New Jersey",
  NM:"New Mexico", NY:"New York", NC:"North Carolina", ND:"North Dakota", OH:"Ohio",
  OK:"Oklahoma", OR:"Oregon", PA:"Pennsylvania", RI:"Rhode Island", SC:"South Carolina",
  SD:"South Dakota", TN:"Tennessee", TX:"Texas", UT:"Utah", VT:"Vermont",
  VA:"Virginia", WA:"Washington", WV:"West Virginia", WI:"Wisconsin", WY:"Wyoming",
};

const US_ABBRS = new Set(Object.keys(STATES));
const STATE_ABBR = Object.fromEntries(Object.entries(STATES).map(([k,v]) => [v.toLowerCase(), k]));

const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.openstreetmap.ru/api/interpreter",
];

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
  if (US_ABBRS.has(upper)) return upper;
  return STATE_ABBR[raw.trim().toLowerCase()] ?? null;
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function fetchState(stateCode) {
  const query = `[out:json][timeout:60];
area["ISO3166-2"="US-${stateCode}"]->.state;
(
  node["shop"="vintage"](area.state);
  node["shop"="consignment"](area.state);
  way["shop"="vintage"](area.state);
  way["shop"="consignment"](area.state);
);
out center tags;`;

  const tmpFile = join(tmpdir(), `overpass-${stateCode}.txt`);
  // Write query as form-encoded to temp file
  writeFileSync(tmpFile, `data=${encodeURIComponent(query)}`);

  for (const endpoint of ENDPOINTS) {
    try {
      const result = execSync(
        `curl -s --max-time 70 -X POST "${endpoint}" --data-binary @"${tmpFile}" -H "Content-Type: application/x-www-form-urlencoded"`,
        { maxBuffer: 20 * 1024 * 1024, timeout: 75000 }
      );
      const text = result.toString().trim();
      if (!text || text.startsWith("<") || text.startsWith("<!")) continue;
      const data = JSON.parse(text);
      if (!Array.isArray(data.elements)) continue;
      try { unlinkSync(tmpFile); } catch {}
      return data.elements;
    } catch {
      // try next endpoint
    }
  }
  try { unlinkSync(tmpFile); } catch {}
  return null;
}

function parseElements(elements, fallbackState) {
  const shops = [];
  for (const el of elements) {
    const tags = el.tags ?? {};
    const name = tags.name;
    if (!name) continue;

    const city = tags["addr:city"];
    const state = normalizeState(tags["addr:state"]) ?? fallbackState;
    if (!city || !state) continue;

    const lat = el.lat ?? el.center?.lat ?? null;
    const lng = el.lon ?? el.center?.lon ?? null;

    const addr = [
      tags["addr:housenumber"],
      tags["addr:street"],
      city,
      state,
      tags["addr:postcode"],
    ].filter(Boolean).join(", ");

    shops.push({
      name,
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
  return shops;
}

async function main() {
  const stateCodes = Object.keys(STATES);

  // Load all existing slugs to avoid conflicts
  const existing = await prisma.shop.findMany({ select: { slug: true } });
  const seen = new Set(existing.map(s => s.slug));

  console.log(`\n🛍️  ThriftSpotter — State-by-State Fetch`);
  console.log(`Existing shops in DB: ${seen.size}`);
  console.log(`Fetching vintage & consignment shops across all 50 states...\n`);

  let totalAdded = 0;
  let totalFailed = 0;

  for (let i = 0; i < stateCodes.length; i++) {
    const code = stateCodes[i];
    const name = STATES[code];
    process.stdout.write(`[${String(i + 1).padStart(2, "0")}/50] ${name.padEnd(20)} ... `);

    const elements = fetchState(code);

    if (!elements) {
      console.log(`⚠️  SKIPPED (API unreachable)`);
      totalFailed++;
    } else {
      const shops = parseElements(elements, code);
      let added = 0;

      for (const shop of shops) {
        const slug = makeUniqueSlug(slugify(`${shop.name}-${shop.city}-${shop.state}`), seen);
        try {
          await prisma.shop.upsert({
            where: { slug },
            update: {},
            create: { ...shop, slug },
          });
          added++;
          totalAdded++;
        } catch {
          // slug conflict, skip
        }
      }

      console.log(`${elements.length} found → ${added} new`);
    }

    // Be polite to the API — 2s between states
    if (i < stateCodes.length - 1) await sleep(2000);
  }

  console.log(`\n✅ Done!`);
  console.log(`   New shops added: ${totalAdded}`);
  console.log(`   States failed:   ${totalFailed}`);
  await prisma.$disconnect();
}

main().catch(async e => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
