import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { IncentiveHeader, IncentiveCTA, IncentiveFooter } from '@/components/incentives/IncentiveHeader';

export const metadata: Metadata = {
  title: 'Section 48C Advanced Manufacturing Tax Credit | IncentEdge',
  description:
    'Section 48C offers a 30% tax credit for advanced clean energy manufacturing facilities. $10 billion allocated under the IRA for clean energy manufacturing.',
  alternates: { canonical: 'https://incentedge.com/incentives/federal/48c' },
  openGraph: {
    title: 'Section 48C Advanced Manufacturing Tax Credit | IncentEdge',
    description:
      'Section 48C offers a 30% tax credit for advanced clean energy manufacturing facilities. $10 billion allocated under the IRA for clean energy manufacturing.',
    url: 'https://incentedge.com/incentives/federal/48c',
    siteName: 'IncentEdge',
    type: 'article',
  },
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Section 48C Advanced Energy Manufacturing Credit Guide',
  description: 'Complete guide to Section 48C: $10B IRA allocation, 30% credit for clean energy manufacturing, application process, and allocation rounds.',
  url: 'https://incentedge.com/incentives/federal/48c',
  author: { '@type': 'Organization', name: 'IncentEdge' },
  publisher: { '@type': 'Organization', name: 'IncentEdge', url: 'https://incentedge.com' },
  dateModified: '2026-03-11',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is the Section 48C credit rate?',
      acceptedAnswer: { '@type': 'Answer', text: 'The credit rate is 30% of qualifying investment costs for facilities that comply with prevailing wage and apprenticeship requirements. Without prevailing wage compliance, the rate drops to 6%. The 30% rate applies to the qualified investment in eligible manufacturing property.' },
    },
    {
      '@type': 'Question',
      name: 'How does the 48C application process work?',
      acceptedAnswer: { '@type': 'Answer', text: 'Section 48C uses a competitive allocation process. Applicants submit a concept paper to the Department of Energy (DOE) for technical review, then a full application to the IRS. DOE scores applications on technical merit, job creation, and community impact. The IRS issues a certification for approved projects. Only certified projects can claim the credit.' },
    },
    {
      '@type': 'Question',
      name: 'What types of manufacturing qualify for 48C?',
      acceptedAnswer: { '@type': 'Answer', text: 'Qualifying manufacturing includes: solar components and panels, wind turbines and components, battery storage systems and components, electric vehicle equipment, energy efficiency equipment, grid modernization equipment, carbon capture components, and advanced nuclear components.' },
    },
    {
      '@type': 'Question',
      name: 'How much 48C funding remains available?',
      acceptedAnswer: { '@type': 'Answer', text: 'The IRA appropriated $10 billion for 48C, with at least $4 billion reserved for projects in energy communities. Allocation is done in rounds — check IncentEdge for current round status and remaining allocation.' },
    },
    {
      '@type': 'Question',
      name: 'Can 48C stack with ITC or PTC?',
      acceptedAnswer: { '@type': 'Answer', text: 'Section 48C cannot be claimed on the same property as the ITC or PTC. However, a manufacturer can use 48C for their factory investment and separately use ITC for a solar or storage system installed at the same facility — as long as the credited property is distinct.' },
    },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://incentedge.com' },
    { '@type': 'ListItem', position: 2, name: 'Incentives', item: 'https://incentedge.com/incentives' },
    { '@type': 'ListItem', position: 3, name: 'Federal', item: 'https://incentedge.com/incentives/federal' },
    { '@type': 'ListItem', position: 4, name: 'Section 48C', item: 'https://incentedge.com/incentives/federal/48c' },
  ],
};

