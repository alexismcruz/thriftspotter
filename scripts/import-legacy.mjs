/**
 * Imports legacy scraped data from CSV and XLSX files.
 * Run: node --env-file=.env scripts/import-legacy.mjs
 */

import { readFileSync, existsSync } from "fs";
import { createRequire } from "module";
import { PrismaClient } from "@prisma/client";

const require = createRequire(import.meta.url);
const XLSX = require("../node_modules/xlsx");

const prisma = new PrismaClient();

const US_ABBRS = new Set([
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
]);

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

// Parse "City, STATE ZIP" from address_2 field
function parseCityState(addr2) {
  if (!addr2) return null;
  const m = String(addr2).match(/^(.+?),\s*([A-Z]{2})\s*(\d{5})?/);
  if (!m) return null;
  const state = m[2];
  if (!US_ABBRS.has(state)) return null;
  return { city: m[1].trim(), state, zip: m[3] ?? null };
}

// Parse "Street City, STATE ZIP" from full address string (CSV format)
function parseCityStateFromFull(addr) {
  if (!addr) return null;
  // Match the last "City, STATE ZIP" at end of string
  const m = String(addr).match(/([A-Za-z][A-Za-z\s]+),\s*([A-Z]{2})\s*(\d{5})?$/);
  if (!m) return null;
  const state = m[2];
  if (!US_ABBRS.has(state)) return null;
  return { city: m[1].trim(), state, zip: m[3] ?? null };
}

// Map sheet name to category
function sheetToCategory(sheetName) {
  const map = {
    "Thrift Store": "Thrift Store",
    "Thrift Shop": "Thrift Store",
    "Vintage Shops": "Vintage Store",
    "Vintage Store": "Vintage Store",
    "Antique Shops": "Vintage Store",
    "Antique Market": "Vintage Store",
    "Vintage Market": "Vintage Store",
    "Vintage Fair": "Vintage Store",
    "Used Goods": "Thrift Store",
    "Used Clothing": "Clothing Resale",
    "Secondhand Shops": "Thrift Store",
    "Swap Meet": "Thrift Store",
    "Thrift Bazaars": "Thrift Store",
    "Flea Market": "Thrift Store",
  };
  return map[sheetName] ?? "Thrift Store";
}

function parseShop(name, addr1, addr2, phone, website, rating, reviewCount, category) {
  if (!name || !name.trim()) return null;
  const loc = parseCityState(addr2);
  if (!loc) return null;

  const a1 = String(addr1 ?? "").trim();
  const a2 = String(addr2 ?? "").trim();
  const address = a1 && a2 ? `${a1}, ${a2}` : a2 || a1;

  return {
    name: String(name).trim(),
    address,
    city: loc.city,
    state: loc.state,
    zip: loc.zip,
    phone: phone ? String(phone).trim() || null : null,
    website: website ? String(website).trim() || null : null,
    rating: typeof rating === "number" ? parseFloat(rating.toFixed(1)) : null,
    reviewCount: typeof reviewCount === "number" ? Math.round(reviewCount) : null,
    categories: ["Thrift Store", ...(category !== "Thrift Store" ? [category] : [])],
    active: true,
  };
}

