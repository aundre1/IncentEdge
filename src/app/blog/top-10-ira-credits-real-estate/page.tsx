import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PublicPageShell } from '@/components/public/PublicPageShell';

export const metadata: Metadata = {
  title: 'Top 10 IRA Tax Credits for Real Estate Developers in 2026',
  description:
    'Ranked list of the most valuable IRA tax credits for real estate developers. From Section 45L ($5K/unit) to PACE financing — maximize your project\'s incentive stack.',
  alternates: { canonical: 'https://incentedge.com/blog/top-10-ira-credits-real-estate' },
  openGraph: {
    title: 'Top 10 IRA Tax Credits for Real Estate Developers in 2026',
    description:
      'Ranked list of the most valuable IRA tax credits for real estate developers. From Section 45L ($5K/unit) to PACE financing.',
    url: 'https://incentedge.com/blog/top-10-ira-credits-real-estate',
    siteName: 'IncentEdge',
    type: 'article',
  },
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Top 10 IRA Tax Credits for Real Estate Developers in 2026',
  description: 'Ranked list of the most valuable IRA tax credits for real estate developers.',
  url: 'https://incentedge.com/blog/top-10-ira-credits-real-estate',
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
    { '@type': 'ListItem', position: 3, name: 'Top 10 IRA Credits for Real Estate', item: 'https://incentedge.com/blog/top-10-ira-credits-real-estate' },
  ],
};

