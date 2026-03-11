import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { IncentiveHeader, IncentiveCTA, IncentiveFooter } from '@/components/incentives/IncentiveHeader';

export const metadata: Metadata = {
  title: 'New York State Clean Energy Incentives | IncentEdge',
  description:
    'Complete guide to New York clean energy incentives: NYSERDA programs, NY Green Bank, Con Edison rebates, and how to stack with federal IRA credits for maximum value.',
  alternates: { canonical: 'https://incentedge.com/incentives/state/ny' },
  openGraph: {
    title: 'New York State Clean Energy Incentives | IncentEdge',
    description:
      'Complete guide to New York clean energy incentives: NYSERDA programs, NY Green Bank, Con Edison rebates, and how to stack with federal IRA credits for maximum value.',
    url: 'https://incentedge.com/incentives/state/ny',
    siteName: 'IncentEdge',
    type: 'article',
  },
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'New York State Clean Energy Incentive Programs — Complete Guide',
  description: 'Full guide to NY clean energy incentives: NYSERDA, NY Green Bank, utility rebates, tax credits, and IRA stacking.',
  url: 'https://incentedge.com/incentives/state/ny',
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
      name: 'Can you stack New York incentives with the federal ITC?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. NY state incentives are designed to stack with federal IRA credits. A solar project can combine the federal ITC (30%), NYSERDA NY-Sun incentives, Con Edison rebates, and NY Green Bank low-cost financing simultaneously. IncentEdge models the full stack automatically.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the NY-Sun Megawatt Block incentive?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "NY-Sun provides upfront MW Block incentives for residential and commercial solar installations. Incentive levels vary by utility territory and capacity block — once a block fills, the incentive steps down to the next lower level. Current rates range from $0.20–$0.80/W depending on system size and Con Ed or upstate utility territory.",
      },
    },
    {
      '@type': 'Question',
      name: 'What does the NY Green Bank finance?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'NY Green Bank provides financing for commercial-scale clean energy projects including solar, wind, energy efficiency, and storage. It offers construction loans, term debt, and credit enhancements at rates below conventional markets. Minimum transaction size is approximately $1M.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the NY Clean Heat program?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Clean Heat is a NYSERDA program that provides incentives for replacing fossil fuel heating systems with electric heat pumps. Incentives vary by fuel displaced (oil, propane, or natural gas) and system type. Commercial and multifamily projects can receive significant per-unit incentives.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does New York qualify for the federal energy community bonus adder?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Several regions of New York qualify for the federal 10% energy community bonus adder under the IRA. This includes former industrial and fossil fuel employment areas in Western NY, parts of the Southern Tier, and specific brownfield sites. IncentEdge maps your project location against current energy community designations.',
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
    { '@type': 'ListItem', position: 4, name: 'New York', item: 'https://incentedge.com/incentives/state/ny' },
  ],
};

const nyserdaPrograms = [
  {
    name: 'NY-Sun Megawatt Block',
    type: 'Upfront Rebate',
    value: '$0.20–$0.80/W',
    desc: 'Capacity-block incentive for residential and commercial solar. Available in Con Edison, PSEG LI, and upstate utility territories. Incentive steps down as capacity blocks fill.',
  },
  {
    name: 'Clean Heat Program',
    type: 'Rebate',
    value: 'Up to $7,000/unit',
    desc: 'Incentives for replacing oil, propane, or gas heating with electric heat pumps. Residential and commercial projects eligible. Stacks with federal 25C/179D credits.',
  },
  {
    name: 'Offshore Wind',
    type: 'Contract / OREC',
    value: 'Project-specific',
    desc: 'NYSERDA procures offshore wind through competitive solicitations. Empire Wind and Sunrise Wind are active projects. ORECs provide long-term revenue certainty for developers.',
  },
  {
    name: 'EmPower NY',
    type: 'Grant',
    value: 'Up to $15,000',
    desc: 'Free energy efficiency upgrades for income-qualified households. Stacks with the federal Low-Income Housing bonus adder for qualifying multifamily projects.',
  },
];

