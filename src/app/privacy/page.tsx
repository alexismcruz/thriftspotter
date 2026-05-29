import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | ThriftSpotter",
  description: "ThriftSpotter's privacy policy — how we collect, use, and protect your information.",
  alternates: { canonical: "https://www.thriftspotter.com/privacy" },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  const lastUpdated = "May 29, 2025";

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-stone-900 mb-2">Privacy Policy</h1>
      <p className="text-stone-500 text-sm mb-10">Last updated: {lastUpdated}</p>

      <div className="prose prose-stone max-w-none text-stone-600 leading-relaxed space-y-8">

        <section>
          <h2 className="text-xl font-bold text-stone-900 mb-3">1. Overview</h2>
          <p>
            ThriftSpotter (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) operates the website{" "}
            <a href="https://www.thriftspotter.com" className="text-brand-600 hover:underline">
              thriftspotter.com
            </a>{" "}
            — a free online directory of thrift stores, consignment shops, and secondhand retailers across
            the United States. This Privacy Policy explains what information we collect, how we use it,
            and your rights regarding that information.
          </p>
          <p className="mt-3">
            ThriftSpotter does not require visitors to create an account or sign in. We are committed to
            collecting only the minimum data necessary to operate and improve the directory.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-900 mb-3">2. Information We Collect</h2>

          <h3 className="font-semibold text-stone-800 mb-2">a. Information you provide voluntarily</h3>
          <p>
            If you submit a business listing request through our website, we collect the information you
            enter in the form, which may include:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-stone-600">
            <li>Business name</li>
            <li>City and state</li>
            <li>Business phone number</li>
            <li>Business email address</li>
            <li>Business website URL</li>
          </ul>
          <p className="mt-3">
            This information is used solely to process your listing request and respond to your inquiry.
            We do not sell or share this information with third parties for marketing purposes.
          </p>

          <h3 className="font-semibold text-stone-800 mb-2 mt-5">b. Information collected automatically</h3>
          <p>
            When you visit ThriftSpotter, we may automatically collect certain technical information,
            including:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-stone-600">
            <li>Pages visited and time spent on each page</li>
            <li>Referring website (how you found us)</li>
            <li>Browser type and device type</li>
            <li>General geographic location (country or region level)</li>
          </ul>
          <p className="mt-3">
            This data is collected in aggregate and anonymized form through{" "}
            <strong>Vercel Analytics</strong> and is used only to understand how visitors use the site
            and to improve the directory experience.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-900 mb-3">3. Cookies</h2>
          <p>
            ThriftSpotter does not use advertising cookies or tracking cookies. We do not serve banner
            ads or use cookie-based ad networks. Basic session and analytics cookies may be set by our
            hosting and analytics providers (Vercel) to help the site function and measure traffic.
          </p>
          <p className="mt-3">
            You can disable cookies in your browser settings at any time. Doing so will not prevent
            you from browsing the directory.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-900 mb-3">4. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-stone-600">
            <li>Respond to business listing requests and inquiries</li>
            <li>Add or update business listings in the directory</li>
            <li>Improve the website's content and user experience</li>
            <li>Monitor site performance and fix technical issues</li>
          </ul>
          <p className="mt-3">
            We do not use your information for automated profiling, behavioral advertising, or any
            purpose beyond what is described above.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-900 mb-3">5. Third-Party Services</h2>
          <p>ThriftSpotter uses the following third-party services to operate the website:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-stone-600">
            <li>
              <strong>Vercel</strong> — website hosting and analytics (
              <a href="https://vercel.com/legal/privacy-policy" className="text-brand-600 hover:underline" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>
              )
            </li>
            <li>
              <strong>Google Maps</strong> — map links for store directions (
              <a href="https://policies.google.com/privacy" className="text-brand-600 hover:underline" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>
              )
            </li>
            <li>
              <strong>OpenStreetMap</strong> — map tile data for store location maps (
              <a href="https://wiki.osmfoundation.org/wiki/Privacy_Policy" className="text-brand-600 hover:underline" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>
              )
            </li>
            <li>
              <strong>Resend</strong> — transactional email delivery for listing request notifications
            </li>
          </ul>
          <p className="mt-3">
            Clicking a &quot;Get Directions&quot; or Google Maps link will take you to Google&apos;s
            website, which has its own privacy policy. We are not responsible for the data practices
            of third-party websites.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-900 mb-3">6. Business Listing Data</h2>
          <p>
            The business information shown in ThriftSpotter&apos;s directory (names, addresses, phone
            numbers, websites) is sourced from publicly available data. If you are a business owner
            and would like to update, correct, or remove your listing, please contact us at{" "}
            <a href="mailto:hello@thriftspotter.com" className="text-brand-600 hover:underline">
              hello@thriftspotter.com
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-900 mb-3">7. Data Retention</h2>
          <p>
            Business listing request submissions are retained in our email inbox for up to 12 months
            and then deleted. We do not maintain a separate database of visitor or user personal data.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-900 mb-3">8. Children&apos;s Privacy</h2>
          <p>
            ThriftSpotter is not directed at children under the age of 13. We do not knowingly collect
            personal information from children. If you believe a child has submitted personal information
            through our site, please contact us so we can delete it.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-900 mb-3">9. Your Rights</h2>
          <p>
            Depending on where you are located, you may have the right to request access to, correction
            of, or deletion of any personal information we hold about you. To make such a request,
            contact us at{" "}
            <a href="mailto:hello@thriftspotter.com" className="text-brand-600 hover:underline">
              hello@thriftspotter.com
            </a>
            . We will respond within 30 days.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-900 mb-3">10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. When we do, we will update the
            &quot;Last updated&quot; date at the top of this page. We encourage you to review this
            policy periodically. Continued use of ThriftSpotter after any changes constitutes your
            acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-900 mb-3">11. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy or how your information is handled,
            please contact us at:
          </p>
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