async function main() {
  // Load existing shops for deduplication (by name+city+state fingerprint AND slug)
  const existing = await prisma.shop.findMany({ select: { slug: true, name: true, city: true, state: true } });
  const seen = new Set(existing.map(s => s.slug));
  // Fingerprint set: slugified name+city+state — prevents duplicates even if slug differs
  const fingerprints = new Set(existing.map(s =>
    `${slugify(s.name)}|${slugify(s.city)}|${s.state.toLowerCase()}`
  ));
  console.log(`Existing shops: ${existing.length}\n`);

  const allShops = [];

  // ── 1. California CSVs ──────────────────────────────────────────
  const csvFiles = [
    "C:/Users/User/Documents/Thrift Directory/California-AdaloUpload.csv",
    "C:/Users/User/Documents/Thrift Directory/California-AdaloUpload2.csv",
    "C:/Users/User/Documents/Thrift Directory/California-AdaloUpload3.csv",
  ];

  for (const csvPath of csvFiles) {
    if (!existsSync(csvPath)) continue;
    const lines = readFileSync(csvPath, "utf8").split("\n").slice(1); // skip header
    let count = 0;
    for (const line of lines) {
      if (!line.trim()) continue;
      // CSV: name, address, postal_code, phone, website, rating, reviews_count
      const cols = line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/); // handle quoted commas
      const name = cols[0]?.replace(/^"|"$/g, "").trim();
      const fullAddr = cols[1]?.replace(/^"|"$/g, "").trim();
      const phone = cols[3]?.replace(/^"|"$/g, "").trim();
      const website = cols[4]?.replace(/^"|"$/g, "").trim();
      const rating = parseFloat(cols[5]) || null;
      const reviewCount = parseInt(cols[6]) || null;
      if (!name || !fullAddr) continue;
      const loc = parseCityStateFromFull(fullAddr);
      if (!loc) continue;
      allShops.push({
        name, address: fullAddr, city: loc.city, state: loc.state, zip: loc.zip,
        phone: phone || null, website: website || null,
        rating: rating ? parseFloat(rating.toFixed(1)) : null,
        reviewCount: reviewCount || null,
        categories: ["Thrift Store"], active: true,
      });
      count++;
    }
    console.log(`CSV ${csvPath.split("/").pop()}: ${count} shops`);
  }

  // ── 2. Nevada CSV ──────────────────────────────────────────────
  const nvPath = "C:/Users/User/Documents/Thrift Directory/NevadaThrift_AdaloUpload.csv";
  if (existsSync(nvPath)) {
    const lines = readFileSync(nvPath, "utf8").split("\n").slice(1);
    let count = 0;
    for (const line of lines) {
      if (!line.trim()) continue;
      const cols = line.split(",");
      const name = cols[0]?.trim();
      const rating = parseFloat(cols[1]) || null;
      const reviewCount = parseInt(cols[2]) || null;
      const category = cols[3]?.trim();
      const address = cols[4]?.trim();
      const phone = cols[5]?.trim();
      if (!name || !address) continue;
      // Nevada addresses don't have city - skip for now as we'd need geocoding
      // But we know state=NV
      allShops.push({
        name, address: `${address}, NV`, city: "Las Vegas", state: "NV", zip: null,
        phone: phone || null, website: null,
        rating: rating ? parseFloat(rating.toFixed(1)) : null,
        reviewCount: reviewCount || null,
        categories: ["Thrift Store"], active: true,
      });
      count++;
    }
    console.log(`Nevada CSV: ${count} shops`);
  }

  // ── 3. XLSX files ──────────────────────────────────────────────
  const xlsxFiles = [
    "C:/Users/User/Documents/Thrift Directory/California.xlsx",
    "C:/Users/User/Documents/Thrift Directory/Texas.xlsx",
  ];

  for (const xlsxPath of xlsxFiles) {
    if (!existsSync(xlsxPath)) continue;
    const wb = XLSX.readFile(xlsxPath);
    let fileCount = 0;

    for (const sheetName of wb.SheetNames) {
      if (sheetName === "Merged_Cleaned" || sheetName === "California Postal Codes") continue;
      const sheet = wb.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }).slice(1);
      const category = sheetToCategory(sheetName);
      let sheetCount = 0;

      for (const row of rows) {
        if (!row[0]) continue;
        // Format: name, addr1, addr2, [addr, addr,] postal, phone, website, rating, reviews
        let name, addr1, addr2, phone, website, rating, reviewCount;

        if (row.length >= 10) {
          // Extended format with duplicate address columns
          [name, addr1, addr2,,, , phone, website, rating, reviewCount] = row;
        } else {
          [name, addr1, addr2, phone, website, rating, reviewCount] = row;
        }

        const shop = parseShop(name, addr1, addr2, phone, website, rating, reviewCount, category);
        if (shop) { allShops.push(shop); sheetCount++; fileCount++; }
      }
    }
    console.log(`${xlsxPath.split("/").pop()}: ${fileCount} shops`);
  }

  // ── 4. Deduplicate and insert ──────────────────────────────────
  console.log(`\nTotal raw records: ${allShops.length}`);

  // Deduplicate within import batch by name+city+state
  const importSeen = new Set();
  const unique = allShops.filter(s => {
    const key = `${slugify(s.name)}-${slugify(s.city)}-${s.state.toLowerCase()}`;
    if (importSeen.has(key)) return false;
    importSeen.add(key);
    return true;
  });
  console.log(`After dedup within import: ${unique.length}`);

  let added = 0;
  let skipped = 0;

  for (const shop of unique) {
    // Skip if already exists in DB by name+city+state fingerprint
    const fp = `${slugify(shop.name)}|${slugify(shop.city)}|${shop.state.toLowerCase()}`;
    if (fingerprints.has(fp)) { skipped++; continue; }

    const slugBase = slugify(`${shop.name}-${shop.city}-${shop.state}`);
    const slug = makeUniqueSlug(slugBase, seen);

    try {
      await prisma.shop.create({ data: { ...shop, slug } });
      fingerprints.add(fp); // prevent duplicates within this batch
      added++;
    } catch {
      skipped++;
    }

    if ((added + skipped) % 100 === 0) {
      process.stdout.write(`\r  Progress: ${added} added, ${skipped} skipped...`);
    }
  }

  console.log(`\n\n✅ Done!`);
  console.log(`   New shops added: ${added}`);
  console.log(`   Skipped (duplicates): ${skipped}`);
  await prisma.$disconnect();
}

main().catch(async e => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
