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
    description: "Classic 1990s distressed denim with authentic wear. Perfect statement piece for any wardrobe.",
    price: "$24.99",
    imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=400&h=400&fit=crop",
    affiliate: "ebay",
    affiliateUrl: "https://ebay.com/sch/i.html?_nkw=vintage+levis+jacket&campid=7372111",
    source: "eBay",
    category: "vintage-clothing",
  },
  {
    title: "Mid-Century Modern Side Table",
    description: "Walnut finish, 1970s design with clean lines. Excellent condition, ready to display.",
    price: "$45.50",
    imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop",
    affiliate: "ebay",
    affiliateUrl: "https://ebay.com/sch/i.html?_nkw=midcentury+furniture&campid=7372111",
    source: "eBay",
    category: "furniture",
  },
  {
    title: "The Beatles White Album Vinyl",
    description: "Original vinyl pressing in good condition. A collectors' classic for music enthusiasts.",
    price: "$35.00",
    imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop",
    affiliate: "ebay",
    affiliateUrl: "https://ebay.com/sch/i.html?_nkw=beatles+vinyl&campid=7372111",
    source: "eBay",
    category: "music",
  },
  {
    title: "Retro 1980s Polaroid Camera",
    description: "Fully functional with original strap. Great for instant photography nostalgia.",
    price: "$28.00",
    imageUrl: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop",
    affiliate: "ebay",
    affiliateUrl: "https://ebay.com/sch/i.html?_nkw=vintage+polaroid+camera&campid=7372111",
    source: "eBay",
    category: "electronics",
  },
  {
    title: "Handmade Ceramic Vase - Blue",
    description: "Artisan-made with beautiful blue glaze. Perfect as plant pot or decorative accent piece.",
    price: "$19.99",
    imageUrl: "https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=400&h=400&fit=crop",
    affiliate: "ebay",
    affiliateUrl: "https://ebay.com/sch/i.html?_nkw=vintage+ceramic+vase&campid=7372111",
    source: "eBay",
    category: "home-decor",
  },
  {
    title: "Wool Peacoat - Navy Blue",
    description: "Vintage wool coat with authentic anchor buttons. Pristine condition, timeless style.",
    price: "$32.50",
    imageUrl: "https://images.unsplash.com/photo-1539533057440-7814a3d12e6e?w=400&h=400&fit=crop",
    affiliate: "ebay",
    affiliateUrl: "https://ebay.com/sch/i.html?_nkw=vintage+peacoat&campid=7372111",
    source: "eBay",
    category: "clothing",
  },
  {
    title: "Vintage Hermes Typewriter",
    description: "Mechanical typewriter in full working order. A desktop statement piece for collectors.",
    price: "$89.99",
    imageUrl: "https://images.unsplash.com/photo-1609034227505-5876f6aa4e90?w=400&h=400&fit=crop",
    affiliate: "ebay",
    affiliateUrl: "https://ebay.com/sch/i.html?_nkw=vintage+typewriter&campid=7372111",
    source: "eBay",
    category: "collectibles",
  },
  {
    title: "Vintage Silk Scarf",
    description: "Authentic vintage silk with beautiful traditional patterns. Versatile and elegant accessory.",
    price: "$22.00",
    imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop",
    affiliate: "ebay",
    affiliateUrl: "https://ebay.com/sch/i.html?_nkw=vintage+silk+scarf&campid=7372111",
    source: "eBay",
    category: "accessories",
  },
  {
    title: "Lodge Cast Iron Skillet",
    description: "Pre-seasoned vintage skillet ready for cooking. Durable and built to last generations.",
    price: "$16.50",
    imageUrl: "https://images.unsplash.com/photo-1578500606732-d6ab79df1ab2?w=400&h=400&fit=crop",
    affiliate: "ebay",
    affiliateUrl: "https://ebay.com/sch/i.html?_nkw=vintage+cast+iron&campid=7372111",
    source: "eBay",
    category: "kitchenware",
  },
  {
    title: "Native American Turquoise Ring",
    description: "Handcrafted with authentic turquoise stones. Traditional design with genuine artistry.",
    price: "$44.99",
    imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop",
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
