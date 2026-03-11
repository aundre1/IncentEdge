import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { IncentiveHeader, IncentiveCTA, IncentiveFooter } from '@/components/incentives/IncentiveHeader';

export const metadata: Metadata = {
  title: 'Section 45L New Energy Efficient Home Credit | IncentEdge',
  description:
    'Section 45L offers up to $5,000 per unit for energy-efficient new homes. Learn eligibility requirements, credit rates, and how to claim this IRA credit.',
  alternates: { canonical: 'https://incentedge.com/incentives/federal/45l' },
  openGraph: {
    title: 'Section 45L New Energy Efficient Home Credit | IncentEdge',
    description:
      'Section 45L offers up to $5,000 per unit for energy-efficient new homes. Learn eligibility requirements, credit rates, and how to claim this IRA credit.',
    url: 'https://incentedge.com/incentives/federal/45l',
    siteName: 'IncentEdge',
    type: 'article',
  },
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Section 45L New Energy Efficient Home Credit',
  description:
    'Section 45L offers up to $5,000 per unit for energy-efficient new homes. Eligibility, credit rates, and claiming instructions.',
  url: 'https://incentedge.com/incentives/federal/45l',
  author: { '@type': 'Organization', name: 'IncentEdge' },
  publisher: { '@type': 'Organization', name: 'IncentEdge', url: 'https://incentedge.com' },
  dateModified: '2026-03-11',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Who can claim the Section 45L credit?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Eligible contractors who build or substantially reconstruct qualified energy-efficient homes for sale or lease. This includes single-family homebuilders, multifamily developers, and manufactured housing contractors.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the 45L credit amount per unit in 2024?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The credit is $2,500 per unit for homes meeting Energy Star certification standards, and $5,000 per unit for homes meeting the Zero Energy Ready Home (ZERH) program requirements.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Section 45L apply to multifamily buildings?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Multifamily buildings are eligible under 45L. The IRA updated the standards so multifamily projects must meet Energy Star Multifamily New Construction certification ($500/unit) or DOE Zero Energy Ready Multifamily ($1,000/unit). Prevailing wage requirements apply for maximum rates.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can 45L be stacked with state incentives?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Section 45L is a federal tax credit and can generally be stacked with state-level energy efficiency incentives, utility rebates, and LIHTC credits. However, some state programs reduce their benefit dollar-for-dollar when federal credits are claimed — always confirm stacking rules with a tax advisor.',
      },
    },
    {
      '@type': 'Question',
      name: 'What form is used to claim Section 45L?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Form 8908 (Energy Efficient Home Credit) is filed with the eligible contractor\'s federal income tax return. A third-party energy certification from a qualified certifier is required before claiming.',
      },
    },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://incentedge.com' },
    { '@type': 'ListItem', position: 2, name: 'Incentives', item: 'https://incentedge.com/incentives' },
    { '@type': 'ListItem', position: 3, name: 'Federal', item: 'https://incentedge.com/incentives/federal' },
    { '@type': 'ListItem', position: 4, name: 'Section 45L', item: 'https://incentedge.com/incentives/federal/45l' },
  ],
};

const creditRates = [
  {
    tier: 'Energy Star Certified',
    amount: '$2,500/unit',
    standard: 'Energy Star Single-Family New Homes',
    prevWage: 'N/A',
    types: 'Single-family, townhomes',
  },
  {
    tier: 'Zero Energy Ready',
    amount: '$5,000/unit',
    standard: 'DOE Zero Energy Ready Home',
    prevWage: 'Required for full rate',
    types: 'Single-family, townhomes',
  },
  {
    tier: 'Multifamily — Energy Star',
    amount: '$500/unit',
    standard: 'Energy Star Multifamily New Construction',
    prevWage: 'N/A',
    types: 'Apartments, condos (3+ stories)',
  },
  {
    tier: 'Multifamily — Zero Energy Ready',
    amount: '$1,000/unit',
    standard: 'DOE Zero Energy Ready Multifamily',
    prevWage: 'Required for full rate',
    types: 'Apartments, condos (3+ stories)',
  },
];

const claimSteps = [
  {
    step: '01',
    title: 'Commission Energy Certification',
    desc: 'Hire a HERS rater or DOE-approved certifier to assess the home before construction is complete.',
  },
  {
    step: '02',
    title: 'Obtain Energy Star or ZERH Certification',
    desc: 'Receive written certification verifying the home meets the applicable program standard.',
  },
  {
    step: '03',
    title: 'Document Prevailing Wage Compliance',
    desc: 'If claiming the maximum ZERH rate, document that all construction workers received prevailing wages as defined by Davis-Bacon.',
  },
  {
    step: '04',
    title: 'Complete Form 8908',
    desc: 'Attach Form 8908 (Energy Efficient Home Credit) to your federal income tax return for the year the home is sold or leased.',
  },
  {
    step: '05',
    title: 'Carry Forward Unused Credits',
    desc: 'Unused 45L credits can generally be carried back 1 year and forward 20 years under standard tax credit carryover rules.',
  },
];

