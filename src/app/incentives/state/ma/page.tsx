import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { IncentiveHeader, IncentiveCTA, IncentiveFooter } from '@/components/incentives/IncentiveHeader';

export const metadata: Metadata = {
  title: 'Massachusetts Clean Energy Incentives & IRA Credits | IncentEdge',
  description:
    'Massachusetts clean energy incentives: SMART solar program, Mass Save rebates, Green Communities, and federal IRA credit stacking for residential and commercial projects.',
  alternates: { canonical: 'https://incentedge.com/incentives/state/ma' },
  openGraph: {
    title: 'Massachusetts Clean Energy Incentives & IRA Credits | IncentEdge',
    description:
      'Massachusetts clean energy incentives: SMART solar program, Mass Save rebates, Green Communities, and federal IRA credit stacking for residential and commercial projects.',
    url: 'https://incentedge.com/incentives/state/ma',
    siteName: 'IncentEdge',
    type: 'article',
  },
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Massachusetts Clean Energy Incentive Programs — Complete Guide',
  description: 'Full guide to MA clean energy incentives: SMART program, Mass Save, MassCEC, utility programs, and IRA stacking.',
  url: 'https://incentedge.com/incentives/state/ma',
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
      name: 'What is the Massachusetts SMART program?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The Solar Massachusetts Renewable Target (SMART) program is a performance-based incentive administered by the Massachusetts DOER. SMART provides a fixed per-kWh compensation rate for solar energy produced over 10 years, with rates varying by utility, system size, and capacity block. The program includes adder categories for storage, building-mounted systems, low-income projects, and brownfield sites that increase the base compensation rate.',
      },
    },
    {
      '@type': 'Question',
      name: 'What rebates does Mass Save offer?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Mass Save is the statewide energy efficiency program administered by Massachusetts electric and gas utilities. Residential customers can receive rebates of up to $10,000 for heat pump installations, $1,000+ for insulation, and significant rebates for heat pump water heaters. Commercial and industrial customers can access rebates for qualifying HVAC, lighting, motors, and building envelope improvements. Mass Save also offers 0% HEAT Loan financing.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the Massachusetts 15% solar tax credit?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Massachusetts offers a state income tax credit equal to 15% of the cost of a solar installation, capped at $1,000. While the cap limits the credit for larger systems, it stacks directly with the federal ITC and SMART program incentives. The credit applies to residential solar installations and can be carried forward for up to 3 years if it exceeds annual tax liability.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the Green Communities program in Massachusetts?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Green Communities is a Massachusetts DOER grant program that provides funding to municipalities for clean energy projects, energy efficiency improvements, and renewable energy installations. Municipalities must meet five criteria to qualify as a Green Community, then receive annual grant funding. Over $240M has been awarded to more than 250 communities since the program launched.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can Massachusetts solar projects stack SMART, Mass Save, and federal ITC?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Massachusetts projects can typically stack the federal ITC (30%), the SMART performance-based incentive, Mass Save rebates for associated efficiency measures, and the MA state 15% tax credit. For larger commercial systems, the SMART compensation plus federal ITC often provides the most significant combined value. IncentEdge models the full stack for your specific project size and location.',
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
    { '@type': 'ListItem', position: 4, name: 'Massachusetts', item: 'https://incentedge.com/incentives/state/ma' },
  ],
};

const smartAdders = [
  { adder: 'Storage Adder', rate: '+$0.04–$0.06/kWh', desc: 'Projects paired with qualifying battery storage systems.' },
  { adder: 'Building-Mounted Adder', rate: '+$0.05/kWh', desc: 'Solar mounted on a building structure (not ground-mounted).' },
  { adder: 'Low-Income Housing Adder', rate: '+$0.06/kWh', desc: 'Projects serving income-qualified residential housing.' },
  { adder: 'Brownfield Adder', rate: '+$0.03/kWh', desc: 'Projects sited on contaminated or former industrial land.' },
  { adder: 'Canopy / Carport Adder', rate: '+$0.06/kWh', desc: 'Solar canopies over parking areas or carport structures.' },
];

