import type { Metadata } from "next";
import Link from "next/link";
import PayPalSubscribeButton from "@/components/PayPalSubscribeButton";
import ListingRequestButton from "@/components/ListingRequestButton";

export const metadata: Metadata = {
  title: "Advertise on ThriftSpotter",
  description: "Get your business in front of thousands of shoppers actively looking for secondhand stores near them.",
};

const PLANS = [
  {
    name: "Basic Listing",
    price: "Free",
    description: "Get discovered by shoppers in your area.",
    features: [
      "Listed in state & city pages",
      "Shop detail page",
      "Address & phone number",
      "Link to your website",
    ],
    cta: "Already included",
    highlighted: false,
  },
  {
    name: "Featured Listing",
    price: "$29/mo",
    description: "Stand out at the top of your city page.",
    features: [
      "Everything in Basic",
      "Pinned to top of city page",
      "⭐ Sponsored badge",
      "Featured banner placement",
      "Priority in search results",
    ],
    cta: "Get Featured",
    highlighted: true,
  },
  {
    name: "Premium Sponsor",
    price: "$59/mo",
    description: "Maximum visibility across the entire state.",
    features: [
      "Everything in Featured",
      "State page banner placement",
      "Homepage featured section",
      "Custom business description",
      "Monthly performance report",
    ],
    cta: "Go Premium",
    highlighted: false,
  },
];