const stackTable = [
  { source: 'Federal ITC (§48/48E)', rate: '30%', type: 'Tax Credit', notes: 'Base rate, prevailing wage required' },
  { source: 'Federal Energy Community Adder', rate: '+10%', type: 'Tax Credit', notes: 'For qualifying NY regions' },
  { source: 'NY State Renewable Energy Tax Credit', rate: '6% of cost', type: 'State Tax Credit', notes: 'Up to $5,000 residential' },
  { source: 'NYSERDA NY-Sun Block Incentive', rate: '$0.20–$0.80/W', type: 'Upfront Rebate', notes: 'Varies by territory and block' },
  { source: 'Con Edison Solar Incentive', rate: '$0.10–$0.40/W', type: 'Utility Rebate', notes: 'Con Ed territory only' },
  { source: 'NY Green Bank Financing', rate: 'Below-market rate', type: 'Low-Cost Debt', notes: 'Commercial projects ≥$1M' },
];

const faqs = [
  {
    q: 'Can you stack New York incentives with the federal ITC?',
    a: 'Yes. NY state incentives are designed to stack with federal IRA credits. A solar project can combine the federal ITC (30%), NYSERDA NY-Sun incentives, Con Edison rebates, and NY Green Bank low-cost financing simultaneously. IncentEdge models the full stack automatically.',
  },
  {
    q: 'What is the NY-Sun Megawatt Block incentive?',
    a: "NY-Sun provides upfront MW Block incentives for residential and commercial solar installations. Incentive levels vary by utility territory and capacity block — once a block fills, the incentive steps down to the next lower level. Current rates range from $0.20–$0.80/W depending on system size and Con Ed or upstate utility territory.",
  },
  {
    q: 'What does the NY Green Bank finance?',
    a: 'NY Green Bank provides financing for commercial-scale clean energy projects including solar, wind, energy efficiency, and storage. It offers construction loans, term debt, and credit enhancements at rates below conventional markets. Minimum transaction size is approximately $1M.',
  },
  {
    q: 'What is the NY Clean Heat program?',
    a: 'Clean Heat is a NYSERDA program that provides incentives for replacing fossil fuel heating systems with electric heat pumps. Incentives vary by fuel displaced (oil, propane, or natural gas) and system type. Commercial and multifamily projects can receive significant per-unit incentives.',
  },
  {
    q: 'Does New York qualify for the federal energy community bonus adder?',
    a: 'Yes. Several regions of New York qualify for the federal 10% energy community bonus adder under the IRA. This includes former industrial and fossil fuel employment areas in Western NY, parts of the Southern Tier, and specific brownfield sites. IncentEdge maps your project location against current energy community designations.',
  },
];

