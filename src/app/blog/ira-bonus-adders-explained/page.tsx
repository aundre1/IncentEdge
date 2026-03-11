import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'IRA Bonus Adders Explained: Stack Up to 70% ITC for Your Clean Energy Project',
  description:
    'Learn how IRA bonus adders — energy community, domestic content, and low-income — can boost your ITC or PTC from 30% to 70%. Eligibility and stacking rules explained.',
  alternates: { canonical: 'https://incentedge.com/blog/ira-bonus-adders-explained' },
  openGraph: {
    title: 'IRA Bonus Adders Explained: Stack Up to 70% ITC for Your Clean Energy Project',
    description:
      'IRA bonus adders can boost your ITC from 30% to 70%. Energy community, domestic content, and low-income adder eligibility and stacking rules explained.',
    url: 'https://incentedge.com/blog/ira-bonus-adders-explained',
    type: 'article',
  },
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'IRA Bonus Adders: How to Stack Credits From 30% to 70%',
  description: 'How IRA bonus adders — energy community, domestic content, and low-income — can boost your ITC or PTC from 30% to 70%.',
  datePublished: '2026-03-01',
  dateModified: '2026-03-01',
  author: { '@type': 'Organization', name: 'IncentEdge Research Team', url: 'https://incentedge.com' },
  publisher: { '@type': 'Organization', name: 'IncentEdge', url: 'https://incentedge.com' },
  mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://incentedge.com/blog/ira-bonus-adders-explained' },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Can I stack all three IRA bonus adders for a 70% ITC?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. A project that satisfies prevailing wage requirements (for the 30% base), qualifies for the energy community adder (+10%), satisfies domestic content (+10%), and qualifies for the low-income community adder (+20%) can achieve a maximum ITC of 70% of eligible basis. All three adders are stackable, but each has its own eligibility requirements that must be independently satisfied.' },
    },
    {
      '@type': 'Question',
      name: 'What qualifies as an energy community?',
      acceptedAnswer: { '@type': 'Answer', text: 'Energy communities are defined in three categories under the IRA: (1) Brownfield sites (any site on the EPA Brownfields list or state equivalent); (2) Statistical areas with significant historical fossil fuel employment or tax revenue (metropolitan/non-metropolitan statistical areas where at least 0.17% of employment or 25% of local tax revenues came from fossil fuel extraction, processing, transport, or storage, and unemployment is at or above the national average); (3) Census tracts containing or adjacent to a coal mine that closed after 1999 or a coal-fired power plant that retired after 2009. Treasury publishes annual updated lists of qualifying communities.' },
    },
    {
      '@type': 'Question',
      name: 'What are the domestic content requirements for the +10% adder?',
      acceptedAnswer: { '@type': 'Answer', text: 'The domestic content bonus requires: (1) All iron and steel used in the facility must be produced in the United States; (2) Manufactured products must meet a US-content percentage threshold — 40% for projects beginning construction in 2023-2024, 45% in 2025, 50% in 2026, and 55% thereafter (wind projects have higher thresholds). Equipment manufacturers must provide certifications, and developers are responsible for obtaining and retaining these certifications.' },
    },
    {
      '@type': 'Question',
      name: 'What are the four categories of the low-income community adder?',
      acceptedAnswer: { '@type': 'Answer', text: 'Category 1 (+10%): Projects in a low-income community as defined in Section 45D (census tracts with 20%+ poverty rate or median family income below 80% of area or statewide median). Category 2 (+10%): Projects on Indian land. Category 3 (+20%): Low-income residential building projects (qualified low-income buildings under Section 42). Category 4 (+20%): Low-income economic benefit projects (at least 50% of financial benefits of the electricity go to low-income households). Categories 3 and 4 only apply to solar and wind facilities under 5MW AC.' },
    },
    {
      '@type': 'Question',
      name: 'How do I check if my project qualifies for bonus adders?',
      acceptedAnswer: { '@type': 'Answer', text: 'The Department of Energy maintains the Energy Community Tax Credit Bonus mapping tool at energycommunities.gov. The IRS provides the low-income community census tract data through its NMTC mapping tool. For domestic content, you must obtain written certifications from your equipment manufacturers. IncentEdge automatically checks all three adder categories for any project location and generates a comprehensive eligibility report.' },
    },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://incentedge.com' },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://incentedge.com/blog' },
    { '@type': 'ListItem', position: 3, name: 'IRA Bonus Adders', item: 'https://incentedge.com/blog/ira-bonus-adders-explained' },
  ],
};

const RELATED_POSTS = [
  { slug: 'prevailing-wage-apprenticeship-requirements', title: 'IRA Prevailing Wage & Apprenticeship Requirements: Complete Guide' },
  { slug: 'itc-vs-ptc-comparison', title: 'ITC vs. PTC: Which Credit Maximizes Your Clean Energy Project\'s Value?' },
  { slug: 'direct-pay-election', title: 'Direct Pay Under the IRA: Monetizing Credits Without Tax Liability' },
];

