import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Terminal, Webhook, BookOpen, Code2, Shield, Zap } from 'lucide-react';
import { PublicPageShell } from '@/components/public/PublicPageShell';

export const metadata: Metadata = {
  title: 'IncentEdge Developer Hub — API & Integration Docs',
  description:
    'Build with the IncentEdge API. REST endpoints for incentive discovery, program matching, and compliance. 99.9% uptime, real-time data.',
  alternates: {
    canonical: 'https://incentedge.com/developers',
  },
  openGraph: {
    title: 'IncentEdge Developer Hub — API & Integration Docs',
    description:
      'Build with the IncentEdge API. REST endpoints for incentive discovery, program matching, and compliance. 99.9% uptime, real-time data.',
    url: 'https://incentedge.com/developers',
    siteName: 'IncentEdge',
    type: 'website',
  },
};

const techArticleSchema = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'IncentEdge Developer Hub — API & Integration Docs',
  description:
    'Complete developer documentation for the IncentEdge REST API. Authentication, rate limits, endpoints, and code examples.',
  url: 'https://incentedge.com/developers',
  publisher: {
    '@type': 'Organization',
    name: 'IncentEdge',
    url: 'https://incentedge.com',
  },
};

const hubCards = [
  {
    icon: BookOpen,
    title: 'Quick Start Guide',
    description: 'Get your API key and make your first call in under 5 minutes.',
    href: '/developers/quickstart',
    cta: 'Start Here',
  },
  {
    icon: Terminal,
    title: 'API Reference',
    description: 'Complete endpoint documentation with request/response examples.',
    href: '/developers/api',
    cta: 'View Reference',
  },
  {
    icon: Webhook,
    title: 'Webhooks',
    description: 'Subscribe to program updates, eligibility changes, and new program launches.',
    href: '/developers/api#webhooks',
    cta: 'Learn More',
  },
  {
    icon: Code2,
    title: 'SDKs',
    description: 'Official JavaScript/TypeScript SDK available. Python and Go coming soon.',
    href: '/developers/quickstart#sdks',
    cta: 'Coming Soon',
    comingSoon: true,
  },
];

const rateLimits = [
  { plan: 'Starter', limit: '500 req/min', concurrent: '10' },
  { plan: 'Pro', limit: '5,000 req/min', concurrent: '50' },
  { plan: 'Enterprise', limit: 'Unlimited', concurrent: 'Unlimited' },
];

const quickStartCode = `curl -X POST https://api.incentedge.com/v1/programs/match \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "projectType": "solar",
    "state": "NY",
    "capacity": 5000
  }'`;

