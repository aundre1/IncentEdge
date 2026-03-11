import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PublicPageShell } from '@/components/public/PublicPageShell';

export const metadata: Metadata = {
  title: 'State of IRA Incentives 2026: Market Trends, Deal Flow & What\'s Coming',
  description:
    'Annual overview of the IRA tax credit market in 2026. Transfer market volumes, credit pricing, policy risk, emerging credits, and what developers and finance teams need to know.',
  alternates: { canonical: 'https://incentedge.com/blog/state-of-ira-incentives-2026' },
  openGraph: {
    title: 'State of IRA Incentives 2026: Market Trends, Deal Flow & What\'s Coming',
    description:
      'Annual overview of the IRA tax credit market in 2026. Transfer market volumes, credit pricing, policy risk, and predictions.',
    url: 'https://incentedge.com/blog/state-of-ira-incentives-2026',
    siteName: 'IncentEdge',
    type: 'article',
  },
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'State of IRA Incentives 2026: The Annual Market Report',
  description: 'Annual overview of the IRA tax credit market — transfer volumes, pricing, policy risk, and predictions.',
  url: 'https://incentedge.com/blog/state-of-ira-incentives-2026',
  author: { '@type': 'Organization', name: 'IncentEdge Research Team' },
  publisher: { '@type': 'Organization', name: 'IncentEdge', url: 'https://incentedge.com' },
  datePublished: '2026-03-01',
  dateModified: '2026-03-11',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How large is the IRA transferable tax credit market in 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The transferable IRA tax credit market reached approximately $35 billion in transaction volume in 2025, its second full year of operation. This represents growth from an estimated $7 billion in 2023 and $18 billion in 2024. The market is projected to reach $50-60 billion annually by 2028 as more projects reach commercial operation.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the current pricing range for transferable ITC credits?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ITC credits trade in the 88-96 cents per dollar range as of early 2026. Base ITC (30%) typically prices at 88-92 cents. ITC with domestic content bonus prices at 91-95 cents. ITC with multiple bonus adders can price at 93-96 cents due to buyer demand for high-quality credits with clear documentation.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the biggest policy risk to IRA credits in 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The primary policy risk is legislative modification or elimination of future IRA credits by the new Congress. Most legal experts believe credits already earned through transferability or claimed on tax returns have strong legal protection. The greatest risk affects prospective credits — particularly the low-income community bonus allocation and direct pay provisions for specific credits.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which IRA credits had the highest volume in 2025?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'By dollar volume, the ITC (Investment Tax Credit for solar and storage) dominated the 2025 transfer market with an estimated 70%+ of all transferred credit value. PTC (Production Tax Credit for wind and solar) was second. 45X advanced manufacturing credits are the fastest-growing segment, reflecting domestic solar manufacturing expansion.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are new credits emerging beyond the original IRA package?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The original IRA credits remain the primary vehicle. Treasury continues to finalize rules for 45V (hydrogen) and expand guidance on 48E (technology-neutral ITC). The 45X advanced manufacturing credit is seeing rapid growth as US solar and battery manufacturing scales. No major new credit programs have been added since 2022.',
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
    { '@type': 'ListItem', position: 3, name: 'State of IRA Incentives 2026', item: 'https://incentedge.com/blog/state-of-ira-incentives-2026' },
  ],
};

