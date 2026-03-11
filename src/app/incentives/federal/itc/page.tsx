import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { IncentiveHeader, IncentiveCTA, IncentiveFooter } from '@/components/incentives/IncentiveHeader';

export const metadata: Metadata = {
  title: 'Investment Tax Credit (ITC) for Solar & Clean Energy | IncentEdge',
  description:
    'The ITC provides a 30% tax credit for solar, wind, and clean energy investments. IRA extended and expanded the ITC through 2032 with bonus adders up to 70%.',
  alternates: { canonical: 'https://incentedge.com/incentives/federal/itc' },
  openGraph: {
    title: 'Investment Tax Credit (ITC) for Solar & Clean Energy | IncentEdge',
    description:
      'The ITC provides a 30% tax credit for solar, wind, and clean energy investments. IRA extended and expanded the ITC through 2032 with bonus adders up to 70%.',
    url: 'https://incentedge.com/incentives/federal/itc',
    siteName: 'IncentEdge',
    type: 'article',
  },
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Investment Tax Credit (ITC) — Section 48 & 48E Complete Guide',
  description: 'Full guide to the ITC: 30% base rate, bonus adders, transferability, direct pay, and ITC vs PTC comparison.',
  url: 'https://incentedge.com/incentives/federal/itc',
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
      name: 'What is the current ITC rate for solar in 2024?',
      acceptedAnswer: { '@type': 'Answer', text: 'The base ITC rate is 30% of eligible project costs for systems that begin construction before 2025. With prevailing wage and apprenticeship compliance, the full 30% applies. Bonus adders can increase the effective rate to as much as 70% for projects meeting energy community, domestic content, and low-income criteria.' },
    },
    {
      '@type': 'Question',
      name: 'What is the difference between Section 48 and Section 48E?',
      acceptedAnswer: { '@type': 'Answer', text: 'Section 48 is the legacy ITC that applies to projects beginning construction through 2024. Section 48E is the new technology-neutral Clean Electricity Investment Credit that applies from 2025 onward for facilities with zero greenhouse gas emissions. The credit rates and structure are similar, but 48E is technology-neutral rather than listing specific qualifying technologies.' },
    },
    {
      '@type': 'Question',
      name: 'Can the ITC be transferred or sold?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. The IRA introduced transferability for the ITC, allowing taxpayers to sell their credits to unrelated third parties for cash. This is a major change that allows developers without sufficient tax liability to monetize credits directly without a tax equity partnership.' },
    },
    {
      '@type': 'Question',
      name: 'What is the energy community bonus adder for the ITC?',
      acceptedAnswer: { '@type': 'Answer', text: 'Projects located in an energy community — defined as a brownfield site, a coal closure community, or a statistical area with significant fossil fuel employment — receive a 10 percentage point bonus adder, increasing the ITC from 30% to 40%.' },
    },
    {
      '@type': 'Question',
      name: 'Should I choose ITC or PTC for my solar project?',
      acceptedAnswer: { '@type': 'Answer', text: 'The optimal choice depends on project economics. The ITC provides a one-time credit upfront based on cost. The PTC pays per kilowatt-hour over 10 years, so high-capacity factor projects (like wind) often benefit more from PTC. IncentEdge models both scenarios and identifies the higher-value option for your specific project.' },
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
    { '@type': 'ListItem', position: 4, name: 'ITC', item: 'https://incentedge.com/incentives/federal/itc' },
  ],
};

const bonusAdders = [
  { adder: 'Base Rate', value: '30%', requirement: 'Prevailing wage + apprenticeship', note: 'Default rate for qualifying projects' },
  { adder: 'Energy Community', value: '+10%', requirement: 'Located in energy community area', note: 'Brownfields, coal closure, fossil fuel employment zones' },
  { adder: 'Domestic Content', value: '+10%', requirement: 'US-made steel, iron, and components', note: 'Specific domestic content % thresholds apply' },
  { adder: 'Low-Income (Category 1)', value: '+10%', requirement: 'Qualified low-income housing / community facility', note: 'Allocated by IRS — application required' },
  { adder: 'Low-Income (Category 2)', value: '+20%', requirement: 'Low-income economic benefit project', note: 'Benefits residents in low-income community' },
];

const eligibleTechnologies = [
  'Solar photovoltaic systems',
  'Solar thermal / concentrating solar',
  'Wind energy facilities',
  'Standalone battery energy storage (≥5 kWh)',
  'Geothermal heat pumps',
  'Microturbines',
  'Combined heat and power systems',
  'Fuel cells (hydrogen and non-hydrogen)',
  'Small wind turbines',
  'Biogas and waste-to-energy',
  'Offshore wind',
  'Hydropower (upgrades)',
];

