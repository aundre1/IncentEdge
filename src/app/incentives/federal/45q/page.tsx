import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { IncentiveHeader, IncentiveCTA, IncentiveFooter } from '@/components/incentives/IncentiveHeader';

export const metadata: Metadata = {
  title: 'Section 45Q Carbon Capture Tax Credit | IncentEdge',
  description:
    'Section 45Q provides $85/ton for geologic storage and $60/ton for utilization. IRA doubled credit rates and lowered capture thresholds for new projects.',
  alternates: { canonical: 'https://incentedge.com/incentives/federal/45q' },
  openGraph: {
    title: 'Section 45Q Carbon Capture Tax Credit | IncentEdge',
    description:
      'Section 45Q provides $85/ton for geologic storage and $60/ton for utilization. IRA doubled credit rates and lowered capture thresholds for new projects.',
    url: 'https://incentedge.com/incentives/federal/45q',
    siteName: 'IncentEdge',
    type: 'article',
  },
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Section 45Q Carbon Capture & Sequestration Tax Credit Guide',
  description: 'Complete guide to Section 45Q: credit rates post-IRA, capture thresholds, direct air capture, transferability, and recapture rules.',
  url: 'https://incentedge.com/incentives/federal/45q',
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
      name: 'What is the 45Q credit rate for carbon capture?',
      acceptedAnswer: { '@type': 'Answer', text: 'Post-IRA rates (for facilities beginning construction after 2022): $85/ton for geologic storage, $60/ton for utilization (EOR with monitoring, concrete mineralization), and $180/ton for direct air capture with geologic storage. These rates are roughly double the pre-IRA amounts.' },
    },
    {
      '@type': 'Question',
      name: 'What are the capture threshold requirements for 45Q?',
      acceptedAnswer: { '@type': 'Answer', text: 'The IRA significantly lowered capture thresholds. Electric generating facilities must capture at least 18,750 metric tons/year (down from 500,000). Industrial facilities must capture at least 12,500 metric tons/year (down from 100,000). Direct air capture facilities must capture at least 1,000 metric tons/year.' },
    },
    {
      '@type': 'Question',
      name: 'How long can 45Q credits be claimed?',
      acceptedAnswer: { '@type': 'Answer', text: 'Credits are earned for 12 years from the date the carbon capture equipment is placed in service, or from January 1, 2023, whichever is later. The 12-year credit window was extended from the original provision by the IRA.' },
    },
    {
      '@type': 'Question',
      name: 'What is recapture under Section 45Q?',
      acceptedAnswer: { '@type': 'Answer', text: 'If CO2 that was stored and credited leaks back into the atmosphere, the taxpayer must repay (recapture) previously claimed credits. The recapture period is generally 5 years. Robust monitoring, reporting, and verification (MRV) plans are required to manage recapture risk.' },
    },
    {
      '@type': 'Question',
      name: 'Can 45Q be transferred or sold?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. The IRA made 45Q credits transferable to unrelated third parties. Nonprofit organizations and government entities can elect direct pay. This significantly improves the monetization options for carbon capture project developers who may not have sufficient tax appetite.' },
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
    { '@type': 'ListItem', position: 4, name: 'Section 45Q', item: 'https://incentedge.com/incentives/federal/45q' },
  ],
};

const creditRates = [
  { type: 'Geologic Storage', preIRA: '$50/ton', postIRA: '$85/ton', dacPostIRA: '$180/ton', notes: 'Permanent underground sequestration' },
  { type: 'EOR (Monitored)', preIRA: '$35/ton', postIRA: '$60/ton', dacPostIRA: '$130/ton', notes: 'Enhanced oil recovery with monitoring' },
  { type: 'Other Utilization', preIRA: '$35/ton', postIRA: '$60/ton', dacPostIRA: '$130/ton', notes: 'Concrete, fuels, chemicals' },
];

const captureThresholds = [
  { facility: 'Electric Generating', preIRA: '500,000 MT/yr', postIRA: '18,750 MT/yr', change: '-96%' },
  { facility: 'Industrial Emitter', preIRA: '100,000 MT/yr', postIRA: '12,500 MT/yr', change: '-87%' },
  { facility: 'Direct Air Capture', preIRA: '100,000 MT/yr', postIRA: '1,000 MT/yr', change: '-99%' },
];

const faqs = [
  { q: 'What is the 45Q credit rate for carbon capture?', a: 'Post-IRA rates (for facilities beginning construction after 2022): $85/ton for geologic storage, $60/ton for utilization (EOR with monitoring, concrete mineralization), and $180/ton for direct air capture with geologic storage. These rates are roughly double the pre-IRA amounts.' },
  { q: 'What are the capture threshold requirements for 45Q?', a: 'The IRA significantly lowered capture thresholds. Electric generating facilities must capture at least 18,750 metric tons/year (down from 500,000). Industrial facilities must capture at least 12,500 metric tons/year (down from 100,000). Direct air capture facilities must capture at least 1,000 metric tons/year.' },
  { q: 'How long can 45Q credits be claimed?', a: 'Credits are earned for 12 years from the date the carbon capture equipment is placed in service, or from January 1, 2023, whichever is later. The 12-year credit window was extended from the original provision by the IRA.' },
  { q: 'What is recapture under Section 45Q?', a: 'If CO2 that was stored and credited leaks back into the atmosphere, the taxpayer must repay (recapture) previously claimed credits. The recapture period is generally 5 years. Robust monitoring, reporting, and verification (MRV) plans are required to manage recapture risk.' },
  { q: 'Can 45Q be transferred or sold?', a: 'Yes. The IRA made 45Q credits transferable to unrelated third parties. Nonprofit organizations and government entities can elect direct pay. This significantly improves the monetization options for carbon capture project developers who may not have sufficient tax appetite.' },
];