export default function IRABonusAddersPage() {
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
            <span className="text-deep-900 dark:text-deep-100">IRA Bonus Adders</span>
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
            IRA Bonus Adders: How to Stack Credits From 30% to 70%
          </h1>

          <p className="text-lg text-deep-600 dark:text-sage-400 mb-10 leading-relaxed border-l-4 border-teal-400 pl-4">
            The Inflation Reduction Act's base ITC is 30% — already the most generous in US history. But up to three stackable bonus adders can push that to 70% of eligible project costs. Here's how each one works and how to check your project's eligibility.
          </p>

          {/* Credit builder */}
          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-6">The ITC Stack: From 30% to 70%</h2>
          <div className="rounded-xl border border-deep-200 dark:border-deep-700 overflow-hidden mb-8">
            {[
              { label: 'Base ITC (with Prevailing Wage + Apprenticeship)', rate: '30%', desc: 'Baseline for projects meeting PWA requirements (or under 1MW AC)', color: 'bg-teal-600', width: '43%' },
              { label: '+ Energy Community Adder', rate: '+10%', desc: 'Brownfields, coal communities, fossil fuel employment areas', color: 'bg-teal-500', width: '14%' },
              { label: '+ Domestic Content Adder', rate: '+10%', desc: 'US steel, iron, and manufactured products threshold met', color: 'bg-teal-400', width: '14%' },
              { label: '+ Low-Income Adder (Categories 3 & 4)', rate: '+20%', desc: 'Low-income residential building or economic benefit project', color: 'bg-emerald-500', width: '29%' },
            ].map(({ label, rate, desc, color, width }) => (
              <div key={label} className="p-4 border-b border-deep-100 dark:border-deep-800 last:border-0">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-[14px] font-medium text-deep-900 dark:text-deep-100">{label}</span>
                  <span className="font-mono font-bold text-teal-700 dark:text-teal-300 text-[15px]">{rate}</span>
                </div>
                <div className="h-2 rounded-full bg-deep-100 dark:bg-deep-800 mb-2">
                  <div className={`h-full rounded-full ${color}`} style={{ width }} />
                </div>
                <p className="text-[12px] text-deep-500 dark:text-sage-500">{desc}</p>
              </div>
            ))}
            <div className="p-4 bg-teal-50 dark:bg-teal-900/20">
              <div className="flex items-baseline justify-between">
                <span className="font-sora font-bold text-deep-900 dark:text-deep-100">Maximum Possible ITC</span>
                <span className="font-mono font-bold text-2xl text-teal-700 dark:text-teal-300">70%</span>
              </div>
            </div>
          </div>

          {/* Energy Community */}
          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-4">Energy Community Adder (+10%)</h2>
          <p className="text-deep-700 dark:text-sage-300 mb-4 leading-relaxed">
            The energy community adder was designed to direct clean energy investment to communities historically dependent on fossil fuel industries. A project located in an energy community receives an additional 10 percentage points of ITC (or 10% more PTC per kWh).
          </p>
          <p className="text-deep-700 dark:text-sage-300 mb-4 leading-relaxed">
            There are three qualifying categories:
          </p>
          <div className="space-y-4 mb-6">
            {[
              { title: 'Brownfield Sites', body: 'Any site listed on the EPA National Priorities List, CERCLA Brownfields database, or a state equivalent brownfield program. These are former industrial or commercial properties with real or potential environmental contamination.' },
              { title: 'Statistical Areas with Fossil Fuel Dependence', body: 'Metropolitan Statistical Areas (MSAs) or non-metropolitan statistical areas where: (a) 0.17% or more of employment OR 25% or more of local tax revenues derived from fossil fuel extraction, processing, transport, or storage, AND (b) unemployment at or above the national average in the prior year. Treasury publishes updated qualifying MSA lists annually.' },
              { title: 'Coal Closure Communities', body: 'Census tracts that contain or are directly adjacent to a coal mine that closed after December 31, 1999, or a coal-fired electric generating unit that ceased operations after December 31, 2009. The Department of Energy maintains the definitive qualifying tract list at energycommunities.gov.' },
            ].map(({ title, body }) => (
              <div key={title} className="p-4 rounded-lg border border-deep-100 dark:border-deep-800">
                <p className="font-semibold text-deep-900 dark:text-deep-100 mb-1">{title}</p>
                <p className="text-[14px] text-deep-600 dark:text-sage-400">{body}</p>
              </div>
            ))}
          </div>
          <p className="text-deep-700 dark:text-sage-300 mb-6 leading-relaxed">
            Checking eligibility: Go to <span className="font-mono text-teal-700 dark:text-teal-300">energycommunities.gov</span> and enter the project's latitude/longitude. The tool provides a definitive determination for each of the three categories.
          </p>

          {/* Domestic Content */}
          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-4">Domestic Content Adder (+10%)</h2>
          <p className="text-deep-700 dark:text-sage-300 mb-4 leading-relaxed">
            The domestic content adder rewards projects that use American-made materials and equipment. Requirements have two components:
          </p>
          <div className="space-y-3 mb-4">
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
              <p className="font-semibold text-deep-900 dark:text-deep-100 mb-1">Iron and Steel: 100% US-produced</p>
              <p className="text-[14px] text-deep-600 dark:text-sage-400">All iron and steel used as structural components (racking, mounting, foundations, piping) must be produced in the United States. This is an absolute requirement — no percentage threshold.</p>
            </div>
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
              <p className="font-semibold text-deep-900 dark:text-deep-100 mb-1">Manufactured Products: Phased US-content threshold</p>
              <p className="text-[14px] text-deep-600 dark:text-sage-400">The manufactured product content threshold (measured by cost) phases in over time: 40% in 2023-2024, 45% in 2025, 50% in 2026, 55% from 2027 onward. Wind turbines have higher thresholds per final regulations.</p>
            </div>
          </div>
          <p className="text-deep-700 dark:text-sage-300 mb-6 leading-relaxed">
            Documentation requirement: The developer must obtain signed domestic content certifications from each equipment manufacturer. For solar, the primary components are the modules (panels) and inverters. For wind, the turbine nacelles and towers. A qualified engineer or tax professional should review the certifications before claiming the adder.
          </p>

          {/* Low-Income */}
          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-4">Low-Income Community Adder (+10% or +20%)</h2>
          <p className="text-deep-700 dark:text-sage-300 mb-4 leading-relaxed">
            The low-income community adder is the most complex of the three but also the most powerful — offering up to +20% additional ITC. It applies to solar and wind facilities under 5MW AC. There are four categories:
          </p>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-[14px] border border-deep-200 dark:border-deep-700 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-deep-50 dark:bg-deep-800">
                  <th className="text-left px-4 py-3 font-semibold text-deep-900 dark:text-deep-100 border-b border-deep-200 dark:border-deep-700">Category</th>
                  <th className="text-left px-4 py-3 font-semibold text-deep-600 dark:text-sage-400 border-b border-deep-200 dark:border-deep-700">Adder</th>
                  <th className="text-left px-4 py-3 font-semibold text-deep-600 dark:text-sage-400 border-b border-deep-200 dark:border-deep-700">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-deep-100 dark:divide-deep-800">
                {[
                  ['Category 1', '+10%', 'Facility located in a low-income community (census tract with 20%+ poverty rate or median income below 80% of area or statewide median)'],
                  ['Category 2', '+10%', 'Facility located on Indian land as defined in the Indian Land Consolidation Act'],
                  ['Category 3', '+20%', 'Qualified low-income residential building project (facility serves a qualified low-income building under Section 42)'],
                  ['Category 4', '+20%', 'Low-income economic benefit project: at least 50% of financial benefits of the electricity sold go to low-income households'],
                ].map(([cat, adder, desc]) => (
                  <tr key={cat} className="hover:bg-deep-50/50 dark:hover:bg-deep-900/50">
                    <td className="px-4 py-3 font-medium text-deep-900 dark:text-deep-100">{cat}</td>
                    <td className="px-4 py-3 font-mono font-bold text-teal-700 dark:text-teal-300">{adder}</td>
                    <td className="px-4 py-3 text-deep-600 dark:text-sage-400">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 mb-6">
            <p className="text-[14px] font-medium text-amber-800 dark:text-amber-300">
              Important: Low-income adder capacity is allocated by the IRS through an annual application process. The DOE has issued guidance that applications are reviewed and allocated on a rolling basis. Not all eligible projects are guaranteed an allocation — apply early.
            </p>
          </div>

          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-4">Stacking Rules: Can You Get All Three?</h2>
          <p className="text-deep-700 dark:text-sage-300 mb-4 leading-relaxed">
            Yes — all three bonus adders are independently stackable. A project that qualifies for all three and satisfies prevailing wage requirements can achieve the maximum 70% ITC. The adders are additive, not mutually exclusive.
          </p>
          <p className="text-deep-700 dark:text-sage-300 mb-6 leading-relaxed">
            The prevailing wage interaction: The base ITC is only 30% if prevailing wage and apprenticeship requirements are met (or the project is under 1MW AC). If PWA is not satisfied, the base is 6%, and the bonus adders only add 2 percentage points each instead of 10/20 — making PWA compliance critical for maximizing adder value.
          </p>

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
              Enter your project location and technology type. IncentEdge checks all three bonus adder categories automatically and shows your full credit stack in seconds.
            </p>
            <Link href="/signup" className="inline-flex items-center gap-2 px-7 py-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[14px] font-semibold transition-colors">
              Calculate Your Credit Stack <ArrowRight className="w-4 h-4" />
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
