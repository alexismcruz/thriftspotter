"use client";

import dynamic from "next/dynamic";

const ShopMap = dynamic(() => import("./ShopMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full rounded-xl bg-stone-100 animate-pulse flex items-center justify-center text-stone-400 text-sm">
      Loading map…
    </div>
  ),
});

export default ShopMap;
