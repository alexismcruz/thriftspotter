"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchInput({ defaultValue = "" }: { defaultValue?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(defaultValue);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    if (trimmed) router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-2xl">
      <div className="relative flex-1">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-lg pointer-events-none">📍</span>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by city, state, zip, or category…"
          className="w-full rounded-xl border-2 border-stone-200 bg-white pl-11 pr-4 py-3.5 text-stone-800 placeholder-stone-400 text-base focus:outline-none focus:border-brand-400 transition-all"
        />
      </div>
      <button
        type="submit"
        className="shrink-0 bg-brand-600 hover:bg-brand-700 text-white font-bold px-7 py-3.5 rounded-xl transition-colors text-base"
      >
        Search
      </button>
    </form>
  );
}
