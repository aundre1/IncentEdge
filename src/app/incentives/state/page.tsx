import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, MapPin, Star, Zap } from 'lucide-react';
import { IncentiveHeader, IncentiveCTA, IncentiveFooter } from '@/components/incentives/IncentiveHeader';

export const metadata: Metadata = {
  title: 'State Clean Energy Incentives by State | IncentEdge',
  description:
    'Browse IRA-compatible state clean energy incentive programs for all 50 states. Find PACE financing, state tax credits, utility rebates, and grant programs.',
  alternates: { canonical: 'https://incentedge.com/incentives/state' },
  openGraph: {
    title: 'State Clean Energy Incentives by State | IncentEdge',
    description:
      'Browse IRA-compatible state clean energy incentive programs for all 50 states. Find PACE financing, state tax credits, utility rebates, and grant programs.',
    url: 'https://incentedge.com/incentives/state',
    siteName: 'IncentEdge',
    type: 'website',
  },
};

const datasetSchema = {
  '@context': 'https://schema.org',
  '@type': 'Dataset',
  name: 'IncentEdge State Clean Energy Incentive Programs',
  description: 'State-level clean energy incentive programs for all 50 US states, including PACE financing, tax credits, utility rebates, and grants',
  url: 'https://incentedge.com/incentives/state',
  provider: {
    '@type': 'Organization',
    name: 'IncentEdge',
    url: 'https://incentedge.com',
  },
  keywords: ['state incentives', 'PACE financing', 'state tax credits', 'utility rebates', 'clean energy grants'],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://incentedge.com' },
    { '@type': 'ListItem', position: 2, name: 'Incentives', item: 'https://incentedge.com/incentives' },
    { '@type': 'ListItem', position: 3, name: 'State Programs', item: 'https://incentedge.com/incentives/state' },
  ],
};

const featuredStates = [
  {
    abbr: 'NY',
    name: 'New York',
    href: '/incentives/state/ny',
    programs: '94 programs',
    highlight: 'NYSERDA + NY Green Bank',
    badge: 'Top State',
  },
  {
    abbr: 'CA',
    name: 'California',
    href: '/incentives/state/ca',
    programs: '112 programs',
    highlight: 'SGIP + CPUC IOU programs',
    badge: 'Largest Market',
  },
  {
    abbr: 'TX',
    name: 'Texas',
    href: '/incentives/state/tx',
    programs: '67 programs',
    highlight: 'Wind + solar tax exemptions',
    badge: '#1 Wind State',
  },
  {
    abbr: 'CO',
    name: 'Colorado',
    href: '/incentives/state/co',
    programs: '58 programs',
    highlight: 'REDI + coal transition adders',
    badge: 'Coal Transition Leader',
  },
  {
    abbr: 'MA',
    name: 'Massachusetts',
    href: '/incentives/state/ma',
    programs: '71 programs',
    highlight: 'SMART + Mass Save',
    badge: 'Highest Density',
  },
];

