import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Tax Equity vs. Transferability: Which IRA Structure Is Right for Your Project?',
  description:
    'Compare tax equity financing vs. IRA credit transferability. Understand timing, returns, complexity, and which structure maximizes value for your clean energy project.',
  alternates: { canonical: 'https://incentedge.com/blog/tax-equity-vs-transferability' },
  openGraph: {
    title: 'Tax Equity vs. Transferability: Which IRA Structure Is Right for Your Project?',
    description:
      'Compare tax equity financing vs. IRA credit transferability. Understand timing, returns, complexity, and which structure maximizes value for your clean energy project.',
    url: 'https://incentedge.com/blog/tax-equity-vs-transferability',
    type: 'article',
  },
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Tax Equity vs. Credit Transferability: Choosing the Right IRA Structure',
  description:
    'Compare tax equity financing vs. IRA credit transferability. Understand timing, returns, complexity, and which structure maximizes value for your clean energy project.',
  datePublished: '2026-03-01',
  dateModified: '2026-03-01',
  author: { '@type': 'Organization', name: 'IncentEdge Research Team', url: 'https://incentedge.com' },
  publisher: { '@type': 'Organization', name: 'IncentEdge', url: 'https://incentedge.com' },
  mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://incentedge.com/blog/tax-equity-vs-transferability' },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is tax equity financing?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Tax equity financing is a structure where a corporate investor with large tax liability invests cash into a clean energy project in exchange for the project\'s tax benefits — primarily the ITC or PTC plus depreciation. The investor earns a return by using these tax benefits to reduce its own tax bill, typically over a 5-10 year holding period.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is credit transferability under the IRA?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Section 6418 of the IRA (enacted August 2022) allows project owners to sell most IRA tax credits directly to third-party buyers for cash. Unlike tax equity, no partnership is required — the seller retains full ownership of the project and simply transfers the right to claim the credit to a buyer.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which structure provides more value per dollar of tax credits?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Tax equity typically delivers 90-95 cents per dollar of tax credit value (when accounting for the full equity investment), while transferability pricing typically runs 88-96 cents per dollar. However, tax equity also monetizes depreciation (MACRS), which can add significant additional value for large projects. Smaller projects often find transferability delivers better net economics when accounting for transaction costs.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can a project use both tax equity and transferability?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, with careful structuring. A project can transfer certain credits (e.g., the base ITC) while using tax equity for the depreciation benefits. However, IRS Notice 2023-29 and final Treasury regulations impose restrictions on combining the structures, and legal counsel familiar with the specific credit types involved is essential.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is recapture risk and who bears it?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Recapture risk is the risk that previously claimed tax credits are "recaptured" (clawed back) by the IRS if the project is disposed of or ceases to qualify within the recapture period (generally 5 years for ITC). In a tax equity deal, recapture risk is typically shared between the developer and the tax equity investor per the partnership agreement. In a transfer, the seller bears primary recapture risk but can purchase tax credit insurance to transfer this risk to an insurer.',
      },
    },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://incentedge.com' },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://incentedge.com/blog' },
    { '@type': 'ListItem', position: 3, name: 'Tax Equity vs. Transferability', item: 'https://incentedge.com/blog/tax-equity-vs-transferability' },
  ],
};

const RELATED_POSTS = [
  { slug: 'transferable-tax-credits-guide', title: 'IRA Transferable Tax Credits: The Complete Guide to Buying and Selling Credits' },
  { slug: 'ira-project-finance-incentives', title: 'How IRA Incentives Work in Clean Energy Project Finance' },
  { slug: 'ira-bonus-adders-explained', title: 'IRA Bonus Adders: How to Stack Credits From 30% to 70%' },
];

export default function TaxEquityVsTransferabilityPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-deep-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* Header */}
      <header className="sticky top-0 z-50 h-[72px] bg-white/95 dark:bg-deep-950/95 backdrop-blur-sm border-b border-deep-100 dark:border-deep-800">
        <div className="h-full max-w-[1400px] mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-teal-400 flex items-center justify-center font-sora font-extrabold text-[15px] text-white shadow-lg shadow-teal-500/30 ring-2 ring-teal-300/50">IE</div>
            <div>
              <span className="font-sora font-bold text-[19px] text-deep-900 dark:text-deep-100 tracking-tight">Incent<em className="not-italic text-teal-500">Edge</em></span>
              <div className="text-[9px] text-sage-500 uppercase tracking-[1.5px] font-medium -mt-0.5">Incentive Intelligence</div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/blog" className="text-[13px] text-deep-600 dark:text-sage-400 hover:text-deep-900 transition-colors">Blog</Link>
            <Link href="/pricing" className="text-[13px] text-deep-600 dark:text-sage-400 hover:text-deep-900 transition-colors">Pricing</Link>
            <Link href="/signup" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-deep-900 dark:bg-teal-600 text-white text-[13px] font-semibold hover:bg-deep-800 transition-colors">
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <article className="max-w-3xl mx-auto px-6 py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-[12px] text-deep-500 dark:text-sage-500 mb-8">
            <Link href="/" className="hover:text-deep-900 dark:hover:text-deep-100 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/blog" className="hover:text-deep-900 dark:hover:text-deep-100 transition-colors">Blog</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-deep-900 dark:text-deep-100">Tax Equity vs. Transferability</span>
          </nav>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-medium bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300">IRA Deep Dives</span>
            <span className="text-[13px] text-deep-500 dark:text-sage-500">IncentEdge Research Team</span>
            <span className="text-deep-300 dark:text-deep-700">·</span>
            <span className="text-[13px] text-deep-500 dark:text-sage-500">March 1, 2026</span>
            <span className="text-deep-300 dark:text-deep-700">·</span>
            <span className="text-[13px] text-deep-500 dark:text-sage-500">Last Updated: March 1, 2026</span>
          </div>

          <h1 className="font-sora text-3xl md:text-4xl font-bold text-deep-900 dark:text-white mb-6 leading-tight">
            Tax Equity vs. Credit Transferability: Choosing the Right IRA Structure
          </h1>

          <p className="text-lg text-deep-600 dark:text-sage-400 mb-10 leading-relaxed border-l-4 border-teal-400 pl-4">
            The Inflation Reduction Act created a new choice for clean energy project developers: stick with traditional tax equity financing, or use the new transferability mechanism to sell credits directly for cash. This guide breaks down how each structure works and when to use which.
          </p>

          {/* Section 1 */}
          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-4">What Is Tax Equity?</h2>
          <p className="text-deep-700 dark:text-sage-300 mb-4 leading-relaxed">
            Tax equity has been the dominant financing mechanism for clean energy since the early 2000s. In a tax equity deal, a corporate investor — typically a bank, insurance company, or large corporation — invests cash into a project entity in exchange for the project's federal tax benefits. These benefits primarily include:
          </p>
          <ul className="list-disc list-inside space-y-2 text-deep-700 dark:text-sage-300 mb-4 ml-2">
            <li>The Investment Tax Credit (ITC) or Production Tax Credit (PTC)</li>
            <li>Accelerated depreciation (5-year MACRS for solar, wind, and most clean energy assets)</li>
            <li>Any applicable bonus depreciation</li>
          </ul>
          <p className="text-deep-700 dark:text-sage-300 mb-4 leading-relaxed">
            The investor earns its return by applying these tax benefits to reduce its own federal tax liability — not by receiving cash distributions. The most common structure is the <strong className="text-deep-900 dark:text-deep-100">partnership flip</strong>: the tax equity investor initially holds a large percentage of the project entity (often 99%), capturing the tax benefits, and then "flips" to a much smaller interest (often 5%) once it achieves its target after-tax yield. The developer retains a buyout option at fair market value.
          </p>
          <p className="text-deep-700 dark:text-sage-300 mb-6 leading-relaxed">
            Tax equity investors typically target yields of 6-9% after-tax, depending on credit quality, technology risk, and market conditions. The holding period is generally 5-10 years, with many investors requiring a 5-year hold for ITC recapture protection. The market size is approximately $20-25B per year.
          </p>

          {/* Section 2 */}
          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-4">What Is Credit Transferability?</h2>
          <p className="text-deep-700 dark:text-sage-300 mb-4 leading-relaxed">
            Section 6418 of the IRA, enacted in August 2022, created a new mechanism: project owners can sell most IRA-eligible tax credits to unrelated third parties for cash. No partnership or joint ownership is required. The mechanics are straightforward:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-deep-700 dark:text-sage-300 mb-4 ml-2">
            <li>The project owner generates the credit (e.g., ITC at commissioning)</li>
            <li>The owner and buyer execute a purchase and sale agreement</li>
            <li>The buyer pays cash — typically 88-96 cents per dollar of credit</li>
            <li>The buyer claims the credit on its own tax return; the seller files Form 3800 to elect the transfer</li>
          </ol>
          <p className="text-deep-700 dark:text-sage-300 mb-6 leading-relaxed">
            Critically, transferability does not monetize depreciation — only the tax credit itself. For projects where accelerated depreciation is a significant portion of the value (e.g., large utility-scale solar), this is a meaningful difference from tax equity.
          </p>

          {/* Comparison Table */}
          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-6">Side-by-Side Comparison</h2>
          <div className="overflow-x-auto mb-8">
            <table className="w-full text-[14px] border border-deep-200 dark:border-deep-700 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-deep-50 dark:bg-deep-800">
                  <th className="text-left px-4 py-3 font-semibold text-deep-900 dark:text-deep-100 border-b border-deep-200 dark:border-deep-700">Factor</th>
                  <th className="text-left px-4 py-3 font-semibold text-teal-700 dark:text-teal-300 border-b border-deep-200 dark:border-deep-700">Tax Equity</th>
                  <th className="text-left px-4 py-3 font-semibold text-blue-700 dark:text-blue-300 border-b border-deep-200 dark:border-deep-700">Transferability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-deep-100 dark:divide-deep-800">
                {[
                  ['Complexity', 'High — partnership structure, legal docs, lender consents', 'Low — purchase & sale agreement only'],
                  ['Transaction Cost', '$200K-$500K+ in legal/advisory fees', '$50K-$150K in legal/advisory fees'],
                  ['Timing to Close', '3-6 months', '4-8 weeks'],
                  ['Credits Eligible', 'ITC, PTC, 45Q, 45V, 48C (varies by structure)', 'ITC, PTC, 45Q, 45V, 48C, 45L (Section 6418 list)'],
                  ['Depreciation Monetized', 'Yes (MACRS 5-year + bonus depreciation)', 'No (credits only)'],
                  ['Pricing (cents per $1)', '90-95¢ (implicit, after tax benefit calc)', '88-96¢ (explicit, cash payment)'],
                  ['Recapture Risk Bearer', 'Shared between developer and investor', 'Seller (insurable with tax credit insurance)'],
                  ['Ownership Structure', 'Partnership required; investor holds % of entity', 'No partnership; seller retains full ownership'],
                  ['Minimum Deal Size', '~$5M+ (practical floor)', '~$500K+ (smaller deals viable)'],
                  ['Ongoing Reporting', 'Quarterly K-1s, partnership tax compliance', 'Annual Form 3800 election; minimal ongoing'],
                ].map(([factor, taxEquity, transfer]) => (
                  <tr key={factor} className="hover:bg-deep-50/50 dark:hover:bg-deep-900/50">
                    <td className="px-4 py-3 font-medium text-deep-900 dark:text-deep-100">{factor}</td>
                    <td className="px-4 py-3 text-deep-600 dark:text-sage-400">{taxEquity}</td>
                    <td className="px-4 py-3 text-deep-600 dark:text-sage-400">{transfer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* When to Choose Tax Equity */}
          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-4">When to Choose Tax Equity</h2>
          <p className="text-deep-700 dark:text-sage-300 mb-4 leading-relaxed">
            Tax equity is still the right choice in several scenarios:
          </p>
          <div className="space-y-4 mb-6">
            {[
              { title: 'Large projects over $50M in ITC basis', body: 'The fixed transaction costs of tax equity (legal, structuring, accounting) are more easily absorbed by larger projects, and the additional value from monetizing depreciation is significant.' },
              { title: 'Stacking with LIHTC or NMTC', body: 'Low-Income Housing Tax Credits and New Markets Tax Credits are not transferable under Section 6418. If your project stacks ITC with LIHTC (e.g., affordable housing with solar), tax equity is often the only viable structure to monetize all credits in a single transaction.' },
              { title: 'Lender or partner requirements', body: 'Some lenders and institutional partners are more familiar with tax equity structures and may require them as a condition of financing. Traditional infrastructure debt is often sized with tax equity as an assumed component.' },
              { title: 'Depreciation value is significant', body: 'For projects with large depreciable basis (utility-scale solar, wind, storage), accelerated MACRS depreciation can add 15-25% additional value over transferability alone.' },
            ].map(({ title, body }) => (
              <div key={title} className="flex gap-4 p-4 rounded-lg bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-2 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-deep-900 dark:text-deep-100 mb-1">{title}</p>
                  <p className="text-[14px] text-deep-600 dark:text-sage-400">{body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* When to Choose Transferability */}
          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-4">When to Choose Transferability</h2>
          <p className="text-deep-700 dark:text-sage-300 mb-4 leading-relaxed">
            Transferability has opened the market to a much wider range of projects and sellers:
          </p>
          <div className="space-y-4 mb-6">
            {[
              { title: 'Smaller projects ($500K–$10M in credits)', body: 'Tax equity market participants typically require minimum deals of $5M+ in tax benefits. Transferability enables smaller projects to monetize credits that would have previously been stranded.' },
              { title: 'Speed is critical', body: 'A credit transfer can close in 4-8 weeks versus 3-6 months for tax equity. For projects on a tight commissioning or financing timeline, this is often decisive.' },
              { title: 'First-time developers', body: 'Tax equity requires extensive legal documentation, partnership structuring, and an established relationship with an investor. Transferability is far more accessible for developers new to federal credit monetization.' },
              { title: 'Tax-exempt entities as project developers', body: 'Nonprofits and governments can claim ITC via direct pay (Section 6417). For projects where such entities are developers but do not have sufficient tax liability even for direct pay purposes, transferability allows them to sell credits to taxable buyers.' },
            ].map(({ title, body }) => (
              <div key={title} className="flex gap-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-deep-900 dark:text-deep-100 mb-1">{title}</p>
                  <p className="text-[14px] text-deep-600 dark:text-sage-400">{body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Can you do both */}
          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-4">Can You Use Both Structures?</h2>
          <p className="text-deep-700 dark:text-sage-300 mb-4 leading-relaxed">
            In some circumstances, yes. A project might transfer the ITC while a separate tax equity investor monetizes the depreciation. This "hybrid" approach requires careful structuring to ensure the depreciation investor is a genuine equity participant and not merely a party with contractual rights — the IRS scrutinizes structures that separate credit monetization from project ownership.
          </p>
          <p className="text-deep-700 dark:text-sage-300 mb-6 leading-relaxed">
            Additionally, if a project is part of a partnership with a tax equity investor who does not want the ITC (for example, a PTC partnership), the partnership can elect to transfer PTCs directly to the tax equity investor rather than having the investor use them on its own return — this is a less common but sometimes advantageous application.
          </p>
          <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 mb-8">
            <p className="text-[14px] font-medium text-amber-800 dark:text-amber-300">
              Note: IRS Notice 2024-27 and the final Treasury regulations on transferability (released 2024) impose specific rules on combining structures. Always engage qualified tax counsel before structuring a hybrid deal.
            </p>
          </div>

          {/* FAQ */}
          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6 mb-10">
            {faqSchema.mainEntity.map((item) => (
              <div key={item.name} className="border-b border-deep-100 dark:border-deep-800 pb-6">
                <h3 className="font-semibold text-deep-900 dark:text-deep-100 mb-2">{item.name}</h3>
                <p className="text-[14px] text-deep-600 dark:text-sage-400 leading-relaxed">{item.acceptedAnswer.text}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 border border-teal-200 dark:border-teal-800 p-8 text-center mb-12">
            <h2 className="font-sora text-xl font-bold text-deep-900 dark:text-deep-100 mb-2">
              Let IncentEdge model both structures for your project
            </h2>
            <p className="text-deep-600 dark:text-sage-400 mb-6 text-[15px]">
              Enter your project details and IncentEdge will calculate your ITC/PTC value, applicable bonus adders, and compare net proceeds from tax equity vs. transferability — in under 60 seconds.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[14px] font-semibold transition-colors"
            >
              Scan your project with IncentEdge — it's free to start
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Related Posts */}
          <div>
            <h2 className="font-sora text-lg font-bold text-deep-900 dark:text-deep-100 mb-4">Related Articles</h2>
            <div className="space-y-3">
              {RELATED_POSTS.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="flex items-center gap-3 p-4 rounded-lg border border-deep-100 dark:border-deep-800 hover:border-teal-300 dark:hover:border-teal-700 transition-colors group">
                  <ChevronRight className="w-4 h-4 text-teal-500 flex-shrink-0" />
                  <span className="text-[14px] text-deep-700 dark:text-sage-300 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">{post.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </article>
      </main>

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