const credits = [
  {
    rank: 1,
    code: '45L',
    name: 'Section 45L — New Energy Efficient Home Credit',
    maxValue: '$5,000 per unit',
    bestFor: 'New residential construction (single-family + multifamily)',
    eligibility: 'Units must be Energy Star certified ($2,500/unit) or Zero Energy Ready certified ($5,000/unit). Claimed by the eligible contractor in the year the unit is leased or sold.',
    stacksWith: 'LIHTC, PACE financing, state housing tax credits, utility efficiency rebates',
    tip: 'A 300-unit Zero Energy Ready multifamily project generates $1.5M in federal 45L credits alone — fully stackable with LIHTC.',
    transferable: false,
  },
  {
    rank: 2,
    code: '179D',
    name: 'Section 179D — Commercial Building Energy Efficiency Deduction',
    maxValue: '$5.00 per sq ft',
    bestFor: 'Commercial buildings, multifamily 4+ stories, offices, retail, industrial',
    eligibility: 'Qualifying energy-efficient improvements to HVAC, building envelope, and lighting. Prevailing wage required for the $5/sq ft maximum. Base rate is $0.50–$1.00/sq ft without prevailing wage.',
    stacksWith: 'ITC (on on-site solar), utility rebates, state commercial building incentives',
    tip: 'A 200,000 sq ft commercial retrofit qualifying at $5/sq ft generates a $1M deduction — worth ~$250K after-tax for a 25% effective rate taxpayer.',
    transferable: true,
  },
  {
    rank: 3,
    code: 'ITC',
    name: 'Investment Tax Credit (48/48E) — On-Site Solar & Storage',
    maxValue: '30%–70% of system cost',
    bestFor: 'Any real estate project with rooftop solar, parking canopy solar, or behind-the-meter battery storage',
    eligibility: 'Solar PV, battery storage (standalone or paired), geothermal heat pumps, and other qualified technologies. Prevailing wage required for projects over 1 MW.',
    stacksWith: '45L (on residential buildings), PACE financing, utility rebates, state solar incentives (NY-Sun, SGIP, etc.)',
    tip: 'A multifamily building with rooftop solar in an energy community can layer ITC (40%) + 45L ($5K/unit) + state solar incentives. Three programs, one project.',
    transferable: true,
  },
  {
    rank: 4,
    code: 'LIHTC',
    name: 'Low-Income Housing Tax Credit (9% and 4%)',
    maxValue: 'Varies — typically $8,000–$20,000 per unit',
    bestFor: 'Affordable housing development (new construction and rehabilitation)',
    eligibility: '4% LIHTC (paired with tax-exempt bonds) or 9% LIHTC (competitive allocation). Units must serve households at 50%–80% Area Median Income for 30+ years.',
    stacksWith: '45L, ITC (for on-site solar), energy community ITC bonus, PACE financing, HOME, CDBG, historic tax credits',
    tip: 'The 4% LIHTC + tax-exempt bonds + ITC on on-site solar + 45L is the most powerful stack in affordable housing development today.',
    transferable: false,
  },
  {
    rank: 5,
    code: 'HTC',
    name: 'Historic Tax Credit (20%)',
    maxValue: '20% of qualified rehabilitation expenditures',
    bestFor: 'Rehabilitation of certified historic buildings',
    eligibility: 'Building must be a certified historic structure and the rehabilitation must meet Secretary of Interior Standards. The credit is 20% of qualified rehabilitation expenditures.',
    stacksWith: '179D (on energy efficiency improvements within the rehabilitation), ITC (on solar added to rehabilitated building), LIHTC (for affordable historic rehabs)',
    tip: 'Historic tax credit + 179D + ITC on new rooftop solar is a powerful triple stack for urban commercial building rehabilitation projects.',
    transferable: false,
  },
  {
    rank: 6,
    code: 'NMTC',
    name: 'New Markets Tax Credit (39%)',
    maxValue: '39% of investment over 7 years',
    bestFor: 'Commercial real estate in low-income communities',
    eligibility: 'Investment must flow through a Community Development Entity (CDE) into a Qualified Active Low-Income Community Business in a designated census tract. Annual allocation is competitive.',
    stacksWith: 'Historic tax credit, LIHTC (on mixed-use projects), ITC (on building systems), PACE financing',
    tip: 'NMTC + Historic Tax Credit in a low-income downtown commercial corridor is among the highest-leveraged development structures available.',
    transferable: false,
  },
  {
    rank: 7,
    code: 'PACE',
    name: 'PACE Financing (Property Assessed Clean Energy)',
    maxValue: '100% financing of eligible improvements',
    bestFor: 'Commercial and multifamily energy upgrades; development capital stack optimization',
    eligibility: 'Available in 38 states for commercial properties. Financed through a special property tax assessment. No personal guarantee required. Does not reduce ITC eligible basis.',
    stacksWith: 'ITC, 179D, utility rebates, state energy programs',
    tip: 'PACE covers upfront capital costs while ITC is calculated on the full project cost — effectively giving you a 30%+ federal credit on equity you did not actually contribute.',
    transferable: false,
  },
  {
    rank: 8,
    code: '48C',
    name: 'Section 48C — Advanced Energy Manufacturing Credit',
    maxValue: '30% of investment in qualifying facility',
    bestFor: 'Developers building or retrofitting facilities for clean energy manufacturing',
    eligibility: 'Applies to facilities that manufacture or recycle clean energy equipment. Must be a domestic manufacturing facility. Competitive allocation through IRS. Energy community siting is prioritized.',
    stacksWith: 'PACE financing, state manufacturing incentives, industrial revenue bonds',
    tip: 'Industrial real estate developers serving clean energy manufacturing tenants should evaluate 48C for tenant build-outs. Build-to-suit structures may allow 48C credit pass-through.',
    transferable: true,
  },
  {
    rank: 9,
    code: 'REAP',
    name: 'USDA REAP — Rural Energy for America Program',
    maxValue: 'Up to 50% of project cost (grant + loan guarantee)',
    bestFor: 'Agricultural properties and rural small businesses',
    eligibility: 'Agricultural producers and rural small businesses in USDA-designated rural areas. Grants cover up to 25% of eligible project costs; loan guarantees up to 75%.',
    stacksWith: 'ITC (REAP grant reduces ITC eligible basis but net effect is positive), PACE financing, state rural energy programs',
    tip: 'A farm with a 200 kW solar array in a rural energy community can stack REAP grant + ITC + energy community bonus for a net cost below 30% of project cost.',
    transferable: false,
  },
  {
    rank: 10,
    code: 'EV',
    name: 'Section 30C — EV Charging Infrastructure Credit',
    maxValue: '30% of cost, up to $100,000 per property',
    bestFor: 'Commercial and multifamily properties adding EV charging stations',
    eligibility: 'Non-residential property installing EV supply equipment. Must be in a low-income community or non-urban census tract to qualify. Credit is 30% of equipment and installation costs, capped at $100,000.',
    stacksWith: 'ITC (if paired with solar), utility EV rebate programs, state EV infrastructure incentives',
    tip: 'Multifamily EV charging infrastructure is a growing tenant amenity. Combined with solar-plus-storage, the credit stack for parking garage EV infrastructure can be substantial.',
    transferable: false,
  },
];

