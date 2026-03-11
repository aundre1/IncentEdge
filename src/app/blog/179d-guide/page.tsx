import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Section 179D Commercial Building Energy Deduction: Complete 2026 Guide',
  description:
    'Section 179D offers up to $5.00/sq ft for energy-efficient commercial buildings. IRA expanded eligibility to nonprofits, governments, and tribal entities. Learn how to claim it.',
  alternates: { canonical: 'https://incentedge.com/blog/179d-guide' },
  openGraph: {
    title: 'Section 179D Commercial Building Energy Deduction: Complete 2026 Guide',
    description: 'Section 179D offers up to $5.00/sq ft for energy-efficient commercial buildings. IRA expanded eligibility to nonprofits, governments, and tribal entities.',
    url: 'https://incentedge.com/blog/179d-guide',
    type: 'article',
  },
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Section 179D: The Energy Efficient Commercial Building Deduction',
  description: 'Section 179D offers up to $5.00/sq ft for energy-efficient commercial buildings.',
  datePublished: '2026-03-01',
  dateModified: '2026-03-01',
  author: { '@type': 'Organization', name: 'IncentEdge Research Team', url: 'https://incentedge.com' },
  publisher: { '@type': 'Organization', name: 'IncentEdge', url: 'https://incentedge.com' },
  mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://incentedge.com/blog/179d-guide' },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is the maximum Section 179D deduction per square foot?',
      acceptedAnswer: { '@type': 'Answer', text: 'The maximum 179D deduction is $5.00 per square foot for buildings placed in service after December 31, 2022, that satisfy prevailing wage requirements. Without prevailing wage, the maximum is $1.00 per square foot. The actual deduction ranges from $0.50 to $5.00/sq ft depending on the percentage of energy reduction achieved versus the ASHRAE 90.1-2007 baseline, subject to inflation adjustments.' },
    },
    {
      '@type': 'Question',
      name: 'Who can claim the 179D deduction for government and nonprofit buildings?',
      acceptedAnswer: { '@type': 'Answer', text: 'Prior to the IRA, only taxable building owners could claim 179D. The IRA created a new pathway: for energy-efficient improvements to buildings owned by tax-exempt organizations, government entities, or Indian tribal governments, the deduction can be allocated to the architect, engineer, or contractor who designed the energy-efficient features. The allocation is made through a written agreement between the building owner and the designer, signed before the deduction is claimed.' },
    },
    {
      '@type': 'Question',
      name: 'What buildings qualify for Section 179D?',
      acceptedAnswer: { '@type': 'Answer', text: 'Section 179D applies to commercial buildings (commercial, industrial, retail) and residential rental buildings of 4+ stories. It also applies to government-owned buildings (federal, state, local) and buildings owned by Indian tribal governments and tax-exempt organizations — with the deduction allocated to the building\'s designer for these entities. Single-family homes and low-rise multifamily buildings are not eligible (see Section 45L instead).' },
    },
    {
      '@type': 'Question',
      name: 'What energy efficiency improvements qualify?',
      acceptedAnswer: { '@type': 'Answer', text: 'Three building systems are eligible for partial deductions: (1) Interior lighting systems (up to $0.50-$5.00/sq ft for the lighting portion alone if it meets 25% energy reduction vs. ASHRAE 2007 baseline); (2) HVAC and hot water systems (up to $0.50-$5.00/sq ft for the HVAC portion); (3) Building envelope (up to $0.50-$5.00/sq ft for the envelope portion). The full deduction applies when all three systems together achieve the required percentage energy reduction vs. the baseline.' },
    },
    {
      '@type': 'Question',
      name: 'How is the 179D deduction certified?',
      acceptedAnswer: { '@type': 'Answer', text: 'The energy efficiency must be certified by a qualified individual: an independent licensed engineer or contractor (not the same entity claiming the deduction) who uses IRS-approved energy modeling software to demonstrate the energy savings versus the ASHRAE 90.1-2007 reference building. The certification report, along with all supporting calculations and the software output, must be retained by the taxpayer. The IRS does not require pre-approval but will request this documentation in an audit.' },
    },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://incentedge.com' },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://incentedge.com/blog' },
    { '@type': 'ListItem', position: 3, name: '179D Guide', item: 'https://incentedge.com/blog/179d-guide' },
  ],
};

const RELATED_POSTS = [
  { slug: 'section-45l-guide', title: 'Section 45L: The Complete Guide to the Energy Efficient Home Credit' },
  { slug: 'ira-bonus-adders-explained', title: 'IRA Bonus Adders: How to Stack Credits From 30% to 70%' },
  { slug: 'prevailing-wage-apprenticeship-requirements', title: 'IRA Prevailing Wage & Apprenticeship Requirements: Complete Guide' },
];

