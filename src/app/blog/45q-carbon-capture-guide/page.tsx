import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PublicPageShell } from '@/components/public/PublicPageShell';

export const metadata: Metadata = {
  title: 'Section 45Q Carbon Capture Tax Credit: The Complete Guide (2026)',
  description:
    'Section 45Q provides $85/ton for geologic storage and $60/ton for utilization. IRA doubled rates and lowered thresholds. Learn how to qualify and monetize 45Q credits.',
  alternates: { canonical: 'https://incentedge.com/blog/45q-carbon-capture-guide' },
  openGraph: {
    title: 'Section 45Q Carbon Capture Tax Credit: The Complete Guide (2026)',
    description:
      'Section 45Q provides $85/ton for geologic storage and $60/ton for utilization. Learn how to qualify and monetize 45Q credits.',
    url: 'https://incentedge.com/blog/45q-carbon-capture-guide',
    siteName: 'IncentEdge',
    type: 'article',
  },
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Section 45Q Carbon Capture Tax Credit: The Complete Guide (2026)',
  description: 'Complete guide to the Section 45Q carbon capture tax credit — rates, eligibility, and monetization.',
  url: 'https://incentedge.com/blog/45q-carbon-capture-guide',
  author: { '@type': 'Organization', name: 'IncentEdge Research Team' },
  publisher: { '@type': 'Organization', name: 'IncentEdge', url: 'https://incentedge.com' },
  datePublished: '2026-03-01',
  dateModified: '2026-03-11',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is the Section 45Q credit rate in 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The IRA-enhanced 45Q credit rates are: $85/metric ton for carbon captured and geologically sequestered; $60/metric ton for carbon captured and utilized (including EOR); and $180/metric ton for direct air capture (DAC) with geological storage. Rates are indexed to inflation.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the minimum capture threshold for Section 45Q?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The IRA significantly lowered the minimum capture thresholds. For industrial facilities: 12,500 metric tons per year (down from 100,000). For direct air capture: 1,000 metric tons per year. For electric generating units: 18,750 metric tons per year.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is Section 45Q transferable?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Section 45Q is one of the IRA credits eligible for both transferability (Section 6418) and direct pay (Section 6417). The broad direct pay provision allows any entity — including for-profit corporations — to elect direct payment for 45Q for the first five years of the credit period.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is direct air capture (DAC) and why is the 45Q rate higher?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Direct air capture removes CO2 directly from the atmosphere (rather than from industrial point sources). Because DAC removes carbon that is already in the atmosphere — providing a net negative emissions outcome — the IRA established a higher credit rate of $180/ton (geological storage) and $130/ton (utilization) to reflect the higher cost and greater climate benefit.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is recapture risk in a 45Q project?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'If captured CO2 that was claimed for the geologic storage credit leaks back into the atmosphere within the 12-year credit period, the credit may be subject to recapture. Developers must file annual reports with the EPA on the integrity of geologic storage sites and maintain recapture insurance.',
      },
    },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://incentedge.com' },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://incentedge.com/blog' },
    { '@type': 'ListItem', position: 3, name: '45Q Carbon Capture Guide', item: 'https://incentedge.com/blog/45q-carbon-capture-guide' },
  ],
};

