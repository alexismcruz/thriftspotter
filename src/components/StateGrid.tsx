import Link from "next/link";
import { US_STATES, stateSlug } from "@/lib/utils";

type StateCounts = Record<string, number>;

export default function StateGrid({ counts }: { counts: StateCounts }) {
  const states = Object.entries(US_STATES).sort((a, b) => a[1].localeCompare(b[1]));

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {states.map(([abbr, name]) => {
        const count = counts[abbr] ?? 0;
        const slug = stateSlug(abbr);
        return (
          <Link
            key={abbr}
            href={`/${slug}`}
            className="rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm transition-colors hover:border-brand-400 hover:bg-brand-50"
          >
            <span className="font-medium text-stone-900 block">{name}</span>
            <span className="text-xs text-stone-500">
              {count > 0 ? `${count.toLocaleString()} shops` : "Browse shops"}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
