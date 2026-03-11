import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'IRA Direct Pay Election: How Tax-Exempt Entities Can Monetize Clean Energy Credits',
  description:
    'Section 6417 direct pay allows nonprofits, governments, and tribal entities to receive IRA tax credits as cash refunds. Learn eligibility, election procedures, and limitations.',
  alternates: { canonical: 'https://incentedge.com/blog/direct-pay-election' },
  openGraph: {
    title: 'IRA Direct Pay Election: How Tax-Exempt Entities Can Monetize Clean Energy Credits',
    description:
      'Section 6417 direct pay allows nonprofits, governments, and tribal entities to receive IRA tax credits as cash refunds.',
    url: 'https://incentedge.com/blog/direct-pay-election',
    type: 'article',
  },
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Direct Pay Under the IRA: Monetizing Credits Without Tax Liability',
  description: 'Section 6417 direct pay allows nonprofits, governments, and tribal entities to receive IRA tax credits as cash refunds.',
  datePublished: '2026-03-01',
  dateModified: '2026-03-01',
  author: { '@type': 'Organization', name: 'IncentEdge Research Team', url: 'https://incentedge.com' },
  publisher: { '@type': 'Organization', name: 'IncentEdge', url: 'https://incentedge.com' },
  mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://incentedge.com/blog/direct-pay-election' },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is Section 6417 direct pay?',
      acceptedAnswer: { '@type': 'Answer', text: 'Section 6417 of the Internal Revenue Code, enacted by the IRA, allows eligible entities to elect to treat certain tax credits as "elective payments" — meaning the IRS pays out the credit amount as a direct cash payment, just like a tax refund, even if the entity has no federal tax liability. This allows tax-exempt organizations, governments, and tribal nations to benefit from clean energy credits for the first time.' },
    },
    {
      '@type': 'Question',
      name: 'Who can elect direct pay?',
      acceptedAnswer: { '@type': 'Answer', text: 'The following entities can elect direct pay for ALL eligible credits: (1) Tax-exempt organizations described in Section 501(c) (nonprofits, churches, charitable organizations); (2) State, territorial, and local governments (and their instrumentalities); (3) Indian tribal governments; (4) Alaska Native Corporations; (5) Tennessee Valley Authority; (6) Rural electric cooperatives (Section 501(c)(12)). Additionally, ANY taxpayer (including for-profit entities) can elect direct pay for 45Q (carbon capture) and 45V (clean hydrogen) credits during the first 5 years the credit is earned.' },
    },
    {
      '@type': 'Question',
      name: 'What is the domestic content penalty for direct pay?',
      acceptedAnswer: { '@type': 'Answer', text: 'If a direct pay electing entity does not satisfy the domestic content requirements (US steel, iron, and manufactured products), the credit amount is reduced by 10 percentage points. For a 30% ITC, this means a direct pay credit of only 20% instead of 30%. For PTC, the rate is reduced by 10%. This reduction does not apply to the first 3 years of the program (2023-2025) for projects that cannot satisfy domestic content due to supply chain limitations and obtain a written determination from Treasury.' },
    },
    {
      '@type': 'Question',
      name: 'How does a direct pay election differ from transferability?',
      acceptedAnswer: { '@type': 'Answer', text: 'Direct pay (Section 6417) means the entity receives cash directly from the IRS — no buyer needed. Transferability (Section 6418) means the entity sells the credit to a third-party buyer for cash at a market discount (typically 88-96 cents per dollar). Tax-exempt entities that qualify for direct pay typically receive more value through direct pay (100 cents on the dollar, minus domestic content penalty if applicable) than through transferability. However, direct pay requires filing a tax return (even for non-filers) and waiting for the IRS refund cycle.' },
    },
    {
      '@type': 'Question',
      name: 'How do I make a direct pay election?',
      acceptedAnswer: { '@type': 'Answer', text: 'To elect direct pay, the eligible entity must: (1) File an annual tax return (Form 990-T for most tax-exempt organizations; Form 1120-POL for some government entities — Treasury provides guidance on the applicable return); (2) Complete Form 3800 (General Business Credit) and the applicable credit form (e.g., Form 3468 for ITC); (3) Make the elective payment election on the return; (4) Obtain a unique registration number from the IRS\'s online portal (registration opens each year prior to the filing deadline). The IRS issues the direct payment as a refund, typically within the normal refund processing timeframe.' },
    },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://incentedge.com' },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://incentedge.com/blog' },
    { '@type': 'ListItem', position: 3, name: 'Direct Pay Election', item: 'https://incentedge.com/blog/direct-pay-election' },
  ],
};