export default function NewYorkPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <IncentiveHeader
        breadcrumbs={[
          { label: 'Incentives', href: '/incentives' },
          { label: 'State Programs', href: '/incentives/state' },
          { label: 'New York' },
        ]}
      />

      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-[900px] mx-auto px-6 pt-16 pb-12 md:pt-20">
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-flex items-center rounded-md px-3 py-1.5 text-sm font-bold font-mono bg-deep-900 text-white">
              NY
            </span>
            <span className="text-[12px] text-deep-500 uppercase tracking-wider font-medium">State Incentive Guide — 94 Programs</span>
          </div>
          <h1 className="font-sora text-4xl md:text-[46px] font-bold tracking-tight text-deep-900 leading-[1.1] mb-5">
            New York State Clean Energy Incentive Programs
          </h1>
          <p className="text-lg text-deep-500 mb-8 leading-relaxed">
            New York leads the United States in clean energy incentive depth. Between NYSERDA&apos;s
            extensive program portfolio, the NY Green Bank&apos;s $1B+ lending capacity, and utility
            rebate programs across Con Edison, PSEG LI, and National Grid, NY projects can stack
            $0.30–$0.80/W in state incentives directly on top of the federal ITC&apos;s 30% base rate.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/signup" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-teal-600 text-white text-[14px] font-semibold hover:bg-teal-700 transition-colors">
              Scan My NY Project
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
              { label: 'Programs Available', value: '94' },
              { label: 'NYSERDA Budget', value: '$6.8B' },
              { label: 'NY Green Bank AUM', value: '$1.4B' },
              { label: 'State Solar Target', value: '10 GW' },
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
              New York&apos;s clean energy programs are administered primarily through the New York State
              Energy Research and Development Authority (NYSERDA), the NY Green Bank, and the three
              major investor-owned utilities: Con Edison, PSEG Long Island, and National Grid.
              Together, these entities deliver a program portfolio worth over $6.8 billion in active
              commitments.
            </p>
            <p className="text-deep-600 leading-relaxed mb-4">
              The federal IRA&apos;s bonus adder structure makes New York projects particularly
              attractive. Several NY regions — especially former industrial areas in Western New York
              and the Southern Tier — qualify for the +10% energy community adder, bringing the
              federal ITC to 40% before state incentives are applied.
            </p>
            <div className="flex items-start gap-3 rounded-lg border border-teal-200 bg-teal-50 px-5 py-4">
              <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-teal-800">
                <strong>Stacking opportunity:</strong> NY projects that qualify for NYSERDA incentives,
                utility rebates, and the federal energy community adder can achieve effective incentive
                rates of 45–55% of total project cost.
              </p>
            </div>
          </section>

          {/* NYSERDA Programs */}
          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-3">NYSERDA Programs</h2>
            <p className="text-deep-600 mb-8 leading-relaxed">
              NYSERDA administers New York&apos;s primary clean energy incentive portfolio, spanning solar,
              heat pumps, offshore wind, and low-income programs.
            </p>
            <div className="grid gap-5">
              {nyserdaPrograms.map((program) => (
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

          {/* NY Green Bank */}
          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-5">NY Green Bank</h2>
            <p className="text-deep-600 leading-relaxed mb-4">
              The NY Green Bank is a $1.4B state-sponsored investment fund that provides below-market
              financing for commercial clean energy projects. It does not compete with private capital
              — it fills gaps where conventional lenders are unwilling or unable to provide financing.
            </p>
            <p className="text-deep-600 leading-relaxed mb-4">
              The Green Bank offers construction loans, permanent term debt, letters of credit,
              and credit enhancements for solar, wind, energy efficiency, EV charging infrastructure,
              and clean heating and cooling projects. Minimum transaction size is approximately $1M,
              with many deals in the $5–$50M range.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Assets Under Management', value: '$1.4B+' },
                { label: 'Min. Transaction Size', value: '~$1M' },
                { label: 'Typical Deal Range', value: '$5M–$50M' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-deep-100 bg-deep-50/50 px-5 py-5 text-center">
                  <div className="font-mono text-xl font-bold text-deep-900">{stat.value}</div>
                  <div className="text-xs text-sage-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Utility Programs */}
          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-5">Utility Programs</h2>
            <p className="text-deep-600 mb-6 leading-relaxed">
              New York&apos;s three major utilities each offer separate incentive programs funded through
              the Clean Energy Fund and utility distribution tariffs.
            </p>
            <div className="space-y-4">
              {[
                {
                  utility: 'Con Edison',
                  territory: 'New York City + Westchester',
                  programs: 'Commercial efficiency rebates, EV charging infrastructure incentives, demand response programs, and NY-Sun solar incentives specific to ConEd territory.',
                },
                {
                  utility: 'PSEG Long Island',
                  territory: 'Nassau + Suffolk Counties',
                  programs: 'Residential and commercial solar rebates, energy efficiency programs, and battery storage incentives. PSEG LI administers LIPA\'s incentive programs.',
                },
                {
                  utility: 'National Grid (NY)',
                  territory: 'Upstate NY, Rochester, Syracuse',
                  programs: 'Commercial efficiency rebates, heat pump incentives for commercial and industrial customers, and demand response programs.',
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

          {/* Tax Credits */}
          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-5">New York State Tax Credits</h2>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-xl border border-deep-100 p-6">
                <h3 className="font-sora font-semibold text-deep-900 mb-2">NY Renewable Energy Tax Credit</h3>
                <div className="font-mono font-bold text-teal-600 text-base mb-3">6% of system cost (up to $5,000)</div>
                <p className="text-sm text-deep-600 leading-relaxed">
                  New York residents can claim a state income tax credit equal to 6% of the installed
                  cost of a solar energy system, capped at $5,000. The credit is refundable if it
                  exceeds tax liability, with any excess carried forward for up to 5 years.
                </p>
              </div>
              <div className="rounded-xl border border-deep-100 p-6">
                <h3 className="font-sora font-semibold text-deep-900 mb-2">NY Green Building Tax Credit</h3>
                <div className="font-mono font-bold text-teal-600 text-base mb-3">Project-based</div>
                <p className="text-sm text-deep-600 leading-relaxed">
                  State tax credits for commercial green building construction meeting LEED or similar
                  standards. Stacks with federal 179D deduction and NYSERDA incentives for comprehensive
                  new construction projects.
                </p>
              </div>
            </div>
          </section>

          {/* Stack Table */}
          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-3">Federal + NY Incentive Stack</h2>
            <p className="text-deep-600 mb-8 leading-relaxed">
              Example combined incentive stack for a commercial solar project in a NY energy community:
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

          {/* Energy Community Zones */}
          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-5">NY Energy Community Zones</h2>
            <p className="text-deep-600 leading-relaxed mb-4">
              Under the IRA, projects located in &quot;energy communities&quot; receive a +10% bonus adder on
              the federal ITC or PTC. In New York, qualifying energy communities include:
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                'Western New York (former steel and manufacturing zones)',
                'Southern Tier (former coal and industrial areas)',
                'Capital Region brownfield sites',
                'Statistical areas with high fossil fuel employment or unemployment',
                'Former coal mining communities (Sullivan County, etc.)',
                'Designated brownfield opportunity areas statewide',
              ].map((zone) => (
                <div key={zone} className="flex items-start gap-2.5 rounded-lg border border-deep-100 px-4 py-3">
                  <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-deep-700">{zone}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-5 py-4">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                Energy community designations are updated annually by the IRS and Treasury. IncentEdge
                verifies your project&apos;s energy community status against the most current census tract
                and MSA data.
              </p>
            </div>
          </section>

          {/* Getting Started */}
          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-5">Getting Started with NY Incentives</h2>
            <p className="text-deep-600 leading-relaxed mb-6">
              Navigating New York&apos;s incentive landscape requires understanding which programs apply
              to your project type, utility territory, location, and ownership structure.
              IncentEdge automates this entire process.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  step: '01',
                  title: 'Enter Project Details',
                  desc: 'Technology type, location, project size, and ownership structure.',
                },
                {
                  step: '02',
                  title: 'AI Matches All Programs',
                  desc: 'IncentEdge cross-references federal, NYSERDA, utility, and local programs.',
                },
                {
                  step: '03',
                  title: 'Get Full Stack Analysis',
                  desc: 'Receive a stacked incentive model with application deadlines and documentation requirements.',
                },
              ].map((item) => (
                <div key={item.step} className="rounded-xl border border-deep-100 p-6">
                  <div className="font-mono text-2xl font-bold text-teal-100 mb-3">{item.step}</div>
                  <h3 className="font-sora font-semibold text-deep-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-deep-600 leading-relaxed">{item.desc}</p>
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
              headline="Auto-Discover All NY + Federal Incentives for Your Project"
              sub="IncentEdge matches your NY project against NYSERDA programs, utility rebates, and federal IRA credits in under 60 seconds — and models the full incentive stack."
            />
          </section>
        </div>
      </main>

      <IncentiveFooter />
    </div>
  );
}