const faqs = [
  {
    q: 'Who can claim the Section 45L credit?',
    a: 'Eligible contractors who build or substantially reconstruct qualified energy-efficient homes for sale or lease. This includes single-family homebuilders, multifamily developers, and manufactured housing contractors.',
  },
  {
    q: 'What is the 45L credit amount per unit in 2024?',
    a: 'The credit is $2,500 per unit for homes meeting Energy Star certification standards, and $5,000 per unit for homes meeting the Zero Energy Ready Home (ZERH) program requirements.',
  },
  {
    q: 'Does Section 45L apply to multifamily buildings?',
    a: 'Yes. Multifamily buildings are eligible under 45L. The IRA updated the standards so multifamily projects must meet Energy Star Multifamily New Construction certification ($500/unit) or DOE Zero Energy Ready Multifamily ($1,000/unit). Prevailing wage requirements apply for maximum rates.',
  },
  {
    q: 'Can 45L be stacked with state incentives?',
    a: 'Yes. Section 45L is a federal tax credit and can generally be stacked with state-level energy efficiency incentives, utility rebates, and LIHTC credits. However, some state programs reduce their benefit dollar-for-dollar when federal credits are claimed — always confirm stacking rules with a tax advisor.',
  },
  {
    q: 'What form is used to claim Section 45L?',
    a: "Form 8908 (Energy Efficient Home Credit) is filed with the eligible contractor's federal income tax return. A third-party energy certification from a qualified certifier is required before claiming.",
  },
];

