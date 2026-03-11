import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Building2, Zap, Clock, CheckCircle2, DollarSign } from 'lucide-react';
import { PublicPageShell } from '@/components/public/PublicPageShell';

export const metadata: Metadata = {
  title: 'IRA Tax Credits for Real Estate Developers | IncentEdge',
  description:
    'Discover 45L, 179D, LIHTC, NMTC, and PACE incentives for your real estate projects. IncentEdge automates incentive discovery for multifamily, commercial, and mixed-use.',
  alternates: {
    canonical: 'https://incentedge.com/use-cases/real-estate',
  },
  openGraph: {
    title: 'IRA Tax Credits for Real Estate Developers | IncentEdge',
    description:
      'Discover 45L, 179D, LIHTC, NMTC, and PACE incentives for your real estate projects. IncentEdge automates incentive discovery for multifamily, commercial, and mixed-use.',
    url: 'https://incentedge.com/use-cases/real-estate',
    siteName: 'IncentEdge',
    type: 'website',
  },
};

const softwareAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'IncentEdge for Real Estate',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: 'https://incentedge.com',
  description:
    'Automated incentive discovery for real estate developers covering 45L, 179D, LIHTC, NMTC, PACE, and 30%+ ITC across multifamily, commercial, and mixed-use projects.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is the 45L tax credit for real estate?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Section 45L provides up to $5,000 per unit for new energy efficient residential properties. Multifamily and single-family projects meeting Energy Star criteria qualify. The IRA extended and expanded this credit through 2032.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the 179D deduction for commercial real estate?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Section 179D provides up to $5.00 per square foot deduction for energy-efficient commercial buildings. Qualifying requires meeting ASHRAE energy efficiency standards. The IRA increased the cap from $1.88 to $5.00/sq ft for projects meeting prevailing wage requirements.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can a real estate project stack multiple incentives?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. A mixed-use project can simultaneously claim 45L (per unit for residential portion), 179D (for commercial portion), ITC (if solar is installed), LIHTC (if affordable units are included), and state/local programs. IncentEdge identifies and quantifies all eligible stacking opportunities.',
      },
    },
  ],
};

const topCredits = [
  {
    code: '45L',
    name: 'New Energy Efficient Home Credit',
    value: 'Up to $5,000/unit',
    description: 'For new multifamily and single-family residential projects meeting Energy Star standards.',
    section: 'IRC Sec. 45L',
  },
  {
    code: '179D',
    name: 'Energy Efficient Commercial Buildings',
    value: 'Up to $5/sq ft',
    description: 'Deduction for energy-efficient commercial buildings. IRA expanded cap with prevailing wage requirements.',
    section: 'IRC Sec. 179D',
  },
  {
    code: 'ITC',
    name: 'Investment Tax Credit',
    value: '30%+ of cost',
    description: 'For solar, battery storage, and EV charging installed at the property. Stackable with bonus adders.',
    section: 'IRC Sec. 48',
  },
  {
    code: 'LIHTC',
    name: 'Low-Income Housing Tax Credit',
    value: 'Up to 9% of cost',
    description: 'Federal credit for affordable housing developments. 4% and 9% credit rates available.',
    section: 'IRC Sec. 42',
  },
  {
    code: 'NMTC',
    name: 'New Markets Tax Credit',
    value: '39% over 7 years',
    description: 'For projects in designated low-income community census tracts. Combines with other credits.',
    section: 'IRC Sec. 45D',
  },
  {
    code: 'PACE',
    name: 'Property Assessed Clean Energy',
    value: '100% financing',
    description: 'Off-balance-sheet financing for energy improvements, repaid through property tax assessments.',
    section: 'State programs',
  },
];

const projectTypes = [
  {
    title: 'Multifamily',
    description: '45L + LIHTC + ITC stacking common for affordable multifamily. Up to $8,000/unit possible.',
    credits: ['45L', 'LIHTC', 'ITC', 'PACE'],
  },
  {
    title: 'Commercial',
    description: '179D deduction plus ITC for solar and storage. Bonus adders for energy communities.',
    credits: ['179D', 'ITC', 'NMTC', 'PACE'],
  },
  {
    title: 'Mixed-Use',
    description: 'Residential and commercial portions both qualify. Stack all applicable programs.',
    credits: ['45L', '179D', 'ITC', 'NMTC'],
  },
  {
    title: 'Affordable Housing',
    description: 'LIHTC + 45L + NMTC often combine for maximum incentive stack in underserved markets.',
    credits: ['LIHTC', '45L', 'NMTC', 'PACE'],
  },
];

