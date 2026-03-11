import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PublicPageShell } from '@/components/public/PublicPageShell';

export const metadata: Metadata = {
  title: 'PACE Financing + ITC: How to Stack Property-Assessed Clean Energy with Federal Credits',
  description:
    'Learn how to stack PACE financing with the ITC and other IRA credits. PACE covers upfront costs, ITC reduces tax liability — a powerful combination for commercial projects.',
  alternates: { canonical: 'https://incentedge.com/blog/pace-financing-ira-combination' },
  openGraph: {
    title: 'PACE Financing + ITC: How to Stack Property-Assessed Clean Energy with Federal Credits',
    description:
      'How to stack PACE financing with ITC and other IRA credits for commercial energy projects.',
    url: 'https://incentedge.com/blog/pace-financing-ira-combination',
    siteName: 'IncentEdge',
    type: 'article',
  },
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'PACE Financing + ITC: How to Stack Property-Assessed Clean Energy with Federal Credits',
  description: 'Complete guide to stacking PACE financing with ITC and IRA credits.',
  url: 'https://incentedge.com/blog/pace-financing-ira-combination',
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
      name: 'Does PACE financing reduce the ITC eligible basis?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. PACE financing does not reduce ITC eligible basis because PACE is a loan (repaid through property tax assessment), not a grant or rebate. The ITC is calculated on the full project cost regardless of how the project is financed. This is one of PACE\'s most significant advantages over grant programs.',
      },
    },
    {
      '@type': 'Question',
      name: 'In which states is commercial PACE available?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Commercial PACE (C-PACE) is available in approximately 38 states and the District of Columbia. The largest markets are California, Florida, New York, Colorado, Texas, and Connecticut. Programs vary significantly by state in terms of eligible improvements, LTV limits, and lender approval requirements.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does my lender need to approve PACE financing?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. C-PACE requires lender consent because the PACE assessment is a senior lien on the property (ahead of the mortgage in property tax priority). Most institutional lenders approve PACE if the project is energy-related, the PACE amount is reasonable relative to property value, and a formal lender consent agreement is signed.',
      },
    },
    {
      '@type': 'Question',
      name: 'What improvements qualify for PACE financing?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Eligible improvements vary by state but typically include: solar PV systems, battery storage, HVAC upgrades, building envelope improvements (windows, insulation, roofing), LED lighting, EV charging infrastructure, and water efficiency measures. Some states include seismic and storm resilience improvements.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can PACE be used in a LIHTC affordable housing deal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, but it requires state Housing Finance Agency (HFA) approval in addition to lender consent. Several HFAs — including California, New York, and Florida — have approved C-PACE for use in LIHTC deals. The PACE lien must be subordinated to the senior lender and structured to not conflict with LIHTC compliance requirements.',
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
    { '@type': 'ListItem', position: 3, name: 'PACE + ITC Stacking', item: 'https://incentedge.com/blog/pace-financing-ira-combination' },
  ],
};