export default function AdvertisePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 sm:py-16">
      {/* Hero */}
      <div className="text-center mb-14">
        <span className="inline-block bg-brand-100 text-brand-700 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
          For Business Owners
        </span>
        <h1 className="text-4xl sm:text-5xl font-heading font-bold mb-4 leading-tight">
          Put your business in front of<br className="hidden sm:block" /> people ready to shop
        </h1>
        <p className="text-stone-500 text-lg max-w-2xl mx-auto">
          ThriftSpotter connects thousands of thrift shoppers with local stores every day.
          Featured listings get seen first — by people already searching in your city.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-14 text-center">
        {[
          { stat: "2,000+", label: "Monthly visitors" },
          { stat: "5,900+", label: "Monthly page views" },
          { stat: "5,600+", label: "Businesses listed" },
          { stat: "50", label: "States covered" },
        ].map(({ stat, label }) => (
          <div key={label} className="bg-white rounded-xl border border-stone-200 py-6 px-4">
            <div className="text-3xl font-bold text-brand-600 mb-1">{stat}</div>
            <div className="text-sm text-stone-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Pricing */}
      <h2 className="text-2xl font-bold text-center mb-8">Simple, transparent pricing</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-14 items-stretch">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`group rounded-2xl border p-6 flex flex-col transition-all duration-200 hover:scale-105 hover:shadow-xl hover:bg-brand-600 hover:border-brand-500 ${
              plan.highlighted
                ? "border-brand-500 bg-brand-600 shadow-lg"
                : "border-stone-200 bg-white"
            }`}
          >
            {plan.highlighted && (
              <span className="text-xs font-bold bg-white text-brand-600 px-3 py-1 rounded-full self-start mb-4">
                Most Popular
              </span>
            )}
            <h3 className={`text-xl font-bold mb-1 ${
              plan.highlighted ? "text-white" : "text-stone-900 group-hover:text-white"
            }`}>
              {plan.name}
            </h3>
            <div className={`text-3xl font-bold mb-2 ${
              plan.highlighted ? "text-white" : "text-brand-600 group-hover:text-white"
            }`}>
              {plan.price}
            </div>
            <p className={`text-sm mb-6 ${
              plan.highlighted ? "text-brand-100" : "text-stone-500 group-hover:text-brand-100"
            }`}>
              {plan.description}
            </p>
            <ul className="space-y-2 mb-8 flex-1">
              {plan.features.map((f) => (
                <li key={f} className={`text-sm flex gap-2 ${
                  plan.highlighted ? "text-brand-100" : "text-stone-600 group-hover:text-brand-100"
                }`}>
                  <span className={`font-bold shrink-0 ${
                    plan.highlighted ? "text-brand-200" : "text-brand-400 group-hover:text-brand-200"
                  }`}>✓</span> {f}
                </li>
              ))}
            </ul>
            {plan.name === "Featured Listing" ? (
              <PayPalSubscribeButton
                planId="P-9JJ64136PU5034937NILO52I"
                containerId="paypal-featured"
              />
            ) : plan.name === "Premium Sponsor" ? (
              <PayPalSubscribeButton
                planId="P-6BY101962J9092244NILO7YI"
                containerId="paypal-premium"
                dark
              />
            ) : (
              <ListingRequestButton />
            )}
          </div>
        ))}
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden mb-14">
        <div className="px-8 py-6 border-b border-stone-100">
          <h2 className="text-2xl font-bold text-stone-900 mb-1">What's the difference?</h2>
          <p className="text-stone-500 text-sm">See exactly what you get with each plan</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50">
                <th className="text-left px-6 py-3 font-medium text-stone-500 border-b border-stone-100 w-1/2">Feature</th>
                <th className="text-center px-4 py-3 font-medium text-stone-500 border-b border-stone-100">Free</th>
                <th className="text-center px-4 py-3 font-medium text-brand-700 border-b border-brand-100 bg-brand-50">Featured · $29/mo</th>
                <th className="text-center px-4 py-3 font-medium text-stone-500 border-b border-stone-100">Premium · $59/mo</th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: "Listed in directory", free: true, featured: true, premium: true },
                { feature: "Address & phone number", free: true, featured: true, premium: true },
                { feature: "Website link", free: true, featured: true, premium: true },
                { feature: "Business description", free: false, featured: true, premium: true },
                { feature: "Photos", free: false, featured: true, premium: true },
                { feature: "Pinned to top of city page", free: false, featured: true, premium: true },
                { feature: "⭐ Featured badge", free: false, featured: true, premium: true },
                { feature: "State page banner", free: false, featured: false, premium: true },
                { feature: "Monthly performance report", free: false, featured: false, premium: true },
              ].map(({ feature, free, featured, premium }, i) => (
                <tr key={feature} className={i % 2 === 0 ? "bg-white" : "bg-stone-50/50"}>
                  <td className="px-6 py-3.5 text-stone-700 font-medium border-b border-stone-100">{feature}</td>
                  <td className="px-4 py-3.5 text-center border-b border-stone-100">
                    {free ? <span className="text-brand-600 font-bold text-base">✓</span> : <span className="text-stone-300">—</span>}
                  </td>
                  <td className="px-4 py-3.5 text-center border-b border-brand-100 bg-brand-50/40">
                    {featured ? <span className="text-brand-600 font-bold text-base">✓</span> : <span className="text-stone-300">—</span>}
                  </td>
                  <td className="px-4 py-3.5 text-center border-b border-stone-100">
                    {premium ? <span className="text-brand-600 font-bold text-base">✓</span> : <span className="text-stone-300">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-white rounded-2xl border border-stone-200 p-8 mb-10">
        <h2 className="text-2xl font-bold mb-8 text-center">How it works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {[
            { step: "1", title: "Subscribe", desc: "Choose your plan and subscribe securely via PayPal. Takes less than 2 minutes." },
            { step: "2", title: "We set it up", desc: "We feature your listing within 24 hours, no tech skills needed." },
            { step: "3", title: "Shoppers find you", desc: "Your business appears at the top when people search your area." },
          ].map(({ step, title, desc }) => (
            <div key={step}>
              <div className="w-12 h-12 rounded-full bg-brand-600 text-white font-bold text-lg flex items-center justify-center mx-auto mb-4">
                {step}
              </div>
              <h3 className="font-bold text-stone-900 mb-2">{title}</h3>
              <p className="text-sm text-stone-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <p className="text-stone-500 mb-4">Ready to get started? Send us a message.</p>
        <a
          href="mailto:advertise@thriftspotter.com"
          className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-bold px-8 py-4 rounded-xl transition-colors text-lg"
        >
          advertise@thriftspotter.com
        </a>
        <p className="text-xs text-stone-400 mt-4">No contracts. Cancel anytime.</p>
      </div>
    </div>
  );
}
