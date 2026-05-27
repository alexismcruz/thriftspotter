import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Chain-specific descriptions
function chainDescription(name, city, state) {
  const n = name.toLowerCase();
  if (n.includes("goodwill")) {
    return `Goodwill in ${city}, ${state} offers a wide selection of donated clothing, furniture, electronics, and household goods at affordable prices. All proceeds support local job training and community programs.`;
  }
  if (n.includes("salvation army")) {
    return `The Salvation Army Thrift Store in ${city}, ${state} carries gently used clothing, furniture, and household items at budget-friendly prices. Proceeds support local social services and community outreach.`;
  }
  if (n.includes("savers") || n.includes("value village")) {
    return `Savers in ${city}, ${state} is a large-format thrift store offering a constantly rotating selection of secondhand clothing, accessories, shoes, and housewares at great prices.`;
  }
  if (n.includes("habitat") || n.includes("restore")) {
    return `Habitat for Humanity ReStore in ${city}, ${state} sells new and gently used furniture, appliances, and building materials at discounted prices. Proceeds help fund affordable housing in the local community.`;
  }
  if (n.includes("arc") || n.includes("a.r.c")) {
    return `Arc Thrift in ${city}, ${state} offers a large selection of secondhand clothing, furniture, and household goods. Proceeds support services for people with intellectual and developmental disabilities.`;
  }
  if (n.includes("st. vincent") || n.includes("saint vincent") || n.includes("svdp") || n.includes("de paul")) {
    return `St. Vincent de Paul in ${city}, ${state} is a community thrift store offering affordable clothing, furniture, and household items. Proceeds directly support neighbors in need through local charitable programs.`;
  }
  if (n.includes("amvets")) {
    return `AMVETS Thrift Store in ${city}, ${state} carries a wide variety of donated clothing, furniture, and household goods. Proceeds benefit veterans and their families through AMVETS programs.`;
  }
  if (n.includes("community") || n.includes("helping hand") || n.includes("hope")) {
    return `${name} in ${city}, ${state} is a community-run thrift store offering affordable secondhand clothing, household goods, and furniture. A great spot for budget-conscious shoppers and treasure hunters alike.`;
  }
  return null;
}

// Generic templates — pick by shop id to distribute variety
const TEMPLATES = [
  (name, city, state) =>
    `${name} is a thrift store in ${city}, ${state} with a constantly rotating selection of secondhand clothing, accessories, and household items at unbeatable prices. Stop in regularly to catch the best finds.`,
  (name, city, state) =>
    `Located in ${city}, ${state}, ${name} is your local destination for affordable secondhand shopping. Browse through clothing, furniture, books, and unique everyday items.`,
  (name, city, state) =>
    `${name} in ${city}, ${state} is a beloved community thrift shop offering gently used clothing, housewares, furniture, and one-of-a-kind vintage finds at prices everyone can enjoy.`,
  (name, city, state) =>
    `Find great deals on clothing, furniture, and everyday essentials at ${name} in ${city}, ${state}. A go-to spot for bargain hunters and eco-friendly shoppers in the area.`,
  (name, city, state) =>
    `${name} serves the ${city} community with a curated selection of pre-loved clothing, home goods, and accessories. New inventory arrives regularly so there's always something new to discover.`,
  (name, city, state) =>
    `Thrift shoppers in ${city}, ${state} love ${name} for its wide variety of secondhand clothing, shoes, and household items. Great prices and fresh stock make every visit worthwhile.`,
  (name, city, state) =>
    `Whether you're hunting for vintage gems or everyday basics, ${name} in ${city}, ${state} has you covered with an ever-changing mix of secondhand clothing, décor, and more.`,
];

function generateDescription(shop) {
  const chain = chainDescription(shop.name, shop.city, shop.state);
  if (chain) return chain;
  const idx = shop.id % TEMPLATES.length;
  return TEMPLATES[idx](shop.name, shop.city, shop.state);
}

async function main() {
  console.log("Fetching shops without descriptions...");
  const shops = await prisma.shop.findMany({
    where: { active: true, description: null },
    select: { id: true, name: true, city: true, state: true },
  });

  console.log(`Generating descriptions for ${shops.length} shops...`);

  const BATCH = 100;
  let updated = 0;

  for (let i = 0; i < shops.length; i += BATCH) {
    const batch = shops.slice(i, i + BATCH);
    await Promise.all(
      batch.map((shop) =>
        prisma.shop.update({
          where: { id: shop.id },
          data: { description: generateDescription(shop) },
        })
      )
    );
    updated += batch.length;
    console.log(`  Updated ${updated}/${shops.length}...`);
  }

  console.log(`✅ Done! ${updated} descriptions generated.`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
