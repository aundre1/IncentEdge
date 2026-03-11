import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { IncentiveHeader, IncentiveCTA, IncentiveFooter } from '@/components/incentives/IncentiveHeader';

export const metadata: Metadata = {
  title: 'Colorado Clean Energy Incentives & IRA Tax Credits | IncentEdge',
  description:
    'Colorado clean energy incentives: REDI rebates, Xcel Energy programs, coal transition bonus adders, and federal IRA stacking for solar, wind, and storage projects.',
  alternates: { canonical: 'https://incentedge.com/incentives/state/co' },
  openGraph: {
    title: 'Colorado Clean Energy Incentives & IRA Tax Credits | IncentEdge',
    description:
      'Colorado clean energy incentives: REDI rebates, Xcel Energy programs, coal transition bonus adders, and federal IRA stacking for solar, wind, and storage projects.',
    url: 'https://incentedge.com/incentives/state/co',
    siteName: 'IncentEdge',
    type: 'article',
  },
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Colorado Clean Energy Incentive Programs — Complete Guide',
  description: 'Full guide to CO clean energy incentives: REDI, Xcel programs, enterprise zones, coal transition adders, and IRA stacking.',
  url: 'https://incentedge.com/incentives/state/co',
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
      name: 'What is the Colorado REDI program?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The Renewable Energy Development Initiative (REDI) is a Colorado rebate program that provides incentives for renewable energy system installations. REDI offers rebates for solar, wind, and other qualifying renewable systems for residential and small commercial customers. Program funding and rebate rates are updated periodically — IncentEdge verifies current availability.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Colorado qualify for the federal coal transition energy community bonus adder?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Colorado has multiple areas qualifying for the federal +10% energy community bonus adder under the IRA, specifically those related to coal mine and coal power plant closures. Former coal communities including areas in Routt County (Steamboat Springs), Moffat County (Craig), and Pueblo (Comanche coal plant closure) qualify, making clean energy projects in these areas eligible for the 40% ITC rather than 30%.',
      },
    },
    {
      '@type': 'Question',
      name: 'What are Xcel Energy Solar*Rewards incentives?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Xcel Energy's Solar*Rewards program provides performance-based incentives for solar installations in Colorado. The program offers rebates based on energy production (per kWh generated) for residential and small commercial systems. Larger commercial and utility-scale projects participate through separate processes. Incentive levels step down as program blocks fill.",
      },
    },
    {
      '@type': 'Question',
      name: 'What are Colorado Enterprise Zone tax credits?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Colorado Enterprise Zones are economically distressed areas designated by the state where businesses receive enhanced state tax credits. Clean energy projects within enterprise zones can receive additional investment tax credits, job creation credits, and research credits against Colorado state income tax. Many rural and coal-transition communities in Colorado are enterprise zones.",
      },
    },
    {
      '@type': 'Question',
      name: 'Can I stack Xcel Energy rebates with federal ITC?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Xcel Energy rebates and the federal ITC are stackable. However, utility rebates that reduce the installed cost of a system also reduce the basis on which the ITC is calculated. IncentEdge models the optimal order of operations and calculates the net combined value of utility rebates plus federal tax credits for your specific project.',
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
    { '@type': 'ListItem', position: 4, name: 'Colorado', item: 'https://incentedge.com/incentives/state/co' },
  ],
};

const coalCommunities = [
  { location: 'Routt County / Steamboat Springs', asset: 'Colowyo and Trapper coal mines + Hayden coal plant', status: 'Mine closures ongoing' },
  { location: 'Moffat County / Craig', asset: 'Craig coal power plant closure (2028)', status: 'Qualifying energy community' },
  { location: 'Pueblo', asset: 'Comanche Unit 3 coal plant (closure announced)', status: 'Qualifying energy community' },
  { location: 'Weld County', asset: 'Oil and gas employment zone', status: 'MSA energy community designation' },
];

