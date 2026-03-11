import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'IncentEdge Blog — IRA Tax Credit Guides & Insights',
  description:
    'Expert guides on IRA tax credits, clean energy incentives, and tax credit monetization. Stay current on policy updates, program requirements, and strategy.',
  alternates: {
    canonical: 'https://incentedge.com/blog',
  },
  openGraph: {
    title: 'IncentEdge Blog — IRA Tax Credit Guides & Insights',
    description:
      'Expert guides on IRA tax credits, clean energy incentives, and tax credit monetization.',
    url: 'https://incentedge.com/blog',
    type: 'website',
  },
};

const blogSchema = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: 'IncentEdge Blog',
  url: 'https://incentedge.com/blog',
  description:
    'Expert guides on IRA tax credits, clean energy incentives, and tax credit monetization.',
  publisher: {
    '@type': 'Organization',
    name: 'IncentEdge',
    url: 'https://incentedge.com',
  },
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://incentedge.com' },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://incentedge.com/blog' },
  ],
};

type Category = 'IRA Deep Dives' | 'Finance Team Guides' | 'Developer Resources' | 'Policy Updates';

interface BlogPost {
  slug: string;
  title: string;
  description: string;
  category: Category;
  date: string;
  readTime: string;
  featured?: boolean;
}

const CATEGORY_COLORS: Record<Category, string> = {
  'IRA Deep Dives': 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
  'Finance Team Guides': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  'Developer Resources': 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300',
  'Policy Updates': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
};

const POSTS: BlogPost[] = [
  {
    slug: 'transferable-tax-credits-guide',
    title: 'IRA Transferable Tax Credits: The Complete Guide to Buying and Selling Credits',
    description:
      'Learn how to buy or sell IRA transferable tax credits. Covers eligible credits, pricing (88–96 cents on the dollar), deal structure, broker platforms, and IRS filing requirements.',
    category: 'IRA Deep Dives',
    date: '2026-03-01',
    readTime: '14 min read',
    featured: true,
  },
  {
    slug: 'tax-equity-vs-transferability',
    title: 'Tax Equity vs. Credit Transferability: Choosing the Right IRA Structure',
    description:
      'Compare tax equity financing vs. IRA credit transferability. Understand timing, returns, complexity, and which structure maximizes value for your clean energy project.',
    category: 'IRA Deep Dives',
    date: '2026-03-01',
    readTime: '12 min read',
  },
  {
    slug: 'ira-bonus-adders-explained',
    title: 'IRA Bonus Adders: How to Stack Credits From 30% to 70%',
    description:
      'Learn how IRA bonus adders — energy community, domestic content, and low-income — can boost your ITC or PTC from 30% to 70%. Eligibility and stacking rules explained.',
    category: 'IRA Deep Dives',
    date: '2026-03-01',
    readTime: '11 min read',
  },
  {
    slug: 'itc-vs-ptc-comparison',
    title: 'ITC vs. PTC: Which Credit Maximizes Your Clean Energy Project\'s Value?',
    description:
      'Compare the Investment Tax Credit (ITC) and Production Tax Credit (PTC). Learn when to choose each based on project economics, technology type, and financing timeline.',
    category: 'IRA Deep Dives',
    date: '2026-03-01',
    readTime: '11 min read',
  },
  {
    slug: 'ira-project-finance-incentives',
    title: 'How IRA Incentives Work in Clean Energy Project Finance',
    description:
      'How IRA tax credits flow through clean energy project finance structures. Tax equity, transferability, debt sizing, and incentive stacking for solar, wind, and storage projects.',
    category: 'Finance Team Guides',
    date: '2026-03-01',
    readTime: '13 min read',
  },
  {
    slug: 'ira-incentive-due-diligence',
    title: 'IRA Incentive Due Diligence: Your 48-Hour Framework',
    description:
      'A step-by-step due diligence framework for IRA tax credit deals. Eligibility verification, credit calculation, recapture risk, and a complete documentation checklist.',
    category: 'Finance Team Guides',
    date: '2026-03-01',
    readTime: '10 min read',
  },
  {
    slug: 'direct-pay-election',
    title: 'Direct Pay Under the IRA: Monetizing Credits Without Tax Liability',
    description:
      'Section 6417 direct pay allows nonprofits, governments, and tribal entities to receive IRA tax credits as cash refunds. Learn eligibility, election procedures, and limitations.',
    category: 'Finance Team Guides',
    date: '2026-03-01',
    readTime: '10 min read',
  },
  {
    slug: 'prevailing-wage-apprenticeship-requirements',
    title: 'IRA Prevailing Wage & Apprenticeship Requirements: Complete Guide',
    description:
      'How IRA prevailing wage and apprenticeship requirements affect your tax credit rates. Compliance requirements, bonus credit rates, and safe harbor rules for 2026.',
    category: 'Developer Resources',
    date: '2026-03-01',
    readTime: '10 min read',
  },
  {
    slug: 'section-45l-guide',
    title: 'Section 45L: The Complete Guide to the Energy Efficient Home Credit',
    description:
      'Section 45L offers up to $5,000 per dwelling unit for energy-efficient new construction. Learn who qualifies, credit rates, certification requirements, and IRA expansion.',
    category: 'Developer Resources',
    date: '2026-03-01',
    readTime: '12 min read',
  },
  {
    slug: '179d-guide',
    title: 'Section 179D: The Energy Efficient Commercial Building Deduction',
    description:
      'Section 179D offers up to $5.00/sq ft for energy-efficient commercial buildings. IRA expanded eligibility to nonprofits, governments, and tribal entities.',
    category: 'Developer Resources',
    date: '2026-03-01',
    readTime: '12 min read',
  },
];

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

