import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { IncentiveHeader, IncentiveCTA, IncentiveFooter } from '@/components/incentives/IncentiveHeader';

export const metadata: Metadata = {
  title: 'Federal IRA Tax Credits — Complete Guide | IncentEdge',
  description:
    'Complete guide to federal IRA tax credits including Section 45L, 179D, ITC, PTC, 48C, 45Q, and 45V. Eligibility, rates, and stacking rules.',
  alternates: { canonical: 'https://incentedge.com/incentives/federal' },
  openGraph: {
    title: 'Federal IRA Tax Credits — Complete Guide | IncentEdge',
    description:
      'Complete guide to federal IRA tax credits including Section 45L, 179D, ITC, PTC, 48C, 45Q, and 45V. Eligibility, rates, and stacking rules.',
    url: 'https://incentedge.com/incentives/federal',
    siteName: 'IncentEdge',
    type: 'article',
  },
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Federal Clean Energy Tax Credits Under the IRA — Complete Guide',
  description:
    'Complete guide to all seven federal IRA tax credits: 45L, 179D, ITC, PTC, 48C, 45Q, and 45V with rates, eligibility, and stacking rules.',
  url: 'https://incentedge.com/incentives/federal',
  author: { '@type': 'Organization', name: 'IncentEdge' },
  publisher: { '@type': 'Organization', name: 'IncentEdge', url: 'https://incentedge.com' },
  dateModified: '2026-03-11',
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://incentedge.com' },
    { '@type': 'ListItem', position: 2, name: 'Incentives', item: 'https://incentedge.com/incentives' },
    { '@type': 'ListItem', position: 3, name: 'Federal', item: 'https://incentedge.com/incentives/federal' },
  ],
};