const eligibleCategories = [
  { category: 'Solar Energy', examples: 'PV panels, solar glass, inverters, racking, trackers' },
  { category: 'Wind Energy', examples: 'Turbine blades, towers, nacelles, gearboxes, generators' },
  { category: 'Battery Storage', examples: 'Lithium-ion cells, packs, management systems, electrolytes' },
  { category: 'Electric Vehicles', examples: 'EV motors, charging equipment, battery packs, power electronics' },
  { category: 'Energy Efficiency', examples: 'Heat pumps, HVAC equipment, insulation, LED systems' },
  { category: 'Grid Modernization', examples: 'Transformers, advanced metering, grid control equipment' },
  { category: 'Carbon Capture', examples: 'CCS components, direct air capture equipment, CO2 storage' },
  { category: 'Advanced Nuclear', examples: 'Small modular reactor components, fuel systems' },
];

const applicationProcess = [
  { step: '01', title: 'Submit Concept Paper to DOE', desc: 'A 10-page concept paper describing the facility, technology, investment amount, and expected jobs. DOE provides encouraged/discouraged feedback.' },
  { step: '02', title: 'Full Application to IRS/DOE', desc: 'Detailed technical and financial application. DOE scores on merit criteria; IRS evaluates tax compliance. The joint review determines allocation.' },
  { step: '03', title: 'Receive Certification', desc: 'Approved applicants receive an IRS certification letter allocating a specific credit amount. Projects must begin construction within 2 years of certification.' },
  { step: '04', title: 'Place Property in Service', desc: 'Complete construction and place the qualified property in service. Document all qualifying investment costs and prevailing wage compliance.' },
  { step: '05', title: 'Claim Credit on Form 3468', desc: 'File Form 3468 (Investment Credit) with your federal return for the tax year the property is placed in service. The credit is non-refundable but carryover is permitted.' },
];

const faqs = [
  { q: 'What is the Section 48C credit rate?', a: 'The credit rate is 30% of qualifying investment costs for facilities that comply with prevailing wage and apprenticeship requirements. Without prevailing wage compliance, the rate drops to 6%. The 30% rate applies to the qualified investment in eligible manufacturing property.' },
  { q: 'How does the 48C application process work?', a: 'Section 48C uses a competitive allocation process. Applicants submit a concept paper to the Department of Energy (DOE) for technical review, then a full application to the IRS. DOE scores applications on technical merit, job creation, and community impact. The IRS issues a certification for approved projects. Only certified projects can claim the credit.' },
  { q: 'What types of manufacturing qualify for 48C?', a: 'Qualifying manufacturing includes: solar components and panels, wind turbines and components, battery storage systems and components, electric vehicle equipment, energy efficiency equipment, grid modernization equipment, carbon capture components, and advanced nuclear components.' },
  { q: 'How much 48C funding remains available?', a: 'The IRA appropriated $10 billion for 48C, with at least $4 billion reserved for projects in energy communities. Allocation is done in rounds — check IncentEdge for current round status and remaining allocation.' },
  { q: 'Can 48C stack with ITC or PTC?', a: 'Section 48C cannot be claimed on the same property as the ITC or PTC. However, a manufacturer can use 48C for their factory investment and separately use ITC for a solar or storage system installed at the same facility — as long as the credited property is distinct.' },
];