const RELATED_POSTS = [
  { slug: 'transferable-tax-credits-guide', title: 'IRA Transferable Tax Credits: The Complete Guide to Buying and Selling Credits' },
  { slug: 'ira-bonus-adders-explained', title: 'IRA Bonus Adders: How to Stack Credits From 30% to 70%' },
  { slug: 'itc-vs-ptc-comparison', title: 'ITC vs. PTC: Which Credit Maximizes Your Clean Energy Project\'s Value?' },
];

export default function DirectPayElectionPage() {
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
            <span className="text-deep-900 dark:text-deep-100">Direct Pay Election</span>
          </nav>

          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">Finance Team Guides</span>
            <span className="text-[13px] text-deep-500 dark:text-sage-500">IncentEdge Research Team</span>
            <span className="text-deep-300 dark:text-deep-700">·</span>
            <span className="text-[13px] text-deep-500 dark:text-sage-500">March 1, 2026</span>
            <span className="text-deep-300 dark:text-deep-700">·</span>
            <span className="text-[13px] text-deep-500 dark:text-sage-500">Last Updated: March 1, 2026</span>
          </div>

          <h1 className="font-sora text-3xl md:text-4xl font-bold text-deep-900 dark:text-white mb-6 leading-tight">
            Direct Pay Under the IRA: Monetizing Credits Without Tax Liability
          </h1>

          <p className="text-lg text-deep-600 dark:text-sage-400 mb-10 leading-relaxed border-l-4 border-teal-400 pl-4">
            For decades, tax-exempt organizations, municipalities, and tribal nations were locked out of clean energy tax credits — they simply had no tax liability to offset. Section 6417 of the IRA changed everything. Direct pay turns credits into cash refunds from the IRS, no tax bill required.
          </p>

          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-4">What Is Direct Pay?</h2>
          <p className="text-deep-700 dark:text-sage-300 mb-4 leading-relaxed">
            Section 6417 created the concept of an "elective payment election." Rather than using a tax credit to reduce a tax liability, an eligible entity can elect to treat the credit as an overpayment of tax — which the IRS then refunds in cash, exactly like a tax refund. The entity receives 100 cents on the dollar of the applicable credit amount (subject to the domestic content adjustment discussed below).
          </p>
          <p className="text-deep-700 dark:text-sage-300 mb-6 leading-relaxed">
            This was a transformative change for the clean energy landscape. Prior to the IRA, a nonprofit building a solar array on its community center had two options: pursue a costly tax equity partnership (if the project was large enough to attract a tax equity investor) or leave the credits uncaptured. Now, the nonprofit can simply receive the ITC as a check from the Treasury.
          </p>

          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-4">Who Can Elect Direct Pay</h2>
          <p className="text-deep-700 dark:text-sage-300 mb-4 leading-relaxed">
            Direct pay eligibility has two tiers:
          </p>
          <div className="space-y-4 mb-6">
            <div className="p-5 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-900/20">
              <h3 className="font-semibold text-deep-900 dark:text-deep-100 mb-3">Tier 1: All Eligible Credits (Unlimited Years)</h3>
              <ul className="space-y-2 text-[14px] text-deep-700 dark:text-sage-300">
                <li className="flex items-start gap-2"><span className="text-teal-500 font-bold mt-0.5">+</span> 501(c) tax-exempt organizations (nonprofits, hospitals, universities, churches)</li>
                <li className="flex items-start gap-2"><span className="text-teal-500 font-bold mt-0.5">+</span> State, territorial, and local governments and their instrumentalities</li>
                <li className="flex items-start gap-2"><span className="text-teal-500 font-bold mt-0.5">+</span> Indian tribal governments and Alaska Native Corporations</li>
                <li className="flex items-start gap-2"><span className="text-teal-500 font-bold mt-0.5">+</span> Rural electric cooperatives (Section 501(c)(12))</li>
                <li className="flex items-start gap-2"><span className="text-teal-500 font-bold mt-0.5">+</span> Tennessee Valley Authority</li>
              </ul>
            </div>
            <div className="p-5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
              <h3 className="font-semibold text-deep-900 dark:text-deep-100 mb-3">Tier 2: 45Q and 45V Credits Only (First 5 Years)</h3>
              <ul className="space-y-2 text-[14px] text-deep-700 dark:text-sage-300">
                <li className="flex items-start gap-2"><span className="text-blue-500 font-bold mt-0.5">+</span> ANY taxpayer (including for-profit C-corps, LLCs, partnerships) may elect direct pay for 45Q (carbon capture) or 45V (clean hydrogen) credits for the first 5 taxable years those credits are earned</li>
                <li className="flex items-start gap-2"><span className="text-blue-500 font-bold mt-0.5">+</span> This is specifically designed to support early-stage development of carbon capture and hydrogen industries</li>
              </ul>
            </div>
          </div>

          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-4">Eligible Credits</h2>
          <p className="text-deep-700 dark:text-sage-300 mb-4 leading-relaxed">
            The following credits are eligible for direct pay election under Section 6417:
          </p>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-[14px] border border-deep-200 dark:border-deep-700 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-deep-50 dark:bg-deep-800">
                  <th className="text-left px-4 py-3 font-semibold text-deep-900 dark:text-deep-100 border-b border-deep-200 dark:border-deep-700">Credit</th>
                  <th className="text-left px-4 py-3 font-semibold text-deep-600 dark:text-sage-400 border-b border-deep-200 dark:border-deep-700">Description</th>
                  <th className="text-left px-4 py-3 font-semibold text-deep-600 dark:text-sage-400 border-b border-deep-200 dark:border-deep-700">Direct Pay Eligible</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-deep-100 dark:divide-deep-800">
                {[
                  ['§48 ITC', 'Investment Tax Credit for solar, wind, storage, geothermal', 'Yes (Tier 1 entities)'],
                  ['§45 PTC', 'Production Tax Credit for wind, solar, geothermal, etc.', 'Yes (Tier 1 entities)'],
                  ['§45Q', 'Carbon oxide sequestration credit', 'Yes (Tiers 1 & 2)'],
                  ['§45V', 'Clean hydrogen production credit', 'Yes (Tiers 1 & 2)'],
                  ['§48C', 'Advanced energy project credit', 'Yes (Tier 1 entities)'],
                  ['§45L', 'New energy efficient home credit', 'Yes (Tier 1 entities)'],
                  ['§179D', 'Energy efficient commercial building deduction', 'No (deduction, not credit)'],
                  ['LIHTC (§42)', 'Low-income housing tax credit', 'No (not listed in §6417)'],
                ].map(([credit, desc, eligible]) => (
                  <tr key={credit} className="hover:bg-deep-50/50 dark:hover:bg-deep-900/50">
                    <td className="px-4 py-3 font-medium text-deep-900 dark:text-deep-100">{credit}</td>
                    <td className="px-4 py-3 text-deep-600 dark:text-sage-400">{desc}</td>
                    <td className={`px-4 py-3 font-medium ${eligible.startsWith('Yes') ? 'text-teal-700 dark:text-teal-300' : 'text-deep-500 dark:text-sage-500'}`}>{eligible}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-4">The Domestic Content Penalty</h2>
          <p className="text-deep-700 dark:text-sage-300 mb-4 leading-relaxed">
            Direct pay electing entities face a significant caveat: if the project does not satisfy domestic content requirements, the credit is reduced by <strong className="text-deep-900 dark:text-deep-100">10 percentage points</strong>. For ITC, this means:
          </p>
          <ul className="list-disc list-inside space-y-1 text-deep-700 dark:text-sage-300 mb-4 ml-2">
            <li>With domestic content + PWA: 30% ITC via direct pay</li>
            <li>Without domestic content + with PWA: 20% ITC via direct pay</li>
          </ul>
          <p className="text-deep-700 dark:text-sage-300 mb-6 leading-relaxed">
            Note that this penalty does not apply to taxable entities using transferability (Section 6418). If your organization cannot satisfy domestic content requirements, it may be worth modeling whether transferability at 88-96 cents outperforms direct pay at 20 cents per dollar of eligible basis.
          </p>

          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-4">Direct Pay vs. Transferability: Quick Comparison</h2>
          <div className="overflow-x-auto mb-8">
            <table className="w-full text-[14px] border border-deep-200 dark:border-deep-700 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-deep-50 dark:bg-deep-800">
                  <th className="text-left px-4 py-3 font-semibold text-deep-900 dark:text-deep-100 border-b border-deep-200 dark:border-deep-700">Factor</th>
                  <th className="text-left px-4 py-3 font-semibold text-teal-700 dark:text-teal-300 border-b border-deep-200 dark:border-deep-700">Direct Pay (§6417)</th>
                  <th className="text-left px-4 py-3 font-semibold text-blue-700 dark:text-blue-300 border-b border-deep-200 dark:border-deep-700">Transferability (§6418)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-deep-100 dark:divide-deep-800">
                {[
                  ['Who can use it', 'Tax-exempt orgs, govts, tribal + all for 45Q/45V', 'Any taxpayer that generated the credit'],
                  ['Cash received', '100¢ per $1 (minus domestic content penalty)', '88-96¢ per $1 (market pricing)'],
                  ['Buyer required', 'No — IRS pays directly', 'Yes — must find a buyer'],
                  ['Tax return required', 'Yes — must file even if non-filer', 'Yes — seller must file to elect'],
                  ['Timing', 'Annual tax return cycle (could be 6-18 months)', '4-8 weeks post-transaction signing'],
                  ['Domestic content impact', '-10pp if not satisfied', 'No penalty (buyer bears indirectly)'],
                ].map(([factor, dp, tr]) => (
                  <tr key={factor} className="hover:bg-deep-50/50 dark:hover:bg-deep-900/50">
                    <td className="px-4 py-3 font-medium text-deep-900 dark:text-deep-100">{factor}</td>
                    <td className="px-4 py-3 text-deep-600 dark:text-sage-400">{dp}</td>
                    <td className="px-4 py-3 text-deep-600 dark:text-sage-400">{tr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-4">Real-World Examples</h2>
          <div className="space-y-4 mb-8">
            <div className="p-5 rounded-xl border border-deep-100 dark:border-deep-800">
              <h3 className="font-semibold text-deep-900 dark:text-deep-100 mb-2">Example 1: City Solar Array</h3>
              <p className="text-[14px] text-deep-600 dark:text-sage-400 leading-relaxed">
                A municipality installs a 500kW solar array on its public works building at a cost of $1.2M. The ITC is 30% = $360,000. The project uses domestic US-manufactured panels. The city files a Form 3800 election on its annual return and receives a $360,000 refund from the IRS — effectively reducing the net project cost to $840,000, a 30% savings.
              </p>
            </div>
            <div className="p-5 rounded-xl border border-deep-100 dark:border-deep-800">
              <h3 className="font-semibold text-deep-900 dark:text-deep-100 mb-2">Example 2: Hospital Energy Efficiency</h3>
              <p className="text-[14px] text-deep-600 dark:text-sage-400 leading-relaxed">
                A nonprofit hospital installs a 2MW combined heat and power (CHP) system at a cost of $4M. The system qualifies for ITC at 30% = $1.2M. The hospital satisfies prevailing wage through a union construction agreement. Using direct pay, the hospital receives $1.2M from the IRS, reducing its net capital cost to $2.8M — dramatically improving the project ROI without needing a tax equity investor.
              </p>
            </div>
          </div>

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
              Whether you're a municipality, nonprofit, or for-profit developer, IncentEdge models your direct pay and transferability options side-by-side so you choose the highest-value path.
            </p>
            <Link href="/signup" className="inline-flex items-center gap-2 px-7 py-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[14px] font-semibold transition-colors">
              Start Free Analysis <ArrowRight className="w-4 h-4" />
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
