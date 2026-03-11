import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'IRA Incentives in Project Finance: How Clean Energy Deals Get Done in 2026',
  description:
    'How IRA tax credits flow through clean energy project finance structures. Tax equity, transferability, debt sizing, and incentive stacking for solar, wind, and storage projects.',
  alternates: { canonical: 'https://incentedge.com/blog/ira-project-finance-incentives' },
  openGraph: {
    title: 'IRA Incentives in Project Finance: How Clean Energy Deals Get Done in 2026',
    description: 'How IRA tax credits flow through clean energy project finance. Tax equity, transferability, debt sizing, and incentive stacking explained.',
    url: 'https://incentedge.com/blog/ira-project-finance-incentives',
    type: 'article',
  },
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'How IRA Incentives Work in Clean Energy Project Finance',
  description: 'How IRA tax credits flow through clean energy project finance structures.',
  datePublished: '2026-03-01',
  dateModified: '2026-03-01',
  author: { '@type': 'Organization', name: 'IncentEdge Research Team', url: 'https://incentedge.com' },
  publisher: { '@type': 'Organization', name: 'IncentEdge', url: 'https://incentedge.com' },
  mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://incentedge.com/blog/ira-project-finance-incentives' },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is project finance?',
      acceptedAnswer: { '@type': 'Answer', text: 'Project finance is a financing structure in which a project (typically infrastructure or energy) is funded through the cash flows and assets of the project itself, with limited or no recourse to the parent company or sponsor. A Special Purpose Vehicle (SPV) is created to own the project, issue debt, and receive revenues. Lenders look to the project\'s revenue stream — PPAs, capacity payments, RECs — to service the debt. Clean energy projects have used project finance since the 1980s.' },
    },
    {
      '@type': 'Question',
      name: 'How does ITC affect debt sizing in project finance?',
      acceptedAnswer: { '@type': 'Answer', text: 'The ITC reduces the effective capital cost of the project, which improves the project\'s debt service coverage ratio (DSCR) and allows for more debt. However, lenders typically account for the ITC on a "basis risk" basis — they size debt to the after-ITC net investment cost, and the tax equity investor funds the ITC-equivalent portion. For a 100MW solar project with $120M capex, the ITC at 30% = $36M. The lender might fund 60% of the $84M net cost ($50M debt), with the tax equity investor or transferred credit proceeds funding the remaining equity.' },
    },
    {
      '@type': 'Question',
      name: 'What is a tax credit bridge loan?',
      acceptedAnswer: { '@type': 'Answer', text: 'A tax credit bridge loan is a short-term construction or bridge loan that provides liquidity between when the project is commissioned (and the ITC is earned) and when the tax equity investor or credit buyer actually closes and funds. Since tax equity deals can take months to finalize and transferred credit proceeds may not be available until after tax return filing, developers often need a bridge loan to cover this timing gap. Bridge loans for ITC are typically 12-24 months and are sized to the anticipated credit proceeds.' },
    },
    {
      '@type': 'Question',
      name: 'Can IRA tax credits be securitized?',
      acceptedAnswer: { '@type': 'Answer', text: 'PTC streams (which produce annual credit cash flows over 10 years) have been explored for securitization — similar to how utility PACE assessments and other structured products are securitized. As of 2026, the market for PTC securitization is nascent but growing, driven by large offshore wind and geothermal developers seeking to monetize the PTC stream in the capital markets. The ITC, as a one-time credit at commissioning, is not typically securitized.' },
    },
    {
      '@type': 'Question',
      name: 'How do bonus adders affect the capital stack?',
      acceptedAnswer: { '@type': 'Answer', text: 'Bonus adders directly increase the credit value, which flows through the capital stack as additional equity or proceeds. For a project in an energy community with domestic content satisfied, the ITC might be 50% rather than 30% — adding 20 percentage points to the credit on the eligible basis. On a $100M project, this is $20M of additional value that can be monetized through tax equity (increasing the tax equity investor\'s contribution) or transferability (generating more cash proceeds from the credit sale).' },
    },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://incentedge.com' },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://incentedge.com/blog' },
    { '@type': 'ListItem', position: 3, name: 'IRA Project Finance Incentives', item: 'https://incentedge.com/blog/ira-project-finance-incentives' },
  ],
};

const RELATED_POSTS = [
  { slug: 'tax-equity-vs-transferability', title: 'Tax Equity vs. Credit Transferability: Choosing the Right IRA Structure' },
  { slug: 'ira-bonus-adders-explained', title: 'IRA Bonus Adders: How to Stack Credits From 30% to 70%' },
  { slug: 'ira-incentive-due-diligence', title: 'IRA Incentive Due Diligence: Your 48-Hour Framework' },
];