const credits = [
  {
    code: '45L',
    section: 'Section 45L',
    name: 'New Energy Efficient Home Credit',
    value: 'Up to $5,000 per unit',
    rate: '$2,500 (Energy Star) / $5,000 (Zero Energy Ready)',
    sectors: ['Residential Construction', 'Multifamily'],
    prevailingWage: false,
    transferable: false,
    directPay: false,
    desc:
      'Contractors and developers building energy-efficient new single-family or multifamily homes can claim a credit per qualified unit. The IRA raised rates significantly from the pre-IRA $2,000 cap.',
    href: '/incentives/federal/45l',
    highlight: false,
  },
  {
    code: '179D',
    section: 'Section 179D',
    name: 'Commercial Building Energy Efficiency Deduction',
    value: 'Up to $5.00 per sq ft',
    rate: '$0.50–$5.00/sq ft (prevailing wage required for maximum)',
    sectors: ['Commercial', 'Nonprofit', 'Government', 'Industrial'],
    prevailingWage: true,
    transferable: true,
    directPay: false,
    desc:
      'A tax deduction for energy-efficient improvements to commercial buildings. The IRA expanded eligibility to include nonprofits and government entities that can now allocate the deduction to designers.',
    href: '/incentives/federal/179d',
    highlight: false,
  },
  {
    code: 'ITC',
    section: 'Section 48 / 48E',
    name: 'Investment Tax Credit',
    value: '30%–70% of project cost',
    rate: '30% base + up to 40% in bonus adders',
    sectors: ['Solar', 'Wind', 'Storage', 'Geothermal', 'Fuel Cell'],
    prevailingWage: true,
    transferable: true,
    directPay: true,
    desc:
      'The flagship clean energy tax credit. The IRA extended the ITC through 2032 and added bonus adders for energy communities, domestic content, and low-income projects.',
    href: '/incentives/federal/itc',
    highlight: true,
  },
  {
    code: 'PTC',
    section: 'Section 45 / 45Y',
    name: 'Production Tax Credit',
    value: '2.75¢/kWh for 10 years',
    rate: 'Inflation-adjusted annually; 0.3¢/kWh without prevailing wage',
    sectors: ['Wind', 'Solar', 'Geothermal', 'Hydro', 'Marine'],
    prevailingWage: true,
    transferable: true,
    directPay: true,
    desc:
      'A per-kilowatt-hour credit for electricity produced from clean energy sources. Projects must choose between ITC and PTC — IncentEdge models both scenarios to maximize your credit value.',
    href: '/incentives/federal/ptc',
    highlight: true,
  },
  {
    code: '48C',
    section: 'Section 48C',
    name: 'Advanced Manufacturing Tax Credit',
    value: '30% of qualified investment',
    rate: '30% base; 6% without prevailing wage/apprenticeship',
    sectors: ['Solar Manufacturing', 'Wind Manufacturing', 'Battery', 'EVs', 'Efficiency'],
    prevailingWage: true,
    transferable: false,
    directPay: true,
    desc:
      'A $10 billion IRA allocation for manufacturers of clean energy equipment. Applications are submitted through a competitive IRS/DOE review process in annual allocation rounds.',
    href: '/incentives/federal/48c',
    highlight: false,
  },
  {
    code: '45Q',
    section: 'Section 45Q',
    name: 'Carbon Capture & Sequestration Credit',
    value: '$85/ton (geologic storage)',
    rate: '$85/ton geologic; $60/ton utilization; $180/ton DAC',
    sectors: ['Industrial', 'Power Generation', 'Direct Air Capture'],
    prevailingWage: true,
    transferable: true,
    directPay: true,
    desc:
      'The IRA doubled credit rates and significantly lowered capture thresholds, unlocking carbon capture economics for a much broader set of industrial and power generation projects.',
    href: '/incentives/federal/45q',
    highlight: false,
  },
  {
    code: '45V',
    section: 'Section 45V',
    name: 'Clean Hydrogen Production Credit',
    value: 'Up to $3.00/kg H2',
    rate: 'Tiered by lifecycle emissions: $0.60–$3.00/kg',
    sectors: ['Green Hydrogen', 'Blue Hydrogen', 'Electrolysis', 'SMR + CCS'],
    prevailingWage: true,
    transferable: true,
    directPay: true,
    desc:
      'A 10-year production credit for clean hydrogen based on lifecycle greenhouse gas emissions. Projects with the lowest emissions (under 0.45 kg CO2e/kg H2) receive the full $3.00/kg.',
    href: '/incentives/federal/45v',
    highlight: false,
  },
];

const stackingRules = [
  'ITC and PTC are mutually exclusive — choose one per project',
  '45L can stack with state energy efficiency incentives',
  '179D can be claimed alongside ITC for the same building',
  '45V can stack with ITC on electrolysis equipment',
  '48C cannot stack with ITC/PTC for the same property',
  '45Q is compatible with ITC when CCS is a separate system',
];

