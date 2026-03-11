import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Code2, BarChart3, Building2, Leaf, Zap, Clock, Database } from 'lucide-react';
import { PublicPageShell } from '@/components/public/PublicPageShell';

export const metadata: Metadata = {
  title: 'IncentEdge Use Cases — Tax Credit Solutions for Every Team',
  description:
    'Discover how developers, finance teams, real estate developers, and clean energy companies use IncentEdge to find and monetize IRA tax credits across 217,000+ programs.',
  alternates: {
    canonical: 'https://incentedge.com/use-cases',
  },
  openGraph: {
    title: 'IncentEdge Use Cases — Tax Credit Solutions for Every Team',
    description:
      'Discover how developers, finance teams, real estate developers, and clean energy companies use IncentEdge to find and monetize IRA tax credits.',
    url: 'https://incentedge.com/use-cases',
    siteName: 'IncentEdge',
    type: 'website',
  },
};

const personaCards = [
  {
    icon: Code2,
    title: 'For Developers',
    subtitle: 'API-First Incentive Intelligence',
    description:
      'REST API with 217,000+ programs. Build incentive calculators, automate compliance checks, and embed credit data directly into your project finance models.',
    href: '/use-cases/developers',
    highlights: ['REST API + Webhooks', 'Real-time JSON data', 'SDKs available'],
    cta: 'View Developer Docs',
    accentColor: 'teal',
  },
  {
    icon: BarChart3,
    title: 'For Finance Teams',
    subtitle: 'Transferable Tax Credit Platform',
    description:
      'Discover, evaluate, and monetize IRA transferable tax credits. The $30B+ transfer market is accessible — automated due diligence, deal flow tracking, portfolio analytics.',
    href: '/use-cases/finance-teams',
    highlights: ['Credit discovery', 'Transfer market access', 'Portfolio analytics'],
    cta: 'Explore Finance Tools',
    accentColor: 'teal',
  },
  {
    icon: Building2,
    title: 'For Real Estate',
    subtitle: 'Multifamily, Commercial, Affordable Housing',
    description:
      '45L, 179D, LIHTC, NMTC, PACE — automated discovery for every real estate project type. A 200-unit mixed-use project in NY can qualify for $4.2M in combined incentives.',
    href: '/use-cases/real-estate',
    highlights: ['45L up to $5,000/unit', '179D up to $5/sq ft', '60-second scan'],
    cta: 'Scan Your Project',
    accentColor: 'teal',
  },
  {
    icon: Leaf,
    title: 'For Clean Energy',
    subtitle: 'Stack Every Available Incentive',
    description:
      'ITC, PTC, 45Q, 45V, 48C with bonus adders stacked automatically. Energy community + domestic content + low-income bonuses can push ITC to 70%. Real-time Treasury guidance alerts.',
    href: '/use-cases/clean-energy',
    highlights: ['Incentive stacking', 'Bonus adder optimizer', 'Policy monitoring'],
    cta: 'Calculate Your Stack',
    accentColor: 'teal',
  },
];

const useCaseSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'IncentEdge',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: 'https://incentedge.com',
  description:
    'AI-powered platform for IRA tax credit discovery, matching, and monetization across 217,000+ programs.',
  offers: {
    '@type': 'Offer',
    price: '299',
    priceCurrency: 'USD',
  },
};

export default function UseCasesPage() {
  return (
    <PublicPageShell breadcrumbs={[{ label: 'Use Cases' }]}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(useCaseSchema) }}
      />

      {/* Hero */}
      <section className="max-w-[1200px] mx-auto px-6 pt-20 pb-12 md:pt-28 md:pb-16">
        <div className="max-w-3xl">
          <div className="inline-flex items-center rounded-full border border-teal-200 dark:border-teal-700 bg-teal-50 dark:bg-teal-900/20 px-4 py-1.5 text-[12px] text-teal-700 dark:text-teal-300 mb-8">
            <Zap className="w-3.5 h-3.5 mr-2" />
            Built for every team that touches incentives
          </div>

          <h1 className="font-sora text-4xl md:text-5xl lg:text-[56px] font-bold tracking-tight text-deep-900 dark:text-white leading-[1.1] mb-6">
            The Right Incentive Intelligence for Your Team
          </h1>

          <p className="text-lg text-deep-500 dark:text-sage-400 mb-10 leading-relaxed max-w-2xl">
            Whether you are a developer building with our API, a finance team monetizing transferable
            credits, or a clean energy company stacking bonus adders — IncentEdge gives you the
            data and tools your workflow needs.
          </p>

          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-teal-600 text-white text-[14px] font-semibold hover:bg-teal-700 transition-colors"
          >
            Start Your Free Scan
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-deep-100 dark:border-deep-800">
        <div className="max-w-[1200px] mx-auto grid gap-0 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-deep-100 dark:divide-deep-800">
          {[
            { icon: Database, value: '217,000+', label: 'Programs', desc: 'Federal, state & local' },
            { icon: BarChart3, value: '$400B+', label: 'IRA Ecosystem', desc: 'Inflation Reduction Act capital' },
            { icon: Clock, value: '100+ Hours', label: 'Saved', desc: 'Per project analyzed' },
          ].map((stat) => (
            <div key={stat.label} className="px-6 py-8 text-center">
              <stat.icon className="w-5 h-5 text-teal-500 mx-auto mb-2" />
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

      {/* Persona Cards Grid */}
      <section className="max-w-[1200px] mx-auto px-6 py-20">
        <div className="grid gap-8 md:grid-cols-2">
          {personaCards.map((card) => (
            <div
              key={card.title}
              className="rounded-xl border border-deep-100 dark:border-deep-800 bg-white dark:bg-deep-900 p-8 hover:border-teal-200 dark:hover:border-teal-700 hover:shadow-lg transition-all group"
            >
              <div className="flex items-start gap-4 mb-5">
                <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-900/30">
                  <card.icon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <h2 className="font-sora font-bold text-xl text-deep-900 dark:text-deep-100">
                    {card.title}
                  </h2>
                  <p className="text-[12px] text-teal-600 dark:text-teal-400 font-medium mt-0.5">
                    {card.subtitle}
                  </p>
                </div>
              </div>

              <p className="text-[14px] text-deep-600 dark:text-sage-400 leading-relaxed mb-6">
                {card.description}
              </p>

              <ul className="space-y-2 mb-7">
                {card.highlights.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-[13px] text-deep-600 dark:text-sage-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                href={card.href}
                className="inline-flex items-center gap-2 text-[13px] font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors group-hover:gap-3"
              >
                {card.cta}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-deep-100 dark:border-deep-800 bg-deep-50/50 dark:bg-deep-900/30">
        <div className="max-w-[1200px] mx-auto px-6 py-20 text-center">
          <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 dark:text-deep-100 mb-4">
            Ready to stop leaving money on the table?
          </h2>
          <p className="text-deep-500 dark:text-sage-400 max-w-xl mx-auto mb-8">
            Join teams that have captured $1B+ in incentives. Get your first results in 60 seconds.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-teal-600 text-white text-[14px] font-semibold hover:bg-teal-700 transition-colors"
            >
              Start Your Free Scan
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
    </PublicPageShell>
  );
}
