import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Section 45L New Energy Efficient Home Credit: 2026 Complete Guide',
  description:
    'Section 45L offers up to $5,000 per dwelling unit for energy-efficient new construction. Learn who qualifies, credit rates, certification requirements, and how IRA expanded the program.',
  alternates: { canonical: 'https://incentedge.com/blog/section-45l-guide' },
  openGraph: {
    title: 'Section 45L New Energy Efficient Home Credit: 2026 Complete Guide',
    description: 'Section 45L offers up to $5,000 per dwelling unit for energy-efficient new construction. Learn eligibility, credit rates, and certification requirements.',
    url: 'https://incentedge.com/blog/section-45l-guide',
    type: 'article',
  },
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Section 45L: The Complete Guide to the Energy Efficient Home Credit',
  description: 'Section 45L offers up to $5,000 per dwelling unit for energy-efficient new construction.',
  datePublished: '2026-03-01',
  dateModified: '2026-03-01',
  author: { '@type': 'Organization', name: 'IncentEdge Research Team', url: 'https://incentedge.com' },
  publisher: { '@type': 'Organization', name: 'IncentEdge', url: 'https://incentedge.com' },
  mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://incentedge.com/blog/section-45l-guide' },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Who can claim the Section 45L credit?',
      acceptedAnswer: { '@type': 'Answer', text: 'Section 45L is claimed by the "eligible contractor" — the person who constructs the dwelling unit and owns it for sale or lease. This is typically the developer or builder, not the homebuyer or tenant. For rental properties, the landlord/developer who builds and rents out the units can claim the credit in the tax year the unit is first sold or leased.' },
    },
    {
      '@type': 'Question',
      name: 'What are the 45L credit amounts for 2026?',
      acceptedAnswer: { '@type': 'Answer', text: 'For single-family homes: $2,500 per unit for homes meeting ENERGY STAR Single Family New Homes standard; $5,000 per unit for homes meeting the DOE Zero Energy Ready Home standard. For multifamily buildings (3+ stories): $500 per unit for ENERGY STAR Multifamily New Construction standard; $1,000 per unit for DOE Zero Energy Ready Home standard. If the multifamily project also satisfies prevailing wage requirements, the per-unit rates increase to $2,500 and $5,000 respectively.' },
    },
    {
      '@type': 'Question',
      name: 'What certification is required for Section 45L?',
      acceptedAnswer: { '@type': 'Answer', text: 'The dwelling unit must be certified by a qualified certifier as meeting the applicable energy efficiency standard: (1) For ENERGY STAR certification: a RESNET-certified rater or ENERGY STAR verifier conducts a field verification and HERS rating of the home; (2) For Zero Energy Ready Home certification: a RESNET-certified rater certifies the home meets the DOE ZERH program requirements. The certifier provides a certificate that the taxpayer retains to support the credit claim.' },
    },
    {
      '@type': 'Question',
      name: 'Can a multifamily developer claim both 45L and other IRA credits?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. A multifamily developer can claim 45L per dwelling unit AND stack the ITC for solar panels on the building (if separately installed and allocated to the building owner). For mixed-use buildings with commercial space, the 179D energy efficient commercial building deduction may apply to the commercial portion. The credits do not offset each other as they apply to different aspects of the project.' },
    },
    {
      '@type': 'Question',
      name: 'When is the Section 45L credit claimed?',
      acceptedAnswer: { '@type': 'Answer', text: 'The credit is claimed in the tax year the qualifying dwelling unit is first sold or leased to a person for use as a residence. The credit is reported on Form 8908 (Energy Efficient Home Credit) and flows through Form 3800 (General Business Credit). The $2,500 ENERGY STAR and $5,000 ZERH rates apply to homes where construction begins after December 31, 2022.' },
    },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://incentedge.com' },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://incentedge.com/blog' },
    { '@type': 'ListItem', position: 3, name: 'Section 45L Guide', item: 'https://incentedge.com/blog/section-45l-guide' },
  ],
};

const RELATED_POSTS = [
  { slug: '179d-guide', title: 'Section 179D: The Energy Efficient Commercial Building Deduction' },
  { slug: 'ira-bonus-adders-explained', title: 'IRA Bonus Adders: How to Stack Credits From 30% to 70%' },
  { slug: 'ira-incentive-due-diligence', title: 'IRA Incentive Due Diligence: Your 48-Hour Framework' },
];

