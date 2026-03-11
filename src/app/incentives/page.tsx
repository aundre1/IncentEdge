import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Building2, MapPin, Zap } from 'lucide-react';
import { IncentiveHeader, IncentiveCTA, IncentiveFooter } from '@/components/incentives/IncentiveHeader';

export const metadata: Metadata = {
  title: 'IRA Tax Credit & Incentive Database | IncentEdge',
  description:
    'Browse federal, state, and local IRA tax credits with IncentEdge. Search 217,000+ programs including 45L, 179D, ITC, PTC, and more.',
  alternates: { canonical: 'https://incentedge.com/incentives' },
  openGraph: {
    title: 'IRA Tax Credit & Incentive Database | IncentEdge',
    description:
      'Browse federal, state, and local IRA tax credits with IncentEdge. Search 217,000+ programs including 45L, 179D, ITC, PTC, and more.',
    url: 'https://incentedge.com/incentives',
    siteName: 'IncentEdge',
    type: 'website',
  },
};

const datasetSchema = {
  '@context': 'https://schema.org',
  '@type': 'Dataset',
  name: 'IncentEdge Incentive Database',
  description: '217,000+ federal, state, and local incentive programs including IRA tax credits',
  url: 'https://incentedge.com/incentives',
  provider: {
    '@type': 'Organization',
    name: 'IncentEdge',
    url: 'https://incentedge.com',
  },
  keywords: ['IRA tax credits', '45L', '179D', 'ITC', 'PTC', '48C', '45Q', '45V'],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://incentedge.com' },
    { '@type': 'ListItem', position: 2, name: 'Incentives', item: 'https://incentedge.com/incentives' },
  ],
};

const federalCredits = [
  {
    code: '45L',
    name: 'New Energy Efficient Home Credit',
    value: 'Up to $5,000/unit',
    desc: 'Tax credit for contractors building energy-efficient new homes or multifamily units.',
    href: '/incentives/federal/45l',
    tag: 'Residential',
  },
  {
    code: '179D',
    name: 'Commercial Building Deduction',
    value: 'Up to $5.00/sq ft',
    desc: 'Deduction for energy-efficient commercial buildings including nonprofits post-IRA.',
    href: '/incentives/federal/179d',
    tag: 'Commercial',
  },
  {
    code: 'ITC',
    name: 'Investment Tax Credit',
    value: '30%–70% of cost',
    desc: 'Credit for solar, wind, storage, and other clean energy system investments.',
    href: '/incentives/federal/itc',
    tag: 'Clean Energy',
  },
  {
    code: 'PTC',
    name: 'Production Tax Credit',
    value: '2.75¢/kWh',
    desc: 'Per-kilowatt-hour credit for clean electricity production over a 10-year period.',
    href: '/incentives/federal/ptc',
    tag: 'Clean Energy',
  },
  {
    code: '48C',
    name: 'Advanced Manufacturing Credit',
    value: '30% of investment',
    desc: '$10B allocated for advanced clean energy manufacturing facility investments.',
    href: '/incentives/federal/48c',
    tag: 'Manufacturing',
  },
  {
    code: '45Q',
    name: 'Carbon Capture Credit',
    value: '$85/ton stored',
    desc: 'Credit for carbon capture, utilization, and storage projects including direct air capture.',
    href: '/incentives/federal/45q',
    tag: 'Carbon',
  },
  {
    code: '45V',
    name: 'Clean Hydrogen Credit',
    value: 'Up to $3.00/kg',
    desc: 'Production credit for clean hydrogen based on lifecycle greenhouse gas emissions.',
    href: '/incentives/federal/45v',
    tag: 'Hydrogen',
  },
];

const categories = [
  {
    icon: Zap,
    title: 'Federal IRA Credits',
    count: '7 Major Programs',
    desc: 'Section 45L, 179D, ITC, PTC, 48C, 45Q, 45V — all Inflation Reduction Act credits in one place.',
    href: '/incentives/federal',
    color: 'teal',
  },
  {
    icon: MapPin,
    title: 'State Programs',
    count: '50 States Covered',
    desc: 'Renewable portfolio standards, state tax credits, rebate programs, and grant funding.',
    href: '/incentives/state',
    color: 'emerald',
  },
  {
    icon: Building2,
    title: 'Local Programs',
    count: '3,000+ Jurisdictions',
    desc: 'Municipal rebates, property tax abatements, permit fee waivers, and utility incentives.',
    href: '/incentives/local',
    color: 'blue',
  },
];

