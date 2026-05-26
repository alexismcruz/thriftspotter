import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About ThriftSpotter",
  description: "We help people find great thrift stores, consignment shops, and secondhand gems across the United States.",
};

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10 sm:py-16">
      <h1 className="text-4xl font-bold mb-2">About ThriftSpotter</h1>
      <p className="text-brand-600 font-medium mb-10">Find it. Love it. Give it a second life.</p>

      <div className="space-y-8 text-stone-700 leading-relaxed">
        <p className="text-lg">
          ThriftSpotter started with a simple frustration: why is it so hard to find a good thrift store?
          You know they&apos;re out there — tucked behind a strip mall, hiding on a side street, or quietly
          sitting in a neighborhood you&apos;ve never explored. But finding them? That was always the hard part.
        </p>

        <p>
          We built ThriftSpotter to fix that. It&apos;s a free, no-fluff directory of thrift stores,
          consignment shops, and secondhand boutiques across the United States. Search by city,
          browse by state, or just wander — you never know what you&apos;ll find.
        </p>

        <div className="bg-brand-50 border border-brand-100 rounded-2xl p-6 space-y-2">
          <h2 className="text-xl font-bold text-stone-900">Why thrift?</h2>
          <p>
            Because one person&apos;s &quot;I don&apos;t need this anymore&quot; is another person&apos;s
            treasure. Thrifting is better for your wallet, better for the planet, and honestly —
            it&apos;s just more fun than buying something brand new off a shelf.
          </p>
        </div>

        <p>
          Every store in our directory is a real place with real people running it. Many of them are
          small businesses, nonprofits, or community organizations doing good work. When you shop
          secondhand, you&apos;re not just scoring a deal — you&apos;re keeping things out of landfills
          and often supporting a local cause.
        </p>

        <p>
          We&apos;re a small team passionate about sustainable shopping and making it easier for everyone
          to participate. ThriftSpotter is a work in progress and we&apos;re always adding more stores,
          improving listings, and listening to feedback.
        </p>

        <div className="border-t border-stone-200 pt-8 space-y-4">
          <h2 className="text-xl font-bold text-stone-900">Know a store we&apos;re missing?</h2>
          <p>
            We&apos;d love to hear about it. Our data comes from open sources and we&apos;re constantly
            working to fill in the gaps. If your favorite shop isn&apos;t listed — or a listing is
            wrong — drop us a note.
          </p>
          <a
            href="mailto:hello@thriftspotter.com"
            className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Get in touch
          </a>
        </div>

        <p className="text-sm text-stone-400 pt-4">
          Happy thrifting. 🛍️{" "}
          <Link href="/" className="underline hover:text-brand-600">
            Start exploring →
          </Link>
        </p>
      </div>
    </div>
  );
}
