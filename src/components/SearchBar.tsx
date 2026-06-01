"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBar({ placeholder = "Try Chicago, Los Angeles, or your city…" }: { placeholder?: string }) {
  const router = useRouter();
  const [q, setQ] = useState("");

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
          placeholder={placeholder}
          className="w-full rounded-xl border-2 border-white/30 bg-white/20 backdrop-blur-sm pl-11 pr-4 py-3.5 text-white placeholder-white/70 text-base focus:outline-none focus:border-white/60 focus:bg-white/30 transition-all"
        />
      </div>
      <button
        type="submit"
        className="shrink-0 bg-white text-brand-700 hover:bg-brand-50 font-bold px-7 py-3.5 rounded-xl transition-colors text-base shadow-sm"
      >
        Search
      </button>
    </form>
  );
}
