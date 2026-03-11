import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BarChart3, Search, FileCheck, TrendingUp, Clock, DollarSign, CheckCircle2 } from 'lucide-react';
import { PublicPageShell } from '@/components/public/PublicPageShell';

export const metadata: Metadata = {
  title: 'Transferable Tax Credit Platform for Finance Teams | IncentEdge',
  description:
    'IncentEdge helps finance teams discover, evaluate, and monetize IRA transferable tax credits. Automated due diligence, deal flow tracking, portfolio analytics.',
  alternates: {
    canonical: 'https://incentedge.com/use-cases/finance-teams',
  },
  openGraph: {
    title: 'Transferable Tax Credit Platform for Finance Teams | IncentEdge',
    description:
      'IncentEdge helps finance teams discover, evaluate, and monetize IRA transferable tax credits. Automated due diligence, deal flow tracking, portfolio analytics.',
    url: 'https://incentedge.com/use-cases/finance-teams',
    siteName: 'IncentEdge',
    type: 'website',
  },
};

const softwareAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'IncentEdge for Finance Teams',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  url: 'https://incentedge.com',
  description:
    'Transferable tax credit discovery, due diligence automation, and portfolio analytics for finance teams working in the $30B+ IRA credit market.',
  offers: {
    '@type': 'Offer',
    price: '799',
    priceCurrency: 'USD',
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What IRA credits can be transferred?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The Inflation Reduction Act allows transfer of ITC (Investment Tax Credit), PTC (Production Tax Credit), 45Q (carbon capture), 45V (clean hydrogen), 48C (advanced manufacturing), and several other credits to unrelated third parties for cash consideration.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does IncentEdge help with due diligence?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'IncentEdge automates eligibility screening, cross-references project data against program requirements, flags recapture risk, and generates structured due diligence reports — reducing manual review from weeks to hours.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the typical time-to-close for a tax credit transfer?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'IncentEdge clients report an average of 45 days from credit identification to close, compared to 90+ days using traditional advisors.',
      },
    },
  ],
};

const features = [
  {
    icon: Search,
    title: 'Credit Discovery',
    description: 'AI-powered screening across 217,000+ programs to surface transferable credits matching your investment criteria.',
  },
  {
    icon: TrendingUp,
    title: 'Transfer Market Access',
    description: 'Connect with verified credit sellers. Track market pricing, discount rates, and deal flow in one dashboard.',
  },
  {
    icon: FileCheck,
    title: 'Due Diligence Automation',
    description: 'Automated eligibility verification, recapture risk scoring, and structured DD reports. Weeks of work in hours.',
  },
  {
    icon: BarChart3,
    title: 'Portfolio Analytics',
    description: 'Track your tax credit portfolio value, exposure, and performance. Generate investor-ready reports in seconds.',
  },
];

const supportedCredits = [
  { code: 'ITC', name: 'Investment Tax Credit', section: 'Sec. 48' },
  { code: 'PTC', name: 'Production Tax Credit', section: 'Sec. 45' },
  { code: '45Q', name: 'Carbon Capture Credit', section: 'Sec. 45Q' },
  { code: '45V', name: 'Clean Hydrogen Credit', section: 'Sec. 45V' },
  { code: '48C', name: 'Advanced Manufacturing', section: 'Sec. 48C' },
];

const workflowSteps = [
  { step: '01', title: 'Discovery', description: 'AI scans project data and surfaces matched transferable credits across all eligible programs.' },
  { step: '02', title: 'Eligibility', description: 'Automated verification against IRS requirements, Treasury guidance, and bonus adder rules.' },
  { step: '03', title: 'Valuation', description: 'Market-rate pricing models based on credit type, project vintage, and transfer discount rates.' },
  { step: '04', title: 'Transfer', description: 'Structured deal documentation, counterparty matching, and closing workflow tools.' },
];