export default function IRAProjectFinancePage() {
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
            <span className="text-deep-900 dark:text-deep-100">IRA Project Finance Incentives</span>
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
            How IRA Incentives Work in Clean Energy Project Finance
          </h1>

          <p className="text-lg text-deep-600 dark:text-sage-400 mb-10 leading-relaxed border-l-4 border-teal-400 pl-4">
            Clean energy project finance has been transformed by the IRA. The traditional two-layer stack — tax equity plus debt — now has a third option: credit transferability. Understanding how these layers interact is essential for any finance team closing clean energy deals in 2026.
          </p>

          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-4">Project Finance 101</h2>
          <p className="text-deep-700 dark:text-sage-300 mb-4 leading-relaxed">
            Clean energy projects are typically financed through a <strong className="text-deep-900 dark:text-deep-100">Special Purpose Vehicle (SPV)</strong> — a separate legal entity created specifically to own, develop, and operate the asset. The SPV structure provides:
          </p>
          <ul className="list-disc list-inside space-y-2 text-deep-700 dark:text-sage-300 mb-6 ml-2">
            <li>Bankruptcy remoteness (project creditors cannot reach the sponsor's other assets)</li>
            <li>Clean allocation of tax benefits (the SPV holds all project assets and generates all tax attributes)</li>
            <li>Efficient capital structuring (each layer of capital can be sized and priced independently)</li>
          </ul>
          <p className="text-deep-700 dark:text-sage-300 mb-6 leading-relaxed">
            The SPV enters into a Power Purchase Agreement (PPA) or other revenue contract, signs EPC and O&M agreements, and obtains project-level debt financing (non-recourse to the sponsor). The sponsor provides or arranges equity, tax equity, and sometimes a transferability proceeds bridge.
          </p>

          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-4">The Traditional Capital Stack</h2>
          <p className="text-deep-700 dark:text-sage-300 mb-4 leading-relaxed">
            Before the IRA, a utility-scale solar project's capital stack typically looked like this:
          </p>
          <div className="rounded-xl border border-deep-200 dark:border-deep-700 overflow-hidden mb-6">
            {[
              { layer: 'Senior Debt', pct: '55-65%', color: 'bg-deep-700', desc: 'Non-recourse term loan from commercial banks or institutional lenders; lowest cost of capital; sized to DSCR of 1.25-1.35x' },
              { layer: 'Tax Equity', pct: '25-35%', color: 'bg-teal-600', desc: 'Investment from bank or corporation seeking ITC/PTC + depreciation; earns return through tax benefits, not cash distributions' },
              { layer: 'Sponsor Equity', pct: '10-20%', color: 'bg-deep-400', desc: 'Cash equity from the developer/owner; highest return expectation; residual cash flows after debt service' },
            ].map(({ layer, pct, color, desc }) => (
              <div key={layer} className="border-b border-deep-100 dark:border-deep-800 last:border-0 p-4">
                <div className="flex items-center gap-4 mb-2">
                  <div className={`w-3 h-3 rounded-sm ${color} flex-shrink-0`} />
                  <span className="font-semibold text-deep-900 dark:text-deep-100">{layer}</span>
                  <span className="font-mono text-teal-700 dark:text-teal-300 ml-auto">{pct}</span>
                </div>
                <p className="text-[13px] text-deep-600 dark:text-sage-400 ml-7">{desc}</p>
              </div>
            ))}
          </div>

          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-4">How IRA Changed the Stack</h2>
          <p className="text-deep-700 dark:text-sage-300 mb-4 leading-relaxed">
            The IRA introduced transferability as a third monetization option alongside traditional tax equity. This created a new capital stack configuration — particularly for smaller projects and first-time developers:
          </p>
          <div className="rounded-xl border border-deep-200 dark:border-deep-700 overflow-hidden mb-6">
            {[
              { layer: 'Senior Debt', pct: '55-65%', color: 'bg-deep-700', desc: 'Unchanged from traditional structure' },
              { layer: 'Transferred Credit Proceeds', pct: '15-25%', color: 'bg-teal-500', desc: 'Cash from selling transferred ITC/PTC to corporate buyer (88-96¢/dollar); replaces tax equity for credit value but does not capture depreciation' },
              { layer: 'Sponsor Equity', pct: '15-25%', color: 'bg-deep-400', desc: 'Larger sponsor equity requirement than traditional tax equity structure (no depreciation monetization)' },
            ].map(({ layer, pct, color, desc }) => (
              <div key={layer} className="border-b border-deep-100 dark:border-deep-800 last:border-0 p-4">
                <div className="flex items-center gap-4 mb-2">
                  <div className={`w-3 h-3 rounded-sm ${color} flex-shrink-0`} />
                  <span className="font-semibold text-deep-900 dark:text-deep-100">{layer}</span>
                  <span className="font-mono text-teal-700 dark:text-teal-300 ml-auto">{pct}</span>
                </div>
                <p className="text-[13px] text-deep-600 dark:text-sage-400 ml-7">{desc}</p>
              </div>
            ))}
          </div>

          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-4">ITC Monetization Timeline</h2>
          <p className="text-deep-700 dark:text-sage-300 mb-4 leading-relaxed">
            Understanding the timing of ITC proceeds is critical for liquidity planning:
          </p>
          <div className="space-y-3 mb-6">
            {[
              { time: 'Month 0-18', event: 'Construction phase', detail: 'Equity and construction debt fund project costs. Tax credit bridge lenders may fund ITC-equivalent amount pending close.' },
              { time: 'Month 18-24', event: 'Commercial operation / Placed in service', detail: 'ITC is earned (ITC) or begins accruing (PTC). Tax equity investor or credit transfer buyer is identified and diligence begins.' },
              { time: 'Month 24-30', event: 'Tax equity or transfer close', detail: 'Tax equity investor funds; OR credit transfer closes (4-8 weeks) and buyer pays 88-96¢/dollar in cash. Bridge loan repaid.' },
              { time: 'Tax Year +1', event: 'Credit claimed on tax return', detail: 'ITC is claimed on the tax return for the year placed in service. Form 3468 + Form 3800 filed.' },
            ].map(({ time, event, detail }) => (
              <div key={time} className="flex gap-4 p-4 rounded-lg border border-deep-100 dark:border-deep-800">
                <div className="w-24 flex-shrink-0">
                  <span className="font-mono text-[11px] font-bold text-teal-600 dark:text-teal-400">{time}</span>
                </div>
                <div>
                  <p className="font-semibold text-deep-900 dark:text-deep-100 text-[14px] mb-0.5">{event}</p>
                  <p className="text-[13px] text-deep-600 dark:text-sage-400">{detail}</p>
                </div>
              </div>
            ))}
          </div>

          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-4">Incentive Stacking in the Capital Stack</h2>
          <p className="text-deep-700 dark:text-sage-300 mb-4 leading-relaxed">
            IRA incentives do not exist in isolation. Effective project finance integrates multiple incentive layers:
          </p>
          <ul className="list-disc list-inside space-y-2 text-deep-700 dark:text-sage-300 mb-8 ml-2">
            <li><strong className="text-deep-900 dark:text-deep-100">ITC + bonus adders:</strong> Base 30% + energy community (+10%) + domestic content (+10%) = 50% ITC on eligible basis. Every percentage point of adder is additional capital to fund the project.</li>
            <li><strong className="text-deep-900 dark:text-deep-100">State tax incentives + federal ITC:</strong> Many states offer additional credits or property tax exemptions for clean energy. These stack on top of federal credits, further reducing net project cost.</li>
            <li><strong className="text-deep-900 dark:text-deep-100">PACE financing:</strong> Property Assessed Clean Energy financing is a low-cost, long-term debt layer that stacks with the ITC and project finance debt in some jurisdictions.</li>
            <li><strong className="text-deep-900 dark:text-deep-100">Grant programs:</strong> DOE loan guarantees, USDA REAP grants, and some state grant programs can be combined with federal tax credits (subject to basis reduction rules).</li>
          </ul>

          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-4">Case Study: 50MW Solar + Storage</h2>
          <div className="p-6 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-900/20 mb-8">
            <p className="font-semibold text-deep-900 dark:text-deep-100 mb-4">Project: 50MW solar + 25MW/100MWh BESS, energy community + domestic content qualified</p>
            <div className="space-y-2 text-[14px]">
              <div className="flex justify-between text-deep-700 dark:text-sage-300"><span>Total capex (solar + storage)</span><span className="font-mono">$85M</span></div>
              <div className="flex justify-between text-deep-700 dark:text-sage-300"><span>Solar eligible basis</span><span className="font-mono">$55M</span></div>
              <div className="flex justify-between text-deep-700 dark:text-sage-300"><span>Storage eligible basis (ITC only)</span><span className="font-mono">$25M</span></div>
              <div className="flex justify-between text-deep-700 dark:text-sage-300"><span>Solar ITC rate (30% + 10% EC + 10% DC)</span><span className="font-mono">50%</span></div>
              <div className="flex justify-between text-deep-700 dark:text-sage-300"><span>Storage ITC rate (same adders)</span><span className="font-mono">50%</span></div>
              <div className="h-px bg-teal-200 dark:bg-teal-700 my-2" />
              <div className="flex justify-between font-bold text-deep-900 dark:text-deep-100"><span>Solar ITC</span><span className="font-mono text-teal-700 dark:text-teal-300">$27.5M</span></div>
              <div className="flex justify-between font-bold text-deep-900 dark:text-deep-100"><span>Storage ITC</span><span className="font-mono text-teal-700 dark:text-teal-300">$12.5M</span></div>
              <div className="flex justify-between font-bold text-deep-900 dark:text-deep-100 text-lg pt-1 border-t border-teal-200 dark:border-teal-700"><span>Total ITC Credits</span><span className="font-mono text-teal-700 dark:text-teal-300">$40M</span></div>
            </div>
            <p className="text-[13px] text-deep-600 dark:text-sage-400 mt-4">
              At transfer pricing of 93¢/dollar, transferred credit proceeds = $37.2M. Combined with $50M project debt and $3.2M sponsor equity, the full $85M project is financed with minimal equity — effectively a 4% equity requirement before depreciation.
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
              IncentEdge builds your full IRA credit stack — ITC, bonus adders, transferability proceeds — and models how they fit into your project capital stack. Get your full analysis in 60 seconds.
            </p>
            <Link href="/signup" className="inline-flex items-center gap-2 px-7 py-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[14px] font-semibold transition-colors">
              Model Your Project Capital Stack <ArrowRight className="w-4 h-4" />
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