const utilityPrograms = [
  {
    utility: 'Eversource',
    territory: 'Eastern + Central MA',
    programs: 'Commercial efficiency rebates, heat pump incentives, EV charging infrastructure programs, and SMART administration for the Eversource territory.',
  },
  {
    utility: 'National Grid (MA)',
    territory: 'Central + Western MA',
    programs: 'Business energy efficiency rebates, industrial process improvement incentives, and SMART administration for the National Grid MA territory.',
  },
  {
    utility: 'Unitil',
    territory: 'Northern MA',
    programs: 'Commercial and residential efficiency programs in the Unitil service territory, including heat pump and insulation rebates.',
  },
];

const stackTable = [
  { source: 'Federal ITC (§48/48E)', rate: '30%', type: 'Tax Credit', notes: 'Base rate for solar + storage' },
  { source: 'Federal Low-Income Bonus Adder', rate: '+10% to +20%', type: 'Tax Credit', notes: 'For qualifying low-income community projects' },
  { source: 'SMART Program Compensation', rate: '$0.03–$0.15/kWh', type: 'Performance Incentive', notes: '10-year fixed rate; varies by block and adders' },
  { source: 'Mass Save Rebates', rate: 'Up to $10,000 residential', type: 'Utility Rebate', notes: 'Heat pumps, insulation, and more' },
  { source: 'MA State Solar Tax Credit', rate: '15% (up to $1,000)', type: 'State Tax Credit', notes: 'Residential solar; capped at $1,000' },
];

const faqs = [
  {
    q: 'What is the Massachusetts SMART program?',
    a: 'The Solar Massachusetts Renewable Target (SMART) program is a performance-based incentive administered by the Massachusetts DOER. SMART provides a fixed per-kWh compensation rate for solar energy produced over 10 years, with rates varying by utility, system size, and capacity block. The program includes adder categories for storage, building-mounted systems, low-income projects, and brownfield sites that increase the base compensation rate.',
  },
  {
    q: 'What rebates does Mass Save offer?',
    a: 'Mass Save is the statewide energy efficiency program administered by Massachusetts electric and gas utilities. Residential customers can receive rebates of up to $10,000 for heat pump installations, $1,000+ for insulation, and significant rebates for heat pump water heaters. Commercial and industrial customers can access rebates for qualifying HVAC, lighting, motors, and building envelope improvements. Mass Save also offers 0% HEAT Loan financing.',
  },
  {
    q: 'What is the Massachusetts 15% solar tax credit?',
    a: 'Massachusetts offers a state income tax credit equal to 15% of the cost of a solar installation, capped at $1,000. While the cap limits the credit for larger systems, it stacks directly with the federal ITC and SMART program incentives. The credit applies to residential solar installations and can be carried forward for up to 3 years if it exceeds annual tax liability.',
  },
  {
    q: 'What is the Green Communities program in Massachusetts?',
    a: 'Green Communities is a Massachusetts DOER grant program that provides funding to municipalities for clean energy projects, energy efficiency improvements, and renewable energy installations. Municipalities must meet five criteria to qualify as a Green Community, then receive annual grant funding. Over $240M has been awarded to more than 250 communities since the program launched.',
  },
  {
    q: 'Can Massachusetts solar projects stack SMART, Mass Save, and federal ITC?',
    a: 'Yes. Massachusetts projects can typically stack the federal ITC (30%), the SMART performance-based incentive, Mass Save rebates for associated efficiency measures, and the MA state 15% tax credit. For larger commercial systems, the SMART compensation plus federal ITC often provides the most significant combined value. IncentEdge models the full stack for your specific project size and location.',
  },
];

