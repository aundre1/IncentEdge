import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen, Calculator, FileCheck, Database } from 'lucide-react';
import { PublicPageShell } from '@/components/public/PublicPageShell';

export const metadata: Metadata = {
  title: 'IRA Tax Credit Resources — Guides, Tools & Templates | IncentEdge',
  description:
    'Free resources for IRA tax credit discovery: comprehensive guides, ROI calculators, due diligence checklists, and state incentive database access. Built for developers and finance teams.',
  alternates: { canonical: 'https://incentedge.com/resources' },
  openGraph: {
    title: 'IRA Tax Credit Resources — Guides, Tools & Templates | IncentEdge',
    description:
      'Free resources for IRA tax credit discovery: comprehensive guides, ROI calculators, due diligence checklists, and state incentive database access.',
    url: 'https://incentedge.com/resources',
    siteName: 'IncentEdge',
    type: 'website',
  },
};

const resourcesSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'IRA Tax Credit Resources',
  description: 'Free guides, tools, and templates for IRA tax credit discovery and monetization.',
  url: 'https://incentedge.com/resources',
  publisher: { '@type': 'Organization', name: 'IncentEdge', url: 'https://incentedge.com' },
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://incentedge.com' },
    { '@type': 'ListItem', position: 2, name: 'Resources', item: 'https://incentedge.com/resources' },
  ],
};

const resources = [
  {
    icon: BookOpen,
    badge: 'Cornerstone Guide',
    badgeColor: 'teal',
    title: 'The Complete IRA Tax Credit Guide (2026)',
    description:
      'The definitive reference for developers and finance teams. Covers all 7 federal credits, bonus adders, transferability, direct pay, state stacking, and compliance — ~4,000 words with tables and examples.',
    href: '/resources/ira-guide',
    cta: 'Read the Guide',
    highlights: ['7 federal credits explained', 'Bonus adder stacking math', 'Transferability vs direct pay'],
    featured: true,
  },
  {
    icon: Calculator,
    badge: 'Free Tool',
    badgeColor: 'emerald',
    title: 'Incentive ROI Calculator',
    description:
      'Input your project type, size, location, and technology to get an instant estimate of your total IRA incentive stack — federal, state, and utility programs combined.',
    href: '/signup',
    cta: 'Open Calculator',
    highlights: ['60-second results', 'Federal + state + utility', 'Export to PDF'],
    featured: false,
  },
  {
    icon: FileCheck,
    badge: 'PDF Download',
    badgeColor: 'blue',
    title: 'IRA Due Diligence Checklist',
    description:
      'A 47-point checklist for verifying IRA tax credit eligibility before closing. Covers prevailing wage, domestic content, energy community classification, and recapture risk.',
    href: '/signup',
    cta: 'Download Checklist',
    highlights: ['47-point checklist', 'Prevailing wage verification', 'Recapture risk flags'],
    featured: false,
  },
  {
    icon: Database,
    badge: 'Live Database',
    badgeColor: 'purple',
    title: 'State Incentive Database',
    description:
      'Browse 217,000+ federal, state, and local incentive programs. Filter by state, project type, credit type, and technology. Updated daily from primary sources.',
    href: '/incentives',
    cta: 'Browse Database',
    highlights: ['217,000+ programs', 'Updated daily', 'All 50 states'],
    featured: false,
  },
];

const badgeStyles: Record<string, string> = {
  teal: 'bg-teal-100 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300',
  emerald: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300',
  blue: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
  purple: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300',
};