const featuredPost = POSTS.find((p) => p.featured);
const remainingPosts = POSTS.filter((p) => !p.featured);

export default function BlogPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-deep-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 h-[72px] bg-white/95 dark:bg-deep-950/95 backdrop-blur-sm border-b border-deep-100 dark:border-deep-800">
        <div className="h-full max-w-[1400px] mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-teal-400 flex items-center justify-center font-sora font-extrabold text-[15px] text-white shadow-lg shadow-teal-500/30 ring-2 ring-teal-300/50">
              IE
            </div>
            <div>
              <span className="font-sora font-bold text-[19px] text-deep-900 dark:text-deep-100 tracking-tight">
                Incent<em className="not-italic text-teal-500">Edge</em>
              </span>
              <div className="text-[9px] text-sage-500 uppercase tracking-[1.5px] font-medium -mt-0.5">
                Incentive Intelligence
              </div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/pricing" className="text-[13px] text-deep-600 dark:text-sage-400 hover:text-deep-900 dark:hover:text-deep-100 transition-colors">
              Pricing
            </Link>
            <Link href="/blog" className="text-[13px] text-teal-600 dark:text-teal-400 font-medium">
              Blog
            </Link>
            <Link href="/login" className="text-[13px] text-deep-600 dark:text-sage-400 hover:text-deep-900 dark:hover:text-deep-100 transition-colors">
              Log In
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-deep-900 dark:bg-teal-600 text-white text-[13px] font-semibold hover:bg-deep-800 dark:hover:bg-teal-500 transition-colors"
            >
              Get Started
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-deep-100 dark:border-deep-800">
          <div className="max-w-[1200px] mx-auto px-6 pt-16 pb-12">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-[12px] text-deep-500 dark:text-sage-500 mb-8">
              <Link href="/" className="hover:text-deep-900 dark:hover:text-deep-100 transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-deep-900 dark:text-deep-100">Blog</span>
            </nav>

            <h1 className="font-sora text-4xl md:text-5xl font-bold tracking-tight text-deep-900 dark:text-white mb-4">
              IRA Tax Credit Guides & Insights
            </h1>
            <p className="text-lg text-deep-500 dark:text-sage-400 max-w-2xl">
              Expert analysis on IRA tax credits, clean energy incentives, and credit monetization strategies — written for finance teams, developers, and project sponsors.
            </p>

            {/* Category filters — static display */}
            <div className="flex flex-wrap gap-2 mt-8">
              {(['IRA Deep Dives', 'Finance Team Guides', 'Developer Resources', 'Policy Updates'] as Category[]).map((cat) => (
                <span
                  key={cat}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-medium ${CATEGORY_COLORS[cat]}`}
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Post */}
        {featuredPost && (
          <section className="max-w-[1200px] mx-auto px-6 py-12">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-6">
              Featured Article
            </div>
            <Link href={`/blog/${featuredPost.slug}`} className="group block">
              <div className="rounded-2xl border border-deep-200 dark:border-deep-700 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 p-8 md:p-12 hover:border-teal-400 dark:hover:border-teal-600 transition-all hover:shadow-lg hover:shadow-teal-500/10">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-medium mb-4 ${CATEGORY_COLORS[featuredPost.category]}`}>
                  {featuredPost.category}
                </span>
                <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 dark:text-deep-100 mb-4 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors leading-tight">
                  {featuredPost.title}
                </h2>
                <p className="text-deep-600 dark:text-sage-400 text-lg mb-6 max-w-3xl leading-relaxed">
                  {featuredPost.description}
                </p>
                <div className="flex items-center gap-4 text-[13px] text-deep-500 dark:text-sage-500">
                  <span>IncentEdge Research Team</span>
                  <span>·</span>
                  <span>{formatDate(featuredPost.date)}</span>
                  <span>·</span>
                  <span>{featuredPost.readTime}</span>
                  <span className="ml-auto inline-flex items-center gap-1.5 text-teal-600 dark:text-teal-400 font-semibold">
                    Read Article <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* Post Grid */}
        <section className="max-w-[1200px] mx-auto px-6 pb-20">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-deep-500 dark:text-sage-500 mb-6">
            All Articles
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {remainingPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
                <article className="h-full rounded-xl border border-deep-100 dark:border-deep-800 bg-white dark:bg-deep-900 p-6 hover:border-teal-300 dark:hover:border-teal-700 hover:shadow-md transition-all">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium mb-4 ${CATEGORY_COLORS[post.category]}`}>
                    {post.category}
                  </span>
                  <h2 className="font-sora font-semibold text-[17px] text-deep-900 dark:text-deep-100 mb-3 leading-snug group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-[13px] text-deep-600 dark:text-sage-400 mb-6 leading-relaxed line-clamp-3">
                    {post.description}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-deep-100 dark:border-deep-800 text-[12px] text-deep-500 dark:text-sage-500">
                    <span>{formatDate(post.date)}</span>
                    <span className="flex items-center gap-1 text-teal-600 dark:text-teal-400 font-medium">
                      {post.readTime} <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="border-t border-deep-100 dark:border-deep-800 bg-deep-50/50 dark:bg-deep-900/30">
          <div className="max-w-[1200px] mx-auto px-6 py-16 text-center">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 dark:text-deep-100 mb-3">
              Ready to scan your project?
            </h2>
            <p className="text-deep-500 dark:text-sage-400 max-w-xl mx-auto mb-8">
              IncentEdge identifies every IRA credit your project qualifies for — bonus adders, transferability, and direct pay included. Free to start.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[14px] font-semibold transition-colors"
            >
              Scan Your Project Free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-deep-100 dark:border-deep-800 bg-white dark:bg-deep-950">
        <div className="max-w-[1400px] mx-auto flex h-16 items-center justify-between px-6 text-sm text-sage-500">
          <div>&copy; 2026 IncentEdge. All rights reserved.</div>
          <div className="flex gap-6">
            <Link href="/legal/privacy" className="hover:text-deep-900 dark:hover:text-deep-100 transition-colors">Privacy</Link>
            <Link href="/legal/terms" className="hover:text-deep-900 dark:hover:text-deep-100 transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
