import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PublicPageShell } from '@/components/public/PublicPageShell';

export const metadata: Metadata = {
  title: 'Section 45V Clean Hydrogen Tax Credit: Qualification Guide (2026)',
  description:
    'Section 45V offers up to $3/kg for clean hydrogen. Learn the 4 credit tiers, 45VH2-GREET model, additionality requirements, and final Treasury rules.',
  alternates: { canonical: 'https://incentedge.com/blog/45v-clean-hydrogen-guide' },
  openGraph: {
    title: 'Section 45V Clean Hydrogen Tax Credit: Qualification Guide (2026)',
    description:
      'Section 45V offers up to $3/kg for clean hydrogen. Learn the 4 credit tiers, 45VH2-GREET model, and final Treasury rules.',
    url: 'https://incentedge.com/blog/45v-clean-hydrogen-guide',
    siteName: 'IncentEdge',
    type: 'article',
  },
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Section 45V Clean Hydrogen Tax Credit: Qualification Guide (2026)',
  description: 'Complete guide to qualifying for the Section 45V clean hydrogen production credit.',
  url: 'https://incentedge.com/blog/45v-clean-hydrogen-guide',
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
      name: 'What is the maximum Section 45V credit rate?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The maximum 45V credit is $3.00 per kilogram of clean hydrogen for production with lifecycle greenhouse gas emissions of 0.45 kg CO2e per kg H2 or less. This corresponds to the Tier 4 credit (emissions ≤ 0.45 kg CO2e/kg H2). With prevailing wage compliance, the full $3/kg applies. Without prevailing wage, the rate is $0.60/kg.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the 45VH2-GREET model?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The 45VH2-GREET model is a lifecycle analysis tool developed by Argonne National Laboratory and certified by Treasury for use in 45V credit calculations. Developers must use this specific model (not other lifecycle tools) to calculate the well-to-gate greenhouse gas emissions intensity of their hydrogen production pathway.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the additionality requirement for 45V?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The additionality requirement means that electrolytic hydrogen producers using grid electricity must demonstrate that they have procured new, additional clean energy — not just purchased existing renewable energy certificates (RECs). New clean energy projects must have a commercial operation date within 36 months of the hydrogen facility.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is Section 45V transferable?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Section 45V is eligible for both transferability (Section 6418) and direct pay (Section 6417). The broad direct pay provision allows any entity — including for-profit corporations — to elect direct payment for the first five years. This makes 45V particularly valuable for corporate hydrogen project sponsors without adequate tax liability.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can natural gas hydrogen (SMR with CCS) qualify for 45V?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Natural gas steam methane reforming (SMR) with carbon capture and storage can qualify for 45V if the resulting hydrogen meets the emissions threshold for the applicable credit tier. With high carbon capture rates, blue hydrogen from SMR+CCS can qualify for Tier 3 or Tier 4 credits depending on the specific facility emissions profile calculated through the 45VH2-GREET model.',
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
    { '@type': 'ListItem', position: 3, name: '45V Clean Hydrogen Guide', item: 'https://incentedge.com/blog/45v-clean-hydrogen-guide' },
  ],
};

