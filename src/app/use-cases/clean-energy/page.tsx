import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Leaf, Zap, Bell, CheckCircle2, TrendingUp } from 'lucide-react';
import { PublicPageShell } from '@/components/public/PublicPageShell';

export const metadata: Metadata = {
  title: 'Clean Energy IRA Incentives Platform | IncentEdge',
  description:
    'Maximize your clean energy project\'s incentive stack with IncentEdge. ITC, PTC, 45Q, 45V, 48C and bonus adders — stacked and optimized automatically.',
  alternates: {
    canonical: 'https://incentedge.com/use-cases/clean-energy',
  },
  openGraph: {
    title: 'Clean Energy IRA Incentives Platform | IncentEdge',
    description:
      'Maximize your clean energy project\'s incentive stack with IncentEdge. ITC, PTC, 45Q, 45V, 48C and bonus adders — stacked and optimized automatically.',
    url: 'https://incentedge.com/use-cases/clean-energy',
    siteName: 'IncentEdge',
    type: 'website',
  },
};

const softwareAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'IncentEdge for Clean Energy',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: 'https://incentedge.com',
  description:
    'Incentive stacking platform for clean energy projects. Automatically identifies and combines ITC, PTC, 45Q, 45V, 48C, and bonus adders including energy community, domestic content, and low-income bonuses.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is the energy community bonus adder?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The IRA provides a 10-percentage-point bonus ITC (or 10% PTC multiplier) for projects located in "energy communities" — areas economically impacted by fossil fuel industry decline. This includes brownfield sites, certain MSAs with high fossil fuel employment, and former coal communities.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can ITC and domestic content bonus be stacked?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. The base 30% ITC can be combined with the 10% energy community bonus, 10% domestic content bonus, and 10-20% low-income community bonus. Projects qualifying for all adders can reach 60-70% effective ITC rate.',
      },
    },
    {
      '@type': 'Question',
      name: 'What technologies qualify for the 45V clean hydrogen credit?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Section 45V provides up to $3/kg for clean hydrogen produced with lifecycle GHG intensity below 0.45 kg CO2e per kg H2. Qualifying production pathways include electrolysis with clean power, natural gas with CCS, and nuclear-powered electrolysis.',
      },
    },
  ],
};

const technologies = [
  { name: 'Solar (Utility & Rooftop)', credits: ['ITC 30%+', 'PTC'], icon: '☀' },
  { name: 'Wind (Onshore & Offshore)', credits: ['ITC 30%+', 'PTC'], icon: '💨' },
  { name: 'Battery Storage (Standalone)', credits: ['ITC 30%+'], icon: '⚡' },
  { name: 'Green Hydrogen', credits: ['45V up to $3/kg'], icon: '🔋' },
  { name: 'Carbon Capture (CCS/DAC)', credits: ['45Q up to $180/ton'], icon: '🌿' },
  { name: 'Geothermal', credits: ['ITC 30%+', 'PTC'], icon: '🌋' },
  { name: 'Advanced Manufacturing', credits: ['48C 30%'], icon: '🏭' },
  { name: 'Fuel Cells', credits: ['ITC 30%+', '45V'], icon: '⚗' },
];

const stackingLayers = [
  {
    layer: 'Base ITC',
    value: '30%',
    description: 'All clean energy projects meeting prevailing wage and apprenticeship requirements.',
    color: 'bg-teal-600',
  },
  {
    layer: 'Energy Community Bonus',
    value: '+10%',
    description: 'Project sited in an energy community (coal closure, MSA with fossil fuel employment).',
    color: 'bg-teal-500',
  },
  {
    layer: 'Domestic Content Bonus',
    value: '+10%',
    description: 'Steel, iron, and manufactured products meet US domestic content thresholds.',
    color: 'bg-teal-400',
  },
  {
    layer: 'Low-Income Community Bonus',
    value: '+10-20%',
    description: 'Located in a low-income community or on Tribal land. Allocated via IRS application.',
    color: 'bg-emerald-400',
  },
];