const allStates = [
  { name: 'Alabama', abbr: 'AL', programs: '23 programs' },
  { name: 'Alaska', abbr: 'AK', programs: '18 programs' },
  { name: 'Arizona', abbr: 'AZ', programs: '41 programs' },
  { name: 'Arkansas', abbr: 'AR', programs: '19 programs' },
  { name: 'California', abbr: 'CA', href: '/incentives/state/ca', programs: '112 programs' },
  { name: 'Colorado', abbr: 'CO', href: '/incentives/state/co', programs: '58 programs' },
  { name: 'Connecticut', abbr: 'CT', programs: '52 programs' },
  { name: 'Delaware', abbr: 'DE', programs: '29 programs' },
  { name: 'Florida', abbr: 'FL', programs: '38 programs' },
  { name: 'Georgia', abbr: 'GA', programs: '31 programs' },
  { name: 'Hawaii', abbr: 'HI', programs: '47 programs' },
  { name: 'Idaho', abbr: 'ID', programs: '22 programs' },
  { name: 'Illinois', abbr: 'IL', programs: '61 programs' },
  { name: 'Indiana', abbr: 'IN', programs: '27 programs' },
  { name: 'Iowa', abbr: 'IA', programs: '33 programs' },
  { name: 'Kansas', abbr: 'KS', programs: '24 programs' },
  { name: 'Kentucky', abbr: 'KY', programs: '21 programs' },
  { name: 'Louisiana', abbr: 'LA', programs: '26 programs' },
  { name: 'Maine', abbr: 'ME', programs: '44 programs' },
  { name: 'Maryland', abbr: 'MD', programs: '57 programs' },
  { name: 'Massachusetts', abbr: 'MA', href: '/incentives/state/ma', programs: '71 programs' },
  { name: 'Michigan', abbr: 'MI', programs: '48 programs' },
  { name: 'Minnesota', abbr: 'MN', programs: '55 programs' },
  { name: 'Mississippi', abbr: 'MS', programs: '17 programs' },
  { name: 'Missouri', abbr: 'MO', programs: '28 programs' },
  { name: 'Montana', abbr: 'MT', programs: '20 programs' },
  { name: 'Nebraska', abbr: 'NE', programs: '25 programs' },
  { name: 'Nevada', abbr: 'NV', programs: '39 programs' },
  { name: 'New Hampshire', abbr: 'NH', programs: '36 programs' },
  { name: 'New Jersey', abbr: 'NJ', programs: '63 programs' },
  { name: 'New Mexico', abbr: 'NM', programs: '34 programs' },
  { name: 'New York', abbr: 'NY', href: '/incentives/state/ny', programs: '94 programs' },
  { name: 'North Carolina', abbr: 'NC', programs: '45 programs' },
  { name: 'North Dakota', abbr: 'ND', programs: '16 programs' },
  { name: 'Ohio', abbr: 'OH', programs: '42 programs' },
  { name: 'Oklahoma', abbr: 'OK', programs: '22 programs' },
  { name: 'Oregon', abbr: 'OR', programs: '54 programs' },
  { name: 'Pennsylvania', abbr: 'PA', programs: '49 programs' },
  { name: 'Rhode Island', abbr: 'RI', programs: '41 programs' },
  { name: 'South Carolina', abbr: 'SC', programs: '26 programs' },
  { name: 'South Dakota', abbr: 'SD', programs: '14 programs' },
  { name: 'Tennessee', abbr: 'TN', programs: '24 programs' },
  { name: 'Texas', abbr: 'TX', href: '/incentives/state/tx', programs: '67 programs' },
  { name: 'Utah', abbr: 'UT', programs: '32 programs' },
  { name: 'Vermont', abbr: 'VT', programs: '46 programs' },
  { name: 'Virginia', abbr: 'VA', programs: '51 programs' },
  { name: 'Washington', abbr: 'WA', programs: '59 programs' },
  { name: 'West Virginia', abbr: 'WV', programs: '19 programs' },
  { name: 'Wisconsin', abbr: 'WI', programs: '43 programs' },
  { name: 'Wyoming', abbr: 'WY', programs: '15 programs' },
];