export default function CleanHydrogen45VGuidePage() {
  return (
    <PublicPageShell breadcrumbs={[{ label: 'Blog', href: '/blog' }, { label: '45V Clean Hydrogen Guide' }]}>
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
            Credit Deep Dive — 45V
          </div>
          <h1 className="font-sora text-4xl font-bold tracking-tight text-deep-900 dark:text-white leading-[1.1] mb-4">
            Section 45V Clean Hydrogen Tax Credit: Complete Guide
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-[13px] text-deep-500 dark:text-sage-500 pb-6 border-b border-deep-100 dark:border-deep-800">
            <span>By IncentEdge Research Team</span>
            <span>March 2026</span>
            <span>13 min read</span>
          </div>
        </header>

        <div className="space-y-8 text-[15px] text-deep-700 dark:text-sage-300 leading-relaxed">

          <p className="text-lg text-deep-600 dark:text-sage-400 leading-relaxed">
            Section 45V is the IRA&apos;s most complex and consequential new credit. Offering up to $3 per kilogram of clean hydrogen produced, 45V has the potential to catalyze a domestic hydrogen economy — but qualifying requires rigorous lifecycle emissions analysis, new electricity additionality requirements, and compliance with final Treasury rules that generated more public comments than any prior IRS regulation.
          </p>

          {/* What is 45V */}
          <section>
            <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-4">
              What Is Section 45V?
            </h2>
            <p className="mb-4">
              Section 45V provides a per-kilogram production tax credit for &quot;clean hydrogen&quot; — hydrogen produced through any qualifying production method that achieves a lifecycle greenhouse gas emissions intensity below specific thresholds. The credit is structured as a sliding scale across four tiers based on emissions intensity, with the most carbon-efficient production receiving the highest credit.
            </p>
            <p className="mb-4">
              The credit applies to the first 10 years of production from facilities placed in service between January 1, 2023 and December 31, 2032. Like other IRA credits, 45V requires prevailing wage compliance for the full credit rate; non-prevailing-wage projects receive 20% of the applicable tier rate.
            </p>
          </section>

          {/* Four Tiers */}
          <section>
            <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-4">
              The Four Credit Tiers
            </h2>

            <div className="overflow-x-auto rounded-xl border border-deep-100 dark:border-deep-800 mb-5">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-deep-50 dark:bg-deep-800/50 border-b border-deep-100 dark:border-deep-700">
                    <th className="text-left px-4 py-3 font-semibold text-deep-700 dark:text-deep-300">Tier</th>
                    <th className="text-left px-4 py-3 font-semibold text-deep-700 dark:text-deep-300">Emissions Intensity</th>
                    <th className="text-left px-4 py-3 font-semibold text-deep-700 dark:text-deep-300">Credit Rate</th>
                    <th className="text-left px-4 py-3 font-semibold text-deep-700 dark:text-deep-300">Typical Pathway</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-deep-100 dark:divide-deep-800">
                  {[
                    { tier: 'Tier 1', emissions: '4.0 – 2.5 kg CO2e/kg H2', rate: '$0.60/kg', pathway: 'Conventional natural gas SMR (without CCS)' },
                    { tier: 'Tier 2', emissions: '2.5 – 1.5 kg CO2e/kg H2', rate: '$0.75/kg', pathway: 'SMR with partial CCS; grid electrolysis (carbon-intensive grid)' },
                    { tier: 'Tier 3', emissions: '1.5 – 0.45 kg CO2e/kg H2', rate: '$1.00/kg', pathway: 'SMR with high-capture CCS; electrolysis on moderately clean grid' },
                    { tier: 'Tier 4', emissions: '≤ 0.45 kg CO2e/kg H2', rate: '$3.00/kg', pathway: 'Green hydrogen (electrolysis from wind/solar/nuclear); biomass with CCS' },
                  ].map((row) => (
                    <tr key={row.tier} className="hover:bg-deep-50/50 dark:hover:bg-deep-800/30">
                      <td className="px-4 py-3 font-semibold text-deep-900 dark:text-deep-100">{row.tier}</td>
                      <td className="px-4 py-3 text-deep-600 dark:text-sage-400">{row.emissions}</td>
                      <td className="px-4 py-3 font-mono text-teal-600 dark:text-teal-400 font-bold">{row.rate}</td>
                      <td className="px-4 py-3 text-deep-600 dark:text-sage-400">{row.pathway}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[13px] text-deep-500 dark:text-sage-500 italic">
              Rates shown with prevailing wage compliance. Without prevailing wage: multiply by 20% (e.g., Tier 4 becomes $0.60/kg). Rates are inflation-indexed from 2022.
            </p>
          </section>

          {/* 45VH2-GREET Model */}
          <section>
            <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-4">
              The 45VH2-GREET Model: How Emissions Are Calculated
            </h2>
            <p className="mb-4">
              The lifecycle greenhouse gas emissions intensity of hydrogen production must be calculated using the 45VH2-GREET model — a specialized version of Argonne National Laboratory&apos;s Greenhouse gases, Regulated Emissions, and Energy use in Transportation (GREET) model. Treasury mandates use of this specific tool; other lifecycle analysis tools are not acceptable for 45V credit calculations.
            </p>
            <p className="mb-4">
              The model calculates &quot;well-to-gate&quot; emissions — from resource extraction through hydrogen production, but not including distribution or end use. For electrolytic hydrogen, the emissions intensity is primarily driven by the carbon intensity of the electricity used.
            </p>
            <p className="mb-4">
              The model considers: feedstock extraction and processing emissions, electricity grid carbon intensity (including marginal vs. average grid emissions), carbon capture efficiency for facilities using CCS, and process-specific emission factors for various production pathways.
            </p>
          </section>

          {/* Additionality and Matching */}
          <section>
            <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-4">
              Additionality, Deliverability, and Temporal Matching
            </h2>
            <p className="mb-4">
              The most controversial aspect of the 45V final rules is the three-pillar framework for electrolytic hydrogen:
            </p>
            <div className="space-y-4 mb-4">
              <div className="rounded-lg border border-deep-100 dark:border-deep-800 p-5">
                <h3 className="font-semibold text-deep-900 dark:text-deep-100 mb-2">1. Additionality</h3>
                <p className="text-[14px] text-deep-600 dark:text-sage-400">
                  Electrolytic hydrogen producers must use &quot;new&quot; clean energy — electricity from clean energy facilities with a commercial operation date within 36 months of the hydrogen production facility. Simply purchasing existing renewable energy certificates (RECs) from decades-old wind or hydro facilities is not sufficient for Tier 4 qualification.
                </p>
              </div>
              <div className="rounded-lg border border-deep-100 dark:border-deep-800 p-5">
                <h3 className="font-semibold text-deep-900 dark:text-deep-100 mb-2">2. Deliverability</h3>
                <p className="text-[14px] text-deep-600 dark:text-sage-400">
                  The clean electricity must be delivered in the same region as the hydrogen facility. &quot;Region&quot; is defined using the 26 Department of Energy interconnection study regions. Cross-region electricity imports cannot be claimed as qualifying clean energy for 45V purposes.
                </p>
              </div>
              <div className="rounded-lg border border-deep-100 dark:border-deep-800 p-5">
                <h3 className="font-semibold text-deep-900 dark:text-deep-100 mb-2">3. Temporal Matching</h3>
                <p className="text-[14px] text-deep-600 dark:text-sage-400">
                  The final rule requires <strong>hourly matching</strong> of clean electricity consumption with clean electricity generation. This is the most operationally demanding requirement — producers must demonstrate that for each hour they consume grid electricity, they have a corresponding clean energy attribute certificate covering that specific hour. Annual matching (the simpler approach) is not permitted under the final rules for new projects after 2028.
                </p>
              </div>
            </div>
            <div className="rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 p-4">
              <p className="text-[13px] text-amber-700 dark:text-amber-400">
                <strong>Regulatory uncertainty:</strong> The hourly matching requirement is being challenged in federal court by multiple industry groups. A successful challenge could substantially broaden 45V eligibility for electrolytic hydrogen. Developers should model both hourly-matching and annual-matching scenarios.
              </p>
            </div>
          </section>

          {/* Monetization */}
          <section>
            <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-4">
              Monetizing 45V Credits
            </h2>
            <p className="mb-4">
              Section 45V is eligible for transferability and direct pay — including the broad 5-year direct pay that allows any entity to receive a direct cash refund. This is particularly important for clean hydrogen developers who may not have sufficient tax liability to use the credits directly.
            </p>
            <p className="mb-4">
              A 50 ton/day green hydrogen facility (with Tier 4 qualification) produces approximately 18,250 metric tons of hydrogen per year. At $3/kg ($3,000/metric ton), the annual 45V credit is approximately $54.75 million. Transferred at 92 cents: ~$50.4 million in annual cash.
            </p>
            <p>
              The transferable credit market for 45V is still developing as the final rules have only recently been published. Credit pricing will be influenced by litigation risk, the specific emissions certification pathway, and buyer comfort with the underlying technical documentation.
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
              Scan your hydrogen project with IncentEdge — free to start
            </h3>
            <p className="text-deep-600 dark:text-sage-400 mb-6 text-[14px] max-w-md mx-auto">
              Get a 45V eligibility analysis, tier classification, and full federal incentive stack for your hydrogen project.
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
                { title: 'Section 45Q Carbon Capture Tax Credit Guide', href: '/blog/45q-carbon-capture-guide' },
                { title: 'IRA Policy Tracker: March 2026', href: '/blog/ira-policy-update-march-2026' },
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