export default function DevelopersPage() {
  return (
    <PublicPageShell breadcrumbs={[{ label: 'Developer Hub' }]}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(techArticleSchema) }}
      />

      {/* Hero */}
      <section className="max-w-[1200px] mx-auto px-6 pt-20 pb-12 md:pt-28 md:pb-16">
        <div className="max-w-3xl">
          <div className="inline-flex items-center rounded-full border border-teal-200 dark:border-teal-700 bg-teal-50 dark:bg-teal-900/20 px-4 py-1.5 text-[12px] text-teal-700 dark:text-teal-300 mb-8">
            <Terminal className="w-3.5 h-3.5 mr-2" />
            REST API — 99.9% uptime — Real-time data
          </div>

          <h1 className="font-sora text-4xl md:text-5xl lg:text-[52px] font-bold tracking-tight text-deep-900 dark:text-white leading-[1.1] mb-6">
            IncentEdge Developer Hub
          </h1>

          <p className="text-lg text-deep-500 dark:text-sage-400 mb-6 leading-relaxed max-w-2xl">
            Programmatic access to 217,000+ IRA incentive programs. Build incentive calculators,
            automate compliance, and embed clean energy credit data into any product.
          </p>

          <div className="flex items-center gap-3 mb-10">
            <div className="font-mono text-[13px] px-3 py-1.5 rounded-lg bg-deep-900 dark:bg-deep-800 text-teal-400 border border-deep-700">
              Base URL:
            </div>
            <code className="font-mono text-[13px] text-deep-700 dark:text-sage-300">
              https://api.incentedge.com/v1
            </code>
          </div>

          <div className="flex flex-col sm:flex-row items-start gap-4">
            <Link
              href="/developers/quickstart"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-teal-600 text-white text-[14px] font-semibold hover:bg-teal-700 transition-colors"
            >
              Quick Start Guide
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg border border-deep-200 dark:border-deep-700 text-deep-700 dark:text-sage-300 text-[14px] font-semibold hover:bg-deep-50 dark:hover:bg-deep-800 transition-colors"
            >
              Get API Key
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Start Overview */}
      <section className="border-y border-deep-100 dark:border-deep-800 bg-deep-50/50 dark:bg-deep-900/30">
        <div className="max-w-[1200px] mx-auto px-6 py-12">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-6">
                Three Steps to Your First Result
              </h2>
              <ol className="space-y-5">
                {[
                  { step: '1', title: 'Get your API key', desc: 'Sign up and copy your Bearer token from the dashboard.' },
                  { step: '2', title: 'Make your first call', desc: 'POST to /v1/programs/match with project type, state, and capacity.' },
                  { step: '3', title: 'Parse the response', desc: 'Receive a ranked JSON array of matching programs with estimated values.' },
                ].map((item) => (
                  <li key={item.step} className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-teal-600 text-white font-mono font-bold text-sm flex-shrink-0 mt-0.5">
                      {item.step}
                    </div>
                    <div>
                      <div className="font-semibold text-deep-900 dark:text-deep-100 mb-0.5">
                        {item.title}
                      </div>
                      <div className="text-[13px] text-deep-500 dark:text-sage-400">{item.desc}</div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div>
              <div className="rounded-xl bg-deep-900 dark:bg-deep-950 border border-deep-800 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-deep-800">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  <span className="ml-2 text-[11px] font-mono text-sage-600">curl</span>
                </div>
                <pre className="overflow-x-auto p-5 text-[12px] font-mono leading-relaxed text-sage-300">
                  <code>{quickStartCode}</code>
                </pre>
              </div>
              <p className="text-[12px] text-deep-400 dark:text-sage-600 mt-3">
                Returns matched programs with eligibility criteria, estimated values, and application links.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Hub Cards */}
      <section className="max-w-[1200px] mx-auto px-6 py-20">
        <div className="mb-10">
          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100">
            Documentation
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {hubCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className={`group flex items-start gap-4 p-6 rounded-xl border bg-white dark:bg-deep-900 transition-all ${
                card.comingSoon
                  ? 'border-deep-100 dark:border-deep-800 opacity-60 cursor-not-allowed pointer-events-none'
                  : 'border-deep-100 dark:border-deep-800 hover:border-teal-200 dark:hover:border-teal-700 hover:shadow-md'
              }`}
            >
              <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/30">
                <card.icon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-sora font-semibold text-deep-900 dark:text-deep-100">
                    {card.title}
                  </h3>
                  {card.comingSoon && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sage-100 dark:bg-deep-800 text-sage-500 dark:text-sage-500">
                      Soon
                    </span>
                  )}
                </div>
                <p className="text-[13px] text-deep-500 dark:text-sage-400 leading-relaxed mb-3">
                  {card.description}
                </p>
                {!card.comingSoon && (
                  <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-teal-600 dark:text-teal-400 group-hover:gap-2.5 transition-all">
                    {card.cta}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Authentication */}
      <section className="border-t border-deep-100 dark:border-deep-800 bg-deep-50/50 dark:bg-deep-900/30">
        <div className="max-w-[1200px] mx-auto px-6 py-16">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/30">
                  <Shield className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                </div>
                <h2 className="font-sora text-xl font-bold text-deep-900 dark:text-deep-100">
                  Authentication
                </h2>
              </div>
              <p className="text-[14px] text-deep-600 dark:text-sage-400 leading-relaxed mb-4">
                All API requests require a Bearer token in the{' '}
                <code className="font-mono text-[12px] bg-deep-100 dark:bg-deep-800 px-1.5 py-0.5 rounded text-teal-600 dark:text-teal-400">
                  Authorization
                </code>{' '}
                header. Generate your token from the{' '}
                <Link href="/signup" className="text-teal-600 dark:text-teal-400 hover:underline">
                  dashboard
                </Link>{' '}
                after creating an account.
              </p>
              <div className="rounded-lg bg-deep-900 border border-deep-800 p-4 font-mono text-[12px] text-sage-300 overflow-x-auto">
                <div className="text-sage-600 mb-1"># All requests</div>
                <div>Authorization: Bearer {'<YOUR_API_KEY>'}</div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/30">
                  <Zap className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                </div>
                <h2 className="font-sora text-xl font-bold text-deep-900 dark:text-deep-100">
                  Rate Limits
                </h2>
              </div>
              <div className="overflow-hidden rounded-xl border border-deep-100 dark:border-deep-800">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-deep-100 dark:border-deep-800 bg-deep-50 dark:bg-deep-900">
                      <th className="text-left px-4 py-3 font-semibold text-deep-700 dark:text-deep-200">Plan</th>
                      <th className="text-left px-4 py-3 font-semibold text-deep-700 dark:text-deep-200">Requests/Min</th>
                      <th className="text-left px-4 py-3 font-semibold text-deep-700 dark:text-deep-200">Concurrent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rateLimits.map((row, i) => (
                      <tr
                        key={row.plan}
                        className={`${i < rateLimits.length - 1 ? 'border-b border-deep-100 dark:border-deep-800' : ''} bg-white dark:bg-deep-900`}
                      >
                        <td className="px-4 py-3 font-medium text-deep-900 dark:text-deep-100">{row.plan}</td>
                        <td className="px-4 py-3 font-mono text-teal-600 dark:text-teal-400">{row.limit}</td>
                        <td className="px-4 py-3 font-mono text-teal-600 dark:text-teal-400">{row.concurrent}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-deep-100 dark:border-deep-800">
        <div className="max-w-[1200px] mx-auto px-6 py-16 text-center">
          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-4">
            Ready to start building?
          </h2>
          <p className="text-deep-500 dark:text-sage-400 mb-8 max-w-lg mx-auto">
            Pro plan includes full API access. 14-day free trial, no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-teal-600 text-white text-[14px] font-semibold hover:bg-teal-700 transition-colors"
            >
              Get Your API Key
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/developers/api"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg border border-deep-200 dark:border-deep-700 text-deep-700 dark:text-sage-300 text-[14px] font-semibold hover:bg-deep-50 dark:hover:bg-deep-800 transition-colors"
            >
              Browse API Reference
            </Link>
          </div>
        </div>
      </section>
    </PublicPageShell>
  );
}
