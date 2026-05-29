import Link from "next/link";

const TOP_STATES = [
  { abbr: "CA", name: "California", slug: "california" },
  { abbr: "TX", name: "Texas", slug: "texas" },
  { abbr: "PA", name: "Pennsylvania", slug: "pennsylvania" },
  { abbr: "NC", name: "North Carolina", slug: "north-carolina" },
  { abbr: "IL", name: "Illinois", slug: "illinois" },
  { abbr: "OH", name: "Ohio", slug: "ohio" },
  { abbr: "VA", name: "Virginia", slug: "virginia" },
  { abbr: "AZ", name: "Arizona", slug: "arizona" },
  { abbr: "MI", name: "Michigan", slug: "michigan" },
  { abbr: "WA", name: "Washington", slug: "washington" },
  { abbr: "FL", name: "Florida", slug: "florida" },
  { abbr: "NY", name: "New York", slug: "new-york" },
];

const TOP_CITIES = [
  { city: "Chicago", state: "IL", slug: "illinois/chicago" },
  { city: "Portland", state: "OR", slug: "oregon/portland" },
  { city: "Austin", state: "TX", slug: "texas/austin" },
  { city: "Phoenix", state: "AZ", slug: "arizona/phoenix" },
  { city: "Houston", state: "TX", slug: "texas/houston" },
  { city: "San Diego", state: "CA", slug: "california/san-diego" },
  { city: "Fresno", state: "CA", slug: "california/fresno" },
  { city: "Mesa", state: "AZ", slug: "arizona/mesa" },
];

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-400 pt-14 pb-8 mt-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-white font-bold text-lg">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" className="w-8 h-8 shrink-0">
                <rect width="240" height="240" rx="44" fill="#0f766e"/>
                <path d="M 120,90 C 120,66 134,50 152,48 C 170,46 181,61 175,76 C 169,89 155,92 140,90" fill="none" stroke="white" strokeWidth="13" strokeLinecap="round"/>
                <path d="M 120,90 Q 74,112 32,185" fill="none" stroke="white" strokeWidth="13" strokeLinecap="round"/>
                <path d="M 120,90 Q 166,112 208,185" fill="none" stroke="white" strokeWidth="13" strokeLinecap="round"/>
                <line x1="23" y1="185" x2="217" y2="185" stroke="white" strokeWidth="13" strokeLinecap="round"/>
                <line x1="120" y1="90" x2="120" y2="115" stroke="white" strokeWidth="5" strokeDasharray="3,3"/>
                <rect x="108" y="115" width="24" height="18" rx="3" fill="white"/>
                <circle cx="120" cy="115" r="3" fill="#0f766e"/>
              </svg>
              ThriftSpotter
            </Link>
            <p className="text-sm mt-3 leading-relaxed">
              Free directory of thrift stores, consignment shops, and secondhand retailers across all 50 US states.
            </p>
            <a
              href="mailto:hello@thriftspotter.com"
              className="inline-block mt-4 text-xs text-stone-500 hover:text-brand-400 transition-colors"
            >
              hello@thriftspotter.com
            </a>
          </div>

          {/* Top States */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Browse by State</h4>
            <ul className="space-y-2 text-sm">
              {TOP_STATES.slice(0, 6).map(({ name, slug }) => (
                <li key={slug}>
                  <Link href={`/${slug}`} className="hover:text-white transition-colors">
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-0 sm:pt-8">
            <ul className="space-y-2 text-sm mt-0 sm:mt-0">
              {TOP_STATES.slice(6).map(({ name, slug }) => (
                <li key={slug}>
                  <Link href={`/${slug}`} className="hover:text-white transition-colors">
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Cities + Links */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Popular Cities</h4>
            <ul className="space-y-2 text-sm">
              {TOP_CITIES.map(({ city, state, slug }) => (
                <li key={slug}>
                  <Link href={`/${slug}`} className="hover:text-white transition-colors">
                    {city}, {state}
                  </Link>
                </li>
              ))}
            </ul>

            <h4 className="text-white text-sm font-semibold mt-8 mb-4 uppercase tracking-wider">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link href="/advertise" className="hover:text-white transition-colors">Advertise</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/near-me" className="hover:text-white transition-colors">Stores Near Me</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-stone-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-stone-600">
          <span>© {new Date().getFullYear()} ThriftSpotter. All rights reserved.</span>
          <span>Business data sourced from OpenStreetMap contributors.</span>
        </div>
      </div>
    </footer>
  );
}
