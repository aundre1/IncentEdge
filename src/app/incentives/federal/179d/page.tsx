import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { IncentiveHeader, IncentiveCTA, IncentiveFooter } from '@/components/incentives/IncentiveHeader';

export const metadata: Metadata = {
  title: 'Section 179D Energy Efficient Commercial Building Deduction | IncentEdge',
  description:
    'Section 179D offers up to $5.00/sq ft deduction for energy-efficient commercial buildings. IRA expanded eligibility to include nonprofits and government buildings.',
  alternates: { canonical: 'https://incentedge.com/incentives/federal/179d' },
  openGraph: {
    title: 'Section 179D Energy Efficient Commercial Building Deduction | IncentEdge',
    description:
      'Section 179D offers up to $5.00/sq ft deduction for energy-efficient commercial buildings. IRA expanded eligibility to include nonprofits and government buildings.',
    url: 'https://incentedge.com/incentives/federal/179d',
    siteName: 'IncentEdge',
    type: 'article',
  },
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Section 179D Commercial Building Energy Efficiency Deduction',
  description: 'Complete guide to Section 179D: deduction rates, eligibility for nonprofits and government, and how to claim.',
  url: 'https://incentedge.com/incentives/federal/179d',
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
      name: 'Who is eligible for Section 179D?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Commercial building owners and designers (architects, engineers) who make qualifying energy efficiency improvements. Post-IRA, designers working on government, tribal, and nonprofit buildings can now receive an allocated deduction directly from those tax-exempt entities.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the maximum 179D deduction per square foot?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The maximum deduction is $5.00 per square foot for buildings meeting the full 25% energy reduction standard with prevailing wage and apprenticeship compliance. Without prevailing wage, the maximum is $1.00/sq ft.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can nonprofits and government agencies use 179D?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Tax-exempt entities cannot directly use 179D since they have no tax liability. However, the IRA allows them to allocate the 179D deduction to the designer (architect, engineer, or contractor) who designed the energy-efficient systems. This is a major change that opened 179D to a much larger market.',
      },
    },
    {
      '@type': 'Question',
      name: 'What building systems qualify for 179D?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Three building systems qualify: (1) Interior lighting systems, (2) HVAC and hot water systems, and (3) Building envelope improvements. A partial deduction of $0.50–$1.00/sq ft is available for each system independently.',
      },
    },
    {
      '@type': 'Question',
      name: 'How often can a building claim 179D?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A building can claim 179D once every three years. If improvements are made across multiple phases, each phase can potentially qualify if three years have elapsed since the prior claim on that building.',
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
    { '@type': 'ListItem', position: 4, name: 'Section 179D', item: 'https://incentedge.com/incentives/federal/179d' },
  ],
};

const deductionRates = [
  { sqft: '$0.50/sq ft', standard: 'Minimum (each system)', prevWage: 'No', note: 'Per qualified system (lighting, HVAC, envelope)' },
  { sqft: '$1.00/sq ft', standard: 'Full without PW', prevWage: 'No', note: '25% energy reduction, no prevailing wage' },
  { sqft: '$2.50/sq ft', standard: 'PW Minimum', prevWage: 'Yes', note: 'Prevailing wage, partial systems' },
  { sqft: '$5.00/sq ft', standard: 'Maximum', prevWage: 'Yes + Apprenticeship', note: 'Full 25% reduction, prevailing wage + apprenticeship' },
];

const faqs = [
  {
    q: 'Who is eligible for Section 179D?',
    a: 'Commercial building owners and designers (architects, engineers) who make qualifying energy efficiency improvements. Post-IRA, designers working on government, tribal, and nonprofit buildings can now receive an allocated deduction directly from those tax-exempt entities.',
  },
  {
    q: 'What is the maximum 179D deduction per square foot?',
    a: 'The maximum deduction is $5.00 per square foot for buildings meeting the full 25% energy reduction standard with prevailing wage and apprenticeship compliance. Without prevailing wage, the maximum is $1.00/sq ft.',
  },
  {
    q: 'Can nonprofits and government agencies use 179D?',
    a: 'Tax-exempt entities cannot directly use 179D since they have no tax liability. However, the IRA allows them to allocate the 179D deduction to the designer (architect, engineer, or contractor) who designed the energy-efficient systems. This is a major change that opened 179D to a much larger market.',
  },
  {
    q: 'What building systems qualify for 179D?',
    a: 'Three building systems qualify: (1) Interior lighting systems, (2) HVAC and hot water systems, and (3) Building envelope improvements. A partial deduction of $0.50–$1.00/sq ft is available for each system independently.',
  },
  {
    q: 'How often can a building claim 179D?',
    a: 'A building can claim 179D once every three years. If improvements are made across multiple phases, each phase can potentially qualify if three years have elapsed since the prior claim on that building.',
  },
];