export default function IncentivesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <IncentiveHeader breadcrumbs={[{ label: 'Incentives' }]} />

      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-[1200px] mx-auto px-6 pt-16 pb-12 md:pt-20 md:pb-16">
          <div className="inline-flex items-center rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-[12px] text-teal-700 mb-6">
            <Zap className="w-3.5 h-3.5 mr-2" />
            217,000+ Programs — Updated Continuously
          </div>
          <h1 className="font-sora text-4xl md:text-5xl lg:text-[52px] font-bold tracking-tight text-deep-900 leading-[1.1] mb-5">
            217,000+ Incentive Programs.<br className="hidden md:block" /> Instantly Discoverable.
          </h1>
          <p className="text-lg text-deep-500 mb-8 leading-relaxed max-w-2xl">
            Federal IRA tax credits, state programs, and local incentives — all verified,
            searchable, and matched to your project in under 60 seconds.
          </p>
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-teal-600 text-white text-[14px] font-semibold hover:bg-teal-700 transition-colors"
            >
              Search All Programs
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/incentives/federal"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg border border-deep-200 text-deep-700 text-[14px] font-semibold hover:bg-deep-50 transition-colors"
            >
              Browse Federal Credits
            </Link>
          </div>
        </section>

        {/* Category Overview */}
        <section className="border-y border-deep-100 bg-deep-50/50">
          <div className="max-w-[1200px] mx-auto px-6 py-16">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-2">
              Three Layers of Incentive Coverage
            </h2>
            <p className="text-deep-500 mb-10 max-w-2xl">
              IncentEdge searches federal, state, and local programs simultaneously — so you
              never miss a stackable opportunity.
            </p>
            <div className="grid gap-6 md:grid-cols-3">
              {categories.map((cat) => (
                <Link
                  key={cat.title}
                  href={cat.href}
                  className="group rounded-xl border border-deep-100 bg-white p-7 hover:shadow-md hover:border-teal-200 transition-all"
                >
                  <div className="flex items-center justify-center h-11 w-11 rounded-lg bg-teal-100 mb-5">
                    <cat.icon className="h-5 w-5 text-teal-600" />
                  </div>
                  <div className="text-[11px] font-semibold text-teal-600 uppercase tracking-wider mb-1">
                    {cat.count}
                  </div>
                  <h3 className="font-sora font-bold text-lg text-deep-900 mb-2 group-hover:text-teal-700 transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-sm text-deep-500 leading-relaxed">{cat.desc}</p>
                  <div className="mt-5 flex items-center gap-1 text-sm font-semibold text-teal-600">
                    Explore <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Federal Credits Grid */}
        <section className="max-w-[1200px] mx-auto px-6 py-16 md:py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-2">
                Federal IRA Tax Credits
              </h2>
              <p className="text-deep-500 max-w-xl">
                Seven major credits enacted or expanded under the Inflation Reduction Act of 2022.
              </p>
            </div>
            <Link
              href="/incentives/federal"
              className="hidden md:inline-flex items-center gap-1.5 text-[13px] font-semibold text-teal-600 hover:text-teal-700 transition-colors"
            >
              View all federal credits <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {federalCredits.map((credit) => (
              <Link
                key={credit.code}
                href={credit.href}
                className="group rounded-xl border border-deep-100 bg-white p-6 hover:shadow-md hover:border-teal-200 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold font-mono bg-deep-900 text-white">
                    §{credit.code}
                  </span>
                  <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium bg-teal-50 text-teal-700">
                    {credit.tag}
                  </span>
                </div>
                <h3 className="font-sora font-semibold text-[15px] text-deep-900 mb-2 group-hover:text-teal-700 transition-colors leading-snug">
                  {credit.name}
                </h3>
                <p className="text-sm text-deep-500 leading-relaxed mb-4">{credit.desc}</p>
                <div className="pt-3 border-t border-deep-100 flex items-center justify-between">
                  <span className="font-mono text-base font-bold text-teal-600">{credit.value}</span>
                  <span className="flex items-center gap-1 text-[12px] font-semibold text-teal-600">
                    Learn more <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-6 md:hidden text-center">
            <Link
              href="/incentives/federal"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-teal-600"
            >
              View all federal credits <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-[1200px] mx-auto px-6 pb-20">
          <IncentiveCTA
            headline="Find Every Incentive Your Project Qualifies For"
            sub="IncentEdge scans 217,000+ programs and delivers a stacked incentive analysis in under 60 seconds. No spreadsheets. No consultants."
          />
        </section>
      </main>

      <IncentiveFooter />
    </div>
  );
}
