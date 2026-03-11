import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { IncentiveHeader, IncentiveCTA, IncentiveFooter } from '@/components/incentives/IncentiveHeader';

export const metadata: Metadata = {
  title: 'California Clean Energy Incentives & IRA Credits | IncentEdge',
  description:
    'California clean energy incentives in 2026: SGIP storage rebates, CPUC IOU programs, NEM 3.0, and federal IRA credit stacking for solar and storage projects.',
  alternates: { canonical: 'https://incentedge.com/incentives/state/ca' },
  openGraph: {
    title: 'California Clean Energy Incentives & IRA Credits | IncentEdge',
    description:
      'California clean energy incentives in 2026: SGIP storage rebates, CPUC IOU programs, NEM 3.0, and federal IRA credit stacking for solar and storage projects.',
    url: 'https://incentedge.com/incentives/state/ca',
    siteName: 'IncentEdge',
    type: 'article',
  },
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'California Clean Energy Incentive Programs — Complete Guide',
  description: 'Full guide to CA clean energy incentives: SGIP, CPUC IOU programs, NEM 3.0, and IRA stacking.',
  url: 'https://incentedge.com/incentives/state/ca',
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
      name: 'What is SGIP and how much is the rebate?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The Self-Generation Incentive Program (SGIP) provides rebates for behind-the-meter battery storage systems in California. Base rebates range from $150–$250 per kWh of installed capacity. Equity tier projects (low-income, disadvantaged communities) receive higher rebates up to $850/kWh. The program is administered by the California Public Utilities Commission through PG&E, SCE, and SDG&E.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does NEM 3.0 affect solar economics in California?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'NEM 3.0, effective April 2023 for new applicants, reduced solar export rates by approximately 75% compared to NEM 2.0. This significantly changes the economics of solar-only systems. Battery storage paired with solar now provides much greater value by shifting self-consumption and avoiding time-of-use export penalties. Projects should model battery + solar together under NEM 3.0 rules.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can California solar projects stack state and federal incentives?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. A California project can stack the federal ITC (30%), SGIP battery storage rebate, CA property tax exclusion (for solar and storage), and CPUC IOU efficiency programs. For disadvantaged community projects, additional DAC rebates and the federal low-income bonus adder may also apply, bringing total incentive value above 50% of project cost.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is solar and storage equipment exempt from California property taxes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. California excludes solar energy systems and qualifying battery storage systems from assessed property value under the Active Solar Energy System property tax exclusion. This exclusion applies to residential, commercial, and industrial installations. The exclusion runs through 2027 and prevents the installation from increasing property tax bills.',
      },
    },
    {
      '@type': 'Question',
      name: 'What are California Disadvantaged Community incentive adders?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Projects located in CPUC-designated Disadvantaged Communities (DACs) or Low-Income Households are eligible for additional rebate tiers under SGIP and other CPUC programs. The SGIP Equity Budget provides up to $850/kWh for DAC storage projects. The federal IRA low-income bonus adder (+10% or +20% ITC) may also apply, creating significant combined value for qualifying projects.',
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
    { '@type': 'ListItem', position: 4, name: 'California', item: 'https://incentedge.com/incentives/state/ca' },
  ],
};

const sgipTiers = [
  { tier: 'Standard', rebate: '$150–$250/kWh', eligibility: 'All commercial and residential applicants', note: 'Subject to budget availability by utility territory' },
  { tier: 'Equity', rebate: '$850/kWh', eligibility: 'Low-income customers, CARE program enrollees', note: 'Priority funding, separate budget allocation' },
  { tier: 'Equity Resiliency', rebate: '$1,000/kWh', eligibility: 'Medical baseline customers in high fire risk areas', note: 'Highest incentive tier; for critical resilience use cases' },
  { tier: 'Small Business', rebate: '$200–$300/kWh', eligibility: 'Small commercial customers', note: 'Separate allocation from residential tier' },
];

