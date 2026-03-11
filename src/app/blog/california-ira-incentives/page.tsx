import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PublicPageShell } from '@/components/public/PublicPageShell';

export const metadata: Metadata = {
  title: 'California IRA + State Incentives for Solar Developers: 2026 Guide',
  description:
    'How California solar developers can stack federal IRA credits with CPUC programs, SGIP storage rebates, and utility incentives. Maximize your project value.',
  alternates: { canonical: 'https://incentedge.com/blog/california-ira-incentives' },
  openGraph: {
    title: 'California IRA + State Incentives for Solar Developers: 2026 Guide',
    description:
      'How California solar developers can stack federal IRA credits with CPUC programs, SGIP storage rebates, and utility incentives.',
    url: 'https://incentedge.com/blog/california-ira-incentives',
    siteName: 'IncentEdge',
    type: 'article',
  },
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'California IRA + State Incentives for Solar Developers: 2026 Guide',
  description: 'How California solar developers stack federal IRA credits with state and utility programs.',
  url: 'https://incentedge.com/blog/california-ira-incentives',
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
    { '@type': 'ListItem', position: 3, name: 'California IRA Incentives', item: 'https://incentedge.com/blog/california-ira-incentives' },
  ],
};

export default function CaliforniaIRAIncentivesPage() {
  return (
    <PublicPageShell breadcrumbs={[{ label: 'Blog', href: '/blog' }, { label: 'California IRA Incentives' }]}>
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
            State Guide — California
          </div>
          <h1 className="font-sora text-4xl font-bold tracking-tight text-deep-900 dark:text-white leading-[1.1] mb-4">
            California Solar & Clean Energy Incentive Stack (2026)
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-[13px] text-deep-500 dark:text-sage-500 pb-6 border-b border-deep-100 dark:border-deep-800">
            <span>By IncentEdge Research Team</span>
            <span>March 2026</span>
            <span>13 min read</span>
          </div>
        </header>

        <div className="space-y-8 text-[15px] text-deep-700 dark:text-sage-300 leading-relaxed">

          <p className="text-lg text-deep-600 dark:text-sage-400 leading-relaxed">
            California has the nation&apos;s largest solar market, the most aggressive clean energy mandates, and one of the most complex incentive environments. Understanding how federal IRA credits interact with CPUC-regulated utility programs, SGIP storage rebates, and NEM 3.0 economics is critical for developers maximizing project value in 2026.
          </p>

          {/* California Landscape */}
          <section>
            <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-4">
              The California Clean Energy Incentive Landscape
            </h2>
            <p className="mb-4">
              California&apos;s clean energy policy is driven by its 100% Clean Electricity by 2045 mandate (SB 100), the Air Resources Board&apos;s Scoping Plan, and the CPUC&apos;s integrated resource planning process. The state incentive ecosystem operates through three primary channels:
            </p>
            <div className="space-y-3 mb-4">
              {[
                { name: 'CPUC-Regulated IOU Programs', desc: 'Pacific Gas & Electric (PG&E), Southern California Edison (SCE), and San Diego Gas & Electric (SDG&E) operate ratepayer-funded programs including rebates, net energy metering, demand response, and storage incentives.' },
                { name: 'California Energy Commission (CEC)', desc: 'Administers grant programs, low-interest financing, and research funding for emerging clean energy technologies. CEC\'s Renewable Energy for Agriculture program serves agricultural solar.' },
                { name: 'State Direct Programs', desc: 'Including SGIP (storage), the California Climate Credit, and various CARB programs targeting disadvantaged communities.' },
              ].map((item) => (
                <div key={item.name} className="rounded-lg border border-deep-100 dark:border-deep-800 p-4">
                  <h3 className="font-semibold text-deep-900 dark:text-deep-100 mb-1.5 text-[14px]">{item.name}</h3>
                  <p className="text-[13px] text-deep-600 dark:text-sage-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* SGIP */}
          <section>
            <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-4">
              Self-Generation Incentive Program (SGIP)
            </h2>
            <p className="mb-4">
              SGIP is California&apos;s primary battery storage incentive program, administered by the four major IOUs and funded through ratepayer charges. As of 2026, SGIP provides incentives of $0.15–$0.85 per watt-hour for qualifying storage systems, with higher rates for disadvantaged communities and low-income customers.
            </p>
            <p className="mb-4">
              Critically, SGIP incentives for storage do not reduce the ITC eligible basis for the storage system. A standalone battery storage system receiving a SGIP incentive of $0.20/Wh on a 500 kWh system ($100,000 incentive) can still claim the full 30% ITC on the total storage system cost. This makes the SGIP + ITC combination particularly valuable.
            </p>

            <div className="rounded-xl bg-deep-50/50 dark:bg-deep-900/30 border border-deep-100 dark:border-deep-800 p-6 mb-4">
              <h4 className="font-sora font-bold text-deep-900 dark:text-deep-100 mb-4">SGIP + ITC Stack Example</h4>
              <p className="text-[13px] text-deep-500 dark:text-sage-500 mb-4">500 kWh commercial battery storage system, standard territory</p>
              <div className="font-mono text-[13px] space-y-2 text-deep-700 dark:text-sage-300">
                <div className="flex justify-between font-semibold text-deep-900 dark:text-white border-b border-deep-200 dark:border-deep-700 pb-2 mb-2">
                  <span>Storage system cost</span>
                  <span>$750,000</span>
                </div>
                <div className="flex justify-between text-teal-600 dark:text-teal-400">
                  <span>ITC (30% of full system cost)</span>
                  <span>$225,000</span>
                </div>
                <div className="flex justify-between text-teal-600 dark:text-teal-400">
                  <span>SGIP incentive ($0.20/Wh × 500,000 Wh)</span>
                  <span>$100,000</span>
                </div>
                <div className="border-t border-deep-200 dark:border-deep-700 pt-2 flex justify-between font-bold text-teal-600 dark:text-teal-400">
                  <span>Combined incentive value</span>
                  <span>$325,000 (43% of cost)</span>
                </div>
              </div>
            </div>

            <p>
              SGIP has multiple budget tranches across the four IOUs, with disadvantaged community (DAC) and equity resiliency tranches offering the highest incentive rates. Projects in DAC or low-income census tracts may also qualify for the ITC low-income community bonus (+10% or +20%), further compounding the stack.
            </p>
          </section>

          {/* NEM 3.0 */}
          <section>
            <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-4">
              NEM 3.0 and Its Implications for Solar + Storage
            </h2>
            <p className="mb-4">
              California&apos;s NEM 3.0 (Net Billing Tariff), effective April 2023 for new applicants, significantly changed residential and commercial solar economics by reducing the compensation rate for exported solar energy from retail rates to roughly 25–75% of retail (varying by time of export).
            </p>
            <p className="mb-4">
              NEM 3.0 increased the value of solar-plus-storage by incentivizing self-consumption rather than grid export. Systems that store solar generation and discharge during peak evening hours avoid the lower NEM 3.0 export rates and benefit from high time-of-use electricity prices. This has structurally improved the economics of the ITC + SGIP combination.
            </p>
            <p className="mb-4">
              Commercial solar developers should model projects using the Avoided Cost Calculator (ACC) for NEM 3.0 export rates rather than retail rates. On the positive side, NEM 3.0 retained the grandfathering provision for existing NEM 2.0 customers for 20 years from their interconnection date — protecting the value of the installed base.
            </p>
          </section>

          {/* CPUC IOU Programs */}
          <section>
            <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-4">
              CPUC IOU Programs: PG&E, SCE, SDG&E
            </h2>
            <div className="space-y-4">
              {[
                { name: 'PG&E Commercial Solar Incentives', desc: 'PG&E\'s agricultural solar program provides incentives for farm solar installations. The Agricultural Solar Pilot provides up to $0.25/W for qualifying agricultural operations. Combined with REAP grants and ITC, agricultural solar in PG&E territory has a three-program federal + state + utility stack.' },
                { name: 'SCE Commercial & Industrial Programs', desc: 'SCE\'s Charge Ready program provides infrastructure funding for commercial EV charging (stacks with the 30C EV credit). The Business Energy Management System program provides rebates for commercial building efficiency upgrades that stack with 179D.' },
                { name: 'SDG&E Demand Response & Storage', desc: 'SDG&E\'s Sustainable Communities program targets low-income communities with solar and storage incentives that layer with ITC, SGIP, and the ITC low-income community bonus. The combination in an SDG&E low-income census tract can reach 60%+ of storage project cost in combined incentives.' },
              ].map((item) => (
                <div key={item.name} className="rounded-lg border border-deep-100 dark:border-deep-800 p-5">
                  <h3 className="font-semibold text-deep-900 dark:text-deep-100 mb-2">{item.name}</h3>
                  <p className="text-[14px] text-deep-600 dark:text-sage-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ITC Stacking Guide */}
          <section>
            <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-4">
              ITC Stacking Guide for California Projects
            </h2>
            <p className="mb-5">
              Here is how to layer ITC bonus adders on top of the base 30% for California solar and storage projects:
            </p>
            <div className="overflow-x-auto rounded-xl border border-deep-100 dark:border-deep-800">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-deep-50 dark:bg-deep-800/50 border-b border-deep-100 dark:border-deep-700">
                    <th className="text-left px-4 py-3 font-semibold text-deep-700 dark:text-deep-300">Adder</th>
                    <th className="text-left px-4 py-3 font-semibold text-deep-700 dark:text-deep-300">Rate</th>
                    <th className="text-left px-4 py-3 font-semibold text-deep-700 dark:text-deep-300">CA Availability</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-deep-100 dark:divide-deep-800">
                  {[
                    { adder: 'Base ITC (prevailing wage met)', rate: '30%', availability: 'Available statewide for all qualifying projects' },
                    { adder: 'Energy Community (+10%)', rate: '+10%', availability: 'Limited — few CA census tracts qualify (primarily inland fossil fuel areas). Check IRS map.' },
                    { adder: 'Domestic Content (+10%)', rate: '+10%', availability: 'Available for projects sourcing US-manufactured modules, racking, and inverters per safe harbor' },
                    { adder: 'Low-Income Community (+10%)', rate: '+10%', availability: 'High CA applicability — many urban and rural CA census tracts qualify. Competitive allocation.' },
                    { adder: 'Low-Income Residential/Economic Benefit (+20%)', rate: '+20%', availability: 'Strong CA fit — affordable housing solar and community solar serving low-income subscribers' },
                    { adder: 'SGIP (state, not ITC adder)', rate: '$0.15–$0.85/Wh', availability: 'Stacks with ITC; does not reduce ITC eligible basis for storage' },
                  ].map((row) => (
                    <tr key={row.adder} className="hover:bg-deep-50/50 dark:hover:bg-deep-800/30">
                      <td className="px-4 py-3 font-medium text-deep-900 dark:text-deep-100">{row.adder}</td>
                      <td className="px-4 py-3 font-mono text-teal-600 dark:text-teal-400">{row.rate}</td>
                      <td className="px-4 py-3 text-deep-600 dark:text-sage-400">{row.availability}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* CTA */}
          <div className="rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/10 dark:to-emerald-900/10 border border-teal-100 dark:border-teal-800 p-8 text-center">
            <h3 className="font-sora text-xl font-bold text-deep-900 dark:text-deep-100 mb-2">
              Scan your California project with IncentEdge — free to start
            </h3>
            <p className="text-deep-600 dark:text-sage-400 mb-6 text-[14px] max-w-md mx-auto">
              Get every CPUC program, SGIP tranche, utility rebate, and federal IRA credit applicable to your CA project in 60 seconds.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[14px] font-semibold transition-colors"
            >
              Scan your CA project free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Related Articles */}
          <div className="pt-6 border-t border-deep-100 dark:border-deep-800">
            <h3 className="font-sora text-lg font-bold text-deep-900 dark:text-deep-100 mb-4">Related Articles</h3>
            <div className="grid gap-3 md:grid-cols-3">
              {[
                { title: 'IRA Bonus Adders: Stack Up to 70% ITC', href: '/blog/ira-bonus-adders-explained' },
                { title: 'PACE Financing + ITC: The Commercial Stack', href: '/blog/pace-financing-ira-combination' },
                { title: 'The Complete IRA Tax Credit Guide (2026)', href: '/resources/ira-guide' },
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
