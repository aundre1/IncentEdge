import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Download } from 'lucide-react';
import { PublicPageShell } from '@/components/public/PublicPageShell';

export const metadata: Metadata = {
  title: 'The Complete IRA Tax Credit Guide for Developers & Finance Teams (2026)',
  description:
    'Everything you need to know about IRA tax credits in 2026. Federal programs, eligibility, bonus adders, transferability, state stacking — the definitive guide for project developers and finance teams.',
  alternates: { canonical: 'https://incentedge.com/resources/ira-guide' },
  openGraph: {
    title: 'The Complete IRA Tax Credit Guide for Developers & Finance Teams (2026)',
    description:
      'Everything you need to know about IRA tax credits in 2026. Federal programs, eligibility, bonus adders, transferability, state stacking — the definitive guide.',
    url: 'https://incentedge.com/resources/ira-guide',
    siteName: 'IncentEdge',
    type: 'article',
  },
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'The Complete IRA Tax Credit Guide for Developers & Finance Teams (2026 Edition)',
  description:
    'The definitive guide to IRA tax credits in 2026: all seven federal programs, bonus adders, transferability, direct pay, state stacking, and compliance requirements.',
  url: 'https://incentedge.com/resources/ira-guide',
  author: { '@type': 'Organization', name: 'IncentEdge Research Team' },
  publisher: { '@type': 'Organization', name: 'IncentEdge', url: 'https://incentedge.com' },
  datePublished: '2026-03-01',
  dateModified: '2026-03-11',
  wordCount: 3800,
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is the Inflation Reduction Act (IRA)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The Inflation Reduction Act of 2022 is the largest climate investment in US history — approximately $400 billion in climate and clean energy provisions. It expanded and created tax credits for clean energy, energy efficiency, clean vehicles, and manufacturing.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the maximum ITC credit rate under the IRA?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The Investment Tax Credit (ITC) base rate is 30% of eligible project costs. With all bonus adders — Energy Community (+10%), Domestic Content (+10%), and Low-Income (+10-20%) — a project can reach up to 70% of project cost.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is IRA transferability?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Section 6418 of the IRS code allows project developers to sell (transfer) IRA tax credits to third-party buyers for cash. Credits typically trade at 88–96 cents per dollar of credit value, giving developers who lack tax appetite a way to immediately monetize their credits.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which IRA credits are directly payable?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Under Section 6417, tax-exempt organizations (nonprofits, municipalities, tribal governments, rural electric cooperatives) can elect to receive a direct cash payment equal to the credit value, rather than using the credit against tax liability.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can you stack IRA credits with state incentives?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. IRA federal credits generally do not prohibit stacking with state incentives, PACE financing, utility rebates, or federal grants. However, certain combinations (like REAP grants + ITC) may require basis adjustments. Always model the full stack with legal counsel.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the prevailing wage requirement for IRA bonus credits?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Projects over 1 MW must pay prevailing wages to all laborers and mechanics during construction and for 5 years of alteration/repair to qualify for the full 30% ITC (vs. 6% base). Prevailing wages are set by the Department of Labor and vary by location and trade.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is an energy community for ITC bonus purposes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'An energy community is a geographic area that has been historically dependent on fossil fuel employment or has a closed coal mine or coal-fired power plant. Projects sited in energy communities qualify for an additional 10% ITC bonus adder.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is Section 45L?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Section 45L provides a federal tax credit of $2,500 per unit for Energy Star certified new homes, and $5,000 per unit for Zero Energy Ready certified homes. It applies to single-family and multifamily buildings where the eligible contractor claims the credit.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does Section 179D work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Section 179D is a tax deduction (not a credit) for energy-efficient improvements to commercial buildings. The IRA raised the maximum to $5.00 per square foot (prevailing wage required). Notably, nonprofits and government building owners can allocate the deduction to the designer/architect.',
      },
    },
    {
      '@type': 'Question',
      name: 'What forms do I need to file for IRA credits?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Most IRA business credits are claimed on Form 3800 (General Business Credit) and the relevant credit-specific form (e.g., Form 8835 for renewable electricity, Form 8911 for alternative fuel vehicle refueling). Transferability elections require additional Forms 3800 and seller registration.',
      },
    },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://incentedge.com' },
    { '@type': 'ListItem', position: 2, name: 'Resources', item: 'https://incentedge.com/resources' },
    { '@type': 'ListItem', position: 3, name: 'IRA Tax Credit Guide', item: 'https://incentedge.com/resources/ira-guide' },
  ],
};

const tocItems = [
  { id: 'what-is-ira', label: 'What Is the IRA?' },
  { id: 'credit-overview', label: 'Federal Credit Overview' },
  { id: 'big-four', label: 'The Big Four Credits' },
  { id: 'bonus-adders', label: 'Bonus Adders & Stacking' },
  { id: 'monetization', label: 'Monetization Options' },
  { id: 'state-stacking', label: 'State + Local Stacking' },
  { id: 'compliance', label: 'Compliance & Documentation' },
  { id: 'incentedge', label: 'How IncentEdge Helps' },
  { id: 'faq', label: 'FAQ' },
];

