"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import Link from "next/link";
import { slugify, stateSlug } from "@/lib/utils";

type ShopPin = {
  id: number;
  name: string;
  slug: string;
  address: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
};

type Props = {
  shops: ShopPin[];
  center: [number, number];
  zoom: number;
};

export default function ShopMap({ shops, center, zoom }: Props) {
  useEffect(() => {
    // Fix Leaflet's default marker icon broken by webpack
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require("leaflet");
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  return (
    <MapContainer
      center={center as LatLngExpression}
      zoom={zoom}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {shops.map((shop) => (
        <Marker key={shop.id} position={[shop.lat, shop.lng] as LatLngExpression}>
          <Popup>
            <div className="text-sm space-y-1 min-w-[160px]">
              <p className="font-semibold leading-snug">{shop.name}</p>
              <p className="text-stone-500 text-xs">{shop.address}</p>
              <Link
                href={`/shop/${shop.slug}`}
                className="block text-brand-600 text-xs font-medium hover:underline pt-1"
              >
                View details →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
