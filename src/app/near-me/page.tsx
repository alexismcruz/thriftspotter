"use client";

import { useState } from "react";
import Link from "next/link";
import ShopCard from "@/components/ShopCard";

type NearbyShop = {
  id: number;
  name: string;
  slug: string;
  address: string;
  city: string;
  state: string;
  phone: string | null;
  website: string | null;
  description: string | null;
  categories: string[];
  featured: boolean;
  rating: number | null;
  reviewCount: number | null;
  lat: number | null;
  lng: number | null;
  distanceMiles: number;
};

type Status = "idle" | "locating" | "loading" | "done" | "error";

export default function NearMePage() {
  const [status, setStatus] = useState<Status>("idle");
  const [shops, setShops] = useState<NearbyShop[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [locationLabel, setLocationLabel] = useState("");

  async function findNearMe() {
    setStatus("locating");
    setErrorMsg("");

    if (!navigator.geolocation) {
      setErrorMsg("Your browser doesn't support location services.");
      setStatus("error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setStatus("loading");

        try {
          const res = await fetch(`/api/near-me?lat=${latitude}&lng=${longitude}&radius=25`);
          if (!res.ok) throw new Error("Failed to fetch nearby stores.");
          const data: NearbyShop[] = await res.json();
          setShops(data);
          setLocationLabel(`within 25 miles of your location`);
          setStatus("done");
        } catch {
          setErrorMsg("Something went wrong fetching nearby stores. Please try again.");
          setStatus("error");
        }
      },
      (err) => {
        if (err.code === 1) {
          setErrorMsg("Location access was denied. Please allow location access in your browser and try again.");
        } else {
          setErrorMsg("Couldn't get your location. Please try again.");
        }
        setStatus("error");
      },
      { timeout: 10000 }
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-stone-900 mb-3">Thrift Stores Near Me</h1>
        <p className="text-stone-500 max-w-xl mx-auto">
          Find thrift stores, consignment shops, and secondhand stores within 25 miles of your current location.
        </p>
      </div>

      {/* CTA button */}
      {status === "idle" && (
        <div className="flex justify-center mb-12">
          <button
            onClick={findNearMe}
            className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors flex items-center gap-3 shadow-md"
          >
            <span>📍</span> Use My Location
          </button>
        </div>
      )}

      {/* Locating */}
      {status === "locating" && (
        <div className="flex flex-col items-center gap-3 py-16 text-stone-500">
          <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p>Getting your location…</p>
        </div>
      )}

      {/* Loading stores */}
      {status === "loading" && (
        <div className="flex flex-col items-center gap-3 py-16 text-stone-500">
          <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p>Finding nearby thrift stores…</p>
        </div>
      )}

      {/* Error */}
      {status === "error" && (
        <div className="max-w-md mx-auto text-center py-12">
          <p className="text-stone-600 mb-6">{errorMsg}</p>
          <button
            onClick={() => setStatus("idle")}
            className="bg-brand-600 text-white px-6 py-3 rounded-lg hover:bg-brand-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Results */}
      {status === "done" && (
        <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-stone-500 text-sm">
                {shops.length > 0
                  ? `Found ${shops.length} thrift store${shops.length !== 1 ? "s" : ""} ${locationLabel}`
                  : `No thrift stores found within 25 miles of your location.`}
              </p>
            </div>
            <button
              onClick={() => { setStatus("idle"); setShops([]); }}
              className="text-sm text-brand-600 hover:underline"
            >
              Search again
            </button>
          </div>

          {shops.length === 0 ? (
            <div className="text-center py-16 text-stone-500">
              <p className="text-4xl mb-4">🗺️</p>
              <p className="font-medium text-stone-700 mb-2">No stores found nearby</p>
              <p className="text-sm mb-6">Try browsing by state instead.</p>
              <Link href="/" className="bg-brand-600 text-white px-6 py-3 rounded-lg hover:bg-brand-700 transition-colors text-sm">
                Browse all states →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {shops.map((shop) => (
                <div key={shop.id} className="relative">
                  <ShopCard shop={shop} />
                  <div className="absolute top-3 right-3 bg-white border border-stone-200 text-xs text-stone-600 font-medium px-2 py-1 rounded-full shadow-sm">
                    📍 {shop.distanceMiles < 1
                      ? `${(shop.distanceMiles * 5280).toFixed(0)} ft`
                      : `${shop.distanceMiles.toFixed(1)} mi`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Browse by state fallback */}
      {status === "idle" && (
        <div className="text-center text-sm text-stone-400 mt-2">
          or{" "}
          <Link href="/" className="text-brand-600 hover:underline">
            browse thrift stores by state
          </Link>
        </div>
      )}
    </div>
  );
}