const stackTable = [
  { source: 'Federal PTC (§45/45Y)', rate: '2.75¢/kWh', type: 'Tax Credit', notes: 'Wind; 10-year production credit' },
  { source: 'Federal ITC (§48/48E)', rate: '30%', type: 'Tax Credit', notes: 'Solar and storage; base rate' },
  { source: 'Federal Energy Community Adder (Coal)', rate: '+10%', type: 'Tax Credit', notes: 'Coal mine/plant closure areas in CO' },
  { source: 'CO Enterprise Zone Credit', rate: 'Variable', type: 'State Tax Credit', notes: 'Investment credit in designated zones' },
  { source: 'Xcel Solar*Rewards Rebate', rate: '$0.02–$0.05/kWh', type: 'Utility Rebate', notes: 'Performance-based; Xcel territory' },
  { source: 'Black Hills Energy Programs', rate: 'Project-specific', type: 'Utility Rebate', notes: 'Southern CO service territory' },
];

const faqs = [
  {
    q: 'What is the Colorado REDI program?',
    a: 'The Renewable Energy Development Initiative (REDI) is a Colorado rebate program that provides incentives for renewable energy system installations. REDI offers rebates for solar, wind, and other qualifying renewable systems for residential and small commercial customers. Program funding and rebate rates are updated periodically — IncentEdge verifies current availability.',
  },
  {
    q: 'Does Colorado qualify for the federal coal transition energy community bonus adder?',
    a: 'Yes. Colorado has multiple areas qualifying for the federal +10% energy community bonus adder under the IRA, specifically those related to coal mine and coal power plant closures. Former coal communities including areas in Routt County (Steamboat Springs), Moffat County (Craig), and Pueblo (Comanche coal plant closure) qualify, making clean energy projects in these areas eligible for the 40% ITC rather than 30%.',
  },
  {
    q: "What are Xcel Energy Solar*Rewards incentives?",
    a: "Xcel Energy's Solar*Rewards program provides performance-based incentives for solar installations in Colorado. The program offers rebates based on energy production (per kWh generated) for residential and small commercial systems. Larger commercial and utility-scale projects participate through separate processes. Incentive levels step down as program blocks fill.",
  },
  {
    q: 'What are Colorado Enterprise Zone tax credits?',
    a: "Colorado Enterprise Zones are economically distressed areas designated by the state where businesses receive enhanced state tax credits. Clean energy projects within enterprise zones can receive additional investment tax credits, job creation credits, and research credits against Colorado state income tax. Many rural and coal-transition communities in Colorado are enterprise zones.",
  },
  {
    q: 'Can I stack Xcel Energy rebates with federal ITC?',
    a: 'Yes. Xcel Energy rebates and the federal ITC are stackable. However, utility rebates that reduce the installed cost of a system also reduce the basis on which the ITC is calculated. IncentEdge models the optimal order of operations and calculates the net combined value of utility rebates plus federal tax credits for your specific project.',
  },
];

