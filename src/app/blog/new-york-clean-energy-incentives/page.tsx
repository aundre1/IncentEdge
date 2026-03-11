import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PublicPageShell } from '@/components/public/PublicPageShell';

export const metadata: Metadata = {
  title: 'New York State Clean Energy Incentives: The Complete 2026 Stack',
  description:
    'Complete guide to New York clean energy incentives in 2026. NYSERDA programs, NY Green Bank, Con Edison rebates, and how to stack them with federal IRA credits.',
  alternates: { canonical: 'https://incentedge.com/blog/new-york-clean-energy-incentives' },
  openGraph: {
    title: 'New York State Clean Energy Incentives: The Complete 2026 Stack',
    description:
      'Complete guide to New York clean energy incentives in 2026. NYSERDA programs, NY Green Bank, Con Edison rebates, and how to stack them with federal IRA credits.',
    url: 'https://incentedge.com/blog/new-york-clean-energy-incentives',
    siteName: 'IncentEdge',
    type: 'article',
  },
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'New York State Clean Energy Incentives: The Complete 2026 Stack',
  description: 'Complete guide to New York clean energy incentives stacked with federal IRA credits.',
  url: 'https://incentedge.com/blog/new-york-clean-energy-incentives',
  author: { '@type': 'Organization', name: 'IncentEdge Research Team' },
  publisher: { '@type': 'Organization', name: 'IncentEdge', url: 'https://incentedge.com' },
  datePublished: '2026-03-01',
  dateModified: '2026-03-11',
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://incentedge.com' },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://incentedge.com/blog' },
    { '@type': 'ListItem', position: 3, name: 'New York Clean Energy Incentives', item: 'https://incentedge.com/blog/new-york-clean-energy-incentives' },
  ],
};