export default function StateHubPage() {
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

      <IncentiveHeader
        breadcrumbs={[
          { label: 'Incentives', href: '/incentives' },
          { label: 'State Programs' },
        ]}
      />

      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-[1200px] mx-auto px-6 pt-16 pb-12 md:pt-20 md:pb-16">
          <div className="inline-flex items-center rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-[12px] text-teal-700 mb-6">
            <MapPin className="w-3.5 h-3.5 mr-2" />
            All 50 States Covered — Updated Continuously
          </div>
          <h1 className="font-sora text-4xl md:text-5xl lg:text-[52px] font-bold tracking-tight text-deep-900 leading-[1.1] mb-5">
            State Clean Energy Incentive Programs
          </h1>
          <p className="text-lg text-deep-500 mb-8 leading-relaxed max-w-2xl">
            Every US state offers clean energy incentive programs that stack directly on top of federal
            IRA credits. PACE financing, state tax credits, utility rebates, and grant programs —
            stacked together, these programs can double or triple the value of your federal incentives.
          </p>
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-teal-600 text-white text-[14px] font-semibold hover:bg-teal-700 transition-colors"
            >
              Scan Your Project
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/incentives/federal"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg border border-deep-200 text-deep-700 text-[14px] font-semibold hover:bg-deep-50 transition-colors"
            >
              View Federal Credits
            </Link>
          </div>
        </section>

        {/* Federal + State stacking info box */}
        <section className="max-w-[1200px] mx-auto px-6 pb-12">
          <div className="rounded-2xl border border-teal-200 bg-teal-50/60 p-8">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-teal-100 flex-shrink-0">
                <Zap className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <h2 className="font-sora font-bold text-lg text-deep-900 mb-2">
                  Stack with Federal IRA Credits for Maximum Value
                </h2>
                <p className="text-deep-600 text-sm leading-relaxed max-w-3xl">
                  State programs are designed to complement — not replace — federal incentives.
                  A solar project in New York, for example, can combine the federal ITC (30%),
                  NYSERDA NY-Sun incentives, Con Edison rebates, and NY Green Bank low-cost financing.
                  IncentEdge identifies every applicable program and models the combined stack
                  automatically.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured States */}
        <section className="border-y border-deep-100 bg-deep-50/50">
          <div className="max-w-[1200px] mx-auto px-6 py-16">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-teal-600" />
              <span className="text-[11px] font-semibold text-teal-600 uppercase tracking-wider">Featured States</span>
            </div>
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-2">
              Top 5 States by Clean Energy Activity
            </h2>
            <p className="text-deep-500 mb-10 max-w-2xl">
              These states lead the US in incentive program depth, IRA bonus adder eligibility,
              and available program funding.
            </p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredStates.map((state) => (
                <Link
                  key={state.abbr}
                  href={state.href}
                  className="group rounded-xl border border-deep-100 bg-white p-7 hover:shadow-md hover:border-teal-200 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-teal-100 font-sora font-extrabold text-teal-700 text-lg">
                      {state.abbr}
                    </div>
                    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium bg-teal-50 text-teal-700">
                      {state.badge}
                    </span>
                  </div>
                  <h3 className="font-sora font-bold text-lg text-deep-900 mb-1 group-hover:text-teal-700 transition-colors">
                    {state.name}
                  </h3>
                  <div className="text-[12px] font-semibold text-teal-600 mb-2">{state.programs}</div>
                  <p className="text-sm text-deep-500 leading-relaxed mb-5">{state.highlight}</p>
                  <div className="flex items-center gap-1 text-sm font-semibold text-teal-600">
                    Explore programs <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* All 50 States Grid */}
        <section className="max-w-[1200px] mx-auto px-6 py-16 md:py-20">
          <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-2">
            All 50 States
          </h2>
          <p className="text-deep-500 mb-10 max-w-2xl">
            Click any state to explore its incentive programs, or use IncentEdge to automatically
            match all applicable state + federal programs to your project.
          </p>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {allStates.map((state) => {
              const content = (
                <>
                  <div className="font-mono text-[11px] font-bold text-deep-400 mb-1">{state.abbr}</div>
                  <div className="font-sora font-semibold text-[14px] text-deep-900 mb-1 group-hover:text-teal-700 transition-colors leading-snug">
                    {state.name}
                  </div>
                  <div className="text-[11px] text-deep-400">{state.programs}</div>
                </>
              );

              return state.href ? (
                <Link
                  key={state.abbr}
                  href={state.href}
                  className="group rounded-xl border border-deep-100 bg-white px-4 py-4 hover:shadow-md hover:border-teal-200 transition-all"
                >
                  {content}
                </Link>
              ) : (
                <div
                  key={state.abbr}
                  className="group rounded-xl border border-deep-100 bg-white px-4 py-4"
                >
                  {content}
                </div>
              );
            })}
          </div>
          <p className="mt-6 text-sm text-deep-400 text-center">
            Full state landing pages are being published weekly. Use IncentEdge to search all 50 states today.
          </p>
        </section>

        {/* CTA */}
        <section className="max-w-[1200px] mx-auto px-6 pb-20">
          <IncentiveCTA
            headline="Scan Your Project — Get All Matching State + Federal Incentives"
            sub="IncentEdge cross-references your project location, technology, and ownership type against 217,000+ programs and delivers a complete stacked analysis in under 60 seconds."
          />
        </section>
      </main>

      <IncentiveFooter />
    </div>
  );
}
