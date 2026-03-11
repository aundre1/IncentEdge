import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'ITC vs. PTC: How to Choose the Right Clean Energy Tax Credit Structure',
  description:
    'Compare the Investment Tax Credit (ITC) and Production Tax Credit (PTC) for clean energy projects. Learn when to choose each based on project economics, technology, and timeline.',
  alternates: { canonical: 'https://incentedge.com/blog/itc-vs-ptc-comparison' },
  openGraph: {
    title: 'ITC vs. PTC: How to Choose the Right Clean Energy Tax Credit Structure',
    description: 'Compare the ITC and PTC for clean energy projects. When to choose each based on project economics, technology, and timeline.',
    url: 'https://incentedge.com/blog/itc-vs-ptc-comparison',
    type: 'article',
  },
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'ITC vs. PTC: Which Credit Maximizes Your Clean Energy Project\'s Value?',
  description: 'Compare the Investment Tax Credit (ITC) and Production Tax Credit (PTC) for clean energy projects.',
  datePublished: '2026-03-01',
  dateModified: '2026-03-01',
  author: { '@type': 'Organization', name: 'IncentEdge Research Team', url: 'https://incentedge.com' },
  publisher: { '@type': 'Organization', name: 'IncentEdge', url: 'https://incentedge.com' },
  mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://incentedge.com/blog/itc-vs-ptc-comparison' },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Can a solar project choose between ITC and PTC?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. The IRA made the PTC available for solar projects for the first time, effective for projects beginning construction after December 31, 2022. Prior to the IRA, solar was ITC-only. Now, solar developers can elect either the 30% ITC or the 2.75¢/kWh PTC. The optimal choice depends on the project\'s capacity factor, financing structure, and whether the developer prefers upfront certainty (ITC) or long-term revenue (PTC).' },
    },
    {
      '@type': 'Question',
      name: 'What is the current PTC rate?',
      acceptedAnswer: { '@type': 'Answer', text: 'The base PTC rate is 0.55¢/kWh for projects that do not satisfy prevailing wage and apprenticeship requirements (or are under 1MW AC). For projects meeting PWA requirements, the bonus PTC rate is 2.75¢/kWh (as of 2023, subject to inflation adjustment — approximately $0.03/kWh as of 2026 after adjustments). The credit is available for 10 years from the date the facility is placed in service.' },
    },
    {
      '@type': 'Question',
      name: 'Which clean energy technologies are eligible for PTC vs ITC?',
      acceptedAnswer: { '@type': 'Answer', text: 'Post-IRA, most clean energy technologies are eligible for BOTH ITC and PTC. Technologies eligible for both include: solar (all types), onshore wind, offshore wind, geothermal electric, hydropower, marine and hydrokinetic, landfill gas, biomass, and battery storage (storage is ITC-only — it cannot generate electricity independently, so no PTC). Technologies that are ITC-only include: combined heat and power, fuel cells, small wind (<100kW), microturbines, geothermal heat pumps, and other property in Section 48.' },
    },
    {
      '@type': 'Question',
      name: 'How do bonus adders interact with ITC vs. PTC?',
      acceptedAnswer: { '@type': 'Answer', text: 'Bonus adders (energy community, domestic content, low-income) apply to both ITC and PTC. For ITC, the adders add percentage points to the base 30% rate. For PTC, the adders add 10% to the per-kWh rate for energy community and domestic content, and 10-20% for low-income. The relative value of bonus adders tends to favor ITC slightly for most technology types, because the absolute per-unit increase is larger when the base is higher (30% vs. per-kWh rates).' },
    },
    {
      '@type': 'Question',
      name: 'Is the ITC or PTC better for a merchant solar project?',
      acceptedAnswer: { '@type': 'Answer', text: 'For merchant solar (selling power at spot market rates without a long-term PPA), the ITC is generally preferred. The ITC provides full value at commissioning regardless of actual generation, eliminating production risk. The PTC only pays out over 10 years based on actual kWh produced, creating uncertainty in merchant markets where electricity prices can drop. Exception: if a project is in a high-value market with sustained high electricity prices, the 10-year PTC stream may have higher NPV.' },
    },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://incentedge.com' },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://incentedge.com/blog' },
    { '@type': 'ListItem', position: 3, name: 'ITC vs. PTC Comparison', item: 'https://incentedge.com/blog/itc-vs-ptc-comparison' },
  ],
};