export default function Section179DPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <IncentiveHeader
        breadcrumbs={[
          { label: 'Incentives', href: '/incentives' },
          { label: 'Federal Credits', href: '/incentives/federal' },
          { label: 'Section 179D' },
        ]}
      />

      <main className="flex-1">
        <section className="max-w-[900px] mx-auto px-6 pt-16 pb-12 md:pt-20">
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-flex items-center rounded-md px-3 py-1.5 text-sm font-bold font-mono bg-deep-900 text-white">
              §179D
            </span>
            <span className="text-[12px] text-deep-500 uppercase tracking-wider font-medium">Federal Tax Deduction</span>
          </div>
          <h1 className="font-sora text-4xl md:text-[46px] font-bold tracking-tight text-deep-900 leading-[1.1] mb-5">
            Section 179D Commercial Building Energy Efficiency Deduction
          </h1>
          <p className="text-lg text-deep-500 mb-8 leading-relaxed">
            Section 179D provides a federal tax deduction of up to $5.00 per square foot for
            energy-efficient improvements to commercial buildings. The IRA dramatically expanded
            this benefit — now including architects and engineers working on government, tribal,
            and nonprofit buildings.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-teal-600 text-white text-[14px] font-semibold hover:bg-teal-700 transition-colors"
            >
              Calculate Your 179D Deduction
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
              { label: 'Max Deduction', value: '$5.00/sq ft' },
              { label: 'Base Deduction', value: '$1.00/sq ft' },
              { label: 'Energy Reduction', value: '25% Required' },
              { label: 'Reclaim Period', value: 'Every 3 Years' },
            ].map((s) => (
              <div key={s.label} className="px-6 py-7 text-center">
                <div className="font-mono text-xl font-bold text-deep-900">{s.value}</div>
                <div className="text-xs text-sage-500 mt-1 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="max-w-[900px] mx-auto px-6">
          {/* What is 179D */}
          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-5">What is Section 179D?</h2>
            <p className="text-deep-600 leading-relaxed mb-4">
              Section 179D of the Internal Revenue Code allows commercial building owners and designers
              to deduct the cost of energy-efficient improvements from their federal taxable income.
              Originally enacted in 2005 under EPAct, the deduction was made permanent in 2020 and
              substantially improved by the Inflation Reduction Act of 2022.
            </p>
            <p className="text-deep-600 leading-relaxed mb-4">
              The IRA's most significant change was allowing tax-exempt entities — nonprofits, schools,
              hospitals, government agencies, and tribal governments — to allocate the 179D deduction to
              the commercial building designer responsible for the energy-efficient systems. This opened
              a massive untapped market for architects, mechanical engineers, and energy contractors.
            </p>
            <div className="flex items-start gap-3 rounded-lg border border-teal-200 bg-teal-50 px-5 py-4">
              <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-teal-800">
                <strong>IRA Expansion:</strong> Pre-IRA, only private commercial building owners could
                benefit from 179D. Now, designers working on government schools, hospitals, and nonprofits
                can receive the deduction directly — representing millions of square feet of previously
                unavailable opportunity.
              </p>
            </div>
          </section>

          {/* Who Qualifies */}
          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-5">Who Qualifies for 179D?</h2>
            <div className="grid gap-4 md:grid-cols-2 mb-6">
              {[
                {
                  title: 'Commercial Building Owners',
                  items: [
                    'Own and operate commercial or industrial buildings',
                    'Make qualifying energy-efficient improvements',
                    'Building must be in the United States',
                    'Can claim deduction on their own tax return',
                  ],
                },
                {
                  title: 'Designers (Post-IRA Allocation)',
                  items: [
                    'Architects, engineers, contractors',
                    'Must design qualifying energy systems',
                    'Nonprofit/gov building allocates deduction to designer',
                    'Written allocation agreement required',
                  ],
                },
                {
                  title: 'Qualifying Entity Types',
                  items: [
                    'S-corps, C-corps, LLCs, partnerships',
                    'Tax-exempt entities (allocate to designers)',
                    'State and local government buildings',
                    'Tribal government-owned properties',
                  ],
                },
                {
                  title: 'Qualifying Building Systems',
                  items: [
                    'Interior lighting systems',
                    'HVAC and hot water systems',
                    'Building envelope (walls, roof, windows)',
                    'All three systems together for maximum deduction',
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
          </section>

          {/* Deduction Rates */}
          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-5">
              Deduction Rates &amp; Prevailing Wage Requirements
            </h2>
            <p className="text-deep-600 mb-8 leading-relaxed">
              The IRA tied higher deduction rates to prevailing wage and apprenticeship requirements.
              The maximum $5.00/sq ft requires both energy performance and labor compliance.
            </p>
            <div className="overflow-x-auto rounded-xl border border-deep-100 mb-8">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-deep-50 border-b border-deep-100">
                    <th className="px-5 py-3.5 text-left font-semibold text-deep-700">Deduction Rate</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-deep-700">Standard</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-deep-700">Prevailing Wage</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-deep-700 hidden md:table-cell">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-deep-100">
                  {deductionRates.map((row) => (
                    <tr key={row.sqft} className="hover:bg-deep-50/50">
                      <td className="px-5 py-4 font-mono font-bold text-teal-600">{row.sqft}</td>
                      <td className="px-5 py-4 text-deep-700">{row.standard}</td>
                      <td className="px-5 py-4 text-deep-600">{row.prevWage}</td>
                      <td className="px-5 py-4 text-deep-500 hidden md:table-cell">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-5 py-4">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                <strong>Energy Modeling Required:</strong> A qualified software modeling study (using
                IRS-approved programs like eQUEST, EnergyPlus, or DOE-2) must demonstrate the required
                25% energy reduction vs. the ASHRAE 90.1 baseline before the deduction can be claimed.
              </p>
            </div>
          </section>

          {/* How to Claim */}
          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-5">How to Claim 179D</h2>
            <div className="space-y-4">
              {[
                { step: '01', title: 'Commission an Energy Study', desc: 'Engage a qualified energy modeling firm to run software analysis and demonstrate the required energy savings vs. ASHRAE 90.1.' },
                { step: '02', title: 'Obtain Qualified Certification', desc: 'A qualified individual (licensed engineer or contractor) certifies the energy study results and the qualifying improvements.' },
                { step: '03', title: 'Secure Allocation Letter (if nonprofit/gov)', desc: 'For government or nonprofit buildings, obtain a signed allocation letter from the building owner designating the designer as the deduction recipient.' },
                { step: '04', title: 'Document Prevailing Wage Compliance', desc: 'If claiming rates above $1.00/sq ft, document that all construction workers were paid prevailing wages and apprenticeship requirements were met.' },
                { step: '05', title: 'Claim on Tax Return', desc: 'Claim the deduction on the applicable tax return (Schedule C, Form 1120, Form 1065, etc.) for the tax year the property is placed in service.' },
              ].map((step) => (
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
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-8">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {faqs.map((faq) => (
                <div key={faq.q} className="rounded-xl border border-deep-100 p-6">
                  <h3 className="font-sora font-semibold text-deep-900 mb-3">{faq.q}</h3>
                  <p className="text-deep-600 text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="py-14">
            <IncentiveCTA
              headline="Calculate Your 179D Deduction Potential"
              sub="Enter your building's square footage and system types. IncentEdge calculates your maximum deduction and checks nonprofit allocation eligibility automatically."
            />
          </section>
        </div>
      </main>

      <IncentiveFooter />
    </div>
  );
}