export default function UseCasesFinanceTeamsPage() {
  return (
    <PublicPageShell
      breadcrumbs={[
        { label: 'Use Cases', href: '/use-cases' },
        { label: 'For Finance Teams' },
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
            <DollarSign className="w-3.5 h-3.5 mr-2" />
            $30B+ transferable tax credit market
          </div>

          <h1 className="font-sora text-4xl md:text-5xl lg:text-[52px] font-bold tracking-tight text-deep-900 dark:text-white leading-[1.1] mb-6">
            Turn IRA Tax Credits Into Monetizable Assets
          </h1>

          <p className="text-lg text-deep-500 dark:text-sage-400 mb-6 leading-relaxed max-w-2xl">
            The transferable tax credit market is $30B+. Your team needs a platform to compete. IncentEdge
            automates discovery, due diligence, and deal flow for finance teams working in the IRA credit ecosystem.
          </p>

          <div className="flex flex-col sm:flex-row items-start gap-4">
            <Link
              href="/signup?type=enterprise"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-teal-600 text-white text-[14px] font-semibold hover:bg-teal-700 transition-colors"
            >
              Schedule a Demo
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

      {/* Stats */}
      <section className="border-y border-deep-100 dark:border-deep-800">
        <div className="max-w-[1200px] mx-auto grid gap-0 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-deep-100 dark:divide-deep-800">
          {[
            { value: '$4.2M', label: 'Avg Credit Value', desc: 'Per project analyzed' },
            { value: '45 Days', label: 'Avg Time-to-Close', desc: 'From discovery to transfer' },
            { value: '$30B+', label: 'Market Size', desc: 'Annual IRA transfer market' },
          ].map((stat) => (
            <div key={stat.label} className="px-6 py-8 text-center">
              <div className="font-mono text-2xl font-bold text-deep-900 dark:text-white">
                {stat.value}
              </div>
              <div className="text-xs font-semibold text-deep-500 dark:text-sage-400 mt-1 uppercase tracking-wider">
                {stat.label}
              </div>
              <div className="text-xs text-sage-500 mt-0.5">{stat.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-[1200px] mx-auto px-6 py-20">
        <div className="mb-12">
          <h2 className="font-sora text-3xl font-bold text-deep-900 dark:text-deep-100 mb-2">
            Platform Features
          </h2>
          <p className="text-deep-500 dark:text-sage-400 max-w-2xl">
            Built for finance teams that need precision, speed, and auditability.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex items-start gap-4 p-6 rounded-xl border border-deep-100 dark:border-deep-800 bg-white dark:bg-deep-900"
            >
              <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/30">
                <feature.icon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <h3 className="font-sora font-semibold text-deep-900 dark:text-deep-100 mb-1">
                  {feature.title}
                </h3>
                <p className="text-[13px] text-deep-600 dark:text-sage-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section className="border-t border-deep-100 dark:border-deep-800 bg-deep-50/50 dark:bg-deep-900/30">
        <div className="max-w-[1200px] mx-auto px-6 py-20">
          <div className="mb-12">
            <h2 className="font-sora text-3xl font-bold text-deep-900 dark:text-deep-100 mb-2">
              The Transfer Workflow
            </h2>
            <p className="text-deep-500 dark:text-sage-400">
              From identification to closing — IncentEdge covers the full lifecycle.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            {workflowSteps.map((step, i) => (
              <div key={step.step} className="relative">
                {i < workflowSteps.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-full w-full h-0.5 bg-teal-100 dark:bg-teal-900/30 z-0" />
                )}
                <div className="relative z-10">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-teal-600 text-white font-mono font-bold text-sm mb-4">
                    {step.step}
                  </div>
                  <h3 className="font-sora font-semibold text-deep-900 dark:text-deep-100 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-[13px] text-deep-500 dark:text-sage-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Credits */}
      <section className="max-w-[1200px] mx-auto px-6 py-20">
        <div className="mb-8">
          <h2 className="font-sora text-3xl font-bold text-deep-900 dark:text-deep-100 mb-2">
            Supported Transferable Credits
          </h2>
          <p className="text-deep-500 dark:text-sage-400">
            All major IRA credits eligible for transfer under IRC Section 6418.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {supportedCredits.map((credit) => (
            <div
              key={credit.code}
              className="flex items-center gap-3 p-4 rounded-xl border border-deep-100 dark:border-deep-800 bg-white dark:bg-deep-900"
            >
              <CheckCircle2 className="w-5 h-5 text-teal-500 flex-shrink-0" />
              <div>
                <div className="font-mono font-semibold text-teal-600 dark:text-teal-400 text-sm">
                  {credit.code}
                </div>
                <div className="text-[13px] text-deep-700 dark:text-deep-200">{credit.name}</div>
                <div className="text-[11px] text-deep-400 dark:text-sage-600">{credit.section}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-deep-100 dark:border-deep-800 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20">
        <div className="max-w-[1200px] mx-auto px-6 py-20 text-center">
          <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 dark:text-deep-100 mb-4">
            Ready to compete in the transferable credit market?
          </h2>
          <p className="text-deep-500 dark:text-sage-400 max-w-xl mx-auto mb-8">
            Enterprise plans include dedicated onboarding, custom deal workflows, and a relationship manager.
          </p>
          <Link
            href="/signup?type=enterprise"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-teal-600 text-white text-[14px] font-semibold hover:bg-teal-700 transition-colors"
          >
            Schedule a Demo
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </PublicPageShell>
  );
}