const faqs = [
  { q: 'What is the current ITC rate for solar in 2024?', a: 'The base ITC rate is 30% of eligible project costs for systems that begin construction before 2025. With prevailing wage and apprenticeship compliance, the full 30% applies. Bonus adders can increase the effective rate to as much as 70% for projects meeting energy community, domestic content, and low-income criteria.' },
  { q: 'What is the difference between Section 48 and Section 48E?', a: 'Section 48 is the legacy ITC that applies to projects beginning construction through 2024. Section 48E is the new technology-neutral Clean Electricity Investment Credit that applies from 2025 onward for facilities with zero greenhouse gas emissions. The credit rates and structure are similar, but 48E is technology-neutral rather than listing specific qualifying technologies.' },
  { q: 'Can the ITC be transferred or sold?', a: 'Yes. The IRA introduced transferability for the ITC, allowing taxpayers to sell their credits to unrelated third parties for cash. This is a major change that allows developers without sufficient tax liability to monetize credits directly without a tax equity partnership.' },
  { q: 'What is the energy community bonus adder for the ITC?', a: 'Projects located in an energy community — defined as a brownfield site, a coal closure community, or a statistical area with significant fossil fuel employment — receive a 10 percentage point bonus adder, increasing the ITC from 30% to 40%.' },
  { q: 'Should I choose ITC or PTC for my solar project?', a: 'The optimal choice depends on project economics. The ITC provides a one-time credit upfront based on cost. The PTC pays per kilowatt-hour over 10 years, so high-capacity factor projects (like wind) often benefit more from PTC. IncentEdge models both scenarios and identifies the higher-value option for your specific project.' },
];

