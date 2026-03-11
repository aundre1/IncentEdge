import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PublicPageShell } from '@/components/public/PublicPageShell';

export const metadata: Metadata = {
  title: 'IRA Tax Credit Policy Tracker: March 2026 Update',
  description:
    'Latest updates on IRA tax credit policy, Treasury guidance, and program changes as of March 2026. What changed, what\'s pending, and what it means for your projects.',
  alternates: { canonical: 'https://incentedge.com/blog/ira-policy-update-march-2026' },
  openGraph: {
    title: 'IRA Tax Credit Policy Tracker: March 2026 Update',
    description:
      'Latest updates on IRA tax credit policy, Treasury guidance, and program changes as of March 2026.',
    url: 'https://incentedge.com/blog/ira-policy-update-march-2026',
    siteName: 'IncentEdge',
    type: 'article',
  },
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'IRA Tax Credit Policy Tracker: March 2026 Update',
  description: 'Latest updates on IRA tax credit policy, Treasury guidance, and program changes as of March 2026.',
  url: 'https://incentedge.com/blog/ira-policy-update-march-2026',
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
    { '@type': 'ListItem', position: 3, name: 'IRA Policy Tracker: March 2026', item: 'https://incentedge.com/blog/ira-policy-update-march-2026' },
  ],
};