export default function StateOfIRAIncentives2026Page() {
  return (
    <PublicPageShell breadcrumbs={[{ label: 'Blog', href: '/blog' }, { label: 'State of IRA Incentives 2026' }]}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <article className="max-w-3xl mx-auto px-6 py-12">
        <header className="mb-10">
          <div className="inline-flex items-center rounded-full border border-teal-200 dark:border-teal-700 bg-teal-50 dark:bg-teal-900/20 px-3 py-1 text-[12px] text-teal-700 dark:text-teal-300 mb-4">
            Annual Market Report — 2026
          </div>
          <h1 className="font-sora text-4xl font-bold tracking-tight text-deep-900 dark:text-white leading-[1.1] mb-4">
            State of IRA Incentives 2026: The Annual Market Report
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-[13px] text-deep-500 dark:text-sage-500 pb-6 border-b border-deep-100 dark:border-deep-800">
            <span>By IncentEdge Research Team</span>
            <span>March 2026</span>
            <span>15 min read</span>
          </div>
        </header>

        <div className="space-y-8 text-[15px] text-deep-700 dark:text-sage-300 leading-relaxed">

          {/* Executive Summary */}
          <section className="rounded-xl bg-deep-50/50 dark:bg-deep-900/30 border border-deep-100 dark:border-deep-800 p-6">
            <h2 className="font-sora text-xl font-bold text-deep-900 dark:text-deep-100 mb-4">
              Executive Summary
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { metric: '$35B+', label: '2025 Transfer Market Volume', desc: '5x growth from 2023 launch year' },
                { metric: '88–96¢', label: 'ITC Credit Pricing Range', desc: 'Stable with domestic content premium' },
                { metric: '$1.2T', label: 'Projected Private Investment', desc: 'IRA-catalyzed by 2032 (BNEF est.)' },
                { metric: '217K+', label: 'Active Incentive Programs', desc: 'Federal, state, and local combined' },
              ].map((stat) => (
                <div key={stat.metric} className="rounded-lg border border-deep-100 dark:border-deep-800 bg-white dark:bg-deep-900 p-4">
                  <div className="font-mono text-2xl font-bold text-teal-600 dark:text-teal-400">{stat.metric}</div>
                  <div className="text-[13px] font-semibold text-deep-900 dark:text-deep-100 mt-1">{stat.label}</div>
                  <div className="text-[12px] text-deep-500 dark:text-sage-500 mt-0.5">{stat.desc}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Transfer Market */}
          <section>
            <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-4">
              The Transferable Credit Market: Year Three
            </h2>
            <p className="mb-4">
              The transferable IRA tax credit market — enabled by Section 6418 of the IRA — is entering its third year of operation in 2026. After a rapid scaling from $7 billion in 2023 to an estimated $35 billion in 2025, the market is maturing from a frontier product to a mainstream alternative to traditional tax equity.
            </p>
            <p className="mb-4">
              Several structural trends are shaping the 2026 market:
            </p>

            <div className="space-y-4 mb-5">
              {[
                {
                  title: 'Buyer Base Expansion',
                  desc: 'The buyer universe has expanded well beyond the original large bank and insurance company buyers. Corporations seeking to offset tax liability — in tech, manufacturing, retail, and healthcare — have entered as direct buyers. Family offices and high-net-worth individuals participate through aggregated fund vehicles. This deeper buyer base has supported pricing stability.',
                },
                {
                  title: 'Intermediary Infrastructure Maturing',
                  desc: 'Specialized credit brokers, lawyers, and insurers have built robust infrastructure around transferable credits. Standard transaction documentation (purchase agreements, tax opinion formats, insurance products) has reduced transaction costs from $150,000–$400,000 in 2023 to $50,000–$150,000 for many deals.',
                },
                {
                  title: 'Smaller Deal Sizes Becoming Viable',
                  desc: 'The original minimum viable deal size was roughly $5 million in credits. Aggregation platforms — where multiple smaller projects pool their credits for sale to a single buyer — have reduced effective minimums to $500,000–$1 million. This opens the market to smaller developers and distributed energy projects.',
                },
                {
                  title: 'ITC Recapture Insurance as Standard Practice',
                  desc: 'Buyers increasingly require recapture insurance, which has become a standard product from established insurers (Munich Re, Chubb, AIG among others). Insurance premiums run 0.5–1.5% of credit value, effectively reducing the developer\'s net proceeds by this amount.',
                },
              ].map((item) => (
                <div key={item.title} className="rounded-lg border border-deep-100 dark:border-deep-800 p-5">
                  <h3 className="font-semibold text-deep-900 dark:text-deep-100 mb-2">{item.title}</h3>
                  <p className="text-[14px] text-deep-600 dark:text-sage-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Credit Pricing Trends */}
          <section>
            <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-4">
              Credit Pricing Trends by Type
            </h2>

            <div className="overflow-x-auto rounded-xl border border-deep-100 dark:border-deep-800 mb-5">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-deep-50 dark:bg-deep-800/50 border-b border-deep-100 dark:border-deep-700">
                    <th className="text-left px-4 py-3 font-semibold text-deep-700 dark:text-deep-300">Credit Type</th>
                    <th className="text-left px-4 py-3 font-semibold text-deep-700 dark:text-deep-300">Q1 2024 Pricing</th>
                    <th className="text-left px-4 py-3 font-semibold text-deep-700 dark:text-deep-300">Q1 2026 Pricing</th>
                    <th className="text-left px-4 py-3 font-semibold text-deep-700 dark:text-deep-300">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-deep-100 dark:divide-deep-800">
                  {[
                    { type: 'ITC (base 30%)', q1_2024: '86–90¢', q1_2026: '88–92¢', trend: 'Stable/up slightly' },
                    { type: 'ITC + Domestic Content', q1_2024: '88–93¢', q1_2026: '91–95¢', trend: 'Up (buyer demand)' },
                    { type: 'ITC + Multiple Adders', q1_2024: '90–94¢', q1_2026: '93–96¢', trend: 'Up (scarcity premium)' },
                    { type: 'PTC (solar/wind)', q1_2024: '85–90¢', q1_2026: '88–93¢', trend: 'Stable/up' },
                    { type: '45X Advanced Mfg', q1_2024: '88–93¢', q1_2026: '90–95¢', trend: 'Up (new supply limited)' },
                    { type: '45Q Carbon Capture', q1_2024: '84–90¢', q1_2026: '87–93¢', trend: 'Stable (policy risk discount)' },
                    { type: '45V Clean Hydrogen', q1_2024: 'N/A (rules pending)', q1_2026: '82–90¢', trend: 'New (litigation discount)' },
                  ].map((row) => (
                    <tr key={row.type} className="hover:bg-deep-50/50 dark:hover:bg-deep-800/30">
                      <td className="px-4 py-3 font-medium text-deep-900 dark:text-deep-100">{row.type}</td>
                      <td className="px-4 py-3 font-mono text-deep-600 dark:text-sage-400">{row.q1_2024}</td>
                      <td className="px-4 py-3 font-mono text-teal-600 dark:text-teal-400 font-semibold">{row.q1_2026}</td>
                      <td className="px-4 py-3 text-deep-600 dark:text-sage-400">{row.trend}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Policy Risk */}
          <section>
            <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-4">
              Policy Risk Landscape
            </h2>
            <p className="mb-5">
              The 2024 election changed the political environment for IRA credits. The new Congress has introduced legislation targeting several IRA provisions. Here is the current risk assessment by program:
            </p>
            <div className="space-y-3">
              {[
                { program: 'ITC (commercial solar, storage)', risk: 'Low', color: 'emerald', desc: 'Bipartisan support from solar manufacturing states. Retroactive elimination of earned credits faces near-certain legal challenge.' },
                { program: 'PTC (wind)', risk: 'Moderate', color: 'amber', desc: 'Some legislative attention but wind manufacturing employment in Republican districts creates bipartisan resistance to elimination.' },
                { program: 'Low-Income Community Bonus Allocation', risk: 'High', color: 'red', desc: 'Allocation program (not the underlying ITC credit) is more politically vulnerable. Annual appropriations could be reduced.' },
                { program: '45L New Energy Efficient Home', risk: 'Low', color: 'emerald', desc: 'Homebuilder support and political neutrality make this among the safest IRA provisions.' },
                { program: '179D Commercial Building Efficiency', risk: 'Low', color: 'emerald', desc: 'Strong real estate industry support. Pre-IRA credit expansion makes rollback politically difficult.' },
                { program: '45V Clean Hydrogen', risk: 'Moderate', color: 'amber', desc: 'Actively contested via litigation on Treasury rules. Legislative risk compounds regulatory uncertainty.' },
                { program: 'Direct Pay (tax-exempt entities)', risk: 'Moderate', color: 'amber', desc: 'Municipal and nonprofit beneficiaries create bipartisan resistance, but the mechanism is politically novel.' },
              ].map((item) => {
                const colors = {
                  emerald: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400',
                  amber: 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400',
                  red: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400',
                };
                return (
                  <div key={item.program} className="flex items-start gap-3 rounded-lg border border-deep-100 dark:border-deep-800 p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex-shrink-0 mt-0.5 ${colors[item.color as keyof typeof colors]}`}>
                      {item.risk}
                    </span>
                    <div>
                      <p className="font-semibold text-deep-900 dark:text-deep-100 mb-0.5 text-[14px]">{item.program}</p>
                      <p className="text-[13px] text-deep-600 dark:text-sage-400">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 2026 Predictions */}
          <section>
            <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-4">
              Predictions for 2026
            </h2>
            <div className="space-y-4">
              {[
                'Transfer market volume will grow to $45–55 billion as additional 2023–2024 project vintages reach PTO and begin generating credits.',
                'The 45X advanced manufacturing credit will become the second-largest by volume, driven by US solar and battery gigafactory completions.',
                'At least one federal appellate court ruling on 45V hourly matching will significantly affect green hydrogen project economics.',
                'Credit pricing will remain stable in the 88–96 cent range absent major legislative changes — with domestic content credits commanding the pricing premium.',
                'The low-income community bonus allocation round will remain oversubscribed by 3:1 or greater as demand outpaces supply.',
                'Corporate direct buyers will surpass traditional tax equity investors in total credit monetization volume for the first time.',
              ].map((pred, i) => (
                <div key={i} className="flex items-start gap-4">
                  <span className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 flex items-center justify-center font-mono font-bold text-[13px] flex-shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-[15px] text-deep-600 dark:text-sage-400 pt-1">{pred}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-5">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqSchema.mainEntity.map((faq, i) => (
                <div key={i} className="rounded-lg border border-deep-100 dark:border-deep-800 p-5">
                  <h3 className="font-semibold text-deep-900 dark:text-deep-100 mb-2 text-[14px]">{faq.name}</h3>
                  <p className="text-[14px] text-deep-600 dark:text-sage-400">{faq.acceptedAnswer.text}</p>
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
              Get the current incentive stack for your project — updated in real time as programs change, markets shift, and new guidance is issued.
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
                { title: 'IRA Policy Tracker: March 2026', href: '/blog/ira-policy-update-march-2026' },
                { title: 'Tax Equity vs. Transferability: Complete Guide', href: '/blog/tax-equity-vs-transferability' },
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