export default function ResourcesPage() {
  return (
    <PublicPageShell breadcrumbs={[{ label: 'Resources' }]}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(resourcesSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Hero */}
      <section className="max-w-[1200px] mx-auto px-6 pt-16 pb-12">
        <div className="max-w-2xl">
          <div className="inline-flex items-center rounded-full border border-teal-200 dark:border-teal-700 bg-teal-50 dark:bg-teal-900/20 px-4 py-1.5 text-[12px] text-teal-700 dark:text-teal-300 mb-6">
            Free Resources
          </div>
          <h1 className="font-sora text-4xl md:text-5xl font-bold tracking-tight text-deep-900 dark:text-white leading-[1.1] mb-5">
            IRA Tax Credit Resources
          </h1>
          <p className="text-lg text-deep-500 dark:text-sage-400 leading-relaxed">
            Everything you need to understand, qualify for, and monetize IRA tax credits. Built by the IncentEdge research team for developers and finance professionals.
          </p>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="max-w-[1200px] mx-auto px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-2">
          {resources.map((resource) => {
            const Icon = resource.icon;
            return (
              <div
                key={resource.href}
                className={`rounded-xl border p-8 transition-all hover:shadow-md ${
                  resource.featured
                    ? 'border-teal-300 dark:border-teal-700 bg-gradient-to-br from-teal-50 to-white dark:from-teal-900/10 dark:to-deep-900 ring-1 ring-teal-200 dark:ring-teal-800'
                    : 'border-deep-100 dark:border-deep-800 bg-white dark:bg-deep-900 hover:border-teal-200 dark:hover:border-teal-700'
                }`}
              >
                <div className="flex items-start gap-4 mb-5">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold mb-2 ${badgeStyles[resource.badgeColor]}`}>
                      {resource.badge}
                    </span>
                    <h2 className="font-sora text-xl font-bold text-deep-900 dark:text-deep-100 leading-tight">
                      {resource.title}
                    </h2>
                  </div>
                </div>

                <p className="text-[14px] text-deep-600 dark:text-sage-400 leading-relaxed mb-5">
                  {resource.description}
                </p>

                <ul className="space-y-1.5 mb-6">
                  {resource.highlights.map((h) => (
                    <li key={h} className="flex items-center gap-2 text-[13px] text-deep-600 dark:text-sage-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>

                <Link
                  href={resource.href}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-deep-900 dark:bg-teal-600 text-white text-[13px] font-semibold hover:bg-deep-800 dark:hover:bg-teal-500 transition-colors"
                >
                  {resource.cta}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="border-t border-deep-100 dark:border-deep-800 bg-deep-50/50 dark:bg-deep-900/30">
        <div className="max-w-[1200px] mx-auto px-6 py-16 text-center">
          <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 dark:text-deep-100 mb-3">
            Skip the research. Get your incentive stack in 60 seconds.
          </h2>
          <p className="text-deep-500 dark:text-sage-400 max-w-xl mx-auto mb-8">
            IncentEdge scans 217,000+ programs and delivers a matched incentive report for your specific project — free to start, no credit card required.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[14px] font-semibold transition-colors"
          >
            Scan your project free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Related Blog Posts */}
      <section className="max-w-[1200px] mx-auto px-6 py-16">
        <h2 className="font-sora text-xl font-bold text-deep-900 dark:text-deep-100 mb-6">
          From the Blog
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { title: 'IRA Bonus Adders Explained: Stack Up to 70% ITC', href: '/blog/ira-bonus-adders-explained' },
            { title: 'Tax Equity vs. Transferability: Which Is Right for Your Project?', href: '/blog/tax-equity-vs-transferability' },
            { title: 'The Complete 179D Deduction Guide (2026)', href: '/blog/179d-guide' },
          ].map((post) => (
            <Link
              key={post.href}
              href={post.href}
              className="block p-5 rounded-lg border border-deep-100 dark:border-deep-800 hover:border-teal-200 dark:hover:border-teal-700 transition-colors group"
            >
              <p className="text-[14px] font-medium text-deep-900 dark:text-deep-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors leading-snug">
                {post.title}
              </p>
              <span className="inline-flex items-center gap-1 text-[12px] text-teal-600 dark:text-teal-400 mt-2">
                Read article <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </PublicPageShell>
  );
}