export default function IRAPolicyUpdateMarch2026Page() {
  return (
    <PublicPageShell breadcrumbs={[{ label: 'Blog', href: '/blog' }, { label: 'IRA Policy Tracker: March 2026' }]}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <article className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="mb-10">
          <div className="inline-flex items-center rounded-full border border-teal-200 dark:border-teal-700 bg-teal-50 dark:bg-teal-900/20 px-3 py-1 text-[12px] text-teal-700 dark:text-teal-300 mb-4">
            Policy Update
          </div>
          <h1 className="font-sora text-4xl font-bold tracking-tight text-deep-900 dark:text-white leading-[1.1] mb-4">
            IRA Policy Tracker: March 2026
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-[13px] text-deep-500 dark:text-sage-500 pb-6 border-b border-deep-100 dark:border-deep-800">
            <span>By IncentEdge Research Team</span>
            <span>March 2026</span>
            <span>10 min read</span>
          </div>
        </header>

        <div className="space-y-8 text-[15px] text-deep-700 dark:text-sage-300 leading-relaxed">

          <p className="text-lg text-deep-600 dark:text-sage-400 leading-relaxed">
            This monthly tracker summarizes the most consequential IRA tax credit policy developments as of March 2026 — new Treasury guidance, regulatory finalization, pending proposed rules, and what each change means for active project development and credit monetization.
          </p>

          {/* What's New */}
          <section>
            <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-4">
              What Changed in Early 2026
            </h2>

            <div className="space-y-5">
              <div className="rounded-lg border-l-4 border-teal-500 bg-teal-50/50 dark:bg-teal-900/10 pl-5 pr-4 py-4">
                <h3 className="font-semibold text-deep-900 dark:text-deep-100 mb-2">Section 45V Final Rules — Hydrogen Additionality</h3>
                <p className="text-[14px] text-deep-600 dark:text-sage-400 mb-2">
                  Treasury finalized the Section 45V clean hydrogen rules in early 2025, including the controversial hourly electricity matching requirement for electrolytic hydrogen. The final rule largely retained the proposed additionality, deliverability, and temporal matching framework from the 2023 proposed rules.
                </p>
                <p className="text-[14px] text-deep-600 dark:text-sage-400">
                  <strong className="text-deep-900 dark:text-deep-100">Impact:</strong> Projects using grid electricity must match hourly clean energy certificates (not annual matching) to qualify for the highest credit tiers. This significantly increases the cost of compliance but preserves the integrity of the lifecycle emissions standard.
                </p>
              </div>

              <div className="rounded-lg border-l-4 border-teal-500 bg-teal-50/50 dark:bg-teal-900/10 pl-5 pr-4 py-4">
                <h3 className="font-semibold text-deep-900 dark:text-deep-100 mb-2">Domestic Content Safe Harbor Expansion</h3>
                <p className="text-[14px] text-deep-600 dark:text-sage-400 mb-2">
                  IRS Notice 2024-41 expanded the list of manufactured products eligible for the domestic content safe harbor, making it easier for solar and storage developers to document the 10% domestic content bonus adder without complex supply chain audits.
                </p>
                <p className="text-[14px] text-deep-600 dark:text-sage-400">
                  <strong className="text-deep-900 dark:text-deep-100">Impact:</strong> More projects can now claim the domestic content bonus with greater confidence. Manufacturers have updated their certification programs. The safe harbor covers modules, inverters, racking, and battery systems from compliant manufacturers.
                </p>
              </div>

              <div className="rounded-lg border-l-4 border-teal-500 bg-teal-50/50 dark:bg-teal-900/10 pl-5 pr-4 py-4">
                <h3 className="font-semibold text-deep-900 dark:text-deep-100 mb-2">Energy Community Map — Annual Update</h3>
                <p className="text-[14px] text-deep-600 dark:text-sage-400 mb-2">
                  The IRS released its annual update to the energy community census tract designations in January 2026. Approximately 2,200 additional census tracts qualified in the 2026 update, including areas near recently announced power plant closures and metropolitan statistical areas with high fossil fuel employment concentrations.
                </p>
                <p className="text-[14px] text-deep-600 dark:text-sage-400">
                  <strong className="text-deep-900 dark:text-deep-100">Impact:</strong> Projects in newly designated energy community tracts can now claim the +10% ITC bonus adder if they have not yet begun construction. Developers with pending pipeline should re-check project addresses against the updated map.
                </p>
              </div>

              <div className="rounded-lg border-l-4 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10 pl-5 pr-4 py-4">
                <h3 className="font-semibold text-deep-900 dark:text-deep-100 mb-2">Transferability Market Matures — Credit Pricing Trends</h3>
                <p className="text-[14px] text-deep-600 dark:text-sage-400 mb-2">
                  The transferable tax credit market completed its second full year in 2025. Transaction volume exceeded $35 billion — up from an estimated $7 billion in 2023. Pricing has stabilized in the 88–93 cent range for ITC, with ITC+ domestic content credits trading at 91–96 cents due to buyer demand for this combination.
                </p>
                <p className="text-[14px] text-deep-600 dark:text-sage-400">
                  <strong className="text-deep-900 dark:text-deep-100">Impact:</strong> The market is deeper and more liquid than it was at launch. More buyers (including insurance companies, family offices, and corporate treasury desks) have entered the market, reducing counterparty concentration risk and supporting pricing.
                </p>
              </div>
            </div>
          </section>

          {/* What's Pending */}
          <section>
            <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-4">
              What Is Pending: Rules in Progress
            </h2>
            <p className="mb-5">
              Several important rules remain in proposed or interim final status as of March 2026. Developers should monitor these carefully as they affect project economics.
            </p>

            <div className="overflow-x-auto rounded-xl border border-deep-100 dark:border-deep-800 mb-5">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-deep-50 dark:bg-deep-800/50 border-b border-deep-100 dark:border-deep-700">
                    <th className="text-left px-4 py-3 font-semibold text-deep-700 dark:text-deep-300">Rule</th>
                    <th className="text-left px-4 py-3 font-semibold text-deep-700 dark:text-deep-300">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-deep-700 dark:text-deep-300">Key Issue</th>
                    <th className="text-left px-4 py-3 font-semibold text-deep-700 dark:text-deep-300">Timeline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-deep-100 dark:divide-deep-800">
                  {[
                    { rule: '45X Advanced Manufacturing Credit', status: 'Final (2024)', issue: 'Component definitions, foreign entity of concern exclusions', timeline: 'Final' },
                    { rule: 'Section 48E Technology-Neutral ITC', status: 'Interim Final', issue: 'Qualified facility definition, storage standalone', timeline: 'Final rules pending' },
                    { rule: 'Low-Income Community Bonus (Category 2)', status: 'Allocation rounds ongoing', issue: 'Annual application window, scoring criteria', timeline: 'Annual' },
                    { rule: 'Apprenticeship Requirements', status: 'Final (2023)', issue: 'Ratios, good faith exception guidance', timeline: 'Final' },
                    { rule: '45Q Carbon Capture (Utilization credits)', status: 'Proposed (2023)', issue: 'Lifecycle emissions for EOR, utilization pathways', timeline: 'TBD' },
                  ].map((row) => (
                    <tr key={row.rule} className="hover:bg-deep-50/50 dark:hover:bg-deep-800/30">
                      <td className="px-4 py-3 font-medium text-deep-900 dark:text-deep-100">{row.rule}</td>
                      <td className="px-4 py-3 text-deep-600 dark:text-sage-400">{row.status}</td>
                      <td className="px-4 py-3 text-deep-600 dark:text-sage-400">{row.issue}</td>
                      <td className="px-4 py-3 text-deep-600 dark:text-sage-400">{row.timeline}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* What to Watch */}
          <section>
            <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-4">
              What to Watch in 2026
            </h2>
            <div className="space-y-4">
              {[
                {
                  title: 'Legislative Risk — IRA Rollback Proposals',
                  desc: 'The new Congress has introduced legislation that would modify or eliminate certain IRA provisions. Most at risk are the low-income community bonus and some direct pay provisions. Credits already claimed through transferability are widely considered legally protected. Projects not yet under construction face more uncertainty.',
                },
                {
                  title: 'Foreign Entity of Concern (FEOC) Restrictions — 45X',
                  desc: 'The 45X advanced manufacturing credit prohibits components from Foreign Entities of Concern (primarily Chinese-owned manufacturers). Treasury is actively enforcing FEOC restrictions, and several manufacturers have had certification challenges. Developers sourcing Chinese-manufactured equipment should consult counsel.',
                },
                {
                  title: 'IRS Audits of Transferable Credits — Recapture Risk',
                  desc: 'The IRS has begun examining early transferable credit transactions. Common audit triggers include misclassification of eligible basis, domestic content bonus claims without adequate documentation, and energy community designations on incorrect census tracts. Proper documentation at project commencement is critical.',
                },
                {
                  title: '45V Hydrogen — Litigation Outcomes',
                  desc: 'Multiple industry groups have challenged the 45V final rules in federal court, specifically challenging the hourly matching requirement as exceeding Treasury\'s statutory authority. Court outcomes could significantly change the economics of clean hydrogen projects. Developers should model both scenarios.',
                },
              ].map((item) => (
                <div key={item.title} className="rounded-lg border border-deep-100 dark:border-deep-800 p-5">
                  <h3 className="font-semibold text-deep-900 dark:text-deep-100 mb-2">{item.title}</h3>
                  <p className="text-[14px] text-deep-600 dark:text-sage-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Impact on Active Projects */}
          <section>
            <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-4">
              Impact on Active Projects: Action Items for Developers
            </h2>
            <ul className="space-y-3">
              {[
                'Re-run energy community classification on all pipeline projects using the updated 2026 IRS map',
                'Verify domestic content bonus eligibility with manufacturers using the expanded safe harbor list',
                'For hydrogen projects: model both hourly-matching and annual-matching scenarios given pending litigation',
                'Ensure transferable credit transactions from 2023–2024 are fully documented and bonus adder certifications are on file',
                'Review 45Q projects for utilization pathway compliance pending proposed rules finalization',
                'Monitor FEOC restrictions affecting supply chains for advanced manufacturing credits (45X)',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-[14px]">
                  <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-5">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {[
                { q: 'Are IRA credits already transferred in 2023–2025 protected from rollback?', a: 'Generally yes. Completed credit transfers are treated as closed tax transactions. Most tax attorneys believe retroactive recapture of completed transfers would face significant legal challenges. Prospective changes are more likely than retroactive ones.' },
                { q: 'How often does the IRS update the energy community map?', a: 'The IRS updates the energy community census tract list annually, typically in January. The coal closure list (mines and plants) is updated quarterly. Developers should check the map at project commencement to lock in the designation.' },
                { q: 'Does Treasury\'s 45V final rule require real-time hourly matching for all hydrogen projects?', a: 'The hourly matching requirement applies to electrolytic hydrogen projects using grid electricity after 2028 (a phase-in applies). Projects that commenced construction before the rule\'s effective date may qualify for transitional relief. Consult IRS Notice 2023-29 and the final 45V regulations.' },
              ].map((faq) => (
                <div key={faq.q} className="rounded-lg border border-deep-100 dark:border-deep-800 p-5">
                  <h3 className="font-semibold text-deep-900 dark:text-deep-100 mb-2 text-[14px]">{faq.q}</h3>
                  <p className="text-[14px] text-deep-600 dark:text-sage-400">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div className="rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/10 dark:to-emerald-900/10 border border-teal-100 dark:border-teal-800 p-8 text-center">
            <h3 className="font-sora text-xl font-bold text-deep-900 dark:text-deep-100 mb-2">
              Scan your project with IncentEdge — free to start
            </h3>
            <p className="text-deep-600 dark:text-sage-400 mb-6 text-[14px] max-w-md mx-auto">
              Get a complete incentive stack report that incorporates the latest policy updates and credit availability.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[14px] font-semibold transition-colors"
            >
              Start free scan
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Related Articles */}
          <div className="pt-6 border-t border-deep-100 dark:border-deep-800">
            <h3 className="font-sora text-lg font-bold text-deep-900 dark:text-deep-100 mb-4">Related Articles</h3>
            <div className="grid gap-3 md:grid-cols-3">
              {[
                { title: 'The Complete IRA Tax Credit Guide (2026)', href: '/resources/ira-guide' },
                { title: 'Section 45V Clean Hydrogen Tax Credit Guide', href: '/blog/45v-clean-hydrogen-guide' },
                { title: 'State of IRA Incentives 2026: Annual Market Report', href: '/blog/state-of-ira-incentives-2026' },
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