export default function CarbonCapture45QGuidePage() {
  return (
    <PublicPageShell breadcrumbs={[{ label: 'Blog', href: '/blog' }, { label: '45Q Carbon Capture Guide' }]}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <article className="max-w-3xl mx-auto px-6 py-12">
        <header className="mb-10">
          <div className="inline-flex items-center rounded-full border border-teal-200 dark:border-teal-700 bg-teal-50 dark:bg-teal-900/20 px-3 py-1 text-[12px] text-teal-700 dark:text-teal-300 mb-4">
            Credit Deep Dive — 45Q
          </div>
          <h1 className="font-sora text-4xl font-bold tracking-tight text-deep-900 dark:text-white leading-[1.1] mb-4">
            Section 45Q Carbon Capture Tax Credit: Complete Guide
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-[13px] text-deep-500 dark:text-sage-500 pb-6 border-b border-deep-100 dark:border-deep-800">
            <span>By IncentEdge Research Team</span>
            <span>March 2026</span>
            <span>12 min read</span>
          </div>
        </header>

        <div className="space-y-8 text-[15px] text-deep-700 dark:text-sage-300 leading-relaxed">

          <p className="text-lg text-deep-600 dark:text-sage-400 leading-relaxed">
            Section 45Q is the most valuable per-unit tax credit in the IRA for carbon capture, utilization, and storage (CCUS) projects. The IRA doubled credit rates, dramatically lowered capture thresholds, and made 45Q transferable — transforming a previously niche credit into a primary incentive for industrial decarbonization and direct air capture development.
          </p>

          {/* What is 45Q */}
          <section>
            <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-4">
              What Is Section 45Q?
            </h2>
            <p className="mb-4">
              Section 45Q of the Internal Revenue Code provides a per-metric-ton federal tax credit for carbon dioxide (CO2) and other carbon oxides that are captured and either: (a) geologically sequestered in secure formations, or (b) utilized in qualified industrial processes. The credit is claimed annually over a 12-year period from the date the carbon capture equipment is placed in service.
            </p>
            <p className="mb-4">
              Originally enacted in 2008 and significantly enhanced by the Bipartisan Budget Act of 2018, the IRA made the most substantial changes to 45Q in its history — doubling maximum rates, reducing minimum capture thresholds by 80–90%, and adding transferability and direct pay.
            </p>
          </section>

          {/* Credit Rates Table */}
          <section>
            <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-4">
              45Q Credit Rates: Complete Table
            </h2>

            <div className="overflow-x-auto rounded-xl border border-deep-100 dark:border-deep-800 mb-5">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-deep-50 dark:bg-deep-800/50 border-b border-deep-100 dark:border-deep-700">
                    <th className="text-left px-4 py-3 font-semibold text-deep-700 dark:text-deep-300">Category</th>
                    <th className="text-left px-4 py-3 font-semibold text-deep-700 dark:text-deep-300">Storage Rate</th>
                    <th className="text-left px-4 py-3 font-semibold text-deep-700 dark:text-deep-300">Utilization Rate</th>
                    <th className="text-left px-4 py-3 font-semibold text-deep-700 dark:text-deep-300">Min Capture/yr</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-deep-100 dark:divide-deep-800">
                  {[
                    { category: 'Industrial CCUS', storage: '$85/ton', util: '$60/ton', min: '12,500 metric tons' },
                    { category: 'Power Generation', storage: '$85/ton', util: '$60/ton', min: '18,750 metric tons' },
                    { category: 'Direct Air Capture (DAC)', storage: '$180/ton', util: '$130/ton', min: '1,000 metric tons' },
                    { category: 'Enhanced Oil Recovery (EOR)', storage: 'N/A', util: '$60/ton', min: '12,500 metric tons' },
                  ].map((row) => (
                    <tr key={row.category} className="hover:bg-deep-50/50 dark:hover:bg-deep-800/30">
                      <td className="px-4 py-3 font-medium text-deep-900 dark:text-deep-100">{row.category}</td>
                      <td className="px-4 py-3 font-mono text-teal-600 dark:text-teal-400">{row.storage}</td>
                      <td className="px-4 py-3 font-mono text-teal-600 dark:text-teal-400">{row.util}</td>
                      <td className="px-4 py-3 text-deep-600 dark:text-sage-400">{row.min}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[13px] text-deep-500 dark:text-sage-500 italic">
              Rates are inflation-indexed from 2022. All rates require prevailing wage compliance for maximum credit; non-prevailing-wage rate is 20% of the above. Credit period: 12 years from placed-in-service date.
            </p>
          </section>

          {/* DAC vs Industrial CCUS */}
          <section>
            <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-4">
              DAC vs. Industrial CCUS: Key Differences
            </h2>
            <p className="mb-4">
              The 45Q credit applies to two fundamentally different types of carbon removal:
            </p>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="rounded-lg border border-deep-100 dark:border-deep-800 p-5">
                <h3 className="font-semibold text-deep-900 dark:text-deep-100 mb-3">Industrial CCUS</h3>
                <ul className="space-y-2 text-[14px] text-deep-600 dark:text-sage-400">
                  <li>Point-source capture from industrial facilities (cement, steel, ethanol, power plants)</li>
                  <li>CO2 must exceed 12,500 metric tons/year capture</li>
                  <li>Credit: $85/ton (geological) or $60/ton (utilization)</li>
                  <li>More established technology, lower cost per ton</li>
                  <li>Infrastructure: pipeline access to storage or utilization site required</li>
                </ul>
              </div>
              <div className="rounded-lg border border-deep-100 dark:border-deep-800 p-5">
                <h3 className="font-semibold text-deep-900 dark:text-deep-100 mb-3">Direct Air Capture (DAC)</h3>
                <ul className="space-y-2 text-[14px] text-deep-600 dark:text-sage-400">
                  <li>Removes CO2 directly from ambient atmosphere</li>
                  <li>Minimum capture: 1,000 metric tons/year (very low threshold)</li>
                  <li>Credit: $180/ton (geological) or $130/ton (utilization)</li>
                  <li>Provides net-negative emissions — higher climate value</li>
                  <li>Current cost: $300–$1,000/ton (CAPEX-intensive, improving rapidly)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Monetization */}
          <section>
            <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-4">
              Monetizing 45Q: Transferability and Direct Pay
            </h2>
            <p className="mb-4">
              Section 45Q is one of only a handful of IRA credits eligible for the &quot;broad&quot; direct pay — meaning any entity (including for-profit corporations) can elect to receive the 45Q credit as a direct cash refund for the first five years.
            </p>
            <p className="mb-4">
              This is a unique provision that distinguishes 45Q from ITC and PTC, which only allow direct pay for tax-exempt entities. A corporation developing a CCUS facility can elect direct pay for years 1–5 and then switch to either tax equity or transferability in years 6–12.
            </p>
            <p className="mb-4">
              Transferability allows developers to sell 45Q credits in the secondary market at approximately 90–95 cents per dollar. For a 100,000 ton/year industrial CCUS facility at $85/ton, that&apos;s $8.5M/year in annual credits — sold via transferability for approximately $7.65–8.1M in annual cash.
            </p>
          </section>

          {/* Recapture Risk */}
          <section>
            <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-4">
              Recapture Risk: What Developers Must Know
            </h2>
            <p className="mb-4">
              The primary risk in 45Q projects is recapture — if CO2 that was claimed under the geological storage credit leaks from the storage formation during the credit period, the developer may be required to repay a portion of the claimed credits.
            </p>
            <p className="mb-4">
              Treasury regulations require annual reporting on storage site integrity to both the IRS and EPA. Third-party monitoring, reporting, and verification (MRV) using EPA-approved methods is mandatory. Developers typically purchase recapture insurance to protect against this risk.
            </p>
            <p>
              Utilization credits (EOR, concrete curing, other uses) have much lower recapture risk because the CO2 is incorporated into a material or converted to a new substance, rather than stored in a geological reservoir subject to potential leakage.
            </p>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-5">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqSchema.mainEntity.map((faq, i) => (
                <div key={i} className="rounded-lg border border-deep-100 dark:border-deep-800 p-5">
                  <h3 className="font-semibold text-deep-900 dark:text-deep-100 mb-2 text-[14px]">{faq.name}</h3>
                  <p className="text-[14px] text-deep-600 dark:text-sage-400">{faq.acceptedAnswer.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div className="rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/10 dark:to-emerald-900/10 border border-teal-100 dark:border-teal-800 p-8 text-center">
            <h3 className="font-sora text-xl font-bold text-deep-900 dark:text-deep-100 mb-2">
              Scan your CCUS project with IncentEdge — free to start
            </h3>
            <p className="text-deep-600 dark:text-sage-400 mb-6 text-[14px] max-w-md mx-auto">
              Get a complete 45Q eligibility analysis and full federal incentive stack report for your carbon capture project.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[14px] font-semibold transition-colors"
            >
              Scan your project free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Related Articles */}
          <div className="pt-6 border-t border-deep-100 dark:border-deep-800">
            <h3 className="font-sora text-lg font-bold text-deep-900 dark:text-deep-100 mb-4">Related Articles</h3>
            <div className="grid gap-3 md:grid-cols-3">
              {[
                { title: 'Section 45V Clean Hydrogen Tax Credit Guide', href: '/blog/45v-clean-hydrogen-guide' },
                { title: 'Tax Equity vs. Transferability: Complete Guide', href: '/blog/tax-equity-vs-transferability' },
                { title: 'The Complete IRA Tax Credit Guide (2026)', href: '/resources/ira-guide' },
              ].map((a) => (
                <Link key={a.href} href={a.href} className="block p-4 rounded-lg border border-deep-100 dark:border-deep-800 hover:border-teal-200 dark:hover:border-teal-700 transition-colors group">
                  <p className="text-[13px] font-medium text-deep-900 dark:text-deep-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors leading-snug">{a.title}</p>
                  <span className="inline-flex items-center gap-1 text-[12px] text-teal-600 dark:text-teal-400 mt-2">Read <ArrowRight className="w-3 h-3" /></span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </article>
    </PublicPageShell>
  );
}
