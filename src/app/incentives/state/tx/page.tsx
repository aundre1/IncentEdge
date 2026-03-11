import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { IncentiveHeader, IncentiveCTA, IncentiveFooter } from '@/components/incentives/IncentiveHeader';

export const metadata: Metadata = {
  title: 'Texas Clean Energy Incentives & IRA Tax Credits | IncentEdge',
  description:
    'Texas clean energy incentives: wind and solar tax exemptions, property tax incentives, utility rebates, and federal IRA credit stacking for large-scale energy projects.',
  alternates: { canonical: 'https://incentedge.com/incentives/state/tx' },
  openGraph: {
    title: 'Texas Clean Energy Incentives & IRA Tax Credits | IncentEdge',
    description:
      'Texas clean energy incentives: wind and solar tax exemptions, property tax incentives, utility rebates, and federal IRA credit stacking for large-scale energy projects.',
    url: 'https://incentedge.com/incentives/state/tx',
    siteName: 'IncentEdge',
    type: 'article',
  },
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Texas Clean Energy Incentive Programs — Complete Guide',
  description: 'Full guide to TX clean energy incentives: sales tax exemptions, property abatements, ERCOT revenue, and IRA stacking for wind, solar, and storage.',
  url: 'https://incentedge.com/incentives/state/tx',
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
      name: 'Is renewable energy equipment exempt from Texas sales tax?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Texas exempts solar, wind, and other renewable energy equipment from the state 6.25% sales tax plus any local sales tax (up to 2%), totaling up to 8.25% savings on equipment purchases. The exemption applies to turbines, solar panels, inverters, mounting hardware, and other qualifying components used for electricity generation.',
      },
    },
    {
      '@type': 'Question',
      name: 'What are Texas property tax abatements for renewable energy projects?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Texas counties can negotiate Chapter 312 property tax abatement agreements with energy project developers, typically providing 50–100% abatement on the value of renewable energy equipment for 10 years. While the original Chapter 313 school district abatement program expired in 2022, successor legislation and standard Chapter 312 county agreements remain widely available, particularly for large wind and solar projects.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does ERCOT benefit battery storage projects in Texas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Battery storage projects interconnected to the ERCOT grid can earn ancillary services revenue by providing frequency regulation, spinning reserve, and responsive reserve services. ERCOT has some of the most competitive ancillary services markets in the US, and battery storage assets can earn $50,000–$200,000+ per MW-year depending on market conditions and dispatch strategy.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Texas qualify for the federal energy community bonus adder?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Large portions of Texas — particularly the Permian Basin, Eagle Ford Shale region, and the Gulf Coast industrial areas — qualify for the federal 10% energy community bonus adder under the IRA. These areas have significant fossil fuel employment and unemployment that trigger the energy community designation. Projects in these areas receive ITC at 40% rather than 30%.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the Texas Franchise Tax renewable energy credit?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Texas offers a franchise tax credit for renewable energy property used in electricity generation. The credit applies against the Texas franchise (margin) tax and can be combined with federal tax incentives. Qualifying renewable energy property includes solar panels, wind turbines, and associated equipment. Consult a Texas tax advisor for current credit rates and eligibility requirements.',
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
    { '@type': 'ListItem', position: 3, name: 'State Programs', item: 'https://incentedge.com/incentives/state' },
    { '@type': 'ListItem', position: 4, name: 'Texas', item: 'https://incentedge.com/incentives/state/tx' },
  ],
};

const stackTable = [
  { source: 'Federal ITC (§48/48E)', rate: '30%', type: 'Tax Credit', notes: 'Base rate for solar and storage' },
  { source: 'Federal PTC (§45/45Y)', rate: '2.75¢/kWh', type: 'Tax Credit', notes: 'For wind; often exceeds ITC for TX wind' },
  { source: 'Federal Energy Community Adder', rate: '+10%', type: 'Tax Credit', notes: 'Permian, Eagle Ford, Gulf Coast regions' },
  { source: 'TX Sales Tax Exemption', rate: 'Up to 8.25%', type: 'Tax Exemption', notes: 'On all qualifying renewable equipment' },
  { source: 'County Property Tax Abatement', rate: '50–100% for 10 yrs', type: 'Property Tax', notes: 'Ch. 312 county agreement required' },
  { source: 'ERCOT Ancillary Services Revenue', rate: '$50K–$200K+/MW-yr', type: 'Market Revenue', notes: 'Battery storage; market-rate dependent' },
];

