import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PublicPageShell } from '@/components/public/PublicPageShell';

export const metadata: Metadata = {
  title: 'Stacking LIHTC with IRA Credits: The Affordable Housing Developer\'s Guide',
  description:
    'How to stack Low-Income Housing Tax Credits (LIHTC) with IRA credits including 45L, ITC, and bonus adders. Maximize value per unit in affordable housing projects.',
  alternates: { canonical: 'https://incentedge.com/blog/lihtc-ira-stacking' },
  openGraph: {
    title: 'Stacking LIHTC with IRA Credits: The Affordable Housing Developer\'s Guide',
    description:
      'How to stack LIHTC with IRA credits including 45L, ITC, and bonus adders for affordable housing projects.',
    url: 'https://incentedge.com/blog/lihtc-ira-stacking',
    siteName: 'IncentEdge',
    type: 'article',
  },
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'LIHTC + IRA Credits: Stacking Guide for Affordable Housing Developers',
  description: 'How to stack LIHTC with IRA credits for affordable housing projects.',
  url: 'https://incentedge.com/blog/lihtc-ira-stacking',
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
    { '@type': 'ListItem', position: 3, name: 'LIHTC + IRA Stacking', item: 'https://incentedge.com/blog/lihtc-ira-stacking' },
  ],
};