export default function Section45LGuidePage() {
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
            <span className="text-deep-900 dark:text-deep-100">Section 45L Guide</span>
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
            Section 45L: The Complete Guide to the Energy Efficient Home Credit
          </h1>

          <p className="text-lg text-deep-600 dark:text-sage-400 mb-10 leading-relaxed border-l-4 border-teal-400 pl-4">
            The IRA dramatically expanded Section 45L, raising the credit from $2,000 to up to $5,000 per dwelling unit and extending it through 2032. For residential developers and homebuilders, 45L is now one of the most straightforward federal credits available — no complex partnership structure required.
          </p>

          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-4">What Is Section 45L?</h2>
          <p className="text-deep-700 dark:text-sage-300 mb-4 leading-relaxed">
            Section 45L of the Internal Revenue Code provides a tax credit to contractors who build energy-efficient residential dwelling units. Originally enacted in 2005, the IRA substantially revamped the program starting January 1, 2023: credit amounts more than doubled, the certification standards were updated to align with current ENERGY STAR and DOE Zero Energy Ready programs, and the program was extended through 2032.
          </p>
          <p className="text-deep-700 dark:text-sage-300 mb-6 leading-relaxed">
            Unlike most clean energy credits, 45L is specifically designed for residential construction — single-family homes, multifamily buildings, condominiums, and manufactured homes. The credit is claimed by the developer/builder, not by the homebuyer.
          </p>

          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-4">Credit Amounts by Dwelling Type</h2>
          <div className="overflow-x-auto mb-8">
            <table className="w-full text-[14px] border border-deep-200 dark:border-deep-700 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-deep-50 dark:bg-deep-800">
                  <th className="text-left px-4 py-3 font-semibold text-deep-900 dark:text-deep-100 border-b border-deep-200 dark:border-deep-700">Dwelling Type</th>
                  <th className="text-left px-4 py-3 font-semibold text-deep-600 dark:text-sage-400 border-b border-deep-200 dark:border-deep-700">ENERGY STAR</th>
                  <th className="text-left px-4 py-3 font-semibold text-teal-700 dark:text-teal-300 border-b border-deep-200 dark:border-deep-700">Zero Energy Ready</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-deep-100 dark:divide-deep-800">
                {[
                  ['Single-family / Manufactured home', '$2,500/unit', '$5,000/unit'],
                  ['Multifamily (3+ stories)', '$500/unit', '$1,000/unit'],
                  ['Multifamily + Prevailing Wage', '$2,500/unit', '$5,000/unit'],
                ].map(([type, es, zerh]) => (
                  <tr key={type} className="hover:bg-deep-50/50 dark:hover:bg-deep-900/50">
                    <td className="px-4 py-3 font-medium text-deep-900 dark:text-deep-100">{type}</td>
                    <td className="px-4 py-3 text-deep-600 dark:text-sage-400">{es}</td>
                    <td className="px-4 py-3 text-teal-700 dark:text-teal-300 font-medium">{zerh}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-4">Who Qualifies</h2>
          <p className="text-deep-700 dark:text-sage-300 mb-4 leading-relaxed">
            The credit is claimed by the <strong className="text-deep-900 dark:text-deep-100">eligible contractor</strong> — defined as any person who constructed the qualified new energy efficient home and owns it during construction for sale or lease. This includes:
          </p>
          <ul className="list-disc list-inside space-y-2 text-deep-700 dark:text-sage-300 mb-4 ml-2">
            <li>Production homebuilders (single-family subdivisions)</li>
            <li>Multifamily developers who build and rent apartments</li>
            <li>Condominium developers who build and sell units</li>
            <li>Manufactured housing manufacturers</li>
          </ul>
          <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 mb-6">
            <p className="text-[14px] font-medium text-amber-800 dark:text-amber-300">
              Important: The homebuyer or tenant cannot claim 45L. The credit belongs to whoever built and originally owned the dwelling unit. Custom home builders who build on a client's land and immediately transfer title must carefully analyze whether they meet the ownership requirement.
            </p>
          </div>

          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-4">Certification Requirements</h2>
          <p className="text-deep-700 dark:text-sage-300 mb-4 leading-relaxed">
            Each dwelling unit must be certified by a qualified third-party certifier. The certification process depends on which standard the unit is designed to meet:
          </p>
          <div className="space-y-4 mb-6">
            {[
              {
                title: 'ENERGY STAR Certification',
                items: [
                  'A RESNET-certified Home Energy Rater (HERS rater) or EPA-recognized verifier conducts field verification',
                  'The home must achieve the current ENERGY STAR Single Family New Homes specification (Version 3.2 or later as of 2026)',
                  'For multifamily: ENERGY STAR Multifamily New Construction program certification',
                  'The certifier issues a signed Certificate of Qualifying New Energy Efficient Home',
                ],
              },
              {
                title: 'DOE Zero Energy Ready Home Certification',
                items: [
                  'RESNET-certified rater certifies the home meets DOE ZERH program requirements',
                  'ZERH requires significantly higher performance than ENERGY STAR — typically a HERS Index 45 or below plus solar-ready infrastructure',
                  'The home must be ENERGY STAR certified as a prerequisite for ZERH',
                  'Certification documentation and HERS report must be retained by the taxpayer',
                ],
              },
            ].map(({ title, items }) => (
              <div key={title} className="p-5 rounded-xl border border-deep-100 dark:border-deep-800">
                <h3 className="font-semibold text-deep-900 dark:text-deep-100 mb-3">{title}</h3>
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[14px] text-deep-600 dark:text-sage-400">
                      <ChevronRight className="w-3.5 h-3.5 text-teal-500 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-4">How to Claim the Credit</h2>
          <p className="text-deep-700 dark:text-sage-300 mb-4 leading-relaxed">
            The Section 45L credit is reported on <strong className="text-deep-900 dark:text-deep-100">Form 8908</strong> (Energy Efficient Home Credit) and flows through Form 3800 (General Business Credit). The credit is claimed in the tax year the qualifying unit is first sold or leased to a person for use as a residence.
          </p>
          <p className="text-deep-700 dark:text-sage-300 mb-6 leading-relaxed">
            For large developers selling hundreds of units per year, the cumulative credit can be substantial. A builder selling 200 ZERH-certified single-family homes in a tax year would generate $1,000,000 in Section 45L credits ($5,000 × 200 units).
          </p>

          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-4">Real Example: 100-Unit Multifamily Development</h2>
          <div className="p-5 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-900/20 mb-8">
            <p className="font-semibold text-deep-900 dark:text-deep-100 mb-3">Scenario: 100-unit apartment building, ZERH-certified, prevailing wage compliant</p>
            <div className="space-y-2 text-[14px] text-deep-700 dark:text-sage-300">
              <div className="flex justify-between"><span>Units</span><span className="font-mono">100</span></div>
              <div className="flex justify-between"><span>45L credit rate (ZERH + PWA)</span><span className="font-mono">$5,000/unit</span></div>
              <div className="flex justify-between pt-2 border-t border-teal-200 dark:border-teal-700 font-bold text-deep-900 dark:text-deep-100"><span>Total 45L Credit</span><span className="font-mono text-teal-700 dark:text-teal-300">$500,000</span></div>
            </div>
            <p className="text-[13px] text-deep-600 dark:text-sage-400 mt-3">
              This $500,000 credit can be stacked with ITC for rooftop solar on the building, and with state-level housing tax credits if applicable — dramatically improving project returns.
            </p>
          </div>

          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-4">Stacking with Other Credits</h2>
          <p className="text-deep-700 dark:text-sage-300 mb-6 leading-relaxed">
            Section 45L stacks cleanly with several other federal credits:
          </p>
          <ul className="list-disc list-inside space-y-2 text-deep-700 dark:text-sage-300 mb-8 ml-2">
            <li><strong className="text-deep-900 dark:text-deep-100">ITC (§48):</strong> If the development includes a solar array allocated to the building owner (common in multifamily), the ITC applies to the solar installation cost independently of the 45L credit.</li>
            <li><strong className="text-deep-900 dark:text-deep-100">179D:</strong> For mixed-use buildings with commercial ground-floor space, the 179D deduction applies to the commercial portion's energy-efficient improvements, while 45L covers the residential units.</li>
            <li><strong className="text-deep-900 dark:text-deep-100">LIHTC (§42):</strong> Affordable housing developers can stack 45L with Low-Income Housing Tax Credits. The 45L credit does not reduce the eligible basis for LIHTC purposes.</li>
          </ul>

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
              IncentEdge calculates your full 45L credit value, identifies stacking opportunities with ITC and 179D, and generates a certification checklist tailored to your project.
            </p>
            <Link href="/signup" className="inline-flex items-center gap-2 px-7 py-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[14px] font-semibold transition-colors">
              Calculate Your 45L Credit <ArrowRight className="w-4 h-4" />
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