export default function Section179DGuidePage() {
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
            <span className="text-deep-900 dark:text-deep-100">179D Guide</span>
          </nav>

          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-medium bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300">Developer Resources</span>
            <span className="text-[13px] text-deep-500 dark:text-sage-500">IncentEdge Research Team</span>
            <span className="text-deep-300 dark:text-deep-700">·</span>
            <span className="text-[13px] text-deep-500 dark:text-sage-500">March 1, 2026</span>
            <span className="text-deep-300 dark:text-deep-700">·</span>
            <span className="text-[13px] text-deep-500 dark:text-sage-500">Last Updated: March 1, 2026</span>
          </div>

          <h1 className="font-sora text-3xl md:text-4xl font-bold text-deep-900 dark:text-white mb-6 leading-tight">
            Section 179D: The Energy Efficient Commercial Building Deduction
          </h1>

          <p className="text-lg text-deep-600 dark:text-sage-400 mb-10 leading-relaxed border-l-4 border-teal-400 pl-4">
            Section 179D rewards building owners and designers who build or retrofit commercial buildings to high energy efficiency standards. The IRA tripled the maximum deduction and opened it up to architects, engineers, and contractors designing buildings for governments, nonprofits, and tribal nations — a group previously excluded from the program.
          </p>

          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-4">Overview and IRA Changes</h2>
          <p className="text-deep-700 dark:text-sage-300 mb-4 leading-relaxed">
            Before the IRA, Section 179D provided a maximum deduction of $1.80 per square foot for commercial buildings achieving at least 50% energy reduction versus ASHRAE 90.1-2007. The IRA made sweeping changes effective January 1, 2023:
          </p>
          <ul className="list-disc list-inside space-y-2 text-deep-700 dark:text-sage-300 mb-6 ml-2">
            <li><strong className="text-deep-900 dark:text-deep-100">Maximum deduction increased to $5.00/sq ft</strong> for buildings satisfying prevailing wage requirements</li>
            <li><strong className="text-deep-900 dark:text-deep-100">Base deduction is $1.00/sq ft</strong> without prevailing wage (versus $1.80 previously)</li>
            <li><strong className="text-deep-900 dark:text-deep-100">Expanded the "designer" rule</strong> to allow the deduction to be allocated to architects, engineers, and contractors for buildings owned by any tax-exempt entity (not just government)</li>
            <li><strong className="text-deep-900 dark:text-deep-100">Revised energy baseline</strong> from ASHRAE 90.1-2007 to the most recent ASHRAE 90.1 standard in effect 2 years before construction begins (for projects beginning after 2022)</li>
            <li>Deduction is now available annually (not just once per building) for improvements</li>
          </ul>

          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-4">Deduction Rates: $0.50 to $5.00 Per Square Foot</h2>
          <p className="text-deep-700 dark:text-sage-300 mb-4 leading-relaxed">
            The deduction is calculated on a sliding scale based on the percentage of energy reduction achieved compared to the ASHRAE baseline:
          </p>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-[14px] border border-deep-200 dark:border-deep-700 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-deep-50 dark:bg-deep-800">
                  <th className="text-left px-4 py-3 font-semibold text-deep-900 dark:text-deep-100 border-b border-deep-200 dark:border-deep-700">Energy Reduction</th>
                  <th className="text-left px-4 py-3 font-semibold text-deep-600 dark:text-sage-400 border-b border-deep-200 dark:border-deep-700">Without PWA</th>
                  <th className="text-left px-4 py-3 font-semibold text-teal-700 dark:text-teal-300 border-b border-deep-200 dark:border-deep-700">With PWA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-deep-100 dark:divide-deep-800">
                {[
                  ['25% (minimum threshold)', '$0.50/sq ft', '$2.50/sq ft'],
                  ['30%', '$0.60/sq ft', '$3.00/sq ft'],
                  ['40%', '$0.80/sq ft', '$4.00/sq ft'],
                  ['50%+ (maximum)', '$1.00/sq ft', '$5.00/sq ft'],
                ].map(([reduction, base, pwa]) => (
                  <tr key={reduction} className="hover:bg-deep-50/50 dark:hover:bg-deep-900/50">
                    <td className="px-4 py-3 font-medium text-deep-900 dark:text-deep-100">{reduction}</td>
                    <td className="px-4 py-3 text-deep-600 dark:text-sage-400">{base}</td>
                    <td className="px-4 py-3 text-teal-700 dark:text-teal-300 font-medium">{pwa}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-deep-700 dark:text-sage-300 mb-6 leading-relaxed text-[14px]">
            Note: Rates are subject to annual inflation adjustments. The $5.00/sq ft rate assumes projects meeting prevailing wage requirements. Rates shown are approximate 2026 values before inflation adjustment.
          </p>

          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-4">Eligible Buildings</h2>
          <p className="text-deep-700 dark:text-sage-300 mb-4 leading-relaxed">
            Section 179D applies to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-deep-700 dark:text-sage-300 mb-6 ml-2">
            <li>Commercial buildings (office, retail, industrial, warehouse, hotel, hospital)</li>
            <li>Residential rental buildings of 4 or more stories</li>
            <li>Government-owned buildings (federal, state, local, territory)</li>
            <li>Buildings owned by tax-exempt organizations (nonprofits, hospitals, universities, churches)</li>
            <li>Buildings owned by Indian tribal governments</li>
          </ul>

          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-4">Who Can Claim It: The Designer Allocation Rule</h2>
          <p className="text-deep-700 dark:text-sage-300 mb-4 leading-relaxed">
            For commercial buildings owned by taxable entities (private owners), the building owner claims the 179D deduction directly.
          </p>
          <p className="text-deep-700 dark:text-sage-300 mb-4 leading-relaxed">
            For buildings owned by tax-exempt entities (nonprofits, governments, tribal nations), the IRA allows the building owner to allocate the deduction to the architect, engineer, contractor, or energy services company that designed the energy-efficient features. This creates a powerful incentive structure: the designer can monetize the deduction in exchange for providing better energy performance, often sharing the benefit with the building owner through reduced design fees or energy performance guarantees.
          </p>
          <div className="p-4 rounded-lg bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 mb-6">
            <p className="text-[14px] font-medium text-teal-800 dark:text-teal-300">
              Key requirement: The designer allocation must be made through a written statement signed by the owner of the building (or an authorized representative) before the deduction is claimed. The statement must identify the building, the tax year, and the portion of the deduction allocated.
            </p>
          </div>

          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-4">Partial Deduction: Three Qualifying Systems</h2>
          <p className="text-deep-700 dark:text-sage-300 mb-4 leading-relaxed">
            If a building cannot achieve the 25% whole-building energy reduction required for the full deduction, partial deductions are available for each of three systems independently:
          </p>
          <div className="space-y-3 mb-8">
            {[
              { system: 'Interior Lighting', requirement: '25% reduction in lighting power density vs. ASHRAE 90.1-2007', note: 'This is the most commonly achieved partial deduction — LED upgrades often qualify' },
              { system: 'HVAC and Hot Water Systems', requirement: 'Meet applicable ASHRAE 90.1-2007 HVAC efficiency requirements', note: 'Requires detailed energy modeling; HVAC improvements alone may not meet the 25% threshold' },
              { system: 'Building Envelope', requirement: 'Meet applicable ASHRAE 90.1-2007 envelope requirements', note: 'Insulation, windows, and roof improvements; hardest to achieve independently' },
            ].map(({ system, requirement, note }) => (
              <div key={system} className="p-4 rounded-lg border border-deep-100 dark:border-deep-800">
                <p className="font-semibold text-deep-900 dark:text-deep-100 mb-1">{system}</p>
                <p className="text-[13px] text-deep-700 dark:text-sage-300 mb-1">{requirement}</p>
                <p className="text-[12px] text-deep-500 dark:text-sage-500 italic">{note}</p>
              </div>
            ))}
          </div>

          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-4">Example: 50,000 Sq Ft Office Building</h2>
          <div className="p-5 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-900/20 mb-8">
            <p className="font-semibold text-deep-900 dark:text-deep-100 mb-3">Scenario: Class A office building, new construction, ASHRAE 50% energy reduction, prevailing wage compliant</p>
            <div className="space-y-2 text-[14px] text-deep-700 dark:text-sage-300">
              <div className="flex justify-between"><span>Building size</span><span className="font-mono">50,000 sq ft</span></div>
              <div className="flex justify-between"><span>Energy reduction achieved</span><span className="font-mono">50%+</span></div>
              <div className="flex justify-between"><span>179D deduction rate (with PWA)</span><span className="font-mono">$5.00/sq ft</span></div>
              <div className="flex justify-between pt-2 border-t border-teal-200 dark:border-teal-700 font-bold text-deep-900 dark:text-deep-100"><span>Total 179D Deduction</span><span className="font-mono text-teal-700 dark:text-teal-300">$250,000</span></div>
            </div>
            <p className="text-[13px] text-deep-600 dark:text-sage-400 mt-3">
              At a 35% marginal tax rate, this $250,000 deduction translates to approximately $87,500 in direct tax savings. For a government building, the architect or engineer who designed the energy systems can claim this deduction directly through the allocation mechanism.
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
              IncentEdge calculates your 179D deduction value, identifies the optimal energy reduction pathway, and generates the documentation checklist for certification.
            </p>
            <Link href="/signup" className="inline-flex items-center gap-2 px-7 py-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[14px] font-semibold transition-colors">
              Calculate Your 179D Deduction <ArrowRight className="w-4 h-4" />
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
