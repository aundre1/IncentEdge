import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'IRA Transferable Tax Credits: The Complete Guide to Buying and Selling Credits',
  description:
    'Learn how to buy or sell IRA transferable tax credits. Covers eligible credits, pricing (88-96 cents on the dollar), deal structure, broker platforms, and IRS filing requirements.',
  alternates: { canonical: 'https://incentedge.com/blog/transferable-tax-credits-guide' },
  openGraph: {
    title: 'IRA Transferable Tax Credits: The Complete Guide to Buying and Selling Credits',
    description: 'How to buy or sell IRA transferable tax credits. Pricing, deal structure, broker platforms, and IRS filing requirements.',
    url: 'https://incentedge.com/blog/transferable-tax-credits-guide',
    type: 'article',
  },
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'IRA Transferable Tax Credits: How the $30B Market Works',
  description: 'The complete guide to buying and selling IRA transferable tax credits under Section 6418.',
  datePublished: '2026-03-01',
  dateModified: '2026-03-01',
  author: { '@type': 'Organization', name: 'IncentEdge Research Team', url: 'https://incentedge.com' },
  publisher: { '@type': 'Organization', name: 'IncentEdge', url: 'https://incentedge.com' },
  mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://incentedge.com/blog/transferable-tax-credits-guide' },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is the market price for IRA transferable tax credits?',
      acceptedAnswer: { '@type': 'Answer', text: 'As of early 2026, IRA transferable tax credits trade at 88-96 cents per dollar of credit value, depending on several factors: credit type (ITC, PTC, 45Q, etc.), deal size (larger deals command tighter spreads), seller credit quality and documentation completeness, presence or absence of tax credit insurance, and market conditions. ITC for solar tends to trade at the tighter end (93-96¢) due to its well-understood risk profile. Novel credits like 45V may trade at wider discounts (88-91¢) due to less buyer familiarity.' },
    },
    {
      '@type': 'Question',
      name: 'Which IRA tax credits are transferable?',
      acceptedAnswer: { '@type': 'Answer', text: 'Under Section 6418, the following credits are transferable: ITC (§48), PTC (§45), 45Q (carbon capture), 45V (clean hydrogen), 48C (advanced energy projects), 45L (energy efficient homes), 45X (advanced manufacturing). Credits that are NOT transferable include: LIHTC (§42), New Markets Tax Credit (§45D), and the historic rehabilitation credit (§47). The personal tax credits (residential energy credits like §25C and §25D) are also not transferable under Section 6418.' },
    },
    {
      '@type': 'Question',
      name: 'What is tax credit insurance and do I need it?',
      acceptedAnswer: { '@type': 'Answer', text: 'Tax credit insurance is a policy issued by a specialty insurer (Chubb, Everest, Tokio Marine, etc.) that covers the buyer\'s loss if the transferred credit is disallowed, reduced, or subject to recapture. Typical coverage: 100% of the credit purchase price, with premiums of 0.5-1.5% of the insured amount. For large deals (>$10M), most sophisticated buyers now require tax credit insurance as a condition of closing. For smaller deals, the cost-benefit may favor self-insuring through extensive due diligence and representations & warranties in the purchase agreement.' },
    },
    {
      '@type': 'Question',
      name: 'What forms do I need to file for a credit transfer?',
      acceptedAnswer: { '@type': 'Answer', text: 'The seller must: (1) Obtain a unique registration number for the credit through the IRS\'s online portal (registration must happen before the transfer); (2) File the applicable credit form (e.g., Form 3468 for ITC) with the registration number; (3) File Form 3800 with the elective payment election and transfer election checkbox. The buyer must: (1) Receive the registration number from the seller; (2) Attach a statement to its return showing the credit type, amount, registration number, and payment made; (3) Report the credit on Form 3800 as a transferred credit. Both parties must retain records of the purchase and sale agreement.' },
    },
    {
      '@type': 'Question',
      name: 'Can a project sell its credits to multiple buyers?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. A project can sell portions of its tax credits to multiple buyers in a single tax year — this is called a "syndicated transfer" or "multi-buyer transfer." Each buyer receives a separate registration number for its allocated portion. This structure is useful when a single buyer cannot absorb the full credit amount due to its own tax liability constraints. Each tranche typically requires separate documentation, but the same purchase and sale agreement can govern the overall structure.' },
    },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://incentedge.com' },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://incentedge.com/blog' },
    { '@type': 'ListItem', position: 3, name: 'Transferable Tax Credits Guide', item: 'https://incentedge.com/blog/transferable-tax-credits-guide' },
  ],
};