export default function NewYorkCleanEnergyPage() {
  return (
    <PublicPageShell breadcrumbs={[{ label: 'Blog', href: '/blog' }, { label: 'New York Clean Energy Incentives' }]}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <article className="max-w-3xl mx-auto px-6 py-12">
        <header className="mb-10">
          <div className="inline-flex items-center rounded-full border border-teal-200 dark:border-teal-700 bg-teal-50 dark:bg-teal-900/20 px-3 py-1 text-[12px] text-teal-700 dark:text-teal-300 mb-4">
            State Guide — New York
          </div>
          <h1 className="font-sora text-4xl font-bold tracking-tight text-deep-900 dark:text-white leading-[1.1] mb-4">
            New York Clean Energy Incentive Stack: Federal + State + Utility
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-[13px] text-deep-500 dark:text-sage-500 pb-6 border-b border-deep-100 dark:border-deep-800">
            <span>By IncentEdge Research Team</span>
            <span>March 2026</span>
            <span>14 min read</span>
          </div>
        </header>

        <div className="space-y-8 text-[15px] text-deep-700 dark:text-sage-300 leading-relaxed">

          <p className="text-lg text-deep-600 dark:text-sage-400 leading-relaxed">
            New York has one of the most robust clean energy incentive ecosystems in the United States. When combined with federal IRA credits, a typical NY commercial solar or multifamily energy project can access five to seven distinct programs simultaneously. This guide maps the full stack — from NYSERDA to Con Edison to federal ITC — with real project examples.
          </p>

          {/* Overview */}
          <section>
            <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-4">
              Why New York Is a Top-Tier Incentive State
            </h2>
            <p className="mb-4">
              New York&apos;s Climate Leadership and Community Protection Act (CLCPA) mandates 70% renewable electricity by 2030 and 100% zero-emission electricity by 2040. To meet these targets, the state has deployed an aggressive suite of incentive programs that complement and stack with federal IRA credits. Key reasons NY developers have an advantage:
            </p>
            <ul className="space-y-2 ml-4 mb-4">
              {[
                'NY-Sun Incentive Program (NYSERDA): Ongoing incentives for distributed solar stacking with ITC',
                'NY Green Bank: $1B+ in below-market financing for clean energy projects',
                'Consolidated Edison and National Grid: Utility interconnection incentives and demand response programs',
                'Energy community census tracts: Large portions of the Bronx, Brooklyn, upstate cities qualify for the +10% ITC bonus',
                'NYC Clean Buildings Law (Local Law 97): Compliance deadlines create urgency for commercial building energy upgrades',
                'NY PACE: Commercial PACE financing available statewide since 2019',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-[14px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0 mt-2" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* NYSERDA Programs */}
          <section>
            <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-5">
              NYSERDA Programs
            </h2>

            <div className="space-y-5">
              <div className="rounded-lg border border-deep-100 dark:border-deep-800 p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-deep-900 dark:text-deep-100">NY-Sun Incentive Program</h3>
                  <span className="font-mono text-teal-600 dark:text-teal-400 text-[13px] font-semibold">$0.20–$0.60/W</span>
                </div>
                <p className="text-[14px] text-deep-600 dark:text-sage-400 mb-3">
                  NY-Sun provides per-watt capacity incentives for commercial, industrial, and community distributed solar installations. The program is funded through the Clean Energy Fund and administered by NYSERDA. Incentive levels vary by utility territory and are subject to block pricing — earlier applicants receive higher rates.
                </p>
                <p className="text-[14px] text-deep-600 dark:text-sage-400 mb-3">
                  NY-Sun incentives reduce ITC eligible basis by the grant amount. However, on a net basis, NY-Sun always adds incremental value. A $0.30/W NY-Sun incentive on a 500 kW system provides $150,000 in state funding while reducing federal ITC basis by $150,000 (a cost of ~$45,000 in lost ITC at 30%) — net benefit: $105,000.
                </p>
                <p className="text-[13px] text-deep-500 dark:text-sage-500"><strong>Stacks with:</strong> ITC, PACE, Con Ed interconnection incentives, Local Law 97 compliance</p>
              </div>

              <div className="rounded-lg border border-deep-100 dark:border-deep-800 p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-deep-900 dark:text-deep-100">NY Clean Heat (Heat Pump Incentives)</h3>
                  <span className="font-mono text-teal-600 dark:text-teal-400 text-[13px] font-semibold">Up to $5,000/ton</span>
                </div>
                <p className="text-[14px] text-deep-600 dark:text-sage-400 mb-3">
                  NYSERDA&apos;s NY Clean Heat program provides incentives for ground-source and air-source heat pumps in commercial and multifamily buildings. Combined with the 48 ITC for ground-source systems (geothermal heat pumps qualify for the 30% ITC), and 179D for overall building efficiency, multifamily heat pump projects have a compelling incentive stack.
                </p>
                <p className="text-[13px] text-deep-500 dark:text-sage-500"><strong>Stacks with:</strong> ITC (geothermal heat pumps qualify), 179D efficiency deduction, utility heat pump rebates</p>
              </div>

              <div className="rounded-lg border border-deep-100 dark:border-deep-800 p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-deep-900 dark:text-deep-100">Community Distributed Generation (CDG)</h3>
                  <span className="font-mono text-teal-600 dark:text-teal-400 text-[13px] font-semibold">Bill credits + NY-Sun</span>
                </div>
                <p className="text-[14px] text-deep-600 dark:text-sage-400 mb-3">
                  Community solar projects in NY can serve subscribers who receive bill credits. CDG developers receive NY-Sun incentives and can structure their projects to qualify for the ITC on the full system cost. The combination of ITC + NY-Sun + Value of Distributed Energy Resources (VDER) compensation creates strong project economics.
                </p>
                <p className="text-[13px] text-deep-500 dark:text-sage-500"><strong>Stacks with:</strong> ITC (30%+ with bonus adders), NY-Sun incentives, PACE financing for project development</p>
              </div>
            </div>
          </section>

          {/* NY Green Bank */}
          <section>
            <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-4">
              NY Green Bank: Below-Market Financing
            </h2>
            <p className="mb-4">
              The NY Green Bank has deployed over $2 billion in financing for clean energy projects since its 2013 founding. The Green Bank does not replace equity or ITC — it provides low-cost debt financing that reduces overall project cost and enhances equity returns.
            </p>
            <p className="mb-4">
              Typical NY Green Bank products include: construction-to-permanent loans for community solar, warehouse lines for clean energy developers, mezzanine financing for larger projects, and credit enhancements for PACE programs. Interest rates are typically 50–150 basis points below market rates.
            </p>
            <p className="mb-4">
              The Green Bank actively participates alongside federal IRA credit transfers. A common structure: NY Green Bank provides construction financing, the developer sells the ITC to a credit buyer at closing, and the Green Bank takeout loan is sized based on the net-ITC project economics.
            </p>
          </section>

          {/* Utility Programs */}
          <section>
            <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-4">
              Utility Incentive Programs
            </h2>

            <div className="space-y-4">
              <div className="rounded-lg border border-deep-100 dark:border-deep-800 p-5">
                <h3 className="font-semibold text-deep-900 dark:text-deep-100 mb-2">Consolidated Edison (Con Ed) — NYC, Westchester</h3>
                <p className="text-[14px] text-deep-600 dark:text-sage-400">
                  Con Ed offers several programs relevant to clean energy developers: the Brooklyn/Queens Demand Management Program (BQDM) pays commercial buildings for demand reduction; the Commercial & Industrial Energy Efficiency program provides rebates for equipment upgrades; and the interconnection facilitation program for distributed solar. BQDM payments are particularly valuable for battery storage projects that can provide demand response.
                </p>
              </div>

              <div className="rounded-lg border border-deep-100 dark:border-deep-800 p-5">
                <h3 className="font-semibold text-deep-900 dark:text-deep-100 mb-2">National Grid — Upstate NY</h3>
                <p className="text-[14px] text-deep-600 dark:text-sage-400">
                  National Grid&apos;s commercial programs include rebates for LED lighting, HVAC upgrades, and custom equipment efficiency projects. These rebates reduce 179D eligible basis but generally add incremental net value. National Grid also participates in NYSERDA&apos;s on-bill recovery loan program, allowing efficiency upgrades to be financed through utility bills.
                </p>
              </div>
            </div>
          </section>

          {/* Energy Community Zones */}
          <section>
            <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-4">
              Energy Community Zones in New York
            </h2>
            <p className="mb-4">
              New York has significant energy community census tract coverage due to its history of fossil fuel employment and power plant closures. Key areas with current or recent energy community designations include:
            </p>
            <ul className="space-y-2 ml-4 mb-4">
              {[
                'Parts of the South Bronx and northern Manhattan (closed Con Ed facilities)',
                'Upstate industrial corridors in Buffalo, Rochester, and Syracuse metro areas',
                'Areas near closed coal plants (Danskammer, Bowline, Roseton)',
                'Mining-dependent areas in western NY',
                'Long Island communities near former fossil fuel infrastructure',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-[14px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0 mt-2" />
                  {item}
                </li>
              ))}
            </ul>
            <p>
              Projects sited in these areas automatically qualify for the +10% ITC energy community bonus adder — raising the base ITC from 30% to 40% before other adders. For a $5M solar project, that&apos;s an additional $500,000 in federal tax credits.
            </p>
          </section>

          {/* Full Stack Example */}
          <section>
            <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-4">
              New York Project Stack Example
            </h2>

            <div className="rounded-xl bg-deep-50/50 dark:bg-deep-900/30 border border-deep-100 dark:border-deep-800 p-6 mb-4">
              <h4 className="font-sora font-bold text-deep-900 dark:text-deep-100 mb-1">2 MW Community Solar — Albany Energy Community Tract</h4>
              <p className="text-[13px] text-deep-500 dark:text-sage-500 mb-4">All figures estimated. Consult counsel for specific project analysis.</p>
              <div className="font-mono text-[13px] space-y-2 text-deep-700 dark:text-sage-300">
                <div className="flex justify-between font-semibold text-deep-900 dark:text-white border-b border-deep-200 dark:border-deep-700 pb-2 mb-2">
                  <span>Project Cost</span>
                  <span>$4,200,000</span>
                </div>
                <div className="flex justify-between text-teal-600 dark:text-teal-400">
                  <span>ITC — 40% (base 30% + energy community 10%)</span>
                  <span>$1,680,000</span>
                </div>
                <div className="flex justify-between text-teal-600 dark:text-teal-400">
                  <span>NY-Sun incentive (est. $0.05/W, 2,000 kW)</span>
                  <span>$100,000</span>
                </div>
                <div className="flex justify-between text-teal-600 dark:text-teal-400">
                  <span>NY Green Bank construction loan (below-market)</span>
                  <span>Interest savings ~$60,000</span>
                </div>
                <div className="flex justify-between text-teal-600 dark:text-teal-400">
                  <span>PACE financing (replaces developer equity)</span>
                  <span>$1,000,000</span>
                </div>
                <div className="border-t border-deep-200 dark:border-deep-700 pt-2 flex justify-between font-bold text-deep-900 dark:text-white">
                  <span>Net developer equity required</span>
                  <span>~$1,360,000 (32% of project)</span>
                </div>
                <div className="flex justify-between font-bold text-teal-600 dark:text-teal-400">
                  <span>Effective incentive rate</span>
                  <span>~68% of project cost</span>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <div className="rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/10 dark:to-emerald-900/10 border border-teal-100 dark:border-teal-800 p-8 text-center">
            <h3 className="font-sora text-xl font-bold text-deep-900 dark:text-deep-100 mb-2">
              Scan your New York project with IncentEdge — free to start
            </h3>
            <p className="text-deep-600 dark:text-sage-400 mb-6 text-[14px] max-w-md mx-auto">
              Get every applicable NY state, utility, and federal program for your specific project location in under 60 seconds.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[14px] font-semibold transition-colors"
            >
              Scan your NY project free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Related Articles */}
          <div className="pt-6 border-t border-deep-100 dark:border-deep-800">
            <h3 className="font-sora text-lg font-bold text-deep-900 dark:text-deep-100 mb-4">Related Articles</h3>
            <div className="grid gap-3 md:grid-cols-3">
              {[
                { title: 'PACE Financing + ITC: How to Stack Clean Energy Credits', href: '/blog/pace-financing-ira-combination' },
                { title: 'LIHTC + IRA Credits: Affordable Housing Stacking Guide', href: '/blog/lihtc-ira-stacking' },
                { title: 'IRA Bonus Adders Explained: Stack Up to 70% ITC', href: '/blog/ira-bonus-adders-explained' },
              ].map((a) => (
                <Link key={a.href} href={a.href} className="block p-4 rounded-lg border border-deep-100 dark:border-deep-800 hover:border-teal-200 dark:hover:border-teal-700 transition-colors group">
                  <p className="text-[13px] font-medium text-deep-900 dark:text-deep-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors leading-snug">{a.title}</p>
                  <span className="inline-flex items-center gap-1 text-[12px] text-teal-600 dark:text-teal-400 mt-2">Read <ArrowRight className="w-3 h-3" /></span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </article>
    </PublicPageShell>
  );
}
