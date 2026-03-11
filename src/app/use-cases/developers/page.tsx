import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Code2, Zap, RefreshCw, Webhook, FileJson, Terminal, CheckCircle2 } from 'lucide-react';
import { PublicPageShell } from '@/components/public/PublicPageShell';

export const metadata: Metadata = {
  title: 'IRA Tax Credit API for Developers | IncentEdge',
  description:
    'IncentEdge API gives developers programmatic access to 217,000+ IRA incentive programs. REST API, webhooks, real-time data. Start free.',
  alternates: {
    canonical: 'https://incentedge.com/use-cases/developers',
  },
  openGraph: {
    title: 'IRA Tax Credit API for Developers | IncentEdge',
    description:
      'IncentEdge API gives developers programmatic access to 217,000+ IRA incentive programs. REST API, webhooks, real-time data. Start free.',
    url: 'https://incentedge.com/use-cases/developers',
    siteName: 'IncentEdge',
    type: 'website',
  },
};

const softwareAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'IncentEdge API',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Web',
  url: 'https://incentedge.com/developers',
  description:
    'REST API providing programmatic access to 217,000+ IRA and clean energy incentive programs with webhooks and real-time data.',
  offers: {
    '@type': 'Offer',
    price: '799',
    priceCurrency: 'USD',
  },
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to integrate the IncentEdge API',
  description: 'Get programmatic access to IRA incentive data in three steps.',
  step: [
    {
      '@type': 'HowToStep',
      name: 'Get your API key',
      text: 'Sign up for an IncentEdge Pro or Enterprise account to receive your Bearer token.',
    },
    {
      '@type': 'HowToStep',
      name: 'Make your first call',
      text: 'POST to /v1/programs/match with your project details to retrieve matched incentive programs.',
    },
    {
      '@type': 'HowToStep',
      name: 'Parse the JSON response',
      text: 'The API returns structured JSON with program names, eligibility criteria, estimated values, and deadlines.',
    },
  ],
};

const features = [
  {
    icon: Terminal,
    title: 'REST API',
    description:
      'Full REST API with predictable endpoints, standard HTTP verbs, and JSON responses. Versioned at /v1 for stability.',
  },
  {
    icon: Webhook,
    title: 'Webhooks',
    description:
      'Subscribe to program updates, new incentive launches, and policy changes. Receive push notifications when relevant data changes.',
  },
  {
    icon: RefreshCw,
    title: 'Real-Time Updates',
    description:
      'Data synced from federal, state, and utility sources daily. Stale data alerts built in so your app always shows current eligibility.',
  },
  {
    icon: FileJson,
    title: 'Structured JSON',
    description:
      'Consistent schema across all 217,000+ programs. Amounts, deadlines, eligibility criteria, and application URLs — all machine-readable.',
  },
  {
    icon: Code2,
    title: 'SDKs',
    description:
      'Official JavaScript/TypeScript SDK available. Python and Go SDKs in development. Community-maintained libraries welcome.',
  },
  {
    icon: Zap,
    title: 'Fast Response Times',
    description:
      'Median API response under 200ms. Match endpoint returns ranked results in under 500ms even across 217,000 programs.',
  },
];

const useCases = [
  {
    title: 'Build Incentive Calculators',
    description:
      'Embed real-time incentive data into your project finance models, ROI calculators, and customer-facing tools.',
  },
  {
    title: 'Automate Compliance Tracking',
    description:
      'Subscribe to program changes via webhooks and automatically flag projects that gain or lose eligibility.',
  },
  {
    title: 'Power Project Finance Models',
    description:
      'Fetch matched incentives and their estimated dollar values to populate financial projections automatically.',
  },
];

const sampleCode = `const response = await fetch('https://api.incentedge.com/v1/programs/match', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    projectType: 'solar',
    state: 'NY',
    capacity: 5000,
  }),
});

const { programs, totalValue } = await response.json();

// programs: array of matched incentive objects
// totalValue: estimated combined incentive value in USD
console.log(\`Found \${programs.length} programs worth \${totalValue}\`);`;