export default function Section48CPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <IncentiveHeader
        breadcrumbs={[
          { label: 'Incentives', href: '/incentives' },
          { label: 'Federal Credits', href: '/incentives/federal' },
          { label: 'Section 48C' },
        ]}
      />

      <main className="flex-1">
        <section className="max-w-[900px] mx-auto px-6 pt-16 pb-12 md:pt-20">
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-flex items-center rounded-md px-3 py-1.5 text-sm font-bold font-mono bg-deep-900 text-white">
              §48C
            </span>
            <span className="text-[12px] text-deep-500 uppercase tracking-wider font-medium">Federal Tax Credit — Competitive Allocation</span>
          </div>
          <h1 className="font-sora text-4xl md:text-[46px] font-bold tracking-tight text-deep-900 leading-[1.1] mb-5">
            Section 48C Advanced Energy Manufacturing Credit
          </h1>
          <p className="text-lg text-deep-500 mb-8 leading-relaxed">
            Section 48C provides a 30% tax credit for investments in advanced clean energy
            manufacturing facilities. The Inflation Reduction Act allocated $10 billion in
            new 48C credits, with at least $4 billion reserved for projects in designated
            energy communities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/signup" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-teal-600 text-white text-[14px] font-semibold hover:bg-teal-700 transition-colors">
              Check 48C Eligibility
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/incentives/federal" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg border border-deep-200 text-deep-700 text-[14px] font-semibold hover:bg-deep-50 transition-colors">
              All Federal Credits
            </Link>
          </div>
        </section>

        <section className="border-y border-deep-100 bg-deep-50/50">
          <div className="max-w-[900px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-deep-100">
            {[
              { label: 'Credit Rate', value: '30%' },
              { label: 'Without PW', value: '6%' },
              { label: 'IRA Allocation', value: '$10B' },
              { label: 'Energy Comm.', value: '$4B Reserved' },
            ].map((s) => (
              <div key={s.label} className="px-6 py-7 text-center">
                <div className="font-mono text-xl font-bold text-deep-900">{s.value}</div>
                <div className="text-xs text-sage-500 mt-1 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="max-w-[900px] mx-auto px-6">
          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-5">What is Section 48C?</h2>
            <p className="text-deep-600 leading-relaxed mb-4">
              Section 48C was originally enacted in 2009 under the American Recovery and Reinvestment
              Act to support domestic clean energy manufacturing. The IRA revived and greatly expanded
              the program in 2022, allocating $10 billion in new credits available through a competitive
              application process administered jointly by the IRS and Department of Energy.
            </p>
            <p className="text-deep-600 leading-relaxed mb-4">
              Unlike the ITC or PTC which are available to any qualifying project, 48C credits must
              be applied for and allocated by the IRS. Applications are evaluated by DOE on technical
              merit, greenhouse gas emission reduction, supply chain development, and community benefits.
            </p>
            <div className="flex items-start gap-3 rounded-lg border border-teal-200 bg-teal-50 px-5 py-4">
              <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-teal-800">
                <strong>Energy Community Priority:</strong> At least $4 billion of the $10 billion
                allocation is reserved for projects in designated energy communities — areas with
                significant employment in fossil fuel industries or that have experienced a coal power
                plant or mine closure. Energy community projects receive scoring preference.
              </p>
            </div>
          </section>

          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-5">Eligible Manufacturing Categories</h2>
            <div className="overflow-x-auto rounded-xl border border-deep-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-deep-50 border-b border-deep-100">
                    <th className="px-5 py-3.5 text-left font-semibold text-deep-700">Category</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-deep-700">Qualifying Examples</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-deep-100">
                  {eligibleCategories.map((row) => (
                    <tr key={row.category} className="hover:bg-deep-50/50">
                      <td className="px-5 py-4 font-medium text-deep-900 w-40">{row.category}</td>
                      <td className="px-5 py-4 text-deep-600">{row.examples}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-5">Application Process</h2>
            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 mb-8">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                <strong>Competitive Allocation Required:</strong> Unlike ITC/PTC, you cannot simply
                claim 48C on your tax return. You must apply, receive DOE/IRS certification, and then
                claim the credit. Start the application process well before construction begins.
              </p>
            </div>
            <div className="space-y-4">
              {applicationProcess.map((step) => (
                <div key={step.step} className="flex gap-5 rounded-xl border border-deep-100 p-6">
                  <div className="flex-shrink-0 font-mono text-2xl font-bold text-teal-200">{step.step}</div>
                  <div>
                    <h3 className="font-sora font-semibold text-deep-900 mb-1">{step.title}</h3>
                    <p className="text-sm text-deep-600 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-8">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {faqs.map((faq) => (
                <div key={faq.q} className="rounded-xl border border-deep-100 p-6">
                  <h3 className="font-sora font-semibold text-deep-900 mb-3">{faq.q}</h3>
                  <p className="text-deep-600 text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="py-14">
            <IncentiveCTA
              headline="Check Your 48C Manufacturing Eligibility"
              sub="IncentEdge identifies qualifying manufacturing categories, checks energy community status, and prepares your concept paper framework — so you can move fast on the next allocation round."
            />
          </section>
        </div>
      </main>

      <IncentiveFooter />
    </div>
  );
}