export default function LIHTCIRAStackingPage() {
  return (
    <PublicPageShell breadcrumbs={[{ label: 'Blog', href: '/blog' }, { label: 'LIHTC + IRA Stacking' }]}>
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
            Affordable Housing
          </div>
          <h1 className="font-sora text-4xl font-bold tracking-tight text-deep-900 dark:text-white leading-[1.1] mb-4">
            LIHTC + IRA Credits: Stacking Guide for Affordable Housing
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-[13px] text-deep-500 dark:text-sage-500 pb-6 border-b border-deep-100 dark:border-deep-800">
            <span>By IncentEdge Research Team</span>
            <span>March 2026</span>
            <span>13 min read</span>
          </div>
        </header>

        <div className="space-y-8 text-[15px] text-deep-700 dark:text-sage-300 leading-relaxed">

          <p className="text-lg text-deep-600 dark:text-sage-400 leading-relaxed">
            Affordable housing developers have access to one of the most powerful incentive stacks in the US tax code. By combining Low-Income Housing Tax Credits (LIHTC) with IRA credits — particularly Section 45L, ITC for on-site solar, and the energy community bonus adder — developers can reduce project gap funding requirements significantly and improve project feasibility in markets where affordable housing is desperately needed.
          </p>

          {/* LIHTC Basics */}
          <section>
            <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-4">
              LIHTC Basics: 9% vs. 4% Credits
            </h2>
            <p className="mb-4">
              The Low-Income Housing Tax Credit (LIHTC) is the primary federal affordable housing production subsidy. Created by the Tax Reform Act of 1986, LIHTC provides tax credits to investors in affordable housing developments, with the credits allocated to developers through state Housing Finance Agencies (HFAs).
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-5">
              <div className="rounded-lg border border-deep-100 dark:border-deep-800 p-5">
                <h3 className="font-semibold text-deep-900 dark:text-deep-100 mb-2">9% LIHTC (Competitive)</h3>
                <ul className="space-y-1.5 text-[14px] text-deep-600 dark:text-sage-400">
                  <li>Annually competitive allocation from state HFA</li>
                  <li>Produces ~70% of affordable project cost in credit equity</li>
                  <li>Typical credit: $8,000–$20,000 per unit</li>
                  <li>Requires competitive application — scored against other projects</li>
                  <li>Best for projects that cannot access tax-exempt bonds</li>
                </ul>
              </div>
              <div className="rounded-lg border border-deep-100 dark:border-deep-800 p-5">
                <h3 className="font-semibold text-deep-900 dark:text-deep-100 mb-2">4% LIHTC (Non-Competitive)</h3>
                <ul className="space-y-1.5 text-[14px] text-deep-600 dark:text-sage-400">
                  <li>Paired with tax-exempt bond financing (at least 50% of basis)</li>
                  <li>Produces ~30–40% of project cost in credit equity</li>
                  <li>Typical credit: $3,000–$8,000 per unit</li>
                  <li>Non-competitive — available as-of-right with qualifying bonds</li>
                  <li>Best for larger projects in high-cost bond markets</li>
                </ul>
              </div>
            </div>

            <p>
              LIHTC investors purchase credits at roughly 90–95 cents per dollar of credit value, providing cash equity to the project. A 200-unit 9% LIHTC project at $15,000/unit in credits generates $3 million per year for 10 years — or $30 million in total LIHTC equity at face value, typically syndicated for ~$27–28.5 million in actual equity.
            </p>
          </section>

          {/* IRA Credits that Stack with LIHTC */}
          <section>
            <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-4">
              Which IRA Credits Stack with LIHTC?
            </h2>
            <p className="mb-5">
              There is no statutory prohibition against combining LIHTC with IRA credits. The key consideration is the eligible basis calculation — IRA credits that reduce eligible basis (like grants or rebates) require adjustments, but tax credits in different code sections generally stack cleanly.
            </p>

            <div className="space-y-5">
              <div className="rounded-lg border border-teal-200 dark:border-teal-700 bg-teal-50/30 dark:bg-teal-900/10 p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-deep-900 dark:text-deep-100">Section 45L — New Energy Efficient Home Credit</h3>
                  <span className="font-mono text-teal-600 dark:text-teal-400 text-[13px] font-bold">$2,500–$5,000/unit</span>
                </div>
                <p className="text-[14px] text-deep-600 dark:text-sage-400 mb-3">
                  45L stacks directly with LIHTC with no basis interaction issues. The 45L credit is claimed by the eligible contractor (who may be the developer entity) in the year units are first leased. For a 200-unit Zero Energy Ready LIHTC project, 45L generates $1,000,000 in federal credits — entirely additive to LIHTC equity.
                </p>
                <p className="text-[13px] text-deep-500 dark:text-sage-500">
                  <strong>Design implication:</strong> Zero Energy Ready certification ($5,000/unit) requires more energy efficiency investment than Energy Star ($2,500/unit), but the additional cost per unit is typically $3,000–$5,000 — often covered by the incremental 45L credit itself.
                </p>
              </div>

              <div className="rounded-lg border border-teal-200 dark:border-teal-700 bg-teal-50/30 dark:bg-teal-900/10 p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-deep-900 dark:text-deep-100">Investment Tax Credit (ITC) — On-Site Solar</h3>
                  <span className="font-mono text-teal-600 dark:text-teal-400 text-[13px] font-bold">30%–50%+ of solar cost</span>
                </div>
                <p className="text-[14px] text-deep-600 dark:text-sage-400 mb-3">
                  On-site solar for a LIHTC multifamily building qualifies for the ITC. The ITC and LIHTC are in entirely different code sections (Section 48 vs. Section 42) and do not interact with each other&apos;s basis calculations. If the building is in a low-income census tract, the ITC low-income community bonus (+10% or +20%) applies on top.
                </p>
                <p className="text-[13px] text-deep-500 dark:text-sage-500">
                  <strong>Important:</strong> For LIHTC deals where the solar system is part of the same partnership structure, tax counsel should confirm that the ITC partnership allocations do not conflict with LIHTC investor requirements.
                </p>
              </div>

              <div className="rounded-lg border border-teal-200 dark:border-teal-700 bg-teal-50/30 dark:bg-teal-900/10 p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-deep-900 dark:text-deep-100">Energy Community ITC Bonus (+10%)</h3>
                  <span className="font-mono text-teal-600 dark:text-teal-400 text-[13px] font-bold">+10% on ITC rate</span>
                </div>
                <p className="text-[14px] text-deep-600 dark:text-sage-400 mb-3">
                  Many LIHTC-eligible census tracts overlap with energy community designations. The IRS energy community map and HUD&apos;s low-income census tract data share significant geographic overlap in legacy industrial communities. Projects in both LIHTC-eligible areas and energy communities get the ITC bonus automatically.
                </p>
              </div>

              <div className="rounded-lg border border-deep-100 dark:border-deep-800 p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-deep-900 dark:text-deep-100">PACE Financing</h3>
                  <span className="font-mono text-teal-600 dark:text-teal-400 text-[13px] font-bold">Non-credit, capital tool</span>
                </div>
                <p className="text-[14px] text-deep-600 dark:text-sage-400">
                  PACE financing for energy improvements (solar, efficiency, geothermal) can be incorporated into LIHTC capital stacks with lender approval. The PACE lien must be subordinated to the senior lender and approved by the state HFA. Several HFAs now have approved PACE for use in LIHTC deals, including California, New York, and Florida.
                </p>
              </div>
            </div>
          </section>

          {/* Real Example */}
          <section>
            <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-4">
              Full Stack Example: 120-Unit Affordable Multifamily
            </h2>

            <div className="rounded-xl bg-deep-50/50 dark:bg-deep-900/30 border border-deep-100 dark:border-deep-800 p-6">
              <h4 className="font-sora font-bold text-deep-900 dark:text-deep-100 mb-1">120-Unit 4% LIHTC + Bonds, Energy Community Census Tract</h4>
              <p className="text-[13px] text-deep-500 dark:text-sage-500 mb-4">Illustrative example. Numbers vary by state, project, and market conditions.</p>
              <div className="font-mono text-[13px] space-y-2 text-deep-700 dark:text-sage-300">
                <div className="flex justify-between font-semibold text-deep-900 dark:text-white border-b border-deep-200 dark:border-deep-700 pb-2 mb-2">
                  <span>Total Development Cost</span>
                  <span>$28,000,000</span>
                </div>
                <div className="flex justify-between">
                  <span>4% LIHTC equity (syndicated at 91¢)</span>
                  <span className="text-teal-600 dark:text-teal-400">$11,200,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax-exempt bonds (50% of eligible basis)</span>
                  <span className="text-teal-600 dark:text-teal-400">$12,000,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Section 45L — Zero Energy Ready (120 units × $5,000)</span>
                  <span className="text-teal-600 dark:text-teal-400">$600,000</span>
                </div>
                <div className="flex justify-between">
                  <span>ITC on rooftop solar (250 kW × $3/W × 40%)</span>
                  <span className="text-teal-600 dark:text-teal-400">$300,000</span>
                </div>
                <div className="flex justify-between">
                  <span>State housing trust fund grant</span>
                  <span className="text-teal-600 dark:text-teal-400">$1,500,000</span>
                </div>
                <div className="border-t border-deep-200 dark:border-deep-700 pt-2 flex justify-between font-bold text-deep-900 dark:text-white">
                  <span>Total sources identified</span>
                  <span>$25,600,000</span>
                </div>
                <div className="flex justify-between text-deep-500 dark:text-sage-500">
                  <span>Remaining gap (soft debt / deferred fee)</span>
                  <span>$2,400,000</span>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <div className="rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/10 dark:to-emerald-900/10 border border-teal-100 dark:border-teal-800 p-8 text-center">
            <h3 className="font-sora text-xl font-bold text-deep-900 dark:text-deep-100 mb-2">
              Scan your affordable housing project with IncentEdge — free to start
            </h3>
            <p className="text-deep-600 dark:text-sage-400 mb-6 text-[14px] max-w-md mx-auto">
              Get every applicable IRA credit, state program, and utility incentive for your LIHTC project in under 60 seconds.
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
                { title: 'Section 45L: New Energy Efficient Home Credit Guide', href: '/blog/section-45l-guide' },
                { title: 'Top 10 IRA Tax Credits for Real Estate Developers', href: '/blog/top-10-ira-credits-real-estate' },
                { title: 'IRA Bonus Adders: Stack Up to 70% ITC', href: '/blog/ira-bonus-adders-explained' },
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