const stackTable = [
  { source: 'Federal ITC (§48/48E)', rate: '30%', type: 'Tax Credit', notes: 'Base rate for solar + storage' },
  { source: 'Federal Low-Income Bonus Adder', rate: '+10% to +20%', type: 'Tax Credit', notes: 'For qualifying DAC projects' },
  { source: 'SGIP Battery Storage Rebate', rate: '$150–$850/kWh', type: 'Utility Rebate', notes: 'Varies by equity tier' },
  { source: 'CA Property Tax Exclusion', rate: 'Property tax savings', type: 'Tax Exemption', notes: 'Solar + storage excluded from assessed value' },
  { source: 'CPUC IOU Efficiency Programs', rate: 'Project-specific', type: 'Utility Rebate', notes: 'PG&E, SCE, SDG&E separate programs' },
];

const faqs = [
  {
    q: 'What is SGIP and how much is the rebate?',
    a: 'The Self-Generation Incentive Program (SGIP) provides rebates for behind-the-meter battery storage systems in California. Base rebates range from $150–$250 per kWh of installed capacity. Equity tier projects (low-income, disadvantaged communities) receive higher rebates up to $850/kWh. The program is administered by the California Public Utilities Commission through PG&E, SCE, and SDG&E.',
  },
  {
    q: 'How does NEM 3.0 affect solar economics in California?',
    a: 'NEM 3.0, effective April 2023 for new applicants, reduced solar export rates by approximately 75% compared to NEM 2.0. This significantly changes the economics of solar-only systems. Battery storage paired with solar now provides much greater value by shifting self-consumption and avoiding time-of-use export penalties. Projects should model battery + solar together under NEM 3.0 rules.',
  },
  {
    q: 'Can California solar projects stack state and federal incentives?',
    a: 'Yes. A California project can stack the federal ITC (30%), SGIP battery storage rebate, CA property tax exclusion, and CPUC IOU efficiency programs. For disadvantaged community projects, additional DAC rebates and the federal low-income bonus adder may also apply, bringing total incentive value above 50% of project cost.',
  },
  {
    q: 'Is solar and storage equipment exempt from California property taxes?',
    a: 'Yes. California excludes solar energy systems and qualifying battery storage systems from assessed property value under the Active Solar Energy System property tax exclusion. This exclusion applies to residential, commercial, and industrial installations. The exclusion runs through 2027 and prevents the installation from increasing property tax bills.',
  },
  {
    q: 'What are California Disadvantaged Community incentive adders?',
    a: "Projects located in CPUC-designated Disadvantaged Communities (DACs) or Low-Income Households are eligible for additional rebate tiers under SGIP and other CPUC programs. The SGIP Equity Budget provides up to $850/kWh for DAC storage projects. The federal IRA low-income bonus adder (+10% or +20% ITC) may also apply, creating significant combined value for qualifying projects.",
  },
];