export default function UseCasesRealEstatePage() {
  return (
    <PublicPageShell
      breadcrumbs={[
        { label: 'Use Cases', href: '/use-cases' },
        { label: 'For Real Estate' },
      ]}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Hero */}
      <section className="max-w-[1200px] mx-auto px-6 pt-20 pb-12 md:pt-28 md:pb-16">
        <div className="max-w-3xl">
          <div className="inline-flex items-center rounded-full border border-teal-200 dark:border-teal-700 bg-teal-50 dark:bg-teal-900/20 px-4 py-1.5 text-[12px] text-teal-700 dark:text-teal-300 mb-8">
            <Building2 className="w-3.5 h-3.5 mr-2" />
            Multifamily, commercial, and mixed-use
          </div>

          <h1 className="font-sora text-4xl md:text-5xl lg:text-[52px] font-bold tracking-tight text-deep-900 dark:text-white leading-[1.1] mb-6">
            Unlock Every Dollar of Incentives in Your Real Estate Project
          </h1>

          <p className="text-lg text-deep-500 dark:text-sage-400 mb-10 leading-relaxed max-w-2xl">
            45L, 179D, LIHTC, NMTC, PACE, ITC — IncentEdge identifies every applicable program
            for your specific project type, location, and design in under 60 seconds.
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
              href="/pricing"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg border border-deep-200 dark:border-deep-700 text-deep-700 dark:text-sage-300 text-[14px] font-semibold hover:bg-deep-50 dark:hover:bg-deep-800 transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Example Result Banner */}
      <section className="border-y border-teal-100 dark:border-teal-900/30 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20">
        <div className="max-w-[1200px] mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-teal-600 text-white flex-shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-teal-700 dark:text-teal-300 uppercase tracking-wider mb-0.5">
                Example Result
              </p>
              <p className="text-deep-900 dark:text-deep-100 font-medium">
                A 200-unit mixed-use project in New York qualifies for{' '}
                <span className="text-teal-600 dark:text-teal-400 font-bold">$4.2M in combined incentives</span>
                {' '}— including 45L, ITC, and state energy programs.
              </p>
            </div>
            <div className="flex items-center gap-2 md:ml-auto flex-shrink-0">
              <Clock className="w-4 h-4 text-teal-500" />
              <span className="text-[12px] text-teal-700 dark:text-teal-300 font-medium">Found in 60 seconds</span>
            </div>
          </div>
        </div>
      </section>

      {/* Top Credits Grid */}
      <section className="max-w-[1200px] mx-auto px-6 py-20">
        <div className="mb-12">
          <h2 className="font-sora text-3xl font-bold text-deep-900 dark:text-deep-100 mb-2">
            Top Credits for Real Estate Projects
          </h2>
          <p className="text-deep-500 dark:text-sage-400 max-w-2xl">
            Federal and state programs most commonly available to real estate developers.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {topCredits.map((credit) => (
            <div
              key={credit.code}
              className="rounded-xl border border-deep-100 dark:border-deep-800 bg-white dark:bg-deep-900 p-6 hover:border-teal-200 dark:hover:border-teal-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300">
                  {credit.code}
                </span>
                <span className="text-[11px] text-deep-400 dark:text-sage-600 font-mono">
                  {credit.section}
                </span>
              </div>
              <h3 className="font-sora font-semibold text-deep-900 dark:text-deep-100 mb-1 text-[15px]">
                {credit.name}
              </h3>
              <div className="font-mono font-bold text-teal-600 dark:text-teal-400 text-sm mb-3">
                {credit.value}
              </div>
              <p className="text-[12px] text-deep-500 dark:text-sage-500 leading-relaxed">
                {credit.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Project Types */}
      <section className="border-t border-deep-100 dark:border-deep-800 bg-deep-50/50 dark:bg-deep-900/30">
        <div className="max-w-[1200px] mx-auto px-6 py-20">
          <div className="mb-12">
            <h2 className="font-sora text-3xl font-bold text-deep-900 dark:text-deep-100 mb-2">
              Supported Project Types
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {projectTypes.map((type) => (
              <div
                key={type.title}
                className="rounded-xl border border-deep-100 dark:border-deep-800 bg-white dark:bg-deep-900 p-6"
              >
                <h3 className="font-sora font-semibold text-deep-900 dark:text-deep-100 text-lg mb-2">
                  {type.title}
                </h3>
                <p className="text-[13px] text-deep-500 dark:text-sage-400 leading-relaxed mb-4">
                  {type.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {type.credits.map((credit) => (
                    <span
                      key={credit}
                      className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 border border-teal-100 dark:border-teal-800"
                    >
                      {credit}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 60-Second Scan Feature */}
      <section className="max-w-[1200px] mx-auto px-6 py-20">
        <div className="rounded-2xl border border-teal-100 dark:border-teal-800 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 p-10 md:p-14">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-[12px] font-semibold text-teal-600 dark:text-teal-400 mb-4 uppercase tracking-wider">
              <Zap className="w-4 h-4" />
              60-Second Scan
            </div>
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 dark:text-deep-100 mb-4">
              Results before your coffee gets cold
            </h2>
            <p className="text-deep-600 dark:text-sage-400 mb-6 leading-relaxed">
              Enter your project type, state, size, and energy features. IncentEdge cross-references
              217,000+ federal, state, and local programs and returns a ranked list of applicable incentives
              with eligibility criteria and estimated values.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                'No consultants needed',
                'Ranked by estimated dollar value',
                'Eligibility criteria included',
                'Application deadlines flagged',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-[14px] text-deep-700 dark:text-deep-200">
                  <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-teal-600 text-white text-[14px] font-semibold hover:bg-teal-700 transition-colors"
            >
              Scan Your Project Free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </PublicPageShell>
  );
}
