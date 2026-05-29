import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function haversineMiles(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lng = parseFloat(searchParams.get("lng") ?? "");
  const radius = parseFloat(searchParams.get("radius") ?? "25");

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
  }

  // Bounding box to reduce DB rows fetched
  const latDelta = radius / 69;
  const lngDelta = radius / (69 * Math.cos((lat * Math.PI) / 180));

  const shops = await prisma.shop.findMany({
    where: {
      active: true,
      lat: { gte: lat - latDelta, lte: lat + latDelta },
      lng: { gte: lng - lngDelta, lte: lng + lngDelta },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      address: true,
      city: true,
      state: true,
      phone: true,
      website: true,
      description: true,
      categories: true,
      featured: true,
      rating: true,
      lat: true,
      lng: true,
    },
  });

  const withDistance = shops
    .map((s) => ({
      ...s,
      distanceMiles: haversineMiles(lat, lng, s.lat!, s.lng!),
    }))
    .filter((s) => s.distanceMiles <= radius)
    .sort((a, b) => a.distanceMiles - b.distanceMiles)
    .slice(0, 30);

  return NextResponse.json(withDistance);
}