export default function CaliforniaPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <IncentiveHeader
        breadcrumbs={[
          { label: 'Incentives', href: '/incentives' },
          { label: 'State Programs', href: '/incentives/state' },
          { label: 'California' },
        ]}
      />

      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-[900px] mx-auto px-6 pt-16 pb-12 md:pt-20">
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-flex items-center rounded-md px-3 py-1.5 text-sm font-bold font-mono bg-deep-900 text-white">
              CA
            </span>
            <span className="text-[12px] text-deep-500 uppercase tracking-wider font-medium">State Incentive Guide — 112 Programs</span>
          </div>
          <h1 className="font-sora text-4xl md:text-[46px] font-bold tracking-tight text-deep-900 leading-[1.1] mb-5">
            California Clean Energy Incentive Programs
          </h1>
          <p className="text-lg text-deep-500 mb-8 leading-relaxed">
            California is the largest clean energy market in the United States, with over $20B in
            active annual incentive investment through the CPUC, CARB, and the state&apos;s three major
            investor-owned utilities. The NEM 3.0 transition has made battery storage essential for
            new solar projects — and the SGIP program provides substantial rebates to offset storage costs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/signup" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-teal-600 text-white text-[14px] font-semibold hover:bg-teal-700 transition-colors">
              Scan My CA Project
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
              { label: 'Programs Available', value: '112' },
              { label: 'Installed Solar', value: '40+ GW' },
              { label: 'SGIP Budget', value: '$900M+' },
              { label: '2045 Target', value: '100% Clean' },
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
              California&apos;s clean energy incentive ecosystem is administered jointly by the California
              Public Utilities Commission (CPUC), the California Air Resources Board (CARB), the
              California Energy Commission (CEC), and the state&apos;s investor-owned utilities — PG&amp;E,
              Southern California Edison (SCE), and San Diego Gas &amp; Electric (SDG&amp;E).
            </p>
            <p className="text-deep-600 leading-relaxed">
              The transition to NEM 3.0 in April 2023 dramatically changed solar project economics.
              Solar-only systems now face significantly lower export compensation, while battery
              storage systems have become essential for maximizing the value of new solar installations.
              SGIP storage rebates and federal ITC together can offset 40–60% of battery storage costs.
            </p>
          </section>

          {/* SGIP */}
          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-3">
              SGIP — Self-Generation Incentive Program
            </h2>
            <p className="text-deep-600 mb-8 leading-relaxed">
              SGIP is California&apos;s primary battery storage rebate program, providing per-kWh incentives
              for behind-the-meter storage systems. The program offers multiple equity tiers that
              significantly increase rebate values for low-income and disadvantaged community projects.
            </p>
            <div className="overflow-x-auto rounded-xl border border-deep-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-deep-50 border-b border-deep-100">
                    <th className="px-5 py-3.5 text-left font-semibold text-deep-700">Tier</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-deep-700">Rebate</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-deep-700 hidden md:table-cell">Eligibility</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-deep-100">
                  {sgipTiers.map((row) => (
                    <tr key={row.tier} className="hover:bg-deep-50/50">
                      <td className="px-5 py-4 font-medium text-deep-900">{row.tier}</td>
                      <td className="px-5 py-4 font-mono font-bold text-teal-600">{row.rebate}</td>
                      <td className="px-5 py-4 text-deep-600 hidden md:table-cell">{row.eligibility}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* IOU Programs */}
          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-5">CPUC IOU Utility Programs</h2>
            <div className="space-y-4">
              {[
                {
                  utility: 'Pacific Gas & Electric (PG&E)',
                  territory: 'Northern & Central California',
                  programs: 'Commercial building efficiency rebates, EV fleet charging programs, demand response, and solar + storage incentives through the CPUC-mandated portfolio.',
                },
                {
                  utility: 'Southern California Edison (SCE)',
                  territory: 'Southern California (excl. San Diego)',
                  programs: 'Residential and commercial efficiency rebates, solar incentives, demand flexibility programs, and the Business Energy Management program for large commercial accounts.',
                },
                {
                  utility: 'San Diego Gas & Electric (SDG&E)',
                  territory: 'San Diego + Orange County',
                  programs: 'EV charging infrastructure incentives, commercial efficiency programs, and battery storage rebates layered with SGIP in the SDG&E service territory.',
                },
              ].map((u) => (
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

          {/* NEM 3.0 */}
          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-5">NEM 3.0 — Net Billing Tariff</h2>
            <p className="text-deep-600 leading-relaxed mb-4">
              California&apos;s Net Energy Metering 3.0 (officially the Net Billing Tariff) took effect
              for new applicants in April 2023. Under NEM 3.0, export compensation rates were reduced
              by approximately 75% compared to NEM 2.0, reflecting time-of-use grid values rather
              than retail rates.
            </p>
            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 mb-6">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                <strong>Impact on solar-only systems:</strong> Under NEM 3.0, solar-only systems have
                significantly longer payback periods. Battery storage is now essential for maximizing
                self-consumption and achieving acceptable project economics. Model battery + solar
                together using IncentEdge.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: 'NEM 2.0 Export Rate', value: '~$0.30/kWh', note: 'Full retail rate compensation' },
                { label: 'NEM 3.0 Export Rate', value: '~$0.05–$0.08/kWh', note: 'Avoided cost rate, time-of-use' },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-deep-100 p-5">
                  <div className="font-mono text-xl font-bold text-deep-900 mb-1">{item.value}</div>
                  <div className="text-sm font-semibold text-deep-700 mb-1">{item.label}</div>
                  <div className="text-xs text-deep-500">{item.note}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Disadvantaged Communities */}
          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-5">Disadvantaged Community Programs</h2>
            <p className="text-deep-600 leading-relaxed mb-6">
              California&apos;s CPUC designates Disadvantaged Communities (DACs) using the CalEnviroScreen
              tool. Projects serving DAC residents receive significantly enhanced incentives across
              multiple programs, and may also qualify for the federal IRA low-income bonus adder.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                {
                  program: 'SGIP Equity Budget',
                  value: 'Up to $850/kWh',
                  desc: 'Storage rebates for DAC and low-income customers — 5x the standard tier.',
                },
                {
                  program: 'Federal Low-Income Adder',
                  value: '+10% to +20% ITC',
                  desc: 'IRS bonus adder for qualifying low-income community solar and storage projects.',
                },
                {
                  program: 'CPUC DAC Green Tariff',
                  value: 'Below-market rates',
                  desc: 'Discounted green electricity rates for low-income customers in DAC areas.',
                },
                {
                  program: 'CA Solar Initiative — DAC',
                  value: 'Enhanced rebates',
                  desc: 'Additional incentive tiers for solar installed in disadvantaged community zones.',
                },
              ].map((item) => (
                <div key={item.program} className="rounded-xl border border-deep-100 p-6">
                  <h3 className="font-sora font-semibold text-deep-900 mb-1">{item.program}</h3>
                  <div className="font-mono font-bold text-teal-600 text-sm mb-2">{item.value}</div>
                  <p className="text-sm text-deep-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CA Property Tax Exclusion */}
          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-5">CA Property Tax Exclusion for Solar & Storage</h2>
            <p className="text-deep-600 leading-relaxed mb-4">
              California excludes qualified solar energy systems and battery storage equipment from
              assessed property value under the Active Solar Energy System exclusion (Revenue and
              Taxation Code § 73). This means installing solar or storage does not increase property
              taxes, effectively providing ongoing tax savings over the life of the system.
            </p>
            <div className="flex items-start gap-3 rounded-lg border border-teal-200 bg-teal-50 px-5 py-4">
              <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-teal-800">
                The property tax exclusion applies automatically for qualifying systems — no separate
                application required. The exclusion currently runs through 2027 and applies to
                residential, commercial, and industrial properties statewide.
              </p>
            </div>
          </section>

          {/* Stack Table */}
          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-3">Federal + CA Incentive Stack</h2>
            <p className="text-deep-600 mb-8 leading-relaxed">
              Example combined incentive stack for a commercial solar + storage project in a CA disadvantaged community:
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

          {/* Offshore Wind */}
          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-5">California Offshore Wind (Emerging)</h2>
            <p className="text-deep-600 leading-relaxed mb-4">
              California is developing the first US commercial-scale floating offshore wind industry
              off the central and northern coasts. BOEM awarded floating wind leases in 2023 for
              the Morro Bay and Humboldt Wind Energy Areas, representing approximately 4.6 GW of
              potential capacity.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { area: 'Morro Bay Wind Energy Area', capacity: '~3.0 GW', status: 'Leases awarded 2023', notes: 'Central CA coast, San Luis Obispo County offshore' },
                { area: 'Humboldt Wind Energy Area', capacity: '~1.6 GW', status: 'Leases awarded 2023', notes: 'Northern CA coast, first floating wind in US federal waters' },
              ].map((item) => (
                <div key={item.area} className="rounded-xl border border-deep-100 p-6">
                  <h3 className="font-sora font-semibold text-deep-900 mb-1">{item.area}</h3>
                  <div className="font-mono font-bold text-teal-600 text-sm mb-2">{item.capacity}</div>
                  <div className="text-[11px] font-medium text-teal-600 uppercase tracking-wider mb-2">{item.status}</div>
                  <p className="text-sm text-deep-600">{item.notes}</p>
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

          <section className="py-14">
            <IncentiveCTA
              headline="Auto-Discover All CA + Federal Incentives for Your Project"
              sub="IncentEdge models SGIP rebates, federal ITC, property tax exclusions, and IOU utility programs together — delivering a complete stacked analysis in under 60 seconds."
            />
          </section>
        </div>
      </main>

      <IncentiveFooter />
    </div>
  );
}
