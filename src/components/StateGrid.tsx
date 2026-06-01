import Link from "next/link";
import { US_STATES, stateSlug } from "@/lib/utils";

type StateCounts = Record<string, number>;

export default function StateGrid({ counts }: { counts: StateCounts }) {
  const states = Object.entries(US_STATES).sort((a, b) => a[1].localeCompare(b[1]));
  const maxCount = Math.max(...Object.values(counts), 1);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {states.map(([abbr, name]) => {
        const count = counts[abbr] ?? 0;
        const slug = stateSlug(abbr);
        const pct = Math.max(8, Math.round((count / maxCount) * 100));

        return (
          <Link
            key={abbr}
            href={`/${slug}`}
            className="card-lift group rounded-xl border border-stone-200 bg-white px-3 py-3 text-sm hover:border-brand-400 hover:shadow-md transition-all overflow-hidden relative"
          >
            <div className="flex items-start justify-between gap-1 mb-2">
              <span className="font-semibold text-stone-800 group-hover:text-brand-600 transition-colors leading-tight text-xs">{name}</span>
              <span className="text-xs font-bold text-stone-400 shrink-0">{abbr}</span>
            </div>
            <span className="text-xs text-stone-500 block mb-2">
              {count > 0 ? `${count.toLocaleString()} shops` : "Coming soon"}
            </span>
            {/* Shop density bar */}
            <div className="h-1 w-full bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-400 rounded-full transition-all group-hover:bg-brand-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