const RELATED_POSTS = [
  { slug: 'tax-equity-vs-transferability', title: 'Tax Equity vs. Credit Transferability: Choosing the Right IRA Structure' },
  { slug: 'ira-bonus-adders-explained', title: 'IRA Bonus Adders: How to Stack Credits From 30% to 70%' },
  { slug: 'ira-project-finance-incentives', title: 'How IRA Incentives Work in Clean Energy Project Finance' },
];

export default function ITCvsPTCPage() {
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
            <span className="text-deep-900 dark:text-deep-100">ITC vs. PTC</span>
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
            ITC vs. PTC: Which Credit Maximizes Your Clean Energy Project's Value?
          </h1>

          <p className="text-lg text-deep-600 dark:text-sage-400 mb-10 leading-relaxed border-l-4 border-teal-400 pl-4">
            The IRA made the ITC and PTC available for most clean energy technologies — giving developers a choice they never had before. For solar developers in particular, this election is new and consequential. Here's the complete framework for deciding which credit maximizes your project's value.
          </p>

          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-4">Overview: Both Available for Most Technologies</h2>
          <p className="text-deep-700 dark:text-sage-300 mb-4 leading-relaxed">
            Before the IRA, the ITC and PTC were available for different technologies on a fixed basis — wind projects claimed the PTC, solar projects claimed the ITC. The IRA's "technology-neutral" framework changed this: from 2023 onward, both credits are available for solar, wind, geothermal, hydropower, and most other clean energy generation technologies. The taxpayer elects which credit to take.
          </p>
          <p className="text-deep-700 dark:text-sage-300 mb-6 leading-relaxed">
            This election is irrevocable once made — you cannot switch after filing. The analysis must be done before construction begins (ideally) or at least before the placed-in-service date.
          </p>

          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-6">Side-by-Side Comparison</h2>
          <div className="overflow-x-auto mb-8">
            <table className="w-full text-[14px] border border-deep-200 dark:border-deep-700 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-deep-50 dark:bg-deep-800">
                  <th className="text-left px-4 py-3 font-semibold text-deep-900 dark:text-deep-100 border-b border-deep-200 dark:border-deep-700">Factor</th>
                  <th className="text-left px-4 py-3 font-semibold text-teal-700 dark:text-teal-300 border-b border-deep-200 dark:border-deep-700">ITC (§48)</th>
                  <th className="text-left px-4 py-3 font-semibold text-blue-700 dark:text-blue-300 border-b border-deep-200 dark:border-deep-700">PTC (§45)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-deep-100 dark:divide-deep-800">
                {[
                  ['Credit basis', '% of eligible capital cost (30% + adders)', 'Per kWh generated (2.75¢/kWh + adders)'],
                  ['Timing', 'Claimed at commissioning (Year 1)', 'Claimed over 10 years of production'],
                  ['Revenue risk', 'None — fixed at commissioning', 'Production-dependent; weather/curtailment risk'],
                  ['Benefit certainty', 'High — based on cost, not performance', 'Lower — depends on generation'],
                  ['Favors high capex?', 'Yes — more capex = more credit', 'No — capex is irrelevant to credit'],
                  ['Favors high capacity factor?', 'Neutral', 'Yes — more generation = more credit'],
                  ['Tax equity structure', 'Partnership flip (ITC at commissioning)', 'Pay-as-you-go (PTC over 10 years)'],
                  ['Transferability', 'Yes (§6418)', 'Yes (§6418)'],
                  ['Stacks with storage ITC?', 'Yes — storage gets separate ITC', 'Partial — storage output is ITC-only'],
                  ['Recapture risk', 'Yes — 5 years', 'No recapture (production-based)'],
                ].map(([factor, itc, ptc]) => (
                  <tr key={factor} className="hover:bg-deep-50/50 dark:hover:bg-deep-900/50">
                    <td className="px-4 py-3 font-medium text-deep-900 dark:text-deep-100">{factor}</td>
                    <td className="px-4 py-3 text-deep-600 dark:text-sage-400">{itc}</td>
                    <td className="px-4 py-3 text-deep-600 dark:text-sage-400">{ptc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-4">When ITC Wins</h2>
          <div className="space-y-4 mb-6">
            {[
              { title: 'Low-capacity factor projects', body: 'Solar projects in cloudy regions (New England, Pacific Northwest) or with high self-consumption and minimal curtailment protection may generate fewer kWh per MW of capacity. The ITC\'s cost-based calculation is immune to generation risk.' },
              { title: 'Merchant power markets', body: 'If the project sells power at spot prices without a long-term PPA, the PTC stream has revenue risk from both generation and electricity price. The ITC provides full value upfront regardless of future electricity prices.' },
              { title: 'Projects with high upfront capital needs', body: 'The ITC improves year-1 cash flows by generating a large, immediate credit. For projects with tight debt service or construction loans to repay, this upfront liquidity can be decisive.' },
              { title: 'Battery storage is paired', body: 'Paired battery storage is not eligible for PTC (it doesn\'t generate electricity independently). If your project includes significant storage, the ITC structure applies to the storage portion regardless — electing ITC for the whole project may simplify accounting.' },
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

          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-4">When PTC Wins</h2>
          <div className="space-y-4 mb-6">
            {[
              { title: 'High-capacity factor projects', body: 'Offshore wind (40-50%+ capacity factor), geothermal (90%+), and baseload projects generate more kWh per MW of capacity than solar. The PTC\'s per-kWh value translates to proportionally larger total credits over 10 years.' },
              { title: 'Projects with long-term PPAs', body: 'A project with a 20-25 year PPA at a fixed price has predictable generation revenue. The PTC stream over 10 years is similarly predictable and can be sized into the capital structure, including securitization.' },
              { title: 'PTC creates a better tax equity structure for some investors', body: 'The PTC\'s pay-as-you-go structure better matches the cash flow needs of certain tax equity investors. Investors with steady annual tax liability prefer the PTC\'s consistent annual credit delivery over a single large ITC in Year 1.' },
              { title: 'No recapture risk', body: 'The PTC has no recapture provision — it\'s earned based on actual production, so there is no risk of clawback if the project is refinanced, sold, or transferred during the credit period.' },
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

          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-4">Real Comparison: 100MW Solar Farm</h2>
          <p className="text-deep-700 dark:text-sage-300 mb-4 leading-relaxed">
            Assume a utility-scale solar project in the Southwest with the following parameters:
          </p>
          <div className="p-5 rounded-xl border border-deep-100 dark:border-deep-800 mb-6">
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-[14px] text-deep-700 dark:text-sage-300 mb-4">
              <div className="flex justify-between"><span>Capacity</span><span className="font-mono">100 MW AC</span></div>
              <div className="flex justify-between"><span>Capacity factor</span><span className="font-mono">27%</span></div>
              <div className="flex justify-between"><span>Total capital cost</span><span className="font-mono">$120M</span></div>
              <div className="flex justify-between"><span>Eligible basis (ITC)</span><span className="font-mono">$110M</span></div>
            </div>
            <div className="space-y-3 pt-4 border-t border-deep-100 dark:border-deep-800">
              <div>
                <p className="font-semibold text-deep-900 dark:text-deep-100 mb-1">ITC Path (30% + energy community adder = 40%)</p>
                <p className="text-[14px] text-deep-600 dark:text-sage-400">$110M × 40% = <span className="font-mono font-bold text-teal-700 dark:text-teal-300">$44M credit</span> at commissioning</p>
              </div>
              <div>
                <p className="font-semibold text-deep-900 dark:text-deep-100 mb-1">PTC Path (2.75¢/kWh × 10 years, same energy community adder)</p>
                <p className="text-[14px] text-deep-600 dark:text-sage-400">
                  100MW × 8,760 hrs × 27% × $0.0275/kWh × 10 years = <span className="font-mono font-bold text-blue-700 dark:text-blue-300">$65M undiscounted</span>
                  <br />
                  At 8% discount rate: ~<span className="font-mono font-bold text-blue-700 dark:text-blue-300">$43.6M NPV</span>
                </p>
              </div>
            </div>
            <p className="text-[12px] text-deep-500 dark:text-sage-500 mt-4 italic">
              In this example, ITC and PTC are roughly equivalent in NPV terms — the optimal choice depends on financing structure, recapture risk tolerance, and the investor's preference.
            </p>
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
              IncentEdge models ITC vs. PTC NPV for your specific project — capacity factor, capital cost, bonus adders, and financing assumptions — so you make the optimal election before it's irrevocable.
            </p>
            <Link href="/signup" className="inline-flex items-center gap-2 px-7 py-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[14px] font-semibold transition-colors">
              Model ITC vs. PTC for Your Project <ArrowRight className="w-4 h-4" />
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