export default function IRAGuidePage() {
  return (
    <PublicPageShell breadcrumbs={[{ label: 'Resources', href: '/resources' }, { label: 'IRA Tax Credit Guide' }]}>
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

      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">

          {/* Sticky Sidebar TOC */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="lg:sticky lg:top-24">
              <div className="rounded-xl border border-deep-100 dark:border-deep-800 bg-deep-50/50 dark:bg-deep-900/30 p-5 mb-4">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-deep-400 dark:text-sage-600 mb-3">
                  Table of Contents
                </p>
                <nav>
                  <ul className="space-y-1.5">
                    {tocItems.map((item) => (
                      <li key={item.id}>
                        <a
                          href={`#${item.id}`}
                          className="block text-[13px] text-deep-600 dark:text-sage-400 hover:text-teal-600 dark:hover:text-teal-400 py-0.5 transition-colors"
                        >
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
              <Link
                href="/signup"
                className="flex items-center gap-2 w-full justify-center px-4 py-2.5 rounded-lg border border-deep-200 dark:border-deep-700 text-[13px] font-semibold text-deep-700 dark:text-sage-300 hover:bg-deep-50 dark:hover:bg-deep-800 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </Link>
            </div>
          </aside>

          {/* Main Content */}
          <article className="flex-1 min-w-0">
            {/* Header */}
            <header className="mb-10">
              <div className="inline-flex items-center rounded-full border border-teal-200 dark:border-teal-700 bg-teal-50 dark:bg-teal-900/20 px-4 py-1.5 text-[12px] text-teal-700 dark:text-teal-300 mb-4">
                Cornerstone Guide
              </div>
              <h1 className="font-sora text-4xl md:text-[42px] font-bold tracking-tight text-deep-900 dark:text-white leading-[1.1] mb-4">
                The Complete IRA Tax Credit Guide (2026 Edition)
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-[13px] text-deep-500 dark:text-sage-500 pb-6 border-b border-deep-100 dark:border-deep-800">
                <span>By IncentEdge Research Team</span>
                <span>Last updated: March 2026</span>
                <span>~20 min read</span>
              </div>
            </header>

            <div className="prose-content space-y-12 text-deep-700 dark:text-sage-300 text-[15px] leading-relaxed">

              {/* Section 1 */}
              <section id="what-is-ira">
                <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-4">
                  Section 1: What Is the Inflation Reduction Act?
                </h2>
                <p className="mb-4">
                  The Inflation Reduction Act of 2022 (IRA) is the largest climate investment in United States history. Signed into law on August 16, 2022, the legislation allocated approximately $400 billion toward clean energy, climate resilience, and domestic manufacturing over a 10-year budget window — with independent estimates now projecting total investment exceeding $1 trillion when accounting for private capital mobilization.
                </p>
                <p className="mb-4">
                  For project developers, real estate owners, and finance teams, the IRA represents an unprecedented opportunity. The law dramatically expanded existing tax credit programs (ITC, PTC, 45L, 179D) and created entirely new ones (45V clean hydrogen, 45Q carbon capture expansion, 48C advanced manufacturing). Crucially, it introduced two mechanisms that fundamentally changed how these credits can be monetized: <strong>transferability</strong> and <strong>direct pay</strong>.
                </p>
                <h3 className="font-sora text-lg font-semibold text-deep-900 dark:text-deep-100 mb-3 mt-6">
                  Three Ways to Monetize IRA Credits
                </h3>
                <ul className="space-y-3 mb-4">
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 flex items-center justify-center text-[12px] font-bold flex-shrink-0 mt-0.5">1</span>
                    <div>
                      <strong className="text-deep-900 dark:text-deep-100">Tax Equity (Traditional):</strong> A tax equity investor provides upfront capital in exchange for the tax benefits (credits and depreciation) from the project. Typical structures include partnership flip and sale-leaseback.
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 flex items-center justify-center text-[12px] font-bold flex-shrink-0 mt-0.5">2</span>
                    <div>
                      <strong className="text-deep-900 dark:text-deep-100">Transferability (Section 6418):</strong> Developers sell credits directly to third-party buyers at a negotiated rate, typically 88–96 cents per dollar. No complex partnership structure required. Active since 2023.
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 flex items-center justify-center text-[12px] font-bold flex-shrink-0 mt-0.5">3</span>
                    <div>
                      <strong className="text-deep-900 dark:text-deep-100">Direct Pay (Section 6417):</strong> Tax-exempt entities — nonprofits, municipalities, tribal governments, rural cooperatives — receive a direct cash refund equal to the credit value. Available for specific credits including ITC and PTC.
                    </div>
                  </li>
                </ul>
                <p className="mb-4">
                  The fundamental principle driving IRA value is <strong>stackability</strong>. A single project can qualify for multiple federal credits simultaneously, layer in state and local incentives, utilize PACE financing, and combine grant programs — all without violating any prohibition (subject to basis adjustment rules). A well-structured project can generate credit value representing 70%+ of total project cost.
                </p>
              </section>

              {/* Section 2 */}
              <section id="credit-overview">
                <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-4">
                  Section 2: Federal Tax Credit Overview
                </h2>
                <p className="mb-6">
                  The IRA established or enhanced seven major federal tax credits relevant to clean energy and real estate projects. The table below summarizes the key parameters.
                </p>
                <div className="overflow-x-auto rounded-xl border border-deep-100 dark:border-deep-800 mb-6">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="bg-deep-50 dark:bg-deep-800/50 border-b border-deep-100 dark:border-deep-700">
                        <th className="text-left px-4 py-3 font-semibold text-deep-700 dark:text-deep-300">Credit Name</th>
                        <th className="text-left px-4 py-3 font-semibold text-deep-700 dark:text-deep-300">Code</th>
                        <th className="text-left px-4 py-3 font-semibold text-deep-700 dark:text-deep-300">Rate</th>
                        <th className="text-left px-4 py-3 font-semibold text-deep-700 dark:text-deep-300">Technology</th>
                        <th className="text-center px-4 py-3 font-semibold text-deep-700 dark:text-deep-300">Transferable</th>
                        <th className="text-center px-4 py-3 font-semibold text-deep-700 dark:text-deep-300">Direct Pay</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-deep-100 dark:divide-deep-800">
                      {[
                        { name: 'New Energy Efficient Home', code: '45L', rate: '$2,500–$5,000/unit', tech: 'Residential', transferable: false, directPay: false },
                        { name: 'Commercial Building Efficiency', code: '179D', rate: '$0.50–$5.00/sq ft', tech: 'Commercial Buildings', transferable: true, directPay: false },
                        { name: 'Investment Tax Credit', code: '48 / 48E', rate: '30%–70% of cost', tech: 'Solar, Wind, Storage, Fuel Cell', transferable: true, directPay: true },
                        { name: 'Production Tax Credit', code: '45 / 45Y', rate: '2.75¢/kWh (10 yrs)', tech: 'Solar, Wind, Geothermal', transferable: true, directPay: true },
                        { name: 'Advanced Energy Mfg Credit', code: '48C', rate: '30% of cost', tech: 'Clean Energy Mfg', transferable: true, directPay: true },
                        { name: 'Carbon Capture Credit', code: '45Q', rate: '$85/ton (storage)', tech: 'Carbon Capture (CCUS)', transferable: true, directPay: true },
                        { name: 'Clean Hydrogen Credit', code: '45V', rate: 'Up to $3.00/kg', tech: 'Clean Hydrogen Production', transferable: true, directPay: true },
                      ].map((row) => (
                        <tr key={row.code} className="hover:bg-deep-50/50 dark:hover:bg-deep-800/30">
                          <td className="px-4 py-3 font-medium text-deep-900 dark:text-deep-100">{row.name}</td>
                          <td className="px-4 py-3 font-mono text-teal-600 dark:text-teal-400">{row.code}</td>
                          <td className="px-4 py-3 text-deep-700 dark:text-sage-300">{row.rate}</td>
                          <td className="px-4 py-3 text-deep-600 dark:text-sage-400">{row.tech}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-[12px] font-semibold ${row.transferable ? 'text-emerald-600 dark:text-emerald-400' : 'text-deep-400 dark:text-deep-600'}`}>
                              {row.transferable ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-[12px] font-semibold ${row.directPay ? 'text-emerald-600 dark:text-emerald-400' : 'text-deep-400 dark:text-deep-600'}`}>
                              {row.directPay ? 'Yes' : 'No'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-[13px] text-deep-500 dark:text-sage-500 italic">
                  Note: Prevailing wage and apprenticeship requirements apply to projects over 1 MW for maximum credit rates. Direct pay is limited to tax-exempt entities for most credits except 45Q, 45V, and 48C (which allow 5-year direct pay for any entity).
                </p>
              </section>

              {/* Section 3 */}
              <section id="big-four">
                <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-4">
                  Section 3: Deep Dive — The Big Four Credits
                </h2>

                <h3 className="font-sora text-xl font-semibold text-deep-900 dark:text-deep-100 mb-3">
                  Investment Tax Credit (ITC) — Section 48 / 48E
                </h3>
                <p className="mb-4">
                  The ITC is the most widely used IRA credit, applying to solar, wind, storage, geothermal, fuel cell, and a growing list of clean energy technologies. The base credit rate is <strong>30% of eligible project costs</strong> (including equipment, installation labor, and certain soft costs). With prevailing wage compliance, projects under 1 MW receive 30% automatically.
                </p>
                <p className="mb-4">
                  The 2022 IRA also created Section 48E, a technology-neutral successor to 48 that will apply to all clean electricity projects placed in service after 2024. Projects that qualify for the Section 48E ITC can still stack bonus adders, bringing the total rate to as high as 70% of project cost.
                </p>
                <p className="mb-6">
                  The ITC is calculated on a project-by-project basis. Eligible basis includes the cost of equipment, installation, and interconnection. Land costs, financing fees, and certain permitting costs are excluded. Depreciation basis must be reduced by 50% of the ITC claimed (unless the taxpayer elects reduced credit).
                </p>

                <h3 className="font-sora text-xl font-semibold text-deep-900 dark:text-deep-100 mb-3">
                  Production Tax Credit (PTC) — Section 45 / 45Y
                </h3>
                <p className="mb-4">
                  The PTC provides a per-kilowatt-hour credit for electricity produced and sold from qualified clean energy facilities. The IRA-enhanced base rate is <strong>2.75 cents per kWh</strong> (adjusted for inflation), payable over the first 10 years of operation. This makes the PTC valuable for high-capacity-factor projects like offshore wind, geothermal, and large-scale solar.
                </p>
                <p className="mb-4">
                  The choice between ITC and PTC is an important financial modeling decision. Projects with high capital costs and lower capacity factors generally favor the ITC. Projects with lower capital costs but high annual generation — or where long-term revenue certainty is valued — often favor the PTC. The two credits are mutually exclusive for a given project.
                </p>
                <p className="mb-6">
                  Section 45Y, the technology-neutral PTC successor, applies to facilities that generate electricity from clean energy sources with zero greenhouse gas emissions. Treasury guidance finalizes the eligibility list.
                </p>

                <h3 className="font-sora text-xl font-semibold text-deep-900 dark:text-deep-100 mb-3">
                  New Energy Efficient Home Credit — Section 45L
                </h3>
                <p className="mb-4">
                  Section 45L provides a federal tax credit to eligible contractors building new energy-efficient homes. The IRA significantly increased the credit: <strong>$2,500 per unit</strong> for Energy Star certified homes, and <strong>$5,000 per unit</strong> for Zero Energy Ready certified homes. The credit was also extended through 2032.
                </p>
                <p className="mb-4">
                  45L applies to both single-family homes and multifamily buildings up to three stories (Energy Star) or meeting Zero Energy Ready standards (all heights). A 200-unit multifamily project where all units qualify for the $5,000 credit generates $1 million in federal tax credits — fully stackable with state and local housing incentives including LIHTC.
                </p>
                <p className="mb-6">
                  The credit is claimed by the eligible contractor in the year the qualified unit is sold or leased to the first tenant. Certification documentation from a qualified third-party rater is required.
                </p>

                <h3 className="font-sora text-xl font-semibold text-deep-900 dark:text-deep-100 mb-3">
                  Commercial Building Energy Efficiency Deduction — Section 179D
                </h3>
                <p className="mb-4">
                  Section 179D is a tax deduction (not a credit) for energy-efficient improvements to commercial and multifamily buildings. The IRA raised the maximum deduction to <strong>$5.00 per square foot</strong> for projects that pay prevailing wages, up from the pre-IRA cap of $1.80/sq ft. The base rate without prevailing wages is $0.50–$1.00/sq ft.
                </p>
                <p className="mb-4">
                  A critical IRA enhancement: nonprofits, government entities, and tribal governments that own commercial buildings can now <strong>allocate the 179D deduction to the designers</strong> (architects, engineers, contractors) who performed the energy-efficiency work. This transformed 179D from a credit unavailable to tax-exempt building owners into a major incentive for the architecture and engineering sector.
                </p>
                <p className="mb-4">
                  179D applies to HVAC, building envelope, and lighting improvements that achieve a minimum percentage improvement over ASHRAE baseline standards. A qualifying 100,000 square foot commercial retrofit can generate a $500,000 deduction — effectively reducing project cost by roughly $125,000–$175,000 after-tax for a typical corporate taxpayer.
                </p>
              </section>

              {/* Section 4 */}
              <section id="bonus-adders">
                <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-4">
                  Section 4: Bonus Adders — Stacking Credits Up to 70%
                </h2>
                <p className="mb-6">
                  The IRA introduced four bonus adders to the ITC and PTC base rates. These are not separate credits — they are percentage-point additions to the base credit rate. A single project can qualify for all applicable adders simultaneously, and they stack multiplicatively with the base rate.
                </p>

                <div className="space-y-5 mb-6">
                  <div className="rounded-lg border border-deep-100 dark:border-deep-800 bg-deep-50/50 dark:bg-deep-900/30 p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-deep-900 dark:text-deep-100">Energy Community Bonus</h4>
                      <span className="font-mono text-teal-600 dark:text-teal-400 font-bold">+10%</span>
                    </div>
                    <p className="text-[13px] text-deep-600 dark:text-sage-400">
                      Projects sited in energy communities — areas with historically high fossil fuel employment, a closed coal mine, or a retired coal power plant — qualify for a 10 percentage-point bonus. The IRS maintains a publicly searchable map. As of 2026, thousands of census tracts qualify, including major metropolitan areas near closed coal plants.
                    </p>
                    <p className="text-[12px] text-deep-500 dark:text-sage-500 mt-2">
                      <strong>How to qualify:</strong> Look up project address on the IRS Energy Community map. Annual census tract updates may change eligibility.
                    </p>
                  </div>

                  <div className="rounded-lg border border-deep-100 dark:border-deep-800 bg-deep-50/50 dark:bg-deep-900/30 p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-deep-900 dark:text-deep-100">Domestic Content Bonus</h4>
                      <span className="font-mono text-teal-600 dark:text-teal-400 font-bold">+10%</span>
                    </div>
                    <p className="text-[13px] text-deep-600 dark:text-sage-400">
                      Projects using a minimum percentage of US-manufactured steel, iron, and manufactured components qualify for a 10 point bonus. The threshold is phased in: 40% domestic manufactured products for projects starting in 2024, rising to 55% by 2027. Steel and iron must be 100% US-produced.
                    </p>
                    <p className="text-[12px] text-deep-500 dark:text-sage-500 mt-2">
                      <strong>How to qualify:</strong> Track domestic content percentages through supply chain. Maintain manufacturer certifications. Treasury provides safe harbor guidance for specific equipment categories.
                    </p>
                  </div>

                  <div className="rounded-lg border border-deep-100 dark:border-deep-800 bg-deep-50/50 dark:bg-deep-900/30 p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-deep-900 dark:text-deep-100">Low-Income Community Bonus</h4>
                      <span className="font-mono text-teal-600 dark:text-teal-400 font-bold">+10% or +20%</span>
                    </div>
                    <p className="text-[13px] text-deep-600 dark:text-sage-400">
                      Facilities under 5 MW sited in low-income communities or on Indian land qualify for a +10% bonus. Facilities that provide direct benefits to low-income households (low-income residential housing or low-income economic benefit projects) qualify for +20%. This is allocated annually through a DOE/IRS application process.
                    </p>
                    <p className="text-[12px] text-deep-500 dark:text-sage-500 mt-2">
                      <strong>How to qualify:</strong> Apply during the annual allocation window. Projects are scored on direct benefits to low-income households. Competition is significant — apply early.
                    </p>
                  </div>

                  <div className="rounded-lg border border-deep-100 dark:border-deep-800 bg-deep-50/50 dark:bg-deep-900/30 p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-deep-900 dark:text-deep-100">Prevailing Wage & Apprenticeship Requirement</h4>
                      <span className="font-mono text-teal-600 dark:text-teal-400 font-bold">Required for 30% base</span>
                    </div>
                    <p className="text-[13px] text-deep-600 dark:text-sage-400">
                      Projects over 1 megawatt must satisfy prevailing wage and apprenticeship requirements to qualify for the full 30% base ITC (otherwise limited to 6%). Prevailing wages must be paid to all construction laborers and mechanics, and a minimum percentage of labor hours must be worked by registered apprentices.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/10 dark:to-emerald-900/10 border border-teal-100 dark:border-teal-800 p-6">
                  <h4 className="font-sora font-bold text-deep-900 dark:text-deep-100 mb-3">Real Example: 70% ITC Stack</h4>
                  <div className="font-mono text-[13px] space-y-1.5 text-deep-700 dark:text-sage-300">
                    <div className="flex justify-between">
                      <span>Base ITC (prevailing wage satisfied)</span>
                      <span className="text-teal-600 dark:text-teal-400">30%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>+ Energy Community Bonus</span>
                      <span className="text-teal-600 dark:text-teal-400">+10%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>+ Domestic Content Bonus</span>
                      <span className="text-teal-600 dark:text-teal-400">+10%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>+ Low-Income Community Bonus (direct benefit)</span>
                      <span className="text-teal-600 dark:text-teal-400">+20%</span>
                    </div>
                    <div className="border-t border-teal-200 dark:border-teal-700 pt-1.5 flex justify-between font-bold text-deep-900 dark:text-white">
                      <span>Total ITC Rate</span>
                      <span className="text-teal-600 dark:text-teal-400">= 70%</span>
                    </div>
                  </div>
                  <p className="text-[12px] text-deep-500 dark:text-sage-500 mt-3">
                    On a $10M solar project: 70% ITC = $7M in federal tax credits. Sold at 92 cents: $6.44M cash.
                  </p>
                </div>
              </section>

              {/* Section 5 */}
              <section id="monetization">
                <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-4">
                  Section 5: Monetization Options
                </h2>
                <p className="mb-6">
                  Project developers often lack sufficient tax liability to utilize IRA credits directly. The IRA provides three primary pathways to convert credits into economic value.
                </p>

                <h3 className="font-sora text-xl font-semibold text-deep-900 dark:text-deep-100 mb-3">
                  Tax Equity (Traditional)
                </h3>
                <p className="mb-4">
                  Tax equity is the original mechanism for monetizing renewable energy credits. A tax equity investor — typically a large bank or insurance company — invests capital in exchange for the project&apos;s tax benefits. The two most common structures are:
                </p>
                <ul className="space-y-2 mb-6 ml-4">
                  <li className="text-[14px]"><strong className="text-deep-900 dark:text-deep-100">Partnership flip:</strong> Developer and investor form a partnership. The investor receives 99% of tax benefits until reaching a target yield, then the developer buys out the investor&apos;s interest. Most common for solar and wind.</li>
                  <li className="text-[14px]"><strong className="text-deep-900 dark:text-deep-100">Sale-leaseback:</strong> Developer sells the project to an investor, then leases it back. Simpler structure but more expensive. Used when developers need clean balance sheets.</li>
                </ul>
                <p className="mb-6 text-[13px] text-deep-500 dark:text-sage-500">
                  Tax equity is capital-intensive and requires sophisticated legal structures. Transaction costs run $200,000–$500,000 and minimum deal sizes are typically $5M+ in credits.
                </p>

                <h3 className="font-sora text-xl font-semibold text-deep-900 dark:text-deep-100 mb-3">
                  Transferability — Section 6418
                </h3>
                <p className="mb-4">
                  Introduced by the IRA and active since January 1, 2023, transferability allows project developers to sell eligible IRA credits directly to third-party buyers for cash. No complex partnership structure is required.
                </p>
                <p className="mb-4">
                  Credits trade in the secondary market at <strong>88–96 cents per dollar</strong> of credit value, depending on credit type, deal size, counterparty risk, and market conditions. The seller (developer) registers the transfer with the IRS before the tax year deadline. The buyer claims the credit on their tax return.
                </p>
                <p className="mb-6">
                  Eligible credits for transfer include ITC (48/48E), PTC (45/45Y), 45Q, 45V, 45X advanced manufacturing credit, 48C, and 45U nuclear production credit. Section 45L and 179D are not transferable.
                </p>

                <h3 className="font-sora text-xl font-semibold text-deep-900 dark:text-deep-100 mb-3">
                  Direct Pay — Section 6417
                </h3>
                <p className="mb-4">
                  Direct pay (also called &quot;elective payment&quot;) allows eligible tax-exempt entities to receive a direct cash payment from the IRS equal to the credit value — effectively a refund for a credit they cannot otherwise use. Eligible entities include:
                </p>
                <ul className="space-y-1.5 mb-4 ml-4">
                  {['State and local governments', 'Tribal governments', 'Rural electric cooperatives', 'Nonprofit organizations', 'Tennessee Valley Authority', 'Alaska Native corporations'].map((entity) => (
                    <li key={entity} className="flex items-center gap-2 text-[14px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0" />
                      {entity}
                    </li>
                  ))}
                </ul>
                <p className="mb-6">
                  Additionally, for the first five years, any entity (including for-profit corporations) can elect direct pay for credits 45Q, 45V, 45X, and 48C. This &quot;broad direct pay&quot; provision is particularly valuable for technology companies and corporates with clean hydrogen and CCUS projects.
                </p>

                <div className="overflow-x-auto rounded-xl border border-deep-100 dark:border-deep-800">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="bg-deep-50 dark:bg-deep-800/50 border-b border-deep-100 dark:border-deep-700">
                        <th className="text-left px-4 py-3 font-semibold text-deep-700 dark:text-deep-300">Factor</th>
                        <th className="text-left px-4 py-3 font-semibold text-deep-700 dark:text-deep-300">Tax Equity</th>
                        <th className="text-left px-4 py-3 font-semibold text-deep-700 dark:text-deep-300">Transferability</th>
                        <th className="text-left px-4 py-3 font-semibold text-deep-700 dark:text-deep-300">Direct Pay</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-deep-100 dark:divide-deep-800">
                      {[
                        { factor: 'Who can use', equity: 'Any developer', transfer: 'Any developer', directPay: 'Tax-exempt entities only (+ 5-yr broad)' },
                        { factor: 'Cash timing', equity: 'Upfront capital injection', transfer: 'Pre-close or post-filing', directPay: 'Annual tax filing refund' },
                        { factor: 'Effective rate', equity: '80–90¢/$ (net of costs)', transfer: '88–96¢/$', directPay: '100¢/$ (face value)' },
                        { factor: 'Complexity', equity: 'High — legal, structure', transfer: 'Low — IRS registration', directPay: 'Low — tax return election' },
                        { factor: 'Min deal size', equity: '$5M+ credits', transfer: '$500K+ credits', directPay: 'No minimum' },
                      ].map((row) => (
                        <tr key={row.factor} className="hover:bg-deep-50/50 dark:hover:bg-deep-800/30">
                          <td className="px-4 py-3 font-medium text-deep-900 dark:text-deep-100">{row.factor}</td>
                          <td className="px-4 py-3 text-deep-600 dark:text-sage-400">{row.equity}</td>
                          <td className="px-4 py-3 text-deep-600 dark:text-sage-400">{row.transfer}</td>
                          <td className="px-4 py-3 text-deep-600 dark:text-sage-400">{row.directPay}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Section 6 */}
              <section id="state-stacking">
                <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-4">
                  Section 6: State + Local Stacking
                </h2>
                <p className="mb-4">
                  Federal IRA credits represent only part of the available incentive stack. Sophisticated developers layer multiple state, local, and utility programs on top of federal credits. The combination can significantly reduce net project cost and improve equity returns.
                </p>
                <p className="mb-6">
                  Key state and local programs that commonly stack with IRA federal credits:
                </p>

                <div className="space-y-5 mb-6">
                  <div className="rounded-lg border border-deep-100 dark:border-deep-800 p-5">
                    <h4 className="font-semibold text-deep-900 dark:text-deep-100 mb-2">PACE Financing</h4>
                    <p className="text-[13px] text-deep-600 dark:text-sage-400">
                      Property Assessed Clean Energy (PACE) financing allows property owners to finance energy improvements through a special assessment on their property tax bill. PACE does not affect the ITC eligible basis calculation, making it an additive capital stack element — the project gets ITC on the full project cost, while PACE covers a portion of the upfront financing at favorable long-term rates. Available in 38 states for commercial projects.
                    </p>
                  </div>

                  <div className="rounded-lg border border-deep-100 dark:border-deep-800 p-5">
                    <h4 className="font-semibold text-deep-900 dark:text-deep-100 mb-2">NY Green Bank / State Green Banks</h4>
                    <p className="text-[13px] text-deep-600 dark:text-sage-400">
                      State green banks provide below-market financing for clean energy projects that complement federal credits. The NY Green Bank has deployed over $2B in financing alongside federal IRA credits. Programs like NYSERDA&apos;s NY-Sun provide additional incentives for solar that stack directly with ITC.
                    </p>
                  </div>

                  <div className="rounded-lg border border-deep-100 dark:border-deep-800 p-5">
                    <h4 className="font-semibold text-deep-900 dark:text-deep-100 mb-2">USDA Rural Energy for America Program (REAP)</h4>
                    <p className="text-[13px] text-deep-600 dark:text-sage-400">
                      REAP provides grants and guaranteed loans for agricultural producers and rural small businesses. IRA increased REAP funding significantly. REAP grants stack with ITC, but the grant amount reduces ITC eligible basis — so a $100K REAP grant on a $1M project reduces ITC basis to $900K. Net effect is still positive.
                    </p>
                  </div>

                  <div className="rounded-lg border border-deep-100 dark:border-deep-800 p-5">
                    <h4 className="font-semibold text-deep-900 dark:text-deep-100 mb-2">Utility Rebate Programs</h4>
                    <p className="text-[13px] text-deep-600 dark:text-sage-400">
                      Major utilities offer rebate programs for distributed solar, battery storage, EV charging, and efficiency upgrades. Like grants, utility rebates typically reduce ITC eligible basis. However, on a net basis, the combination almost always exceeds either program alone.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-deep-50/50 dark:bg-deep-900/30 border border-deep-100 dark:border-deep-800 p-6">
                  <h4 className="font-sora font-bold text-deep-900 dark:text-deep-100 mb-4">New York Project: Full Incentive Stack Example</h4>
                  <p className="text-[13px] text-deep-600 dark:text-sage-400 mb-4">
                    A 2 MW community solar project in Albany, NY (energy community census tract):
                  </p>
                  <div className="font-mono text-[13px] space-y-2 text-deep-700 dark:text-sage-300">
                    <div className="flex justify-between"><span>Project cost</span><span>$4,200,000</span></div>
                    <div className="flex justify-between text-teal-600 dark:text-teal-400"><span>ITC (40% — base + energy community)</span><span>+$1,680,000</span></div>
                    <div className="flex justify-between text-teal-600 dark:text-teal-400"><span>NY-Sun incentive (NYSERDA)</span><span>+$210,000</span></div>
                    <div className="flex justify-between text-teal-600 dark:text-teal-400"><span>Con Ed interconnection rebate</span><span>+$42,000</span></div>
                    <div className="flex justify-between text-teal-600 dark:text-teal-400"><span>PACE financing (replaces equity)</span><span>+$800,000</span></div>
                    <div className="border-t border-deep-200 dark:border-deep-700 pt-2 flex justify-between font-bold text-deep-900 dark:text-white">
                      <span>Net developer equity required</span>
                      <span>$1,468,000 (35% of project)</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 7 */}
              <section id="compliance">
                <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-4">
                  Section 7: Compliance & Documentation
                </h2>
                <p className="mb-4">
                  Claiming IRA credits requires systematic documentation and compliance with Treasury regulations. Inadequate records expose developers to credit disallowance, penalties, and recapture risk.
                </p>

                <h3 className="font-sora text-lg font-semibold text-deep-900 dark:text-deep-100 mb-3">
                  Prevailing Wage Certification
                </h3>
                <p className="mb-4">
                  For projects over 1 MW, prevailing wage requirements must be tracked and documented throughout construction. Requirements include: certified payroll records from all contractors and subcontractors, wage determination look-up by county and occupation, and maintenance of records for a minimum of 3 years post-credit claim. Failure to pay prevailing wages reduces the ITC to 6% (not 30%) and triggers monetary penalties.
                </p>

                <h3 className="font-sora text-lg font-semibold text-deep-900 dark:text-deep-100 mb-3">
                  Domestic Content Tracking
                </h3>
                <p className="mb-4">
                  To claim the 10% domestic content bonus, developers must document the manufactured cost of each major component and its country of manufacture. Manufacturers may provide certifications following Treasury safe harbor guidance. Records must be retained for the statute of limitations period — typically 3 years after the credit tax year.
                </p>

                <h3 className="font-sora text-lg font-semibold text-deep-900 dark:text-deep-100 mb-3">
                  Record-Keeping Requirements
                </h3>
                <ul className="space-y-2 mb-4 ml-4">
                  {[
                    'Retain all construction contracts, invoices, and certified payroll records for 5+ years',
                    'Maintain equipment certifications, manufacturer documentation, and domestic content records',
                    'Document energy community status with IRS map screenshots and census tract data at time of project commencement',
                    'For 45L: obtain third-party energy rater certifications before credits are claimed',
                    'For 179D: commission qualified computer software energy analysis and third-party certification',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[14px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0 mt-2" />
                      {item}
                    </li>
                  ))}
                </ul>

                <h3 className="font-sora text-lg font-semibold text-deep-900 dark:text-deep-100 mb-3">
                  Key Tax Forms
                </h3>
                <p className="mb-2">
                  IRA credits are generally claimed using the following IRS forms:
                </p>
                <ul className="space-y-1.5 ml-4 text-[14px]">
                  <li><strong className="text-deep-900 dark:text-deep-100">Form 3800:</strong> General Business Credit — aggregates all business tax credits</li>
                  <li><strong className="text-deep-900 dark:text-deep-100">Form 8835:</strong> Renewable Electricity Production Credit (PTC)</li>
                  <li><strong className="text-deep-900 dark:text-deep-100">Form 3468:</strong> Investment Credit (ITC)</li>
                  <li><strong className="text-deep-900 dark:text-deep-100">Form 8908:</strong> Energy Efficient Home Credit (45L)</li>
                  <li><strong className="text-deep-900 dark:text-deep-100">Form 7207:</strong> Advanced Manufacturing Production Credit (45X)</li>
                </ul>
              </section>

              {/* Section 8 */}
              <section id="incentedge">
                <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-4">
                  Section 8: How IncentEdge Automates This
                </h2>
                <p className="mb-4">
                  Manually researching, tracking, and stacking IRA credits across 217,000+ programs is a 200+ hour task per project. IncentEdge automates the entire workflow in under 60 seconds.
                </p>
                <ul className="space-y-4 mb-6">
                  {[
                    { step: '1', title: '60-Second Project Scan', desc: 'Enter your project location, type, size, and technology. IncentEdge scans all applicable federal, state, local, and utility programs instantly.' },
                    { step: '2', title: 'Auto-Generated Incentive Stack Report', desc: 'Receive a prioritized report showing all matched programs, estimated values, eligibility criteria, and documentation requirements — formatted for your finance team or lender.' },
                    { step: '3', title: 'API Access for Developers', desc: 'Embed IncentEdge incentive data directly into your project finance models, development pipeline tools, or customer-facing applications via REST API.' },
                  ].map((item) => (
                    <li key={item.step} className="flex gap-4">
                      <span className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold font-mono text-[13px] flex-shrink-0">
                        {item.step}
                      </span>
                      <div>
                        <p className="font-semibold text-deep-900 dark:text-deep-100 mb-1">{item.title}</p>
                        <p className="text-[14px] text-deep-600 dark:text-sage-400">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/10 dark:to-emerald-900/10 border border-teal-100 dark:border-teal-800 p-8 text-center">
                  <h3 className="font-sora text-xl font-bold text-deep-900 dark:text-deep-100 mb-2">
                    Get your free incentive scan
                  </h3>
                  <p className="text-deep-600 dark:text-sage-400 mb-6 max-w-md mx-auto text-[14px]">
                    See every program your project qualifies for in 60 seconds. Free to start, no credit card required.
                  </p>
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[14px] font-semibold transition-colors"
                  >
                    Scan your project free
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </section>

              {/* Section 9: FAQ */}
              <section id="faq">
                <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-6">
                  Section 9: Frequently Asked Questions
                </h2>
                <div className="space-y-5">
                  {faqSchema.mainEntity.map((faq, i) => (
                    <div key={i} className="rounded-lg border border-deep-100 dark:border-deep-800 p-5">
                      <h3 className="font-sora font-semibold text-deep-900 dark:text-deep-100 mb-2 text-[15px]">
                        {faq.name}
                      </h3>
                      <p className="text-[14px] text-deep-600 dark:text-sage-400 leading-relaxed">
                        {faq.acceptedAnswer.text}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Related Articles */}
              <section className="pt-8 border-t border-deep-100 dark:border-deep-800">
                <h2 className="font-sora text-xl font-bold text-deep-900 dark:text-deep-100 mb-5">
                  Related Articles
                </h2>
                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    { title: 'IRA Bonus Adders: Stacking Up to 70% ITC', href: '/blog/ira-bonus-adders-explained' },
                    { title: 'Tax Equity vs. Transferability: Complete Comparison', href: '/blog/tax-equity-vs-transferability' },
                    { title: 'Section 45L Guide: New Energy Efficient Home Credit', href: '/blog/section-45l-guide' },
                  ].map((article) => (
                    <Link
                      key={article.href}
                      href={article.href}
                      className="block p-4 rounded-lg border border-deep-100 dark:border-deep-800 hover:border-teal-200 dark:hover:border-teal-700 transition-colors group"
                    >
                      <p className="text-[13px] font-medium text-deep-900 dark:text-deep-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors leading-snug">
                        {article.title}
                      </p>
                      <span className="inline-flex items-center gap-1 text-[12px] text-teal-600 dark:text-teal-400 mt-2">
                        Read <ArrowRight className="w-3 h-3" />
                      </span>
                    </Link>
                  ))}
                </div>
              </section>

            </div>
          </article>
        </div>
      </div>
    </PublicPageShell>
  );
}