export default function ITCPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <IncentiveHeader
        breadcrumbs={[
          { label: 'Incentives', href: '/incentives' },
          { label: 'Federal Credits', href: '/incentives/federal' },
          { label: 'ITC' },
        ]}
      />

      <main className="flex-1">
        <section className="max-w-[900px] mx-auto px-6 pt-16 pb-12 md:pt-20">
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-flex items-center rounded-md px-3 py-1.5 text-sm font-bold font-mono bg-deep-900 text-white">
              §48 / §48E
            </span>
            <span className="text-[12px] text-deep-500 uppercase tracking-wider font-medium">Federal Tax Credit — Transferable</span>
          </div>
          <h1 className="font-sora text-4xl md:text-[46px] font-bold tracking-tight text-deep-900 leading-[1.1] mb-5">
            Investment Tax Credit (ITC) — Section 48 &amp; 48E
          </h1>
          <p className="text-lg text-deep-500 mb-8 leading-relaxed">
            The Investment Tax Credit is the primary federal incentive for clean energy projects.
            At a 30% base rate — with bonus adders bringing the effective rate up to 70% —
            the ITC remains the cornerstone of clean energy project finance through 2032 and beyond.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/signup" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-teal-600 text-white text-[14px] font-semibold hover:bg-teal-700 transition-colors">
              Model ITC vs PTC for My Project
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/incentives/federal/ptc" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg border border-deep-200 text-deep-700 text-[14px] font-semibold hover:bg-deep-50 transition-colors">
              Compare with PTC
            </Link>
          </div>
        </section>

        <section className="border-y border-deep-100 bg-deep-50/50">
          <div className="max-w-[900px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-deep-100">
            {[
              { label: 'Base Rate', value: '30%' },
              { label: 'Max with Adders', value: '70%' },
              { label: 'Available Through', value: '2032+' },
              { label: 'Direct Pay', value: 'Available' },
            ].map((s) => (
              <div key={s.label} className="px-6 py-7 text-center">
                <div className="font-mono text-xl font-bold text-deep-900">{s.value}</div>
                <div className="text-xs text-sage-500 mt-1 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="max-w-[900px] mx-auto px-6">
          {/* Base Rate */}
          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-5">Base Rate: 30% of Eligible Costs</h2>
            <p className="text-deep-600 leading-relaxed mb-4">
              The ITC provides a direct reduction in federal income tax equal to 30% of the total
              qualified costs of a clean energy system. Eligible costs include equipment, installation
              labor, permitting, engineering, and interconnection fees directly attributable to the
              energy property.
            </p>
            <p className="text-deep-600 leading-relaxed mb-4">
              To receive the full 30% rate, projects must comply with prevailing wage and apprenticeship
              requirements set by the IRA. Projects under 1 MW (AC) are exempt from prevailing wage
              requirements and still receive the full 30% base rate.
            </p>
            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-5 py-4">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                <strong>Small Project Exemption:</strong> Projects under 1 megawatt (AC) of nameplate capacity
                are automatically exempt from prevailing wage and apprenticeship requirements and qualify
                for the full 30% ITC without additional labor compliance documentation.
              </p>
            </div>
          </section>

          {/* Bonus Adders */}
          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-5">Bonus Adders — Up to 70% Total</h2>
            <p className="text-deep-600 mb-8 leading-relaxed">
              The IRA created four bonus adder categories that stack on top of the 30% base rate.
              Projects in energy communities using domestic content with low-income benefits can
              potentially reach a 70% effective credit rate.
            </p>
            <div className="overflow-x-auto rounded-xl border border-deep-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-deep-50 border-b border-deep-100">
                    <th className="px-5 py-3.5 text-left font-semibold text-deep-700">Adder</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-deep-700">Rate</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-deep-700 hidden md:table-cell">Requirement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-deep-100">
                  {bonusAdders.map((row) => (
                    <tr key={row.adder} className="hover:bg-deep-50/50">
                      <td className="px-5 py-4 font-medium text-deep-900">{row.adder}</td>
                      <td className="px-5 py-4 font-mono font-bold text-teal-600">{row.value}</td>
                      <td className="px-5 py-4 text-deep-600 hidden md:table-cell">{row.requirement}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Eligible Technologies */}
          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-5">Eligible Technologies</h2>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {eligibleTechnologies.map((tech) => (
                <div key={tech} className="flex items-center gap-2.5 rounded-lg border border-deep-100 px-4 py-3">
                  <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0" />
                  <span className="text-sm text-deep-700">{tech}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Transferability */}
          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-5">Transferability &amp; Direct Pay</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-deep-100 p-6">
                <h3 className="font-sora font-semibold text-deep-900 mb-3">Transferability (Credit Sale)</h3>
                <p className="text-sm text-deep-600 leading-relaxed mb-3">
                  For-profit taxpayers can sell ITC credits to unrelated third parties in exchange
                  for cash. The sale price is determined by market rates (typically 90–95 cents per
                  dollar of credit). Credits must be sold in the year they are generated.
                </p>
                <ul className="space-y-2">
                  {['Available to all for-profit entities', 'Credits sold to unrelated buyers', 'No tax equity partnership required', 'Sold at market price (90–95 cents/$)'].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-deep-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-6">
                <h3 className="font-sora font-semibold text-deep-900 mb-3">Direct Pay (Elective Payment)</h3>
                <p className="text-sm text-deep-600 leading-relaxed mb-3">
                  Tax-exempt entities, state and local governments, and tribal governments can elect
                  to receive the ITC as a direct cash payment from the IRS rather than as a credit
                  against tax liability.
                </p>
                <ul className="space-y-2">
                  {['Available to nonprofits and governments', 'IRS pays cash equivalent of credit', 'No tax liability needed to benefit', 'Election made on annual tax filing'].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-deep-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* ITC vs PTC */}
          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-5">ITC vs PTC — Which is Better?</h2>
            <p className="text-deep-600 mb-6 leading-relaxed">
              Most utility-scale clean energy projects can elect either the ITC or the PTC — but not both.
              The optimal choice depends on project cost, expected production, and timeline.
            </p>
            <div className="overflow-x-auto rounded-xl border border-deep-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-deep-50 border-b border-deep-100">
                    <th className="px-5 py-3.5 text-left font-semibold text-deep-700">Factor</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-deep-700">ITC (§48/48E)</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-deep-700">PTC (§45/45Y)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-deep-100 text-deep-700">
                  {[
                    { factor: 'Timing', itc: 'Claimed year 1 (upfront)', ptc: 'Earned over 10 years' },
                    { factor: 'Basis', itc: '% of capital cost', ptc: 'Per kWh produced' },
                    { factor: 'Best for', itc: 'High-cost, lower capacity factor', ptc: 'High capacity factor (wind)' },
                    { factor: 'Revenue certainty', itc: 'Higher (one-time)', ptc: 'Lower (depends on production)' },
                    { factor: 'Transferable', itc: 'Yes', ptc: 'Yes' },
                    { factor: 'Direct Pay', itc: 'Yes (tax-exempt entities)', ptc: 'Yes (tax-exempt entities)' },
                  ].map((row) => (
                    <tr key={row.factor} className="hover:bg-deep-50/50">
                      <td className="px-5 py-4 font-medium">{row.factor}</td>
                      <td className="px-5 py-4">{row.itc}</td>
                      <td className="px-5 py-4">{row.ptc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
              headline="Model ITC vs PTC for Your Project"
              sub="IncentEdge calculates both ITC and PTC scenarios using your project's actual cost and location, then recommends the higher-value option with all bonus adders applied."
            />
          </section>
        </div>
      </main>

      <IncentiveFooter />
    </div>
  );
}