export default function MassachusettsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <IncentiveHeader
        breadcrumbs={[
          { label: 'Incentives', href: '/incentives' },
          { label: 'State Programs', href: '/incentives/state' },
          { label: 'Massachusetts' },
        ]}
      />

      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-[900px] mx-auto px-6 pt-16 pb-12 md:pt-20">
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-flex items-center rounded-md px-3 py-1.5 text-sm font-bold font-mono bg-deep-900 text-white">
              MA
            </span>
            <span className="text-[12px] text-deep-500 uppercase tracking-wider font-medium">State Incentive Guide — 71 Programs</span>
          </div>
          <h1 className="font-sora text-4xl md:text-[46px] font-bold tracking-tight text-deep-900 leading-[1.1] mb-5">
            Massachusetts Clean Energy Incentive Programs
          </h1>
          <p className="text-lg text-deep-500 mb-8 leading-relaxed">
            Massachusetts has the highest solar incentive density per capita in the United States.
            The SMART program provides a guaranteed 10-year performance-based incentive for solar
            projects, while Mass Save delivers some of the most generous heat pump and efficiency
            rebates in the country. Combined with the federal ITC and the MA state solar tax credit,
            Massachusetts projects consistently achieve exceptional economics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/signup" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-teal-600 text-white text-[14px] font-semibold hover:bg-teal-700 transition-colors">
              Scan My MA Project
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
              { label: 'Programs Available', value: '71' },
              { label: 'SMART Blocks', value: '3,200+ MW' },
              { label: 'Mass Save Budget', value: '$700M+/yr' },
              { label: 'Offshore Wind Target', value: '5.6 GW' },
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
              Massachusetts&apos; clean energy programs are led by MassCEC (Massachusetts Clean Energy
              Center), the Department of Energy Resources (DOER), and the state&apos;s three major
              utilities — Eversource, National Grid, and Unitil. The combination of the SMART
              solar program, Mass Save efficiency programs, and offshore wind development creates
              a multi-layered incentive ecosystem for clean energy developers of all sizes.
            </p>
            <div className="flex items-start gap-3 rounded-lg border border-teal-200 bg-teal-50 px-5 py-4">
              <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-teal-800">
                <strong>Highest incentive density:</strong> Massachusetts ranks #1 nationally for
                solar incentives per capita. The combination of SMART (10-year performance payment),
                Mass Save (deep efficiency rebates), and the federal ITC creates total incentive
                stacks that can cover 50–60% of total solar + storage project costs.
              </p>
            </div>
          </section>

          {/* SMART Program */}
          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-3">
              SMART Program — Solar Massachusetts Renewable Target
            </h2>
            <p className="text-deep-600 mb-6 leading-relaxed">
              The SMART program is Massachusetts&apos; primary solar incentive, providing a fixed
              per-kWh compensation rate for 10 years to qualifying solar projects. Base rates
              decline as capacity blocks fill. SMART includes several adder categories that
              increase the base compensation rate:
            </p>
            <div className="overflow-x-auto rounded-xl border border-deep-100 mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-deep-50 border-b border-deep-100">
                    <th className="px-5 py-3.5 text-left font-semibold text-deep-700">Adder Category</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-deep-700">Rate Increase</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-deep-700 hidden md:table-cell">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-deep-100">
                  {smartAdders.map((row) => (
                    <tr key={row.adder} className="hover:bg-deep-50/50">
                      <td className="px-5 py-4 font-medium text-deep-900">{row.adder}</td>
                      <td className="px-5 py-4 font-mono font-bold text-teal-600">{row.rate}</td>
                      <td className="px-5 py-4 text-deep-600 hidden md:table-cell">{row.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-5 py-4">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                SMART capacity blocks are allocated by utility territory (Eversource, National Grid,
                Unitil) and system size category. When a block fills, the next block opens at a
                lower rate. Current block status and rates are published by the MA DOER and should
                be verified before project financial modeling.
              </p>
            </div>
          </section>

          {/* Mass Save */}
          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-5">Mass Save</h2>
            <p className="text-deep-600 leading-relaxed mb-6">
              Mass Save is the statewide energy efficiency program funded through utility customer
              charges. It delivers some of the most generous efficiency rebates in the US, particularly
              for heat pumps — making Massachusetts one of the most attractive markets for heat pump
              and electrification contractors.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                {
                  category: 'Heat Pump Systems',
                  value: 'Up to $10,000',
                  desc: 'Cold-climate heat pumps for heating and cooling. Includes mini-splits, central ducted systems, and ground-source heat pumps.',
                },
                {
                  category: 'Heat Pump Water Heaters',
                  value: 'Up to $750',
                  desc: 'High-efficiency heat pump water heaters replacing electric resistance or gas water heating.',
                },
                {
                  category: 'Insulation & Air Sealing',
                  value: 'Up to $4,000',
                  desc: 'Comprehensive weatherization for residential properties, including 75–100% of insulation costs for income-eligible households.',
                },
                {
                  category: 'Commercial HVAC & Lighting',
                  value: 'Project-specific',
                  desc: 'Commercial and industrial equipment rebates for qualifying HVAC, lighting, motors, and building systems upgrades.',
                },
                {
                  category: '0% HEAT Loan',
                  value: 'Up to $50,000',
                  desc: 'Zero-interest financing for qualifying energy efficiency and heat pump improvements. Administered by Mass Save partners.',
                },
                {
                  category: 'EV Charging',
                  value: 'Up to $4,000',
                  desc: 'Rebates for Level 2 EV charging installation for residential and commercial properties.',
                },
              ].map((item) => (
                <div key={item.category} className="rounded-xl border border-deep-100 p-6">
                  <h3 className="font-sora font-semibold text-deep-900 mb-1">{item.category}</h3>
                  <div className="font-mono font-bold text-teal-600 text-sm mb-2">{item.value}</div>
                  <p className="text-sm text-deep-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Green Communities */}
          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-5">Green Communities Program</h2>
            <p className="text-deep-600 leading-relaxed mb-4">
              The Green Communities program provides annual grants to Massachusetts municipalities
              that achieve Green Community designation by meeting five qualifying criteria. Since
              2010, over $240M in grants have been awarded to more than 250 communities for clean
              energy projects, fleet electrification, municipal building retrofits, and renewable
              energy installations.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                'Adopt as-of-right zoning for renewable energy',
                'Adopt an expedited permitting process',
                'Establish energy use baseline for municipal buildings',
                'Purchase only fuel-efficient vehicles for municipal fleet',
                'Reduce municipal energy use by 20% in 5 years',
              ].map((criteria) => (
                <div key={criteria} className="flex items-start gap-2.5 rounded-lg border border-deep-100 px-4 py-3">
                  <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-deep-700">{criteria}</span>
                </div>
              ))}
            </div>
          </section>

          {/* MassCEC */}
          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-5">MassCEC Programs</h2>
            <p className="text-deep-600 leading-relaxed mb-6">
              The Massachusetts Clean Energy Center (MassCEC) is the state&apos;s clean energy agency,
              administering programs across offshore wind, clean transportation, energy storage,
              and workforce development.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  area: 'Offshore Wind',
                  programs: 'Vineyard Wind, SouthCoast Wind, and New England Wind development support; supply chain investment programs.',
                },
                {
                  area: 'Clean Transportation',
                  programs: 'Fleet electrification grants, EV adoption programs, and charging infrastructure development.',
                },
                {
                  area: 'Energy Storage',
                  programs: 'Advancing Commonwealth Energy Storage (ACES) program; demonstration grants for novel storage technologies.',
                },
              ].map((item) => (
                <div key={item.area} className="rounded-xl border border-deep-100 p-6">
                  <h3 className="font-sora font-semibold text-deep-900 mb-2">{item.area}</h3>
                  <p className="text-sm text-deep-600 leading-relaxed">{item.programs}</p>
                </div>
              ))}
            </div>
          </section>

          {/* MA State Tax Credit */}
          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-5">Massachusetts State Solar Tax Credit</h2>
            <p className="text-deep-600 leading-relaxed mb-4">
              Massachusetts offers a residential income tax credit equal to 15% of the cost of
              a qualifying solar energy system, capped at $1,000. The credit is non-refundable
              but can be carried forward for up to 3 years if it exceeds annual state tax liability.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Credit Rate', value: '15%', note: 'Of qualifying system cost' },
                { label: 'Maximum Credit', value: '$1,000', note: 'Per residence per year' },
                { label: 'Carryforward', value: '3 Years', note: 'If credit exceeds tax liability' },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-deep-100 p-5 text-center">
                  <div className="font-mono text-xl font-bold text-teal-600 mb-1">{item.value}</div>
                  <div className="text-sm font-semibold text-deep-900 mb-1">{item.label}</div>
                  <div className="text-xs text-deep-500">{item.note}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Utility Programs */}
          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-5">Utility Programs</h2>
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

          {/* Stack Table */}
          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-3">Federal + MA Incentive Stack</h2>
            <p className="text-deep-600 mb-8 leading-relaxed">
              Example combined incentive stack for a commercial solar + storage project in Massachusetts:
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
              headline="Get Your Complete MA + Federal Incentive Stack"
              sub="IncentEdge models SMART program compensation, Mass Save rebates, federal ITC, and the MA state tax credit together — delivering a full project economics analysis in under 60 seconds."
            />
          </section>
        </div>
      </main>

      <IncentiveFooter />
    </div>
  );
}
