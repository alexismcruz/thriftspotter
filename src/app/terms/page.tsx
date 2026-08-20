import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | ThriftSpotter",
  description: "ThriftSpotter's terms of service — the rules for using our directory and paid business listing subscriptions.",
  alternates: { canonical: "https://www.thriftspotter.com/terms" },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  const lastUpdated = "August 3, 2026";

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-stone-900 mb-2">Terms of Service</h1>
      <p className="text-stone-500 text-sm mb-10">Last updated: {lastUpdated}</p>

      <div className="prose prose-stone max-w-none text-stone-600 leading-relaxed space-y-8">

        <section>
          <h2 className="text-xl font-bold text-stone-900 mb-3">1. Agreement to Terms</h2>
          <p>
            These Terms of Service (&quot;Terms&quot;) govern your use of{" "}
            <a href="https://www.thriftspotter.com" className="text-brand-600 hover:underline">
              thriftspotter.com
            </a>{" "}
            (the &quot;Site&quot;), operated by ThriftSpotter (&quot;we,&quot; &quot;our,&quot; or
            &quot;us&quot;). By accessing or using the Site — whether as a shopper browsing listings or a
            business owner purchasing a paid placement — you agree to be bound by these Terms. If you do
            not agree, please do not use the Site.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-900 mb-3">2. About the Service</h2>
          <p>
            ThriftSpotter is a free online directory of thrift stores, consignment shops, vintage stores,
            and secondhand retailers across the United States. Basic listings are free and require no
            account. Business owners may optionally purchase a Featured or Premium subscription for
            enhanced visibility, as described on our{" "}
            <Link href="/advertise" className="text-brand-600 hover:underline">Advertise</Link> page.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-900 mb-3">3. Directory Listings</h2>
          <p>
            Business information shown in the directory (names, addresses, phone numbers, websites) is
            sourced from publicly available data or submitted by business owners. We make reasonable
            efforts to keep listings accurate but do not guarantee that any listing is complete, current,
            or error-free. If you are a business owner and would like to update, correct, or remove your
            listing, contact us at{" "}
            <a href="mailto:hello@thriftspotter.com" className="text-brand-600 hover:underline">
              hello@thriftspotter.com
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-900 mb-3">4. Paid Subscriptions</h2>
          <p>
            Featured and Premium listings are recurring monthly subscriptions. Current pricing is shown on
            our <Link href="/advertise" className="text-brand-600 hover:underline">Advertise</Link> page and
            at checkout. By subscribing, you authorize us (through our payment processor) to charge your
            payment method the applicable amount each month until you cancel.
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-stone-600">
            <li>Subscriptions renew automatically each month on your original billing date.</li>
            <li>There are no long-term contracts — you may cancel at any time.</li>
            <li>Any promotional or discounted pricing applies as stated at the time of purchase.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-900 mb-3">5. Payments &amp; Billing</h2>
          <p>
            Payments are processed securely through <strong>PayPal</strong>. We do not collect or store
            your full payment card details on our servers. Your use of PayPal is subject to PayPal&apos;s
            own terms and privacy policy. You are responsible for keeping your payment information with
            PayPal current so your subscription can renew without interruption.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-900 mb-3">6. Cancellations &amp; Refunds</h2>
          <p>
            You may cancel a paid subscription at any time through your PayPal account or by emailing{" "}
            <a href="mailto:hello@thriftspotter.com" className="text-brand-600 hover:underline">
              hello@thriftspotter.com
            </a>
            . When you cancel, your Featured or Premium placement remains active until the end of the
            current billing period, after which it reverts to a free basic listing. Payments already made
            are non-refundable except where required by law, though we are happy to review individual
            situations in good faith.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-900 mb-3">7. Acceptable Use</h2>
          <p>When using ThriftSpotter, you agree not to:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-stone-600">
            <li>Submit false, misleading, or fraudulent business information</li>
            <li>Scrape, copy, or republish the directory data for a competing service</li>
            <li>Attempt to disrupt, overload, or gain unauthorized access to the Site</li>
            <li>Use the Site for any unlawful purpose</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-900 mb-3">8. Disclaimer</h2>
          <p>
            ThriftSpotter is provided on an &quot;as is&quot; and &quot;as available&quot; basis. We do not
            operate, endorse, or guarantee any business listed in the directory. Store hours, inventory,
            prices, and availability are set by the individual businesses and may change without notice. We
            recommend contacting a store directly before visiting. We are not responsible for your
            experience with, or any transaction between you and, a listed business.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-900 mb-3">9. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, ThriftSpotter shall not be liable for any indirect,
            incidental, or consequential damages arising from your use of the Site or from any business
            listing. Our total liability for any claim relating to a paid subscription is limited to the
            amount you paid us in the twelve months preceding the claim.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-900 mb-3">10. Changes to These Terms</h2>
          <p>
            We may update these Terms from time to time. When we do, we will revise the &quot;Last
            updated&quot; date above. Continued use of the Site after changes take effect constitutes your
            acceptance of the updated Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-900 mb-3">11. Contact Us</h2>
          <p>If you have any questions about these Terms, please contact us at:</p>
          <div className="mt-3 bg-stone-50 rounded-xl border border-stone-200 p-5">
            <p className="font-semibold text-stone-800">ThriftSpotter</p>
            <p className="mt-1">
              Email:{" "}
              <a href="mailto:hello@thriftspotter.com" className="text-brand-600 hover:underline">
                hello@thriftspotter.com
              </a>
            </p>
            <p>Website: <a href="https://www.thriftspotter.com" className="text-brand-600 hover:underline">thriftspotter.com</a></p>
          </div>
        </section>

      </div>

      <div className="mt-12 pt-8 border-t border-stone-200">
        <Link href="/" className="text-sm text-brand-600 hover:underline">← Back to ThriftSpotter</Link>
      </div>
    </div>
  );
}
