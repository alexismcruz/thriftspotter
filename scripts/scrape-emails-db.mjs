/**
 * Scrapes emails from shop websites pulled directly from the DB.
 * Only targets independent shops (skips chains) with websites we haven't scraped yet.
 * Run: node --env-file=.env scripts/scrape-emails-db.mjs
 * Output: C:/Users/User/Documents/Thrift Spotter/outreach-new.csv
 */

import fs from "fs";
import https from "https";
import http from "http";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CHAINS = [
  "goodwill","salvation army","habitat for humanity","habitat restore",
  "savers","value village","arc thrift","the arc ","amvets",
  "deseret industries","saint vincent de paul","st vincent de paul",
  "st. vincent de paul","svdp","community aid","plato's closet",
  "once upon a child","kid to kid","2nd ave","second ave",
  "unique thrift","red white and blue","family thrift center",
  "america's thrift","thrift town","buffalo exchange","crossroads trading",
];

function isChain(name) {
  const l = name.toLowerCase();
  return CHAINS.some(c => l.includes(c));
}

function isScrapeable(website) {
  if (!website) return false;
  const w = website.toLowerCase();
  return !w.includes("facebook.com") && !w.includes("instagram.com") &&
         !w.includes("twitter.com") && !w.includes("yelp.com") &&
         !w.includes("linkedin.com");
}

const EMAIL_RE = /\b([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})\b/g;
const IGNORE_DOMAINS = [
  "sentry.io","example.com","schema.org","wix.com","wordpress.com",
  "google.com","apple.com","facebook.com","instagram.com","w3.org",
  "jquery.com","cloudflare.com","fontawesome.com","squarespace.com",
  "shopify.com","amazonaws.com","cdnjs.com","jsdelivr.net",
];

function extractEmails(html) {
  const found = new Set();
  for (const m of html.matchAll(EMAIL_RE)) {
    const email = m[1].toLowerCase();
    if (IGNORE_DOMAINS.some(d => email.includes(d))) continue;
    if (email.endsWith(".png") || email.endsWith(".jpg") || email.endsWith(".svg") || email.endsWith(".gif")) continue;
    if (email.split("@")[0].length < 2) continue;
    found.add(email);
  }
  return [...found];
}

function fetchPage(url, timeout = 6000) {
  return new Promise(resolve => {
    try {
      const lib = url.startsWith("https") ? https : http;
      const req = lib.get(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; ThriftSpotter-bot/1.0)" },
        timeout,
      }, res => {
        if ([301,302,303,307,308].includes(res.statusCode) && res.headers.location) {
          const next = res.headers.location.startsWith("http")
            ? res.headers.location
            : new URL(res.headers.location, url).href;
          return fetchPage(next, timeout).then(resolve);
        }
        let body = "";
        res.on("data", d => { if (body.length < 150000) body += d; });
        res.on("end", () => resolve(body));
        res.on("error", () => resolve(""));
      });
      req.on("timeout", () => { req.destroy(); resolve(""); });
      req.on("error", () => resolve(""));
    } catch { resolve(""); }
  });
}

function normaliseUrl(raw) {
  let u = raw.trim();
  if (!u.startsWith("http")) u = "https://" + u;
  return u.replace(/\/$/, "");
}

function subpage(base, path) {
  try { return new URL(base).origin + path; } catch { return null; }
}

async function scrapeShop(shop) {
  const base = normaliseUrl(shop.website);
  let html = await fetchPage(base);
  let emails = extractEmails(html);

  if (emails.length === 0) {
    const contact = subpage(base, "/contact");
    if (contact) { html = await fetchPage(contact); emails = extractEmails(html); }
  }
  if (emails.length === 0) {
    const about = subpage(base, "/about");
    if (about) { html = await fetchPage(about); emails = extractEmails(html); }
  }
  if (emails.length === 0) {
    const contact2 = subpage(base, "/contact-us");
    if (contact2) { html = await fetchPage(contact2); emails = extractEmails(html); }
  }

  return { ...shop, foundEmails: emails };
}

function csvEsc(v) {
  const s = String(v ?? "");
  return s.includes(",") || s.includes('"') || s.includes("\n")
    ? '"' + s.replace(/"/g, '""') + '"' : s;
}

async function main() {
  console.log("Loading shops from DB...");

  const shops = await prisma.shop.findMany({
    where: { active: true, website: { not: null } },
    select: { id: true, name: true, city: true, state: true, phone: true, website: true, slug: true },
    orderBy: { id: "asc" },
  });

  // Filter to independent shops with scrapeable websites
  const targets = shops.filter(s => !isChain(s.name) && isScrapeable(s.website));
  console.log(`Total with websites: ${shops.length}`);
  console.log(`Independent + scrapeable: ${targets.length}`);
  console.log(`Starting scrape in batches of 15...\n`);

  const BATCH = 15;
  const withEmail = [];
  const withoutEmail = [];
  let done = 0;

  for (let i = 0; i < targets.length; i += BATCH) {
    const batch = targets.slice(i, i + BATCH);
    const results = await Promise.all(batch.map(scrapeShop));

    for (const r of results) {
      if (r.foundEmails.length > 0) withEmail.push(r);
      else withoutEmail.push(r);
    }

    done += batch.length;
    process.stdout.write(
      `\r${done}/${targets.length} processed — ${withEmail.length} emails found...`
    );

    // Small pause between batches to be polite
    await new Promise(r => setTimeout(r, 300));
  }

  console.log("\n\nWriting CSV...");

  const headers = ["Business Name","Location","Email","Phone","Website","ThriftSpotter URL","Status"];
  const rows = [
    ...withEmail.map(r => [
      r.name,
      `${r.city}, ${r.state}`,
      r.foundEmails.join("; "),
      r.phone ?? "",
      r.website,
      `https://www.thriftspotter.com/shop/${r.slug}`,
      "Email found",
    ]),
    ...withoutEmail.map(r => [
      r.name,
      `${r.city}, ${r.state}`,
      "",
      r.phone ?? "",
      r.website,
      `https://www.thriftspotter.com/shop/${r.slug}`,
      "No email found",
    ]),
  ];

  const csv = [headers, ...rows].map(r => r.map(csvEsc).join(",")).join("\r\n");
  const outPath = "C:/Users/User/Documents/Thrift Spotter/outreach-new.csv";
  fs.writeFileSync(outPath, csv, "utf8");

  console.log(`\n✅  ${withEmail.length} emails found`);
  console.log(`⚠️  ${withoutEmail.length} shops — no email found`);
  console.log(`📄  Saved to: ${outPath}`);

  await prisma.$disconnect();
}

main().catch(async e => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