const RELATED_POSTS = [
  { slug: 'tax-equity-vs-transferability', title: 'Tax Equity vs. Credit Transferability: Choosing the Right IRA Structure' },
  { slug: 'direct-pay-election', title: 'Direct Pay Under the IRA: Monetizing Credits Without Tax Liability' },
  { slug: 'ira-project-finance-incentives', title: 'How IRA Incentives Work in Clean Energy Project Finance' },
];

export default function TransferableTaxCreditsGuidePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-deep-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

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
          <nav className="flex items-center gap-1.5 text-[12px] text-deep-500 dark:text-sage-500 mb-8">
            <Link href="/" className="hover:text-deep-900 dark:hover:text-deep-100 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/blog" className="hover:text-deep-900 dark:hover:text-deep-100 transition-colors">Blog</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-deep-900 dark:text-deep-100">Transferable Tax Credits Guide</span>
          </nav>

          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-medium bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300">IRA Deep Dives</span>
            <span className="text-[13px] text-deep-500 dark:text-sage-500">IncentEdge Research Team</span>
            <span className="text-deep-300 dark:text-deep-700">·</span>
            <span className="text-[13px] text-deep-500 dark:text-sage-500">March 1, 2026</span>
            <span className="text-deep-300 dark:text-deep-700">·</span>
            <span className="text-[13px] text-deep-500 dark:text-sage-500">Last Updated: March 1, 2026</span>
          </div>

          <h1 className="font-sora text-3xl md:text-4xl font-bold text-deep-900 dark:text-white mb-6 leading-tight">
            IRA Transferable Tax Credits: How the $30B Market Works
          </h1>

          <p className="text-lg text-deep-600 dark:text-sage-400 mb-10 leading-relaxed border-l-4 border-teal-400 pl-4">
            Section 6418 of the IRA created the largest new capital market in clean energy since the advent of tax equity. Transferable tax credits have unlocked hundreds of billions in clean energy investment by allowing any project owner to sell their IRA credits to any corporate buyer — in weeks, not months, and at 88-96 cents on the dollar.
          </p>

          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-4">What Are Transferable Credits?</h2>
          <p className="text-deep-700 dark:text-sage-300 mb-4 leading-relaxed">
            Section 6418, enacted as part of the Inflation Reduction Act in August 2022, allows taxpayers that generate certain clean energy tax credits to transfer (sell) those credits to unrelated parties for cash. The buyer pays cash to the seller, then claims the credit on its own federal tax return to reduce its tax liability.
          </p>
          <p className="text-deep-700 dark:text-sage-300 mb-6 leading-relaxed">
            The key innovation is simplicity: no partnership, no joint venture, no equity interest in the project. The seller simply sells a financial instrument (the right to claim the credit) and the buyer uses it exactly like any other business tax credit. The transaction can close in 4-8 weeks versus 3-6 months for traditional tax equity.
          </p>

          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-4">Eligible Credits</h2>
          <div className="overflow-x-auto mb-8">
            <table className="w-full text-[14px] border border-deep-200 dark:border-deep-700 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-deep-50 dark:bg-deep-800">
                  <th className="text-left px-4 py-3 font-semibold text-deep-900 dark:text-deep-100 border-b border-deep-200 dark:border-deep-700">Credit</th>
                  <th className="text-left px-4 py-3 font-semibold text-deep-600 dark:text-sage-400 border-b border-deep-200 dark:border-deep-700">Description</th>
                  <th className="text-left px-4 py-3 font-semibold text-teal-700 dark:text-teal-300 border-b border-deep-200 dark:border-deep-700">Transferable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-deep-100 dark:divide-deep-800">
                {[
                  ['§48 ITC', 'Investment Tax Credit — solar, wind, storage, geothermal', 'Yes'],
                  ['§45 PTC', 'Production Tax Credit — wind, solar, geothermal, hydro', 'Yes'],
                  ['§45Q', 'Carbon oxide sequestration', 'Yes'],
                  ['§45V', 'Clean hydrogen production', 'Yes'],
                  ['§48C', 'Advanced energy projects', 'Yes'],
                  ['§45L', 'Energy efficient new homes', 'Yes'],
                  ['§45X', 'Advanced manufacturing production', 'Yes'],
                  ['§42 LIHTC', 'Low-income housing tax credit', 'No'],
                  ['§45D NMTC', 'New markets tax credit', 'No'],
                  ['§47', 'Historic rehabilitation credit', 'No'],
                ].map(([credit, desc, transferable]) => (
                  <tr key={credit} className="hover:bg-deep-50/50 dark:hover:bg-deep-900/50">
                    <td className="px-4 py-3 font-medium text-deep-900 dark:text-deep-100">{credit}</td>
                    <td className="px-4 py-3 text-deep-600 dark:text-sage-400">{desc}</td>
                    <td className={`px-4 py-3 font-medium ${transferable === 'Yes' ? 'text-teal-700 dark:text-teal-300' : 'text-red-600 dark:text-red-400'}`}>{transferable}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-4">How the Market Works</h2>
          <p className="text-deep-700 dark:text-sage-300 mb-4 leading-relaxed">
            The transferable credit market operates through three channels:
          </p>
          <div className="space-y-4 mb-6">
            {[
              { title: 'Direct transactions', body: 'Large projects with well-established credit profiles negotiate directly with corporate buyers (often large financial institutions, insurance companies, or Fortune 500 companies with large tax bills). These deals are typically $20M+.' },
              { title: 'Broker platforms', body: 'Specialty firms like Crux Capital, Reunion Infrastructure, and others have built marketplace infrastructure connecting sellers and buyers, handling documentation, due diligence, and matching. They charge fees of 1-3% of transaction value.' },
              { title: 'IncentEdge marketplace', body: 'IncentEdge provides integrated credit identification, valuation, and transfer facilitation — from initial project analysis through executed purchase agreement — in a single platform.' },
            ].map(({ title, body }) => (
              <div key={title} className="p-4 rounded-lg border border-deep-100 dark:border-deep-800">
                <p className="font-semibold text-deep-900 dark:text-deep-100 mb-1">{title}</p>
                <p className="text-[14px] text-deep-600 dark:text-sage-400">{body}</p>
              </div>
            ))}
          </div>

          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-4">Credit Pricing: 88-96 Cents on the Dollar</h2>
          <p className="text-deep-700 dark:text-sage-300 mb-4 leading-relaxed">
            The price paid for transferred credits depends on multiple factors:
          </p>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-[14px] border border-deep-200 dark:border-deep-700 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-deep-50 dark:bg-deep-800">
                  <th className="text-left px-4 py-3 font-semibold text-deep-900 dark:text-deep-100 border-b border-deep-200 dark:border-deep-700">Factor</th>
                  <th className="text-left px-4 py-3 font-semibold text-teal-700 dark:text-teal-300 border-b border-deep-200 dark:border-deep-700">Higher Price</th>
                  <th className="text-left px-4 py-3 font-semibold text-deep-600 dark:text-sage-400 border-b border-deep-200 dark:border-deep-700">Lower Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-deep-100 dark:divide-deep-800">
                {[
                  ['Credit type', 'ITC (well understood)', 'Novel credits (45V, 45Q)'],
                  ['Deal size', '>$10M', '<$2M'],
                  ['Documentation', 'Complete, clean', 'Gaps in prevailing wage or domestic content'],
                  ['Insurance', 'Tax credit insurance included', 'No insurance'],
                  ['Seller track record', 'Repeat seller, institutional developer', 'First-time seller'],
                  ['Recapture period', 'Post-recapture period', 'Within 5-year ITC recapture window'],
                ].map(([factor, high, low]) => (
                  <tr key={factor} className="hover:bg-deep-50/50 dark:hover:bg-deep-900/50">
                    <td className="px-4 py-3 font-medium text-deep-900 dark:text-deep-100">{factor}</td>
                    <td className="px-4 py-3 text-teal-700 dark:text-teal-300">{high}</td>
                    <td className="px-4 py-3 text-deep-600 dark:text-sage-400">{low}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-4">Who Sells Transferred Credits?</h2>
          <p className="text-deep-700 dark:text-sage-300 mb-4 leading-relaxed">
            Sellers are typically project owners who generated eligible credits but cannot use them directly against their own tax liability. Common seller profiles:
          </p>
          <ul className="list-disc list-inside space-y-2 text-deep-700 dark:text-sage-300 mb-6 ml-2">
            <li><strong className="text-deep-900 dark:text-deep-100">Projects too small for traditional tax equity</strong> (under $5M in credits) that previously had no monetization options</li>
            <li><strong className="text-deep-900 dark:text-deep-100">First-time developers</strong> without established tax equity relationships</li>
            <li><strong className="text-deep-900 dark:text-deep-100">Pass-through entities</strong> (LLCs, S-corps) where the owners' individual tax liabilities are insufficient to use the full credit</li>
            <li><strong className="text-deep-900 dark:text-deep-100">Projects needing faster monetization</strong> — companies that cannot wait 3-6 months for a tax equity deal to close</li>
            <li><strong className="text-deep-900 dark:text-deep-100">Advanced manufacturing facilities</strong> claiming the 45X production credit, which is a new category without an established tax equity market</li>
          </ul>

          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-4">Who Buys Transferred Credits?</h2>
          <p className="text-deep-700 dark:text-sage-300 mb-4 leading-relaxed">
            Buyers are corporations with large, predictable federal tax bills looking to reduce their effective tax rate. The typical buyer has:
          </p>
          <ul className="list-disc list-inside space-y-2 text-deep-700 dark:text-sage-300 mb-6 ml-2">
            <li>Annual federal tax liability of $10M+ (ideally $50M+ to buy meaningful credit volumes)</li>
            <li>Stable earnings that make the tax benefit predictable year over year</li>
            <li>Risk tolerance for compliance documentation review and due diligence</li>
          </ul>
          <p className="text-deep-700 dark:text-sage-300 mb-6 leading-relaxed">
            Common buyer sectors: financial services, insurance, technology, energy companies, healthcare systems, and manufacturing firms with large taxable income.
          </p>

          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-4">Deal Structure</h2>
          <p className="text-deep-700 dark:text-sage-300 mb-4 leading-relaxed">
            A typical credit transfer involves the following documents:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-deep-700 dark:text-sage-300 mb-6 ml-2">
            <li><strong className="text-deep-900 dark:text-deep-100">Purchase and Sale Agreement:</strong> Sets out credit amount, purchase price, closing date, representations and warranties, indemnification provisions, and recapture risk allocation.</li>
            <li><strong className="text-deep-900 dark:text-deep-100">Disclosure Schedule:</strong> All material project documents, certification reports, prevailing wage records, domestic content certifications.</li>
            <li><strong className="text-deep-900 dark:text-deep-100">Tax Credit Insurance Policy:</strong> Most institutional buyers require this. The seller typically pays the premium (0.5-1.5% of insured credit amount).</li>
            <li><strong className="text-deep-900 dark:text-deep-100">IRS Registration:</strong> Seller obtains pre-filing registration number through IRS portal; registration number is provided to buyer at or before closing.</li>
            <li><strong className="text-deep-900 dark:text-deep-100">Tax Return Filings:</strong> Seller files Form 3468/3800 with transfer election; buyer files Form 3800 claiming the transferred credit.</li>
          </ol>

          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6 mb-10">
            {faqSchema.mainEntity.map((item) => (
              <div key={item.name} className="border-b border-deep-100 dark:border-deep-800 pb-6">
                <h3 className="font-semibold text-deep-900 dark:text-deep-100 mb-2">{item.name}</h3>
                <p className="text-[14px] text-deep-600 dark:text-sage-400 leading-relaxed">{item.acceptedAnswer.text}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 border border-teal-200 dark:border-teal-800 p-8 text-center mb-12">
            <h2 className="font-sora text-xl font-bold text-deep-900 dark:text-deep-100 mb-2">Scan your project with IncentEdge — it's free to start</h2>
            <p className="text-deep-600 dark:text-sage-400 mb-6 text-[15px]">
              IncentEdge identifies your transferable credits, calculates market value at current pricing, and connects you with qualified buyers through the IncentEdge marketplace. Start with a free project scan.
            </p>
            <Link href="/signup" className="inline-flex items-center gap-2 px-7 py-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[14px] font-semibold transition-colors">
              Get Your Credit Transfer Analysis <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

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
