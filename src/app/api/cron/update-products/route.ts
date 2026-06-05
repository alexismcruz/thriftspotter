import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Cron job to update product carousel daily at 9pm Central Time
 * Call via: curl -X POST https://thriftspotter.com/api/cron/update-products
 *
 * Setup: Use a cron service like cron-job.org to POST to this endpoint at 9pm CT
 * Cron expression: 0 21 * * * (9pm UTC is 21:00, adjust for daylight savings)
 *
 * For Vercel: Use /vercel.json with crons array, or external service
 */

const SAMPLE_PRODUCTS = [
  {
    title: "Vintage Levi's 501 Denim Jacket",
    description: "Classic 1990s distressed denim, perfect for thrift lovers",
    price: "$24.99",
    affiliate: "ebay",
    affiliateUrl: "https://ebay.com/sch/i.html?_nkw=vintage+levis+jacket&campid=7372111",
    source: "eBay",
    category: "vintage-clothing",
  },
  {
    title: "Mid-Century Modern Wooden Side Table",
    description: "Walnut finish, 1970s design, excellent condition",
    price: "$45.50",
    affiliate: "ebay",
    affiliateUrl: "https://ebay.com/sch/i.html?_nkw=midcentury+furniture&campid=7372111",
    source: "eBay",
    category: "furniture",
  },
  {
    title: "Vinyl Record - The Beatles White Album",
    description: "Original pressing, good condition",
    price: "$35.00",
    affiliate: "ebay",
    affiliateUrl: "https://ebay.com/sch/i.html?_nkw=beatles+vinyl&campid=7372111",
    source: "eBay",
    category: "music",
  },
  {
    title: "Retro 1980s Polaroid Camera",
    description: "Fully functional, comes with strap",
    price: "$28.00",
    affiliate: "ebay",
    affiliateUrl: "https://ebay.com/sch/i.html?_nkw=vintage+polaroid+camera&campid=7372111",
    source: "eBay",
    category: "electronics",
  },
  {
    title: "Handmade Ceramic Vase - Blue Glaze",
    description: "Artisan-made, perfect plant pot",
    price: "$19.99",
    affiliate: "ebay",
    affiliateUrl: "https://ebay.com/sch/i.html?_nkw=vintage+ceramic+vase&campid=7372111",
    source: "eBay",
    category: "home-decor",
  },
  {
    title: "Wool Peacoat - Navy Blue",
    description: "Vintage anchor buttons, pristine condition",
    price: "$32.50",
    affiliate: "ebay",
    affiliateUrl: "https://ebay.com/sch/i.html?_nkw=vintage+peacoat&campid=7372111",
    source: "eBay",
    category: "clothing",
  },
  {
    title: "Vintage Typewriter - Hermes 3000",
    description: "Mechanical, fully operational",
    price: "$89.99",
    affiliate: "ebay",
    affiliateUrl: "https://ebay.com/sch/i.html?_nkw=vintage+typewriter&campid=7372111",
    source: "eBay",
    category: "collectibles",
  },
  {
    title: "Silk Scarf - Hermès Style",
    description: "Vintage silk, beautiful patterns",
    price: "$22.00",
    affiliate: "ebay",
    affiliateUrl: "https://ebay.com/sch/i.html?_nkw=vintage+silk+scarf&campid=7372111",
    source: "eBay",
    category: "accessories",
  },
  {
    title: "Cast Iron Skillet - Lodge Vintage",
    description: "Pre-seasoned, ready to cook",
    price: "$16.50",
    affiliate: "ebay",
    affiliateUrl: "https://ebay.com/sch/i.html?_nkw=vintage+cast+iron&campid=7372111",
    source: "eBay",
    category: "kitchenware",
  },
  {
    title: "Native American Turquoise Jewelry",
    description: "Handcrafted, authentic design",
    price: "$44.99",
    affiliate: "ebay",
    affiliateUrl: "https://ebay.com/sch/i.html?_nkw=turquoise+jewelry&campid=7372111",
    source: "eBay",
    category: "jewelry",
  },
];

async function fetchAndUpdateProducts() {
  try {
    // TODO: In production, fetch real data from eBay/Amazon APIs
    // For now, using sample data rotated with random selection

    // Shuffle and select 10 random items
    const shuffled = SAMPLE_PRODUCTS.sort(() => Math.random() - 0.5).slice(0, 10);

    // Clear old products
    await prisma.product.deleteMany({});

    // Insert new products with randomized prices for variety
    const productsToInsert = shuffled.map((p, i) => ({
      title: p.title,
      description: p.description,
      imageUrl: null, // TODO: fetch real images from eBay
      price: p.price,
      affiliate: p.affiliate,
      affiliateUrl: p.affiliateUrl,
      source: p.source,
      category: p.category,
      position: i,
      active: true,
    }));

    for (const product of productsToInsert) {
      await prisma.product.create({ data: product });
    }

    console.log(`✅ Updated ${productsToInsert.length} products at ${new Date().toISOString()}`);
    return { success: true, count: productsToInsert.length };
  } catch (err) {
    console.error("Error updating products:", err);
    throw err;
  }
}

export async function POST(req: NextRequest) {
  // Verify cron secret if set (optional security measure)
  const cronSecret = req.headers.get("x-cron-secret");
  if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await fetchAndUpdateProducts();
    return NextResponse.json(result);
  } catch (err) {
    console.error("Cron job failed:", err);
    return NextResponse.json(
      { error: "Failed to update products" },
      { status: 500 }
    );
  }
}

// GET is allowed for testing (remove in production if you want)
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET && process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return POST(req);
}