export default function FederalCreditsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <IncentiveHeader
        breadcrumbs={[
          { label: 'Incentives', href: '/incentives' },
          { label: 'Federal Credits' },
        ]}
      />

      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-[1200px] mx-auto px-6 pt-16 pb-12 md:pt-20 md:pb-16">
          <div className="inline-flex items-center rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-[12px] text-teal-700 mb-6">
            Inflation Reduction Act — Enacted August 2022
          </div>
          <h1 className="font-sora text-4xl md:text-5xl font-bold tracking-tight text-deep-900 leading-[1.1] mb-5">
            Federal Clean Energy Tax Credits<br className="hidden md:block" /> Under the IRA
          </h1>
          <p className="text-lg text-deep-500 mb-8 leading-relaxed max-w-2xl">
            The Inflation Reduction Act deployed over $370 billion in clean energy incentives across
            seven major tax credit programs. Here is a complete guide to every federal credit,
            who qualifies, and how to stack them.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-teal-600 text-white text-[14px] font-semibold hover:bg-teal-700 transition-colors"
          >
            Scan My Project for All 7 Credits
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>

        {/* Stats */}
        <section className="border-y border-deep-100">
          <div className="max-w-[1200px] mx-auto grid sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-deep-100">
            {[
              { value: '$370B+', label: 'IRA Clean Energy Spend' },
              { value: '7', label: 'Major Credit Programs' },
              { value: '10 Years', label: 'Production Credit Window' },
              { value: '70%', label: 'Max ITC with Adders' },
            ].map((stat) => (
              <div key={stat.label} className="px-6 py-8 text-center">
                <div className="font-mono text-2xl font-bold text-deep-900">{stat.value}</div>
                <div className="text-xs text-sage-500 mt-1 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Credit Cards */}
        <section className="max-w-[1200px] mx-auto px-6 py-16 md:py-20">
          <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-2">
            All Seven Federal IRA Credits
          </h2>
          <p className="text-deep-500 mb-10 max-w-2xl">
            Select any credit to read a detailed guide with eligibility requirements, rates,
            bonus adders, and step-by-step claim instructions.
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            {credits.map((credit) => (
              <Link
                key={credit.code}
                href={credit.href}
                className={`group rounded-xl border p-7 hover:shadow-md transition-all ${
                  credit.highlight
                    ? 'border-teal-300 bg-teal-50/50 hover:border-teal-400'
                    : 'border-deep-100 bg-white hover:border-teal-200'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold font-mono bg-deep-900 text-white mr-2">
                      §{credit.code}
                    </span>
                    <span className="text-[11px] text-deep-500">{credit.section}</span>
                  </div>
                  {credit.highlight && (
                    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold bg-teal-100 text-teal-700">
                      Most Used
                    </span>
                  )}
                </div>

                <h3 className="font-sora font-bold text-[17px] text-deep-900 mb-2 group-hover:text-teal-700 transition-colors leading-snug">
                  {credit.name}
                </h3>
                <p className="text-sm text-deep-500 leading-relaxed mb-4">{credit.desc}</p>

                <div className="rounded-lg bg-deep-50 border border-deep-100 px-4 py-3 mb-4">
                  <div className="text-[11px] font-semibold text-deep-500 uppercase tracking-wider mb-0.5">Credit Rate</div>
                  <div className="font-mono text-sm font-semibold text-deep-900">{credit.rate}</div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {credit.sectors.map((s) => (
                    <span key={s} className="rounded-full px-2.5 py-0.5 text-[11px] bg-deep-100 text-deep-600">
                      {s}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-4 text-[11px] pt-3 border-t border-deep-100">
                  {credit.transferable && (
                    <span className="flex items-center gap-1 text-emerald-600 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Transferable
                    </span>
                  )}
                  {credit.directPay && (
                    <span className="flex items-center gap-1 text-emerald-600 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Direct Pay
                    </span>
                  )}
                  {credit.prevailingWage && (
                    <span className="text-deep-400">PW Bonus Available</span>
                  )}
                  <span className="ml-auto flex items-center gap-1 font-semibold text-teal-600">
                    Full guide <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Stacking Rules */}
        <section className="border-t border-deep-100 bg-deep-50/50">
          <div className="max-w-[1200px] mx-auto px-6 py-16">
            <h2 className="font-sora text-2xl font-bold text-deep-900 mb-2">
              Credit Stacking Rules
            </h2>
            <p className="text-deep-500 mb-8 max-w-xl">
              Most IRA credits can be layered together — but a few are mutually exclusive.
              IncentEdge models every combination automatically.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {stackingRules.map((rule, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg border border-deep-100 bg-white px-5 py-3.5">
                  <CheckCircle2 className="w-4.5 h-4.5 text-teal-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-deep-700">{rule}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-[1200px] mx-auto px-6 py-16 md:py-20">
          <IncentiveCTA
            headline="Stack Every IRA Credit Your Project Qualifies For"
            sub="IncentEdge runs every credit simultaneously and calculates the optimal stacking strategy for your project — in under 60 seconds."
          />
        </section>
      </main>

      <IncentiveFooter />
    </div>
  );
}