export default function UseCasesCleanEnergyPage() {
  return (
    <PublicPageShell
      breadcrumbs={[
        { label: 'Use Cases', href: '/use-cases' },
        { label: 'For Clean Energy' },
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
            <Leaf className="w-3.5 h-3.5 mr-2" />
            ITC, PTC, 45Q, 45V, 48C and all bonus adders
          </div>

          <h1 className="font-sora text-4xl md:text-5xl lg:text-[52px] font-bold tracking-tight text-deep-900 dark:text-white leading-[1.1] mb-6">
            Stack Every Clean Energy Incentive Available to You
          </h1>

          <p className="text-lg text-deep-500 dark:text-sage-400 mb-10 leading-relaxed max-w-2xl">
            The IRA created a layered incentive system where bonus adders combine with base credits.
            IncentEdge automatically identifies every adder your project qualifies for and calculates
            your maximum incentive stack.
          </p>

          <div className="flex flex-col sm:flex-row items-start gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-teal-600 text-white text-[14px] font-semibold hover:bg-teal-700 transition-colors"
            >
              Calculate Your Incentive Stack
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

      {/* Incentive Stacking Visual */}
      <section className="border-y border-deep-100 dark:border-deep-800 bg-deep-50/50 dark:bg-deep-900/30">
        <div className="max-w-[1200px] mx-auto px-6 py-16">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8 text-center">
              <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-2">
                How Incentive Stacking Works
              </h2>
              <p className="text-deep-500 dark:text-sage-400 text-[14px]">
                A qualifying solar project can reach up to 70% effective ITC rate
              </p>
            </div>

            <div className="space-y-3">
              {stackingLayers.map((layer, i) => (
                <div
                  key={layer.layer}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-deep-900 border border-deep-100 dark:border-deep-800"
                >
                  <div
                    className={`flex items-center justify-center w-14 h-10 rounded-lg ${layer.color} text-white font-mono font-bold text-sm flex-shrink-0`}
                  >
                    {layer.value}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[13px] text-deep-900 dark:text-deep-100">
                      {layer.layer}
                    </div>
                    <div className="text-[12px] text-deep-500 dark:text-sage-400 truncate">
                      {layer.description}
                    </div>
                  </div>
                  <div className="text-[11px] text-teal-600 dark:text-teal-400 font-mono font-medium flex-shrink-0">
                    Layer {i + 1}
                  </div>
                </div>
              ))}

              {/* Total */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-teal-600 text-white mt-2">
                <div className="font-sora font-bold text-base">Maximum Stack (All Adders)</div>
                <div className="font-mono font-bold text-2xl">Up to 70%</div>
              </div>
            </div>

            <p className="text-[11px] text-deep-400 dark:text-sage-600 text-center mt-4">
              Actual eligibility depends on project location, technology, and IRS annual allocations. IncentEdge provides personalized analysis.
            </p>
          </div>
        </div>
      </section>

      {/* Technologies Grid */}
      <section className="max-w-[1200px] mx-auto px-6 py-20">
        <div className="mb-12">
          <h2 className="font-sora text-3xl font-bold text-deep-900 dark:text-deep-100 mb-2">
            Technologies Covered
          </h2>
          <p className="text-deep-500 dark:text-sage-400 max-w-2xl">
            IncentEdge covers all major clean energy technologies eligible under the IRA.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {technologies.map((tech) => (
            <div
              key={tech.name}
              className="rounded-xl border border-deep-100 dark:border-deep-800 bg-white dark:bg-deep-900 p-5 hover:border-teal-200 dark:hover:border-teal-700 transition-colors"
            >
              <div className="text-2xl mb-3">{tech.icon}</div>
              <h3 className="font-semibold text-[14px] text-deep-900 dark:text-deep-100 mb-2">
                {tech.name}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {tech.credits.map((credit) => (
                  <span
                    key={credit}
                    className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 border border-teal-100 dark:border-teal-800"
                  >
                    {credit}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Policy Monitoring */}
      <section className="border-t border-deep-100 dark:border-deep-800 bg-deep-50/50 dark:bg-deep-900/30">
        <div className="max-w-[1200px] mx-auto px-6 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-[12px] font-semibold text-teal-600 dark:text-teal-400 mb-4 uppercase tracking-wider">
                <Bell className="w-4 h-4" />
                Policy Monitoring
              </div>
              <h2 className="font-sora text-3xl font-bold text-deep-900 dark:text-deep-100 mb-4">
                Stay ahead of Treasury guidance changes
              </h2>
              <p className="text-deep-600 dark:text-sage-400 leading-relaxed mb-6">
                IRA implementation is ongoing. Treasury guidance, IRS notices, and bonus adder
                allocations change throughout the year. IncentEdge monitors all federal guidance
                and alerts you when changes affect your project's eligibility or credit value.
              </p>
              <ul className="space-y-3">
                {[
                  'Real-time Treasury guidance alerts',
                  'Annual bonus adder allocation tracking',
                  'Prevailing wage rule updates',
                  'New program launches flagged automatically',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-[14px] text-deep-700 dark:text-deep-200">
                    <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-deep-100 dark:border-deep-800 bg-white dark:bg-deep-900 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/30">
                  <TrendingUp className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <div className="font-sora font-semibold text-deep-900 dark:text-deep-100">
                    Bonus Adder Calculator
                  </div>
                  <div className="text-[12px] text-deep-500 dark:text-sage-500">
                    Estimate your maximum incentive rate
                  </div>
                </div>
              </div>
              <div className="space-y-3 mb-5">
                {[
                  { label: 'Base ITC Rate', value: '30%', checked: true },
                  { label: 'Energy Community', value: '+10%', checked: true },
                  { label: 'Domestic Content', value: '+10%', checked: false },
                  { label: 'Low-Income Bonus', value: '+20%', checked: false },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-2 border-b border-deep-100 dark:border-deep-800">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded border ${row.checked ? 'bg-teal-500 border-teal-500' : 'border-deep-300 dark:border-deep-600'} flex items-center justify-center`}
                      >
                        {row.checked && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-[13px] text-deep-700 dark:text-deep-200">{row.label}</span>
                    </div>
                    <span className="font-mono font-semibold text-teal-600 dark:text-teal-400 text-[13px]">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800">
                <span className="font-semibold text-deep-900 dark:text-deep-100 text-[13px]">Current Stack</span>
                <span className="font-mono font-bold text-teal-600 dark:text-teal-400 text-lg">40%</span>
              </div>
              <Link
                href="/signup"
                className="block w-full mt-4 text-center py-2.5 rounded-lg bg-teal-600 text-white text-[13px] font-semibold hover:bg-teal-700 transition-colors"
              >
                Run Full Analysis
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-deep-100 dark:border-deep-800">
        <div className="max-w-[1200px] mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center rounded-full border border-teal-200 dark:border-teal-700 bg-teal-50 dark:bg-teal-900/20 px-4 py-1.5 text-[12px] text-teal-700 dark:text-teal-300 mb-6">
            <Zap className="w-3.5 h-3.5 mr-2" />
            Results in 60 seconds
          </div>
          <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 dark:text-deep-100 mb-4">
            Calculate your full clean energy incentive stack
          </h2>
          <p className="text-deep-500 dark:text-sage-400 max-w-xl mx-auto mb-8">
            Enter your project details and IncentEdge will identify every applicable credit,
            bonus adder, and state program — and calculate the combined incentive value.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-deep-900 dark:bg-teal-600 text-white text-[14px] font-semibold hover:bg-deep-800 dark:hover:bg-teal-500 transition-colors"
          >
            Calculate Your Incentive Stack
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </PublicPageShell>
  );
}
