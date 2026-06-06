import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const EBAY_TOKEN_URL = "https://api.ebay.com/identity/v1/oauth2/token";
const EBAY_BROWSE_URL = "https://api.ebay.com/buy/browse/v1/item_summary/search";
const CAMPAIGN_ID = process.env.EBAY_CAMPAIGN_ID ?? "7372111";

// Rotate through these search terms nightly for variety
const SEARCH_TERMS = [
  "vintage clothing lot",
  "thrift store vintage finds",
  "vintage denim jacket",
  "vintage home decor",
  "vintage record vinyl",
  "secondhand furniture",
  "vintage accessories jewelry",
  "vintage collectibles",
  "retro clothing women",
  "vintage kitchenware",
];

async function getEbayToken(): Promise<string> {
  const appId = process.env.EBAY_APP_ID;
  const certId = process.env.EBAY_CERT_ID;

  if (!appId || !certId) throw new Error("Missing EBAY_APP_ID or EBAY_CERT_ID");

  const credentials = Buffer.from(`${appId}:${certId}`).toString("base64");

  const res = await fetch(EBAY_TOKEN_URL, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope",
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`eBay token error: ${err}`);
  }

  const data = await res.json();
  return data.access_token;
}

async function fetchEbayProducts(token: string): Promise<{
  title: string;
  description: string;
  imageUrl: string | null;
  price: string;
  affiliateUrl: string;
  category: string;
}[]> {
  // Pick today's search term based on day of year
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const searchTerm = SEARCH_TERMS[dayOfYear % SEARCH_TERMS.length];

  const params = new URLSearchParams({
    q: searchTerm,
    limit: "20",
    filter: "buyingOptions:{FIXED_PRICE},conditions:{USED|VERY_GOOD|GOOD|ACCEPTABLE},price:[5..500],priceCurrency:USD",
    sort: "newlyListed",
  });

  const res = await fetch(`${EBAY_BROWSE_URL}?${params}`, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
      "X-EBAY-C-ENDUSERCTX": `affiliateCampaignId=${CAMPAIGN_ID}`,
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`eBay Browse API error: ${err}`);
  }

  const data = await res.json();
  const items = data.itemSummaries ?? [];

  // Map to our product schema
  return items
    .filter((item: any) => item.title && item.price)
    .slice(0, 10)
    .map((item: any, i: number) => {
      const price = item.price?.value
        ? `$${parseFloat(item.price.value).toFixed(2)}`
        : null;

      // Build affiliate URL with campaign ID
      const itemId = item.itemId?.replace("v1|", "").split("|")[0];
      const affiliateUrl = `https://www.ebay.com/itm/${itemId}?campid=${CAMPAIGN_ID}&mkevt=1&mkrid=711-53200-19255-0&mkcid=1`;

      // Get image URL — upgrade to 500px size for better display
      const rawImage = item.image?.imageUrl ?? item.thumbnailImages?.[0]?.imageUrl ?? null;
      const imageUrl = rawImage
        ? rawImage.replace(/s-l\d+\.jpg/, "s-l500.jpg").replace(/s-l\d+\.webp/, "s-l500.webp")
        : null;

      // Determine category from item
      const catName = item.categories?.[0]?.categoryName?.toLowerCase() ?? "";
      let category = "vintage-finds";
      if (catName.includes("cloth") || catName.includes("shirt") || catName.includes("jacket") || catName.includes("dress")) category = "vintage-clothing";
      else if (catName.includes("furni") || catName.includes("chair") || catName.includes("table")) category = "furniture";
      else if (catName.includes("jewel") || catName.includes("ring") || catName.includes("necklace")) category = "jewelry";
      else if (catName.includes("record") || catName.includes("vinyl") || catName.includes("music")) category = "music";
      else if (catName.includes("electron") || catName.includes("camera") || catName.includes("phone")) category = "electronics";
      else if (catName.includes("kitchen") || catName.includes("cook") || catName.includes("dish")) category = "kitchenware";
      else if (catName.includes("book")) category = "books";

      return {
        title: item.title,
        description: item.shortDescription ?? item.condition ?? "Preloved item in great condition",
        imageUrl,
        price: price ?? "Check price",
        affiliateUrl,
        category,
        position: i,
      };
    });
}

async function updateProducts() {
  const token = await getEbayToken();
  console.log("✅ eBay OAuth token obtained");

  const products = await fetchEbayProducts(token);
  console.log(`📦 Fetched ${products.length} real eBay products`);

  // Clear old products and insert fresh ones
  await prisma.product.deleteMany({});

  for (const p of products) {
    await prisma.product.create({
      data: {
        title: p.title,
        description: p.description,
        imageUrl: p.imageUrl,
        price: p.price,
        affiliate: "ebay",
        affiliateUrl: p.affiliateUrl,
        source: "eBay",
        category: p.category,
        position: products.indexOf(p),
        active: true,
      },
    });
  }

  console.log(`✅ Updated carousel with ${products.length} real eBay listings`);
  return { success: true, count: products.length };
}

export async function POST(req: NextRequest) {
  const cronSecret = req.headers.get("x-cron-secret");
  if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await updateProducts();
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Cron job failed:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return POST(req);
}