export default function PACEFinancingITCPage() {
  return (
    <PublicPageShell breadcrumbs={[{ label: 'Blog', href: '/blog' }, { label: 'PACE + ITC Stacking' }]}>
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
            Financing Stack
          </div>
          <h1 className="font-sora text-4xl font-bold tracking-tight text-deep-900 dark:text-white leading-[1.1] mb-4">
            PACE + ITC Stacking: The Commercial Energy Upgrade Financing Stack
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-[13px] text-deep-500 dark:text-sage-500 pb-6 border-b border-deep-100 dark:border-deep-800">
            <span>By IncentEdge Research Team</span>
            <span>March 2026</span>
            <span>12 min read</span>
          </div>
        </header>

        <div className="space-y-8 text-[15px] text-deep-700 dark:text-sage-300 leading-relaxed">

          <p className="text-lg text-deep-600 dark:text-sage-400 leading-relaxed">
            Property Assessed Clean Energy (PACE) financing and the Investment Tax Credit (ITC) are a uniquely powerful combination. PACE covers upfront project costs through long-term property-tax-based financing — and because PACE is a loan rather than a grant, it does not reduce the ITC eligible basis. The result: a developer gets ITC credits on the full project cost, including the portion financed by PACE, without putting in the underlying equity.
          </p>

          {/* What is PACE */}
          <section>
            <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-4">
              What Is PACE Financing?
            </h2>
            <p className="mb-4">
              Property Assessed Clean Energy (PACE) financing allows property owners to finance energy efficiency and renewable energy improvements through a voluntary property tax assessment. The assessment is repaid over 5–30 years through the property tax bill, and transfers with the property upon sale.
            </p>
            <p className="mb-4">
              Key characteristics of C-PACE (Commercial PACE):
            </p>
            <ul className="space-y-2 ml-4 mb-4">
              {[
                'Long-term, fixed-rate financing (typically 5–30 years at 5–9% rates)',
                'No personal guarantee required — secured by the property assessment',
                'Covers 100% of eligible improvement costs (subject to LTV limits)',
                'Senior lien position in property tax priority (requires lender consent)',
                'Transfers with property upon sale — no payoff required at closing',
                'Available for commercial, industrial, multifamily, and mixed-use properties',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-[14px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0 mt-2" />
                  {item}
                </li>
              ))}
            </ul>
            <p>
              As of 2026, C-PACE is available in approximately 38 states. The program is administered by state-authorized PACE administrators (like Nuveen Green Capital, Hannon Armstrong, Greenworks Lending, and others) who originate and service the assessments.
            </p>
          </section>

          {/* Why PACE + ITC Works */}
          <section>
            <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-4">
              Why PACE + ITC Is Such a Powerful Combination
            </h2>
            <p className="mb-4">
              The critical legal distinction: PACE is <strong>debt financing</strong>, not a grant or government rebate. Under IRS rules, grants and forgivable loans reduce the eligible basis of a project for ITC purposes. PACE does not — because it is a fully repayable obligation.
            </p>
            <p className="mb-4">
              This means a developer can use PACE to finance 60–80% of a project&apos;s upfront cost, while still claiming the ITC on the <strong>entire project cost</strong> (including the PACE-financed portion). The equity contribution required is reduced dramatically, while the ITC credit value remains at the full project level.
            </p>

            <div className="rounded-xl bg-deep-50/50 dark:bg-deep-900/30 border border-deep-100 dark:border-deep-800 p-6 mb-4">
              <h4 className="font-sora font-bold text-deep-900 dark:text-deep-100 mb-4">Example: $2M Commercial Solar + Storage Project</h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-[12px] font-semibold text-deep-500 dark:text-sage-500 mb-3 uppercase tracking-wider">Without PACE</p>
                  <div className="font-mono text-[13px] space-y-1.5 text-deep-700 dark:text-sage-300">
                    <div className="flex justify-between"><span>Project cost</span><span>$2,000,000</span></div>
                    <div className="flex justify-between text-teal-600 dark:text-teal-400"><span>ITC (30%)</span><span>$600,000</span></div>
                    <div className="flex justify-between"><span>Debt (60% LTV)</span><span>$1,200,000</span></div>
                    <div className="flex justify-between font-bold border-t border-deep-200 dark:border-deep-700 pt-1.5 mt-1.5 text-deep-900 dark:text-white"><span>Equity required</span><span>$200,000</span></div>
                  </div>
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-teal-600 dark:text-teal-400 mb-3 uppercase tracking-wider">With PACE + ITC</p>
                  <div className="font-mono text-[13px] space-y-1.5 text-deep-700 dark:text-sage-300">
                    <div className="flex justify-between"><span>Project cost</span><span>$2,000,000</span></div>
                    <div className="flex justify-between text-teal-600 dark:text-teal-400"><span>ITC (30% of FULL cost)</span><span>$600,000</span></div>
                    <div className="flex justify-between text-teal-600 dark:text-teal-400"><span>PACE financing (80%)</span><span>$1,600,000</span></div>
                    <div className="flex justify-between font-bold border-t border-deep-200 dark:border-deep-700 pt-1.5 mt-1.5 text-teal-600 dark:text-teal-400"><span>Equity required</span><span>($200,000) — NET ZERO</span></div>
                  </div>
                </div>
              </div>
              <p className="text-[12px] text-deep-500 dark:text-sage-500 mt-4 italic">
                In the PACE scenario, the ITC proceeds ($600K) cover the non-PACE equity ($400K) plus provide $200K positive cash. Net developer equity: zero. All from a $2M project.
              </p>
            </div>
          </section>

          {/* Eligible States */}
          <section>
            <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-4">
              Top C-PACE States in 2026
            </h2>
            <div className="overflow-x-auto rounded-xl border border-deep-100 dark:border-deep-800">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-deep-50 dark:bg-deep-800/50 border-b border-deep-100 dark:border-deep-700">
                    <th className="text-left px-4 py-3 font-semibold text-deep-700 dark:text-deep-300">State</th>
                    <th className="text-left px-4 py-3 font-semibold text-deep-700 dark:text-deep-300">Program Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-deep-700 dark:text-deep-300">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-deep-100 dark:divide-deep-800">
                  {[
                    { state: 'California', status: 'Active (CSCDA/CalPACE)', notes: 'Largest market; covers all commercial property types; LIHTC approved' },
                    { state: 'New York', status: 'Active (NY Green Bank partnership)', notes: 'NY PACE since 2019; multifamily eligible; strong lender acceptance' },
                    { state: 'Florida', status: 'Active (multiple administrators)', notes: 'Major market for commercial; hurricane resilience improvements included' },
                    { state: 'Colorado', status: 'Active (statewide)', notes: 'One of first states; well-developed market; industrial eligible' },
                    { state: 'Texas', status: 'Active (Houston, Dallas, Austin)', notes: 'Municipal adoption; strong for commercial solar and storage' },
                    { state: 'Connecticut', status: 'Active (C-PACE CT)', notes: 'High participation rates; clean energy priority; state-backed program' },
                  ].map((row) => (
                    <tr key={row.state} className="hover:bg-deep-50/50 dark:hover:bg-deep-800/30">
                      <td className="px-4 py-3 font-medium text-deep-900 dark:text-deep-100">{row.state}</td>
                      <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400">{row.status}</td>
                      <td className="px-4 py-3 text-deep-600 dark:text-sage-400">{row.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Lender Considerations */}
          <section>
            <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-4">
              Lender Approval Considerations
            </h2>
            <p className="mb-4">
              C-PACE requires written consent from the first mortgage lender because the PACE assessment is senior to the mortgage in property tax priority. Most institutional lenders approve PACE with the following conditions:
            </p>
            <ul className="space-y-3 ml-4">
              {[
                { title: 'Energy-related improvements only', desc: 'PACE must fund qualifying energy, water, or resilience improvements — not general property improvements.' },
                { title: 'Reasonable PACE-to-value ratio', desc: 'Most lenders cap combined senior debt + PACE at 70–80% of stabilized property value. PACE amounts exceeding this create lender resistance.' },
                { title: 'Formal lender consent agreement', desc: 'The PACE administrator provides a standardized lender consent agreement. Many major banks (Wells Fargo, JP Morgan) have pre-approved forms for efficient processing.' },
                { title: 'Debt service coverage analysis', desc: 'Lenders want to see that the property cash flow can support both the senior debt service and the PACE assessment payment.' },
              ].map((item) => (
                <li key={item.title} className="rounded-lg border border-deep-100 dark:border-deep-800 p-4">
                  <p className="font-semibold text-deep-900 dark:text-deep-100 mb-1">{item.title}</p>
                  <p className="text-[14px] text-deep-600 dark:text-sage-400">{item.desc}</p>
                </li>
              ))}
            </ul>
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
              Scan your project with IncentEdge — free to start
            </h3>
            <p className="text-deep-600 dark:text-sage-400 mb-6 text-[14px] max-w-md mx-auto">
              Get the full PACE-eligible + ITC + state incentive stack for your commercial project in 60 seconds.
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
                { title: 'New York Clean Energy Incentive Stack', href: '/blog/new-york-clean-energy-incentives' },
                { title: 'California IRA + State Incentives Guide', href: '/blog/california-ira-incentives' },
                { title: 'LIHTC + IRA Credits: Affordable Housing Guide', href: '/blog/lihtc-ira-stacking' },
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