export default function Section45LPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <IncentiveHeader
        breadcrumbs={[
          { label: 'Incentives', href: '/incentives' },
          { label: 'Federal Credits', href: '/incentives/federal' },
          { label: 'Section 45L' },
        ]}
      />

      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-[900px] mx-auto px-6 pt-16 pb-12 md:pt-20">
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-flex items-center rounded-md px-3 py-1.5 text-sm font-bold font-mono bg-deep-900 text-white">
              §45L
            </span>
            <span className="text-[12px] text-deep-500 uppercase tracking-wider font-medium">Federal Tax Credit</span>
          </div>
          <h1 className="font-sora text-4xl md:text-[46px] font-bold tracking-tight text-deep-900 leading-[1.1] mb-5">
            Section 45L New Energy Efficient Home Credit
          </h1>
          <p className="text-lg text-deep-500 mb-8 leading-relaxed">
            Section 45L provides eligible contractors with a tax credit of up to $5,000 per unit
            for constructing energy-efficient new homes. The Inflation Reduction Act expanded
            credit rates and updated certification standards beginning in 2023.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-teal-600 text-white text-[14px] font-semibold hover:bg-teal-700 transition-colors"
            >
              Scan Your Project for 45L Eligibility
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/incentives/federal"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg border border-deep-200 text-deep-700 text-[14px] font-semibold hover:bg-deep-50 transition-colors"
            >
              All Federal Credits
            </Link>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="border-y border-deep-100 bg-deep-50/50">
          <div className="max-w-[900px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-deep-100">
            {[
              { label: 'Max Credit', value: '$5,000/unit' },
              { label: 'Energy Star Rate', value: '$2,500/unit' },
              { label: 'MF ZERH Rate', value: '$1,000/unit' },
              { label: 'Claim Form', value: 'Form 8908' },
            ].map((s) => (
              <div key={s.label} className="px-6 py-7 text-center">
                <div className="font-mono text-xl font-bold text-deep-900">{s.value}</div>
                <div className="text-xs text-sage-500 mt-1 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="max-w-[900px] mx-auto px-6">
          {/* Section 1 — What is 45L */}
          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-5">
              What is Section 45L?
            </h2>
            <div className="prose prose-deep max-w-none">
              <p className="text-deep-600 leading-relaxed mb-4">
                Section 45L of the Internal Revenue Code provides a tax credit to eligible contractors
                who build energy-efficient new homes or dwelling units. The credit was originally enacted
                in 2005 and substantially revised by the Inflation Reduction Act of 2022, which raised
                credit rates, updated certification standards, and extended the program through 2032.
              </p>
              <p className="text-deep-600 leading-relaxed mb-4">
                Under current law, the credit is $2,500 per unit for homes certified under the
                Energy Star Single-Family New Homes program, and $5,000 per unit for homes meeting
                the more rigorous Department of Energy Zero Energy Ready Home (ZERH) standard.
                Separate, lower rates apply to multifamily buildings.
              </p>
              <p className="text-deep-600 leading-relaxed">
                The credit is non-refundable and reduces the contractor's federal income tax liability
                dollar-for-dollar. Unused credits may be carried back one year and forward twenty years.
              </p>
            </div>
          </section>

          {/* Section 2 — Who Qualifies */}
          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-5">
              Who Qualifies for Section 45L?
            </h2>
            <div className="grid gap-4 md:grid-cols-2 mb-6">
              {[
                {
                  title: 'Single-Family Homebuilders',
                  items: [
                    'New single-family homes sold or leased',
                    'Energy Star or ZERH certification required',
                    'Home must be located in the United States',
                    'Credit claimed by contractor (not buyer)',
                  ],
                },
                {
                  title: 'Multifamily Developers',
                  items: [
                    'Apartment buildings and condominiums',
                    'Buildings with 3+ stories above grade',
                    'Energy Star MF or ZERH MF certification',
                    'Prevailing wage required for full ZERH rate',
                  ],
                },
                {
                  title: 'Manufactured Housing',
                  items: [
                    'HUD-regulated manufactured homes',
                    'Must meet Energy Star for Manufactured Homes',
                    'Credit is $2,500 for Energy Star certified',
                    'Dealers and manufacturers may qualify',
                  ],
                },
                {
                  title: 'Substantial Reconstruction',
                  items: [
                    'Existing homes that undergo major renovation',
                    '50%+ of exterior walls replaced or reconstituted',
                    'Must meet new construction energy standards',
                    'Same certification process as new construction',
                  ],
                },
              ].map((group) => (
                <div key={group.title} className="rounded-xl border border-deep-100 bg-deep-50/50 p-6">
                  <h3 className="font-sora font-semibold text-deep-900 mb-3">{group.title}</h3>
                  <ul className="space-y-2">
                    {group.items.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-deep-600">
                        <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-5 py-4">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                <strong>Important:</strong> The credit belongs to the eligible contractor, not the home
                buyer. If you are a general contractor who builds and sells homes, you claim the credit —
                not your customers.
              </p>
            </div>
          </section>

          {/* Section 3 — Credit Rates */}
          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-5">
              Credit Rates &amp; Stacking
            </h2>
            <p className="text-deep-600 mb-8 leading-relaxed">
              Credit rates vary by certification level and building type. Prevailing wage compliance
              is required to access the maximum rates for multifamily ZERH projects.
            </p>

            <div className="overflow-x-auto rounded-xl border border-deep-100 mb-8">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-deep-50 border-b border-deep-100">
                    <th className="px-5 py-3.5 text-left font-semibold text-deep-700">Certification Tier</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-deep-700">Credit Amount</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-deep-700 hidden md:table-cell">Building Types</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-deep-700 hidden lg:table-cell">Prevailing Wage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-deep-100">
                  {creditRates.map((row) => (
                    <tr key={row.tier} className="hover:bg-deep-50/50">
                      <td className="px-5 py-4 font-medium text-deep-900">{row.tier}</td>
                      <td className="px-5 py-4 font-mono font-bold text-teal-600">{row.amount}</td>
                      <td className="px-5 py-4 text-deep-600 hidden md:table-cell">{row.types}</td>
                      <td className="px-5 py-4 text-deep-600 hidden lg:table-cell">{row.prevWage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="font-sora font-semibold text-lg text-deep-900 mb-3">Stacking with Other IRA Credits</h3>
            <div className="space-y-3">
              {[
                { compatible: true, text: 'State energy efficiency tax credits and rebates (check state rules)' },
                { compatible: true, text: 'LIHTC (Low-Income Housing Tax Credit) — common for affordable housing' },
                { compatible: true, text: 'Utility rebates and weatherization grants' },
                { compatible: false, text: '179D deduction — 45L and 179D may not be claimed for the same residential property' },
              ].map((item) => (
                <div key={item.text} className={`flex items-start gap-3 rounded-lg border px-5 py-3.5 ${item.compatible ? 'border-emerald-100 bg-emerald-50/50' : 'border-red-100 bg-red-50/50'}`}>
                  <span className={`text-lg font-bold flex-shrink-0 ${item.compatible ? 'text-emerald-500' : 'text-red-400'}`}>
                    {item.compatible ? '+' : '×'}
                  </span>
                  <span className="text-sm text-deep-700">{item.text}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Section 4 — How to Claim */}
          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-5">
              How to Claim Section 45L
            </h2>
            <div className="space-y-4">
              {claimSteps.map((step) => (
                <div key={step.step} className="flex gap-5 rounded-xl border border-deep-100 p-6">
                  <div className="flex-shrink-0 font-mono text-2xl font-bold text-teal-200">{step.step}</div>
                  <div>
                    <h3 className="font-sora font-semibold text-deep-900 mb-1">{step.title}</h3>
                    <p className="text-sm text-deep-600 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {faqs.map((faq) => (
                <div key={faq.q} className="rounded-xl border border-deep-100 p-6">
                  <h3 className="font-sora font-semibold text-deep-900 mb-3">{faq.q}</h3>
                  <p className="text-deep-600 text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="py-14">
            <IncentiveCTA
              headline="Scan Your Project for 45L Eligibility"
              sub="IncentEdge calculates your exact 45L credit across all units, checks certification pathways, and models stacking with state incentives — in under 60 seconds."
            />
          </section>
        </div>
      </main>

      <IncentiveFooter />
    </div>
  );
}