export default function UseCasesDevelopersPage() {
  return (
    <PublicPageShell
      breadcrumbs={[
        { label: 'Use Cases', href: '/use-cases' },
        { label: 'For Developers' },
      ]}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      {/* Hero */}
      <section className="max-w-[1200px] mx-auto px-6 pt-20 pb-12 md:pt-28 md:pb-16">
        <div className="max-w-3xl">
          <div className="inline-flex items-center rounded-full border border-teal-200 dark:border-teal-700 bg-teal-50 dark:bg-teal-900/20 px-4 py-1.5 text-[12px] text-teal-700 dark:text-teal-300 mb-8">
            <Terminal className="w-3.5 h-3.5 mr-2" />
            API-first incentive intelligence
          </div>

          <h1 className="font-sora text-4xl md:text-5xl lg:text-[52px] font-bold tracking-tight text-deep-900 dark:text-white leading-[1.1] mb-6">
            Built for Developers Who Build Clean Energy
          </h1>

          <p className="text-lg text-deep-500 dark:text-sage-400 mb-10 leading-relaxed max-w-2xl">
            Programmatic access to 217,000+ IRA incentive programs. REST API, webhooks, real-time
            data, and structured JSON. Integrate incentive intelligence into any product in minutes.
          </p>

          <div className="flex flex-col sm:flex-row items-start gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-teal-600 text-white text-[14px] font-semibold hover:bg-teal-700 transition-colors"
            >
              Start Building Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/developers/api"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg border border-deep-200 dark:border-deep-700 text-deep-700 dark:text-sage-300 text-[14px] font-semibold hover:bg-deep-50 dark:hover:bg-deep-800 transition-colors"
            >
              View API Reference
            </Link>
          </div>
        </div>
      </section>

      {/* Code Snippet */}
      <section className="border-y border-deep-100 dark:border-deep-800 bg-deep-900/5 dark:bg-deep-900/50">
        <div className="max-w-[1200px] mx-auto px-6 py-12">
          <div className="max-w-3xl">
            <p className="text-[12px] font-mono font-medium text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-3">
              Example — Match a solar project in New York
            </p>
            <div className="rounded-xl bg-deep-900 dark:bg-deep-950 border border-deep-800 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-deep-800">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
                <span className="ml-2 text-[11px] font-mono text-sage-600">match-programs.js</span>
              </div>
              <pre className="overflow-x-auto p-6 text-[13px] font-mono leading-relaxed text-sage-300">
                <code>{sampleCode}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-[1200px] mx-auto px-6 py-20">
        <div className="mb-12">
          <h2 className="font-sora text-3xl font-bold text-deep-900 dark:text-deep-100 mb-2">
            Everything You Need to Integrate Incentive Data
          </h2>
          <p className="text-deep-500 dark:text-sage-400 max-w-2xl">
            Purpose-built for developers who want reliable, structured, and fast incentive intelligence.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-deep-100 dark:border-deep-800 bg-white dark:bg-deep-900 p-6"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/30 mb-4">
                <feature.icon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="font-sora font-semibold text-deep-900 dark:text-deep-100 mb-2">
                {feature.title}
              </h3>
              <p className="text-[13px] text-deep-600 dark:text-sage-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Use Cases */}
      <section className="border-t border-deep-100 dark:border-deep-800 bg-deep-50/50 dark:bg-deep-900/30">
        <div className="max-w-[1200px] mx-auto px-6 py-20">
          <div className="mb-12">
            <h2 className="font-sora text-3xl font-bold text-deep-900 dark:text-deep-100 mb-2">
              What You Can Build
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {useCases.map((uc) => (
              <div key={uc.title} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-deep-900 dark:text-deep-100 mb-1">
                    {uc.title}
                  </h3>
                  <p className="text-[13px] text-deep-500 dark:text-sage-400 leading-relaxed">
                    {uc.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Start Links */}
      <section className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="grid gap-4 md:grid-cols-2">
          <Link
            href="/developers"
            className="group flex items-center justify-between p-6 rounded-xl border border-deep-100 dark:border-deep-800 hover:border-teal-200 dark:hover:border-teal-700 hover:shadow-md transition-all"
          >
            <div>
              <div className="font-sora font-semibold text-deep-900 dark:text-deep-100 mb-1">
                Developer Hub
              </div>
              <div className="text-[13px] text-deep-500 dark:text-sage-400">
                Overview, authentication, rate limits, base URL
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-teal-500 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/developers/api"
            className="group flex items-center justify-between p-6 rounded-xl border border-deep-100 dark:border-deep-800 hover:border-teal-200 dark:hover:border-teal-700 hover:shadow-md transition-all"
          >
            <div>
              <div className="font-sora font-semibold text-deep-900 dark:text-deep-100 mb-1">
                API Reference
              </div>
              <div className="text-[13px] text-deep-500 dark:text-sage-400">
                All endpoints, parameters, and response schemas
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-teal-500 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-deep-100 dark:border-deep-800">
        <div className="max-w-[1200px] mx-auto px-6 py-20 text-center">
          <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 dark:text-deep-100 mb-4">
            Start building with 217,000+ incentive programs
          </h2>
          <p className="text-deep-500 dark:text-sage-400 max-w-xl mx-auto mb-8">
            Pro plan includes full API access. 14-day free trial, no credit card required.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-deep-900 dark:bg-teal-600 text-white text-[14px] font-semibold hover:bg-deep-800 dark:hover:bg-teal-500 transition-colors"
          >
            Start Building Free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </PublicPageShell>
  );
}
