import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'IRA Incentive Due Diligence: A Finance Team\'s 48-Hour Checklist',
  description:
    'A step-by-step due diligence framework for IRA tax credit deals. Eligibility verification, credit calculation, recapture risk, and documentation checklist.',
  alternates: { canonical: 'https://incentedge.com/blog/ira-incentive-due-diligence' },
  openGraph: {
    title: 'IRA Incentive Due Diligence: A Finance Team\'s 48-Hour Checklist',
    description:
      'A step-by-step due diligence framework for IRA tax credit deals. Eligibility verification, credit calculation, recapture risk, and documentation checklist.',
    url: 'https://incentedge.com/blog/ira-incentive-due-diligence',
    type: 'article',
  },
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'IRA Incentive Due Diligence: Your 48-Hour Framework',
  description: 'A step-by-step due diligence framework for IRA tax credit deals.',
  datePublished: '2026-03-01',
  dateModified: '2026-03-01',
  author: { '@type': 'Organization', name: 'IncentEdge Research Team', url: 'https://incentedge.com' },
  publisher: { '@type': 'Organization', name: 'IncentEdge', url: 'https://incentedge.com' },
  mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://incentedge.com/blog/ira-incentive-due-diligence' },
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Conduct IRA Incentive Due Diligence in 48 Hours',
  description: 'Step-by-step framework for verifying IRA tax credit eligibility, calculating value, and assessing recapture risk.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Hours 1-4: Project Classification & Credit Identification', text: 'Classify the project technology, identify applicable credit sections, confirm the credit type (ITC vs PTC), and map the project location to energy community and low-income overlays.' },
    { '@type': 'HowToStep', position: 2, name: 'Hours 4-12: Eligibility Verification', text: 'Verify prevailing wage and apprenticeship compliance, domestic content certification status, energy community designation, and project entity structure.' },
    { '@type': 'HowToStep', position: 3, name: 'Hours 12-24: Credit Calculation & Value Modeling', text: 'Calculate eligible basis, apply applicable bonus adders, model ITC vs PTC NPV, and determine transferability vs tax equity pricing.' },
    { '@type': 'HowToStep', position: 4, name: 'Hours 24-36: Recapture Risk Assessment', text: 'Review project disposition plans, assess operational continuity risk, evaluate insurance options, and confirm 5-year recapture period management.' },
    { '@type': 'HowToStep', position: 5, name: 'Hours 36-48: Documentation Checklist', text: 'Collect and verify all required documents: engineer certifications, placed-in-service dates, prevailing wage payroll records, domestic content certifications, and energy community designation proof.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is ITC recapture and how long does it last?',
      acceptedAnswer: { '@type': 'Answer', text: 'ITC recapture occurs when an ITC-eligible project is disposed of, ceases to qualify, or is transferred in a taxable transaction within 5 years of being placed in service. The recapture amount decreases by 20% per year: 100% in year 1, 80% in year 2, 60% in year 3, 40% in year 4, and 20% in year 5. After year 5, there is no recapture.' },
    },
    {
      '@type': 'Question',
      name: 'What documents are required for an IRA tax credit claim?',
      acceptedAnswer: { '@type': 'Answer', text: 'Required documentation includes: (1) engineer or third-party certification of placed-in-service date; (2) cost segregation study or qualified appraisal for eligible basis; (3) prevailing wage compliance records (certified payrolls, apprenticeship agreements); (4) domestic content certifications from equipment manufacturers; (5) energy community designation evidence (DOE maps, census tract data); (6) Form 3800 and applicable credit forms (e.g., Form 3468 for ITC).' },
    },
    {
      '@type': 'Question',
      name: 'What kills an IRA tax credit deal in due diligence?',
      acceptedAnswer: { '@type': 'Answer', text: 'Common deal killers include: (1) Missing prevailing wage payroll records with no ability to cure retroactively; (2) Equipment that does not qualify for domestic content due to foreign manufacturing (and no certification available); (3) Project entity structure that does not allow for clean credit transfer (existing tax equity investor with conflicting contractual rights); (4) IRS audit risk flags (related-party transactions in eligible basis, inflated cost certifications).' },
    },
    {
      '@type': 'Question',
      name: 'Can prevailing wage non-compliance be cured?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes, within limits. IRS Notice 2023-29 and the final Treasury regulations provide a correction mechanism: if a project discovers prevailing wage non-compliance, it can pay the shortfall to affected workers plus 3x interest within 180 days of IRS notification (or proactively before a notice is issued). The 5x multiplier is preserved if corrected proactively or within 30 days of an IRS inquiry.' },
    },
    {
      '@type': 'Question',
      name: 'How does IncentEdge help with IRA due diligence?',
      acceptedAnswer: { '@type': 'Answer', text: 'IncentEdge automates the initial classification, eligibility mapping, and credit calculation phases of IRA due diligence. Our platform cross-references project location against DOE energy community maps, SBA HUBZone data, and census tract low-income designations; calculates applicable bonus adders; and generates a structured due diligence report in under 60 seconds — replacing hours of manual research.' },
    },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://incentedge.com' },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://incentedge.com/blog' },
    { '@type': 'ListItem', position: 3, name: 'IRA Incentive Due Diligence', item: 'https://incentedge.com/blog/ira-incentive-due-diligence' },
  ],
};