const utilityPrograms = [
  {
    utility: 'Oncor',
    territory: 'North Texas / DFW',
    programs: 'Commercial energy efficiency rebates, smart thermostat programs, demand response for large commercial and industrial customers.',
  },
  {
    utility: 'AEP Texas',
    territory: 'West and South Texas',
    programs: 'Commercial and industrial demand response, power factor correction rebates, and energy audit programs for large accounts.',
  },
  {
    utility: 'CenterPoint Energy',
    territory: 'Houston metro',
    programs: 'Commercial efficiency rebates, smart grid programs, and demand response for large commercial customers in the CenterPoint service territory.',
  },
];

const energyCommunityRegions = [
  'Permian Basin (oil and gas employment zone)',
  'Eagle Ford Shale region (South Texas)',
  'Gulf Coast industrial corridor (Beaumont, Port Arthur)',
  'Midland-Odessa MSA',
  'Laredo area (former fossil fuel employment)',
  'Brownfield sites across multiple urban areas',
];

const faqs = [
  {
    q: 'Is renewable energy equipment exempt from Texas sales tax?',
    a: 'Yes. Texas exempts solar, wind, and other renewable energy equipment from the state 6.25% sales tax plus any local sales tax (up to 2%), totaling up to 8.25% savings on equipment purchases. The exemption applies to turbines, solar panels, inverters, mounting hardware, and other qualifying components used for electricity generation.',
  },
  {
    q: 'What are Texas property tax abatements for renewable energy projects?',
    a: 'Texas counties can negotiate Chapter 312 property tax abatement agreements with energy project developers, typically providing 50–100% abatement on the value of renewable energy equipment for 10 years. While the original Chapter 313 school district abatement program expired in 2022, successor legislation and standard Chapter 312 county agreements remain widely available, particularly for large wind and solar projects.',
  },
  {
    q: 'How does ERCOT benefit battery storage projects in Texas?',
    a: 'Battery storage projects interconnected to the ERCOT grid can earn ancillary services revenue by providing frequency regulation, spinning reserve, and responsive reserve services. ERCOT has some of the most competitive ancillary services markets in the US, and battery storage assets can earn $50,000–$200,000+ per MW-year depending on market conditions and dispatch strategy.',
  },
  {
    q: 'Does Texas qualify for the federal energy community bonus adder?',
    a: 'Yes. Large portions of Texas — particularly the Permian Basin, Eagle Ford Shale region, and the Gulf Coast industrial areas — qualify for the federal 10% energy community bonus adder under the IRA. These areas have significant fossil fuel employment and unemployment that trigger the energy community designation. Projects in these areas receive ITC at 40% rather than 30%.',
  },
  {
    q: 'What is the Texas Franchise Tax renewable energy credit?',
    a: 'Texas offers a franchise tax credit for renewable energy property used in electricity generation. The credit applies against the Texas franchise (margin) tax and can be combined with federal tax incentives. Qualifying renewable energy property includes solar panels, wind turbines, and associated equipment. Consult a Texas tax advisor for current credit rates and eligibility requirements.',
  },
];