export default function Top10IRARealEstatePage() {
  return (
    <PublicPageShell breadcrumbs={[{ label: 'Blog', href: '/blog' }, { label: 'Top 10 IRA Credits for Real Estate' }]}>
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
            Real Estate
          </div>
          <h1 className="font-sora text-4xl font-bold tracking-tight text-deep-900 dark:text-white leading-[1.1] mb-4">
            Top 10 IRA Tax Credits for Real Estate Developers
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-[13px] text-deep-500 dark:text-sage-500 pb-6 border-b border-deep-100 dark:border-deep-800">
            <span>By IncentEdge Research Team</span>
            <span>March 2026</span>
            <span>12 min read</span>
          </div>
        </header>

        <div className="space-y-8 text-[15px] text-deep-700 dark:text-sage-300 leading-relaxed">

          <p className="text-lg text-deep-600 dark:text-sage-400 leading-relaxed">
            The Inflation Reduction Act transformed the incentive landscape for real estate developers. Between federal tax credits, state programs, and financing tools, a typical mixed-use development project can access 8–12 stacking programs. This guide ranks the most valuable credits — by maximum value per project — and explains exactly how to qualify for each one.
          </p>

          <div className="space-y-8">
            {credits.map((credit) => (
              <div
                key={credit.rank}
                className="rounded-xl border border-deep-100 dark:border-deep-800 bg-white dark:bg-deep-900 overflow-hidden"
              >
                <div className="flex items-center gap-4 px-6 py-4 bg-deep-50/50 dark:bg-deep-800/50 border-b border-deep-100 dark:border-deep-800">
                  <span className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-sora font-bold text-[18px] flex-shrink-0">
                    {credit.rank}
                  </span>
                  <div>
                    <h2 className="font-sora text-lg font-bold text-deep-900 dark:text-deep-100 leading-tight">
                      {credit.name}
                    </h2>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="font-mono text-teal-600 dark:text-teal-400 font-semibold text-[13px]">
                        Max: {credit.maxValue}
                      </span>
                      {credit.transferable && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold">
                          Transferable
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="px-6 py-5 space-y-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-deep-400 dark:text-sage-600 mb-1">Best For</p>
                    <p className="text-[14px] text-deep-700 dark:text-sage-300">{credit.bestFor}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-deep-400 dark:text-sage-600 mb-1">Eligibility</p>
                    <p className="text-[14px] text-deep-600 dark:text-sage-400">{credit.eligibility}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-deep-400 dark:text-sage-600 mb-1">Stacks With</p>
                    <p className="text-[14px] text-deep-600 dark:text-sage-400">{credit.stacksWith}</p>
                  </div>
                  <div className="rounded-lg bg-teal-50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-800 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-1">Developer Tip</p>
                    <p className="text-[14px] text-deep-700 dark:text-sage-300">{credit.tip}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/10 dark:to-emerald-900/10 border border-teal-100 dark:border-teal-800 p-8 text-center">
            <h3 className="font-sora text-xl font-bold text-deep-900 dark:text-deep-100 mb-2">
              Scan your project with IncentEdge — free to start
            </h3>
            <p className="text-deep-600 dark:text-sage-400 mb-6 text-[14px] max-w-md mx-auto">
              Get every applicable incentive from this list — plus state, local, and utility programs — in a single 60-second scan.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[14px] font-semibold transition-colors"
            >
              Scan your project free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Related Articles */}
          <div className="pt-6 border-t border-deep-100 dark:border-deep-800">
            <h3 className="font-sora text-lg font-bold text-deep-900 dark:text-deep-100 mb-4">Related Articles</h3>
            <div className="grid gap-3 md:grid-cols-3">
              {[
                { title: 'LIHTC + IRA Credits: Stacking Guide for Affordable Housing', href: '/blog/lihtc-ira-stacking' },
                { title: 'PACE Financing + ITC: How to Stack Clean Energy Credits', href: '/blog/pace-financing-ira-combination' },
                { title: 'The Complete 179D Deduction Guide', href: '/blog/179d-guide' },
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