export default function ColoradoPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <IncentiveHeader
        breadcrumbs={[
          { label: 'Incentives', href: '/incentives' },
          { label: 'State Programs', href: '/incentives/state' },
          { label: 'Colorado' },
        ]}
      />

      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-[900px] mx-auto px-6 pt-16 pb-12 md:pt-20">
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-flex items-center rounded-md px-3 py-1.5 text-sm font-bold font-mono bg-deep-900 text-white">
              CO
            </span>
            <span className="text-[12px] text-deep-500 uppercase tracking-wider font-medium">State Incentive Guide — 58 Programs</span>
          </div>
          <h1 className="font-sora text-4xl md:text-[46px] font-bold tracking-tight text-deep-900 leading-[1.1] mb-5">
            Colorado Clean Energy Incentive Programs
          </h1>
          <p className="text-lg text-deep-500 mb-8 leading-relaxed">
            Colorado is one of the nation&apos;s clean energy transition leaders, with aggressive
            100% renewable electricity targets and significant coal community transition incentives.
            Colorado&apos;s coal mine and power plant closure communities qualify for the federal
            IRA&apos;s +10% energy community bonus adder — creating exceptional project economics
            for wind, solar, and storage developers willing to invest in energy transition areas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/signup" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-teal-600 text-white text-[14px] font-semibold hover:bg-teal-700 transition-colors">
              Scan My CO Project
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
              { label: 'Programs Available', value: '58' },
              { label: 'Clean Energy Target', value: '100% by 2040' },
              { label: 'Coal Transition Communities', value: '4 Major' },
              { label: 'Wind Generation', value: '25%+ of mix' },
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
              Colorado&apos;s clean energy incentive landscape is shaped by three key factors: Xcel
              Energy&apos;s extensive ratepayer-funded incentive programs (Xcel serves ~70% of
              Colorado&apos;s electricity customers), the state&apos;s enterprise zone program that
              benefits rural and underserved communities, and the significant federal incentive
              opportunity created by Colorado&apos;s coal community transition.
            </p>
            <div className="flex items-start gap-3 rounded-lg border border-teal-200 bg-teal-50 px-5 py-4">
              <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-teal-800">
                <strong>Coal Transition Opportunity:</strong> Colorado&apos;s retiring coal communities
                represent some of the most attractive federal incentive opportunities in the western US.
                Projects in qualifying coal closure zones receive the +10% federal bonus adder,
                bringing ITC/PTC rates to 40%+ before any state incentives.
              </p>
            </div>
          </section>

          {/* REDI */}
          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-5">REDI — Renewable Energy Development Initiative</h2>
            <p className="text-deep-600 leading-relaxed mb-4">
              The Colorado Renewable Energy Development Initiative (REDI) provides state-funded
              rebates for renewable energy installations, primarily targeting residential and
              small commercial projects. The program has operated through multiple funding cycles
              and provides upfront rebates to reduce project costs for qualifying technologies.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Program Type', value: 'State Rebate' },
                { label: 'Target Market', value: 'Residential + Small Commercial' },
                { label: 'Qualifying Tech', value: 'Solar, Wind, Other RE' },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-deep-100 p-5 text-center">
                  <div className="font-semibold text-deep-900 mb-1">{item.value}</div>
                  <div className="text-xs text-sage-500">{item.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Xcel Energy */}
          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-5">Xcel Energy Programs</h2>
            <p className="text-deep-600 mb-6 leading-relaxed">
              Xcel Energy serves approximately 70% of Colorado electricity customers and administers
              the state&apos;s largest utility incentive portfolio, including solar, wind, and efficiency programs.
            </p>
            <div className="grid gap-5">
              {[
                {
                  name: 'Solar*Rewards',
                  type: 'Performance-Based Incentive',
                  value: '$0.02–$0.05/kWh',
                  desc: 'Per-kWh incentive for residential and small commercial solar systems in Xcel territory. Paid based on actual energy production for 20 years. Incentive steps down as program blocks fill.',
                },
                {
                  name: 'Windsource',
                  type: 'Renewable Energy Product',
                  value: 'Market rate',
                  desc: 'Wind energy purchase program allowing commercial and residential customers to buy 100% wind energy. Supports wind development in Colorado through renewable energy certificates.',
                },
                {
                  name: 'Energy Efficiency Programs',
                  type: 'Rebates',
                  value: 'Up to $100K commercial',
                  desc: 'Commercial lighting, HVAC, motors, and building envelope efficiency rebates. Stacks with federal 179D commercial building deduction for qualifying improvements.',
                },
              ].map((program) => (
                <div key={program.name} className="rounded-xl border border-deep-100 p-6">
                  <div className="flex items-start justify-between mb-3 gap-4">
                    <h3 className="font-sora font-semibold text-deep-900">{program.name}</h3>
                    <div className="text-right flex-shrink-0">
                      <div className="font-mono font-bold text-teal-600 text-sm">{program.value}</div>
                      <div className="text-[11px] text-deep-400 mt-0.5">{program.type}</div>
                    </div>
                  </div>
                  <p className="text-sm text-deep-600 leading-relaxed">{program.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Enterprise Zones */}
          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-5">Colorado Enterprise Zones</h2>
            <p className="text-deep-600 leading-relaxed mb-4">
              Colorado&apos;s Enterprise Zone program designates economically distressed areas where
              businesses receive enhanced state tax incentives. Clean energy projects in enterprise
              zones can access investment tax credits, new employee credits, and research credits
              against Colorado state income tax — on top of federal IRA incentives.
            </p>
            <p className="text-deep-600 leading-relaxed mb-6">
              Many of Colorado&apos;s rural communities and coal transition areas are enterprise zones,
              meaning projects in these regions can qualify for both the federal energy community
              bonus adder and Colorado enterprise zone credits simultaneously.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { credit: 'Investment Tax Credit', rate: '3% of investment', desc: 'Credit against CO income tax for qualifying business investments in enterprise zones.' },
                { credit: 'New Employee Credit', rate: '$1,100 per new job', desc: 'Per-employee credit for creating new positions in enterprise zone areas.' },
                { credit: 'R&D Tax Credit', rate: '3% of R&D spend', desc: 'Credit for research and development expenditures in enterprise zones.' },
                { credit: 'Rehabilitation Credit', rate: '25% of costs', desc: 'Credit for rehabilitating vacant historic commercial buildings in enterprise zones.' },
              ].map((item) => (
                <div key={item.credit} className="rounded-xl border border-deep-100 p-6">
                  <h3 className="font-sora font-semibold text-deep-900 mb-1">{item.credit}</h3>
                  <div className="font-mono font-bold text-teal-600 text-sm mb-2">{item.rate}</div>
                  <p className="text-sm text-deep-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Black Hills Energy */}
          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-5">Black Hills Energy Programs</h2>
            <p className="text-deep-600 leading-relaxed">
              Black Hills Energy serves customers in southern Colorado (Pueblo, Colorado Springs
              surrounding area) and offers commercial energy efficiency rebates and demand response
              programs. Commercial customers can access rebates for qualifying HVAC, lighting,
              and equipment upgrades. Programs are smaller in scale than Xcel&apos;s but available
              to qualifying accounts in the Black Hills service territory.
            </p>
          </section>

          {/* Coal Transition Bonus */}
          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-5">Coal Transition Energy Community Bonus Adder</h2>
            <p className="text-deep-600 leading-relaxed mb-6">
              The IRA&apos;s energy community bonus adder provides a +10% increase to the federal ITC
              or PTC for projects located in communities affected by coal mine or coal power plant
              closures. Colorado has four major qualifying regions:
            </p>
            <div className="overflow-x-auto rounded-xl border border-deep-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-deep-50 border-b border-deep-100">
                    <th className="px-5 py-3.5 text-left font-semibold text-deep-700">Location</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-deep-700 hidden md:table-cell">Coal Asset</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-deep-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-deep-100">
                  {coalCommunities.map((row) => (
                    <tr key={row.location} className="hover:bg-deep-50/50">
                      <td className="px-5 py-4 font-medium text-deep-900">{row.location}</td>
                      <td className="px-5 py-4 text-deep-600 hidden md:table-cell">{row.asset}</td>
                      <td className="px-5 py-4 font-medium text-teal-600 text-[12px]">{row.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-5 py-4">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                Energy community coal closure designations require the coal mine or plant to have
                closed after December 31, 1999, and the census tract must meet population proximity
                criteria. IncentEdge maps your project location against current IRS-published
                energy community lists.
              </p>
            </div>
          </section>

          {/* Stack Table */}
          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-3">Federal + CO Incentive Stack</h2>
            <p className="text-deep-600 mb-8 leading-relaxed">
              Example combined incentive stack for a wind project in a Colorado coal transition community:
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
              headline="Identify All CO Coal Transition + Federal Incentives for Your Project"
              sub="IncentEdge maps your Colorado project against energy community zones, enterprise zone designations, and utility incentives — then models the full federal + state stack."
            />
          </section>
        </div>
      </main>

      <IncentiveFooter />
    </div>
  );
}