export default function Section45QPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <IncentiveHeader
        breadcrumbs={[
          { label: 'Incentives', href: '/incentives' },
          { label: 'Federal Credits', href: '/incentives/federal' },
          { label: 'Section 45Q' },
        ]}
      />

      <main className="flex-1">
        <section className="max-w-[900px] mx-auto px-6 pt-16 pb-12 md:pt-20">
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-flex items-center rounded-md px-3 py-1.5 text-sm font-bold font-mono bg-deep-900 text-white">
              §45Q
            </span>
            <span className="text-[12px] text-deep-500 uppercase tracking-wider font-medium">Federal Tax Credit — Transferable</span>
          </div>
          <h1 className="font-sora text-4xl md:text-[46px] font-bold tracking-tight text-deep-900 leading-[1.1] mb-5">
            Section 45Q Carbon Capture &amp; Sequestration Tax Credit
          </h1>
          <p className="text-lg text-deep-500 mb-8 leading-relaxed">
            Section 45Q is the primary federal incentive for carbon capture, utilization, and storage
            (CCUS). The IRA doubled credit rates, dramatically lowered capture thresholds, made
            credits transferable, and introduced a $180/ton rate for direct air capture — unlocking
            CCUS economics for a broad range of industrial and power generation projects.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/signup" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-teal-600 text-white text-[14px] font-semibold hover:bg-teal-700 transition-colors">
              Evaluate My 45Q Opportunity
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
              { label: 'Geologic Storage', value: '$85/ton' },
              { label: 'Utilization', value: '$60/ton' },
              { label: 'DAC Storage', value: '$180/ton' },
              { label: 'Credit Window', value: '12 Years' },
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
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-5">Credit Rates Post-IRA</h2>
            <div className="overflow-x-auto rounded-xl border border-deep-100 mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-deep-50 border-b border-deep-100">
                    <th className="px-5 py-3.5 text-left font-semibold text-deep-700">Disposition Type</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-deep-700">Pre-IRA Rate</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-deep-700">Post-IRA Rate</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-deep-700 hidden md:table-cell">DAC (Post-IRA)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-deep-100">
                  {creditRates.map((row) => (
                    <tr key={row.type} className="hover:bg-deep-50/50">
                      <td className="px-5 py-4 font-medium text-deep-900">{row.type}</td>
                      <td className="px-5 py-4 text-deep-500 font-mono">{row.preIRA}</td>
                      <td className="px-5 py-4 font-mono font-bold text-teal-600">{row.postIRA}</td>
                      <td className="px-5 py-4 font-mono font-bold text-teal-600 hidden md:table-cell">{row.dacPostIRA}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-deep-500">
              Note: Post-IRA rates apply to facilities that begin construction after August 16, 2022.
              Prevailing wage and apprenticeship compliance is required to receive the above rates;
              without compliance the rates are approximately 20% of these amounts.
            </p>
          </section>

          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-5">Capture Thresholds — IRA Expansion</h2>
            <p className="text-deep-600 mb-6 leading-relaxed">
              One of the IRA's most impactful changes was drastically lowering the minimum annual
              capture thresholds that make a facility eligible for 45Q credits, opening the program
              to a much wider range of industrial emitters.
            </p>
            <div className="overflow-x-auto rounded-xl border border-deep-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-deep-50 border-b border-deep-100">
                    <th className="px-5 py-3.5 text-left font-semibold text-deep-700">Facility Type</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-deep-700">Pre-IRA Threshold</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-deep-700">Post-IRA Threshold</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-deep-700">Reduction</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-deep-100">
                  {captureThresholds.map((row) => (
                    <tr key={row.facility} className="hover:bg-deep-50/50">
                      <td className="px-5 py-4 font-medium text-deep-900">{row.facility}</td>
                      <td className="px-5 py-4 text-deep-500 font-mono">{row.preIRA}</td>
                      <td className="px-5 py-4 font-mono font-bold text-teal-600">{row.postIRA}</td>
                      <td className="px-5 py-4 font-semibold text-emerald-600">{row.change}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-5">Recapture Rules &amp; MRV Requirements</h2>
            <p className="text-deep-600 leading-relaxed mb-4">
              Section 45Q includes recapture provisions to ensure CO2 remains permanently stored.
              If credited CO2 leaks or is otherwise released, previously claimed credits must be
              repaid to the IRS.
            </p>
            <div className="grid gap-4 md:grid-cols-2 mb-4">
              {[
                { title: 'Recapture Period', items: ['5-year recapture window post-storage', 'Annual monitoring reports required', 'EPA Underground Injection Control compliance', 'Third-party verification often required'] },
                { title: 'MRV Requirements', items: ['Measurement, Reporting & Verification plan', 'Annual CO2 injection and storage reporting', 'EPA Greenhouse Gas Reporting Program compliance', 'Site characterization and integrity monitoring'] },
              ].map((box) => (
                <div key={box.title} className="rounded-xl border border-deep-100 p-6">
                  <h3 className="font-sora font-semibold text-deep-900 mb-3">{box.title}</h3>
                  <ul className="space-y-2">
                    {box.items.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-deep-600">
                        <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-5 py-4">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                <strong>Recapture Insurance:</strong> Some project developers purchase geological
                risk insurance to protect against recapture liability. This cost should be modeled
                as part of the project's overall economics.
              </p>
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
              headline="Evaluate Your Carbon Capture 45Q Opportunity"
              sub="IncentEdge models your facility's capture potential, identifies the optimal utilization or storage pathway, and calculates 12-year credit value with transferability options."
            />
          </section>
        </div>
      </main>

      <IncentiveFooter />
    </div>
  );
}
