"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBar({ placeholder = "Search by city, zip, or store name…" }: { placeholder?: string }) {
  const router = useRouter();
  const [q, setQ] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    if (trimmed) router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-xl">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        className="flex-1 rounded-lg border border-stone-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
      />
      <button
        type="submit"
        className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
      >
        Search
      </button>
    </form>
  );
}