export default function TexasPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <IncentiveHeader
        breadcrumbs={[
          { label: 'Incentives', href: '/incentives' },
          { label: 'State Programs', href: '/incentives/state' },
          { label: 'Texas' },
        ]}
      />

      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-[900px] mx-auto px-6 pt-16 pb-12 md:pt-20">
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-flex items-center rounded-md px-3 py-1.5 text-sm font-bold font-mono bg-deep-900 text-white">
              TX
            </span>
            <span className="text-[12px] text-deep-500 uppercase tracking-wider font-medium">State Incentive Guide — 67 Programs</span>
          </div>
          <h1 className="font-sora text-4xl md:text-[46px] font-bold tracking-tight text-deep-900 leading-[1.1] mb-5">
            Texas Clean Energy Incentive Programs
          </h1>
          <p className="text-lg text-deep-500 mb-8 leading-relaxed">
            Texas is the #1 wind energy state and #2 solar state in the US. While Texas has fewer
            direct subsidy programs than states like New York or California, its unique combination
            of sales tax exemptions, county property tax abatements, ERCOT ancillary services
            revenue, and federal IRA energy community adders create exceptional project economics
            for large-scale renewable energy development.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/signup" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-teal-600 text-white text-[14px] font-semibold hover:bg-teal-700 transition-colors">
              Scan My TX Project
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/incentives/state" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg border border-deep-200 text-deep-700 text-[14px] font-semibold hover:bg-deep-50 transition-colors">
              All State Programs
            </Link>
          </div>
        </section>

        {/* Stats */}
        <section className="border-y border-deep-100 bg-deep-50/50">
          <div className="max-w-[900px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-deep-100">
            {[
              { label: 'Wind Installed', value: '40+ GW' },
              { label: 'Solar Installed', value: '28+ GW' },
              { label: 'Sales Tax Savings', value: 'Up to 8.25%' },
              { label: 'Programs Available', value: '67' },
            ].map((s) => (
              <div key={s.label} className="px-6 py-7 text-center">
                <div className="font-mono text-xl font-bold text-deep-900">{s.value}</div>
                <div className="text-xs text-sage-500 mt-1 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="max-w-[900px] mx-auto px-6">
          {/* Overview */}
          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-5">Overview</h2>
            <p className="text-deep-600 leading-relaxed mb-4">
              Texas&apos;s energy market structure — anchored by the deregulated ERCOT grid and a
              pro-development regulatory environment — creates unique incentive dynamics. Unlike
              states with large utility-administered incentive programs, Texas&apos; primary state-level
              incentives are tax-based: sales tax exemptions on equipment and county-level property
              tax abatement agreements.
            </p>
            <p className="text-deep-600 leading-relaxed">
              The federal IRA energy community bonus adder is particularly impactful for Texas.
              The Permian Basin, Eagle Ford Shale, and Gulf Coast industrial corridor contain
              large populations of fossil fuel workers and communities meeting IRA energy community
              criteria — meaning projects in these regions qualify for the 40% ITC rather than 30%.
            </p>
          </section>

          {/* Sales Tax Exemption */}
          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-5">Texas Sales Tax Exemption for Renewable Equipment</h2>
            <p className="text-deep-600 leading-relaxed mb-4">
              Texas exempts equipment and machinery used in the production of electricity from
              renewable sources from state and local sales tax. On a typical utility-scale solar
              or wind project, this exemption is worth 6.25–8.25% of total equipment cost —
              representing millions of dollars in savings for large installations.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { label: 'State Sales Tax Rate', value: '6.25%', note: 'Exempt for renewable equipment' },
                { label: 'Max Local Sales Tax', value: '+2.0%', note: 'Also exempt for qualifying equipment' },
                { label: 'Total Potential Savings', value: 'Up to 8.25%', note: 'Of qualifying equipment cost' },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-deep-100 p-5 text-center">
                  <div className="font-mono text-xl font-bold text-teal-600 mb-1">{item.value}</div>
                  <div className="text-sm font-semibold text-deep-900 mb-1">{item.label}</div>
                  <div className="text-xs text-deep-500">{item.note}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                'Solar photovoltaic panels and inverters',
                'Wind turbines and associated equipment',
                'Battery storage systems for renewable projects',
                'Mounting hardware and racking systems',
                'Transformers and electrical equipment',
                'Transmission and interconnection equipment',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2.5 rounded-lg border border-deep-100 px-4 py-3">
                  <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0" />
                  <span className="text-sm text-deep-700">{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Property Tax Abatements */}
          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-5">Property Tax Abatements — Chapter 312</h2>
            <p className="text-deep-600 leading-relaxed mb-4">
              Under Texas Tax Code Chapter 312, counties and municipalities can enter into property
              tax abatement agreements with renewable energy project developers. These agreements
              typically provide 50–100% abatement on the value of renewable energy equipment for
              up to 10 years, representing significant savings on large projects.
            </p>
            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 mb-6">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                <strong>Chapter 313 Note:</strong> The Texas Economic Development Act (Chapter 313)
                school district property value limitation program expired December 31, 2022 and
                is no longer available for new applications. Projects should pursue Chapter 312
                county abatements and evaluate alternative structures.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Typical Abatement Rate', value: '50–100%' },
                { label: 'Maximum Duration', value: '10 Years' },
                { label: 'Applicable Tax', value: 'County + Muni' },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-deep-100 p-5 text-center">
                  <div className="font-mono text-xl font-bold text-deep-900 mb-1">{item.value}</div>
                  <div className="text-xs text-sage-500">{item.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Utility Programs */}
          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-5">Utility Efficiency Programs</h2>
            <div className="space-y-4">
              {utilityPrograms.map((u) => (
                <div key={u.utility} className="rounded-xl border border-deep-100 p-6">
                  <div className="flex items-start justify-between mb-2 gap-4">
                    <h3 className="font-sora font-semibold text-deep-900">{u.utility}</h3>
                    <span className="text-[11px] font-medium text-deep-500 bg-deep-50 rounded-full px-2.5 py-1 flex-shrink-0">{u.territory}</span>
                  </div>
                  <p className="text-sm text-deep-600 leading-relaxed">{u.programs}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ERCOT */}
          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-5">ERCOT Ancillary Services Revenue for Battery Storage</h2>
            <p className="text-deep-600 leading-relaxed mb-4">
              Battery storage assets interconnected to the ERCOT grid participate in one of the
              most competitive and highest-value ancillary services markets in North America.
              Revenue from frequency regulation (ECRS), spinning reserve, and responsive reserve
              can significantly improve project economics for standalone storage or solar + storage
              projects.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { service: 'ECRS (Emergency Capacity Reserve Service)', value: 'Market-dependent', desc: 'New ERCOT product; high-value during grid stress events.' },
                { service: 'Spinning Reserve (SPIN)', value: 'Market-dependent', desc: 'Fast-response capacity held online for immediate dispatch.' },
                { service: 'Responsive Reserve Service (RRS)', value: 'Market-dependent', desc: 'Automatic frequency response within seconds of a grid event.' },
                { service: 'Non-Spinning Reserve (Non-Spin)', value: 'Market-dependent', desc: '10-minute response capability; lower value than spinning products.' },
              ].map((item) => (
                <div key={item.service} className="rounded-xl border border-deep-100 p-6">
                  <h3 className="font-sora font-semibold text-[14px] text-deep-900 mb-1">{item.service}</h3>
                  <div className="font-mono text-sm font-bold text-teal-600 mb-2">{item.value}</div>
                  <p className="text-sm text-deep-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Energy Community Bonus Adder */}
          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-5">Federal Energy Community Bonus Adder in Texas</h2>
            <p className="text-deep-600 leading-relaxed mb-6">
              Texas has extensive areas qualifying for the IRA&apos;s +10% energy community bonus adder,
              based on historical fossil fuel employment and current unemployment rates:
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {energyCommunityRegions.map((region) => (
                <div key={region} className="flex items-start gap-2.5 rounded-lg border border-deep-100 px-4 py-3">
                  <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-deep-700">{region}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Stack Table */}
          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-3">Federal + TX Incentive Stack</h2>
            <p className="text-deep-600 mb-8 leading-relaxed">
              Example combined incentive stack for a utility-scale solar + storage project in a Texas energy community:
            </p>
            <div className="overflow-x-auto rounded-xl border border-deep-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-deep-50 border-b border-deep-100">
                    <th className="px-5 py-3.5 text-left font-semibold text-deep-700">Incentive Source</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-deep-700">Rate / Value</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-deep-700 hidden md:table-cell">Type</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-deep-700 hidden lg:table-cell">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-deep-100">
                  {stackTable.map((row) => (
                    <tr key={row.source} className="hover:bg-deep-50/50">
                      <td className="px-5 py-4 font-medium text-deep-900">{row.source}</td>
                      <td className="px-5 py-4 font-mono font-bold text-teal-600">{row.rate}</td>
                      <td className="px-5 py-4 text-deep-600 hidden md:table-cell">{row.type}</td>
                      <td className="px-5 py-4 text-deep-500 text-[12px] hidden lg:table-cell">{row.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

          <section className="py-14">
            <IncentiveCTA
              headline="Model the Full TX + Federal Incentive Stack for Your Project"
              sub="IncentEdge calculates sales tax savings, property abatement values, ERCOT revenue projections, and federal IRA credits together — delivering a complete project economics analysis in under 60 seconds."
            />
          </section>
        </div>
      </main>

      <IncentiveFooter />
    </div>
  );
}