const RELATED_POSTS = [
  { slug: 'tax-equity-vs-transferability', title: 'Tax Equity vs. Credit Transferability: Choosing the Right IRA Structure' },
  { slug: 'prevailing-wage-apprenticeship-requirements', title: 'IRA Prevailing Wage & Apprenticeship Requirements: Complete Guide' },
  { slug: 'ira-bonus-adders-explained', title: 'IRA Bonus Adders: How to Stack Credits From 30% to 70%' },
];

const CHECKLIST_PHASES = [
  {
    phase: 'Hours 1–4',
    title: 'Project Classification & Credit Identification',
    color: 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800',
    items: [
      'Identify technology type (solar PV, wind, storage, geothermal, CHP, etc.)',
      'Confirm applicable credit section (ITC §48, PTC §45, 45Q, 45V, 48C)',
      'Determine ITC vs. PTC election (both available for most technologies post-IRA)',
      'Map project GPS coordinates to energy community overlays (DOE interactive map)',
      'Map project census tract to low-income community categories (IRS LIC tool)',
      'Confirm project capacity (under 1MW AC for automatic prevailing wage satisfaction)',
      'Review project entity structure (LLC, C-corp, partnership)',
    ],
  },
  {
    phase: 'Hours 4–12',
    title: 'Eligibility Verification',
    color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    items: [
      'Prevailing wage: Confirm construction contracts reference current DOL wage tables',
      'Prevailing wage: Collect certified payroll records from all contractors and subs',
      'Apprenticeship: Verify 15% of labor hours assigned to registered apprentices',
      'Apprenticeship: Confirm apprenticeship programs are registered with DOL or state agency',
      'Domestic content: Request manufacturer certifications for steel, iron, and manufactured products',
      'Domestic content: Apply 40% US-manufactured product threshold (50% for wind after 2026)',
      'Energy community: Obtain official census tract designation documentation',
      'Confirm placed-in-service date (or projected date) aligns with credit year',
    ],
  },
  {
    phase: 'Hours 12–24',
    title: 'Credit Calculation & Value Modeling',
    color: 'bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800',
    items: [
      'Determine eligible basis (total project cost minus ineligible items: land, interconnection line > 50 feet)',
      'Apply applicable bonus adders: +10% energy community, +10% domestic content, +10/20% low-income',
      'Model ITC: (eligible basis × credit rate) to determine gross credit value',
      'Model PTC alternative: Project 10-year kWh production × 2.75¢/kWh (inflation-adjusted)',
      'Compare ITC vs. PTC NPV at applicable discount rate',
      'Obtain transferability pricing indications from 2-3 broker/platforms',
      'Model tax equity yield and compare net developer proceeds',
      'Account for MACRS depreciation if tax equity path is under consideration',
    ],
  },
  {
    phase: 'Hours 24–36',
    title: 'Recapture Risk Assessment',
    color: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    items: [
      'Review project operating agreement for disposition restrictions',
      'Confirm no planned asset sales within 5-year ITC recapture period',
      'Review project debt covenants for change-of-control provisions',
      'Assess force majeure and operational risk (natural disaster, permitting revocation)',
      'Obtain term sheets from 2-3 tax credit insurance providers',
      'Quantify recapture insurance cost (typically 0.5-1.5% of insured credit amount)',
      'Identify any related-party transactions in eligible basis that could trigger IRS scrutiny',
      'Review state tax credit implications and any state recapture provisions',
    ],
  },
  {
    phase: 'Hours 36–48',
    title: 'Documentation Checklist',
    color: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
    items: [
      'Engineer or independent certifier confirmation of placed-in-service date',
      'Cost segregation study or qualified appraisal supporting eligible basis',
      'Certified payroll records for all construction labor (prevailing wage proof)',
      'Apprenticeship hour logs and registered apprenticeship program certificates',
      'Domestic content certifications from equipment manufacturers (signed)',
      'DOE or census bureau documentation confirming energy community / LIC status',
      'Interconnection agreement confirming project capacity and point of interconnection',
      'Final project operating agreement and entity formation documents',
      'Draft Form 3468 (ITC) or Form 8835 (PTC) with supporting calculations',
      'Draft Form 3800 transfer election (if using transferability)',
    ],
  },
];

export default function IRAIncentiveDueDiligencePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-deep-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
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
            <span className="text-deep-900 dark:text-deep-100">IRA Due Diligence</span>
          </nav>

          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">Finance Team Guides</span>
            <span className="text-[13px] text-deep-500 dark:text-sage-500">IncentEdge Research Team</span>
            <span className="text-deep-300 dark:text-deep-700">·</span>
            <span className="text-[13px] text-deep-500 dark:text-sage-500">March 1, 2026</span>
            <span className="text-deep-300 dark:text-deep-700">·</span>
            <span className="text-[13px] text-deep-500 dark:text-sage-500">Last Updated: March 1, 2026</span>
          </div>

          <h1 className="font-sora text-3xl md:text-4xl font-bold text-deep-900 dark:text-white mb-6 leading-tight">
            IRA Incentive Due Diligence: Your 48-Hour Framework
          </h1>

          <p className="text-lg text-deep-600 dark:text-sage-400 mb-10 leading-relaxed border-l-4 border-teal-400 pl-4">
            IRA tax credit deals have real financial risk. Miscalculated eligible basis, missing prevailing wage records, or undisclosed recapture exposure can cost millions. This structured 48-hour framework gives finance teams the tools to verify, calculate, and document any IRA credit deal from initial review to signed purchase agreement.
          </p>

          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-4">Why Due Diligence Matters</h2>
          <p className="text-deep-700 dark:text-sage-300 mb-4 leading-relaxed">
            The IRS treats IRA tax credits as self-certified by the taxpayer — there is no government pre-approval process. This means buyers and sellers of transferred credits must do their own verification. The consequences of failure are severe:
          </p>
          <ul className="list-disc list-inside space-y-2 text-deep-700 dark:text-sage-300 mb-6 ml-2">
            <li><strong className="text-deep-900 dark:text-deep-100">Recapture:</strong> The IRS can claw back ITC if the project fails to meet credit requirements during the 5-year recapture period.</li>
            <li><strong className="text-deep-900 dark:text-deep-100">Audit exposure:</strong> Overstated eligible basis or fraudulent prevailing wage certifications can trigger penalties of 20-40% of the overstated amount.</li>
            <li><strong className="text-deep-900 dark:text-deep-100">Credit disallowance:</strong> Missing documentation for bonus adders (energy community, domestic content) results in disallowance of those adders without penalty but with significant value loss.</li>
            <li><strong className="text-deep-900 dark:text-deep-100">Transfer liability:</strong> In a credit transfer, the buyer is generally not liable for seller fraud, but must prove it exercised "reasonable diligence" to avoid being disallowed.</li>
          </ul>

          {/* Checklist Phases */}
          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-6">The 48-Hour Checklist</h2>
          <div className="space-y-6 mb-10">
            {CHECKLIST_PHASES.map((phase) => (
              <div key={phase.phase} className={`rounded-xl border p-6 ${phase.color}`}>
                <div className="flex items-baseline gap-3 mb-3">
                  <span className="font-mono text-[12px] font-bold text-deep-500 dark:text-sage-500">{phase.phase}</span>
                  <h3 className="font-sora font-semibold text-[17px] text-deep-900 dark:text-deep-100">{phase.title}</h3>
                </div>
                <ul className="space-y-2">
                  {phase.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-[14px] text-deep-700 dark:text-sage-300">
                      <span className="mt-1.5 w-4 h-4 rounded border border-deep-300 dark:border-deep-600 flex-shrink-0 bg-white dark:bg-deep-900" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-4">Red Flags That Kill Deals</h2>
          <p className="text-deep-700 dark:text-sage-300 mb-4 leading-relaxed">
            These issues have derailed real IRA credit transactions. If you encounter any of them, pause and get qualified tax counsel involved before proceeding:
          </p>
          <div className="space-y-3 mb-8">
            {[
              'Certified payroll records are incomplete, unsigned, or missing for any week of construction',
              'Equipment manufacturer refuses to provide domestic content certification (or certification is unsigned)',
              'Project had a prior tax equity investor whose rights have not been cleanly terminated',
              'Energy community designation relies on informal interpretation rather than official census tract data',
              'Placed-in-service date is disputed (e.g., project partially operational, grid interconnection pending)',
              'Related-party transactions make up more than 20% of eligible basis without independent appraisal',
              'State permitting violations or environmental liens on project real property',
            ].map((flag) => (
              <div key={flag} className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <span className="text-red-500 font-bold mt-0.5 flex-shrink-0">!</span>
                <span className="text-[14px] text-deep-700 dark:text-sage-300">{flag}</span>
              </div>
            ))}
          </div>

          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mt-10 mb-4">How IncentEdge Automates This Workflow</h2>
          <p className="text-deep-700 dark:text-sage-300 mb-6 leading-relaxed">
            IncentEdge compresses the initial phases of this checklist into under 60 seconds. Enter your project location, technology type, capacity, and construction timeline, and IncentEdge automatically:
          </p>
          <ul className="list-disc list-inside space-y-2 text-deep-700 dark:text-sage-300 mb-8 ml-2">
            <li>Cross-references the project location against the DOE Energy Community map (brownfields, coal retirement, fossil fuel employment communities)</li>
            <li>Identifies applicable census tract categories for low-income community adders</li>
            <li>Calculates applicable credit rate with all stacked bonus adders</li>
            <li>Generates a structured due diligence checklist tailored to your specific project type</li>
            <li>Produces a shareable PDF report documenting the analysis for your deal file</li>
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
            <h2 className="font-sora text-xl font-bold text-deep-900 dark:text-deep-100 mb-2">
              Scan your project with IncentEdge — it's free to start
            </h2>
            <p className="text-deep-600 dark:text-sage-400 mb-6 text-[15px]">
              Get your full due diligence checklist, credit calculation, and bonus adder analysis in under 60 seconds.
            </p>
            <Link href="/signup" className="inline-flex items-center gap-2 px-7 py-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[14px] font-semibold transition-colors">
              Start Your Free Analysis <ArrowRight className="w-4 h-4" />
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
