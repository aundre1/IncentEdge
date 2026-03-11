import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'IRA Prevailing Wage & Apprenticeship Requirements: What You Need to Know in 2026',
  description:
    'Learn how IRA prevailing wage and apprenticeship requirements affect your tax credit rates. Compliance requirements, bonus credit rates, and safe harbor rules explained.',
  alternates: { canonical: 'https://incentedge.com/blog/prevailing-wage-apprenticeship-requirements' },
  openGraph: {
    title: 'IRA Prevailing Wage & Apprenticeship Requirements: What You Need to Know in 2026',
    description:
      'Learn how IRA prevailing wage and apprenticeship requirements affect your tax credit rates. Compliance, bonus credit rates, and safe harbor rules explained.',
    url: 'https://incentedge.com/blog/prevailing-wage-apprenticeship-requirements',
    type: 'article',
  },
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'IRA Prevailing Wage & Apprenticeship Requirements: Complete Guide',
  description: 'How IRA prevailing wage and apprenticeship requirements affect your tax credit rates.',
  datePublished: '2026-03-01',
  dateModified: '2026-03-01',
  author: { '@type': 'Organization', name: 'IncentEdge Research Team', url: 'https://incentedge.com' },
  publisher: { '@type': 'Organization', name: 'IncentEdge', url: 'https://incentedge.com' },
  mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://incentedge.com/blog/prevailing-wage-apprenticeship-requirements' },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is the 5x credit multiplier for IRA credits?',
      acceptedAnswer: { '@type': 'Answer', text: 'The IRA provides a "bonus" credit rate — typically 5x the base rate — for projects that satisfy prevailing wage and apprenticeship (PWA) requirements. For example, the base ITC rate is 6% and the bonus rate is 30%. For PTC, the base is 0.55¢/kWh and the bonus is 2.75¢/kWh. Projects under 1MW AC automatically receive the bonus rate without having to satisfy PWA requirements.' },
    },
    {
      '@type': 'Question',
      name: 'What are the Davis-Bacon prevailing wage rates?',
      acceptedAnswer: { '@type': 'Answer', text: 'Davis-Bacon prevailing wage rates are the minimum wages and fringe benefits that must be paid to workers on covered projects. Rates are set by the Department of Labor and vary by location (county), occupation (electrician, ironworker, laborer, etc.), and type of work (building, heavy, highway, residential). Current rates are published on the SAM.gov Wage Determinations database. Rates are updated periodically and the current rate at the time of construction must be paid.' },
    },
    {
      '@type': 'Question',
      name: 'What is the apprenticeship requirement percentage?',
      acceptedAnswer: { '@type': 'Answer', text: 'For projects where construction began after August 16, 2022, at least 15% of total labor hours for construction, alteration, and repair work must be performed by qualified apprentices from registered apprenticeship programs. This 15% threshold applies in aggregate across all contractors and subcontractors. The requirement took effect at 10% for work beginning in 2022, 12.5% for 2023, and reached the current 15% for work beginning in 2024 and beyond.' },
    },
    {
      '@type': 'Question',
      name: 'What are the penalties for prevailing wage non-compliance?',
      acceptedAnswer: { '@type': 'Answer', text: 'Non-compliance results in reduction to the base (1x) credit rate, not disallowance of the entire credit. However, the difference between the 5x bonus rate and the 1x base rate is substantial — for a 30% ITC, this means getting only 6% instead of 30%. The IRS allows correction within 180 days of notification by paying the wage shortfall to affected workers plus interest (3x the shortfall for intentional violations), after which the bonus rate applies retroactively.' },
    },
    {
      '@type': 'Question',
      name: 'Are there any safe harbors or exceptions from prevailing wage requirements?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. The most significant exception is the 1MW AC threshold: any qualifying facility with a maximum net output of less than 1 megawatt of electrical or thermal energy automatically satisfies the PWA requirements and receives the bonus credit rate without any certification. This covers most commercial rooftop solar, small wind, and community-scale projects. Additionally, projects that began construction before the IRS published prevailing wage guidance (January 30, 2023) have a temporary safe harbor.' },
    },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://incentedge.com' },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://incentedge.com/blog' },
    { '@type': 'ListItem', position: 3, name: 'Prevailing Wage & Apprenticeship', item: 'https://incentedge.com/blog/prevailing-wage-apprenticeship-requirements' },
  ],
};

const RELATED_POSTS = [
  { slug: 'ira-bonus-adders-explained', title: 'IRA Bonus Adders: How to Stack Credits From 30% to 70%' },
  { slug: 'ira-incentive-due-diligence', title: 'IRA Incentive Due Diligence: Your 48-Hour Framework' },
  { slug: 'itc-vs-ptc-comparison', title: 'ITC vs. PTC: Which Credit Maximizes Your Clean Energy Project\'s Value?' },
];

export default function PrevailingWagePage() {
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
            <span className="text-deep-900 dark:text-deep-100">Prevailing Wage & Apprenticeship</span>
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
            IRA Prevailing Wage & Apprenticeship Requirements: Complete Guide
          </h1>

          <p className="text-lg text-deep-600 dark:text-sage-400 mb-10 leading-relaxed border-l-4 border-teal-400 pl-4">
            Meeting IRA prevailing wage and apprenticeship requirements is the single highest-leverage compliance decision for most clean energy projects. Getting it right can mean the difference between a 6% ITC and a 30% ITC — a 5x multiplier on your credit value.
          </p>

          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-4">Why Prevailing Wage Matters: The 5x Multiplier</h2>
          <p className="text-deep-700 dark:text-sage-300 mb-4 leading-relaxed">
            The IRA structures most clean energy tax credits with two tiers:
          </p>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-[14px] border border-deep-200 dark:border-deep-700 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-deep-50 dark:bg-deep-800">
                  <th className="text-left px-4 py-3 font-semibold text-deep-900 dark:text-deep-100 border-b border-deep-200 dark:border-deep-700">Credit</th>
                  <th className="text-left px-4 py-3 font-semibold text-deep-600 dark:text-sage-400 border-b border-deep-200 dark:border-deep-700">Base Rate (No PWA)</th>
                  <th className="text-left px-4 py-3 font-semibold text-teal-700 dark:text-teal-300 border-b border-deep-200 dark:border-deep-700">Bonus Rate (With PWA)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-deep-100 dark:divide-deep-800">
                {[
                  ['ITC (§48)', '6% of eligible basis', '30% of eligible basis'],
                  ['PTC (§45)', '0.55¢/kWh', '2.75¢/kWh'],
                  ['45Q Carbon Capture', '$12/metric ton (utilization)', '$60/metric ton'],
                  ['45V Clean Hydrogen', '60¢/kg (base lifecycle score)', '$3.00/kg'],
                  ['48C Advanced Mfg.', '6% of eligible basis', '30% of eligible basis'],
                ].map(([credit, base, bonus]) => (
                  <tr key={credit} className="hover:bg-deep-50/50 dark:hover:bg-deep-900/50">
                    <td className="px-4 py-3 font-medium text-deep-900 dark:text-deep-100">{credit}</td>
                    <td className="px-4 py-3 text-deep-600 dark:text-sage-400">{base}</td>
                    <td className="px-4 py-3 text-teal-700 dark:text-teal-300 font-medium">{bonus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-4">What "Prevailing Wage" Means</h2>
          <p className="text-deep-700 dark:text-sage-300 mb-4 leading-relaxed">
            The IRA incorporates the Davis-Bacon Act prevailing wage standards. These are the minimum wages and fringe benefits that must be paid to every laborer and mechanic engaged in construction, alteration, or repair of the qualifying facility.
          </p>
          <p className="text-deep-700 dark:text-sage-300 mb-4 leading-relaxed">
            Key characteristics of Davis-Bacon rates:
          </p>
          <ul className="list-disc list-inside space-y-2 text-deep-700 dark:text-sage-300 mb-6 ml-2">
            <li><strong className="text-deep-900 dark:text-deep-100">Geography-specific:</strong> Rates vary by county and type of construction (building, heavy, highway, residential).</li>
            <li><strong className="text-deep-900 dark:text-deep-100">Occupation-specific:</strong> Each trade class (electrician, ironworker, equipment operator, laborer) has its own rate.</li>
            <li><strong className="text-deep-900 dark:text-deep-100">Updated periodically:</strong> The current Wage Determination in effect at the start of construction must be used. Check SAM.gov Wage Determinations Online (WDOL).</li>
            <li><strong className="text-deep-900 dark:text-deep-100">Fringe benefits count:</strong> Health insurance, retirement contributions, and other bona fide fringe benefits can be credited toward the prevailing wage rate.</li>
            <li><strong className="text-deep-900 dark:text-deep-100">Applies to all contractors:</strong> The requirement flows down to all subcontractors. The developer is responsible for ensuring compliance throughout the construction chain.</li>
          </ul>

          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-4">Apprenticeship Requirements</h2>
          <p className="text-deep-700 dark:text-sage-300 mb-4 leading-relaxed">
            In addition to prevailing wage, the bonus credit rate requires that <strong className="text-deep-900 dark:text-deep-100">at least 15% of total labor hours</strong> for construction, alteration, and repair be performed by qualified apprentices enrolled in registered apprenticeship programs.
          </p>
          <p className="text-deep-700 dark:text-sage-300 mb-4 leading-relaxed">
            Specific requirements:
          </p>
          <ul className="list-disc list-inside space-y-2 text-deep-700 dark:text-sage-300 mb-6 ml-2">
            <li>Apprentices must be from programs registered with the Department of Labor's Office of Apprenticeship or a state-recognized equivalent.</li>
            <li>Each contractor that employs 4 or more individuals for construction must employ at least 1 qualified apprentice.</li>
            <li>The "ratio requirement" ensures journeypersons are not displaced by apprentices — the apprentice-to-journeyman ratio must comply with the registered program's standards.</li>
            <li>Hours are calculated across all construction, not just electrical or a single trade.</li>
          </ul>
          <div className="p-4 rounded-lg bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 mb-6">
            <p className="text-[14px] font-medium text-teal-800 dark:text-teal-300">
              Good faith exception: If a developer requests apprentices from a registered program and the program cannot supply them within 5 business days, the contractor is exempt from the apprenticeship requirement for those hours. Document the request and the program's response.
            </p>
          </div>

          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-4">How to Certify Compliance</h2>
          <p className="text-deep-700 dark:text-sage-300 mb-4 leading-relaxed">
            The IRS does not require pre-approval or pre-certification. Instead, taxpayers self-certify compliance on their tax return and must maintain records to substantiate:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-deep-700 dark:text-sage-300 mb-6 ml-2">
            <li>Copies of all Wage Determinations incorporated into construction contracts</li>
            <li>Certified payroll reports from all contractors and subcontractors (weekly, by trade, by location)</li>
            <li>Total labor hours by contractor, broken down by journeyman vs. apprentice</li>
            <li>Apprentice program registration certificates</li>
            <li>Any good-faith exception documentation (requests and responses from apprenticeship programs)</li>
          </ol>

          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-4">Penalties for Non-Compliance</h2>
          <p className="text-deep-700 dark:text-sage-300 mb-4 leading-relaxed">
            Non-compliance with prevailing wage requirements does not automatically disallow the credit — it reduces the rate from the 5x bonus to the 1x base. However, the IRS provides a correction mechanism:
          </p>
          <div className="space-y-3 mb-6">
            {[
              { label: 'Proactive correction (before IRS notice)', desc: 'Pay wage shortfall to affected workers + interest. Full bonus rate preserved retroactively.' },
              { label: 'Within 180 days of IRS notification', desc: 'Pay wage shortfall to affected workers + 3x interest to the IRS. Full bonus rate preserved.' },
              { label: 'After 180 days or intentional disregard', desc: 'Credit reduced to base (1x) rate. No correction available. Potential additional penalties of $5,000-$10,000 per affected worker.' },
            ].map(({ label, desc }) => (
              <div key={label} className="flex gap-4 p-4 rounded-lg border border-deep-100 dark:border-deep-800">
                <div>
                  <p className="font-semibold text-deep-900 dark:text-deep-100 text-[14px] mb-1">{label}</p>
                  <p className="text-[13px] text-deep-600 dark:text-sage-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-4">Automatic Satisfaction: The 1MW Threshold</h2>
          <p className="text-deep-700 dark:text-sage-300 mb-6 leading-relaxed">
            Projects with a maximum net output of less than 1 megawatt (AC) automatically receive the bonus credit rate without satisfying prevailing wage or apprenticeship requirements. This covers most:
          </p>
          <ul className="list-disc list-inside space-y-2 text-deep-700 dark:text-sage-300 mb-8 ml-2">
            <li>Commercial and industrial rooftop solar installations</li>
            <li>Community solar projects under 1MW</li>
            <li>Small wind and small geothermal projects</li>
            <li>Battery storage systems sized to pair with the above</li>
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
              Find out which bonus adders apply to your project, including prevailing wage, energy community, and domestic content — with a full compliance checklist.
            </p>
            <Link href="/signup" className="inline-flex items-center gap-2 px-7 py-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[14px] font-semibold transition-colors">
              Start Free Analysis <ArrowRight className="w-4 h-4" />
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
