import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { IncentiveHeader, IncentiveCTA, IncentiveFooter } from '@/components/incentives/IncentiveHeader';

export const metadata: Metadata = {
  title: 'Section 45V Clean Hydrogen Production Tax Credit | IncentEdge',
  description:
    'Section 45V offers up to $3/kg for clean hydrogen production based on lifecycle emissions. Learn qualification requirements, production tiers, and Treasury guidance.',
  alternates: { canonical: 'https://incentedge.com/incentives/federal/45v' },
  openGraph: {
    title: 'Section 45V Clean Hydrogen Production Tax Credit | IncentEdge',
    description:
      'Section 45V offers up to $3/kg for clean hydrogen production based on lifecycle emissions. Learn qualification requirements, production tiers, and Treasury guidance.',
    url: 'https://incentedge.com/incentives/federal/45v',
    siteName: 'IncentEdge',
    type: 'article',
  },
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Section 45V Clean Hydrogen Production Tax Credit — Complete Guide',
  description: 'Complete guide to Section 45V: credit tiers by emissions, additionality rules, Treasury guidance, and ITC vs 45V comparison.',
  url: 'https://incentedge.com/incentives/federal/45v',
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
      name: 'What is the Section 45V credit rate for green hydrogen?',
      acceptedAnswer: { '@type': 'Answer', text: 'The maximum rate of $3.00/kg applies to hydrogen with lifecycle greenhouse gas emissions at or below 0.45 kg CO2e per kg of hydrogen. This is the "Tier 1" rate applicable to electrolysis using zero-carbon electricity. Lower tiers apply at higher emission intensities: $2.00/kg (0.45–1.5 kg CO2e/kg), $1.00/kg (1.5–2.5 kg CO2e/kg), and $0.60/kg (2.5–4.0 kg CO2e/kg).' },
    },
    {
      '@type': 'Question',
      name: 'What is additionality and why does it matter for 45V?',
      acceptedAnswer: { '@type': 'Answer', text: 'Additionality requires that the clean electricity used to produce hydrogen must come from new generating capacity (built within 3 years of the hydrogen facility). The goal is to prevent electrolyzers from drawing on existing grid power and claiming credit for hydrogen that indirectly uses fossil fuel electricity. The 2024 Treasury final rules established the 3-year safe harbor for additionality compliance.' },
    },
    {
      '@type': 'Question',
      name: 'Can blue hydrogen (SMR + CCS) qualify for 45V?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes, if the carbon capture rate is sufficient to achieve lifecycle emissions below 4.0 kg CO2e/kg H2. Steam methane reforming (SMR) with high CCS capture rates (90%+) can qualify for the lower 45V tiers. The exact credit rate depends on the GREET lifecycle model calculation including Scope 1, 2, and some Scope 3 emissions.' },
    },
    {
      '@type': 'Question',
      name: 'Can 45V be stacked with the ITC on an electrolyzer?',
      acceptedAnswer: { '@type': 'Answer', text: 'Section 45V and Section 48 ITC cannot both be claimed on the same electrolyzer equipment. However, the renewable energy generation facility (solar, wind) that powers the electrolyzer can claim the ITC, while the electrolyzer facility claims the 45V. This is a common project structure — separate the generation asset from the hydrogen production asset.' },
    },
    {
      '@type': 'Question',
      name: 'How long can 45V credits be claimed?',
      acceptedAnswer: { '@type': 'Answer', text: 'The 45V credit is available for 10 years from the date the qualified clean hydrogen production facility is placed in service. For facilities placed in service before 2033, credits can be earned through the end of the 10-year window even if that extends past 2033.' },
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
    { '@type': 'ListItem', position: 4, name: 'Section 45V', item: 'https://incentedge.com/incentives/federal/45v' },
  ],
};

const creditTiers = [
  {
    tier: 'Tier 1',
    creditRate: '$3.00/kg',
    emissions: '≤ 0.45 kg CO2e/kg H2',
    color: 'teal',
    pathway: 'Green hydrogen (electrolysis with zero-carbon power)',
    note: 'Maximum rate — requires very low-carbon electricity source',
  },
  {
    tier: 'Tier 2',
    creditRate: '$2.00/kg',
    emissions: '0.45–1.5 kg CO2e/kg H2',
    color: 'emerald',
    pathway: 'Electrolysis with low-carbon grid or partial CCS',
    note: 'Achievable with clean grid connection or 85%+ CCS',
  },
  {
    tier: 'Tier 3',
    creditRate: '$1.00/kg',
    emissions: '1.5–2.5 kg CO2e/kg H2',
    color: 'blue',
    pathway: 'SMR with moderate CCS (75–85% capture)',
    note: 'Blue hydrogen pathway with significant carbon capture',
  },
  {
    tier: 'Tier 4',
    creditRate: '$0.60/kg',
    emissions: '2.5–4.0 kg CO2e/kg H2',
    color: 'slate',
    pathway: 'SMR with basic CCS or low-emission grid',
    note: 'Minimum qualifying emissions intensity',
  },
];

const additionalityRules = [
  { rule: 'New Build Requirement', desc: 'Electricity must come from generating capacity placed in service within 36 months of the hydrogen facility.' },
  { rule: 'Deliverability (Temporal)', desc: 'Electricity consumed for hydrogen must be matched to clean generation on an hourly basis (by 2028) or annual basis (2024–2027 safe harbor).' },
  { rule: 'Geographic Deliverability', desc: 'The clean electricity must be delivered in the same region (electricity balancing area) as the electrolyzer.' },
  { rule: 'Incrementality', desc: 'The clean electricity must be additional to the grid — not electricity that would have been generated regardless of the hydrogen project.' },
];

const faqs = [
  { q: 'What is the Section 45V credit rate for green hydrogen?', a: 'The maximum rate of $3.00/kg applies to hydrogen with lifecycle greenhouse gas emissions at or below 0.45 kg CO2e per kg of hydrogen. This is the "Tier 1" rate applicable to electrolysis using zero-carbon electricity. Lower tiers apply at higher emission intensities: $2.00/kg (0.45–1.5 kg CO2e/kg), $1.00/kg (1.5–2.5 kg CO2e/kg), and $0.60/kg (2.5–4.0 kg CO2e/kg).' },
  { q: 'What is additionality and why does it matter for 45V?', a: 'Additionality requires that the clean electricity used to produce hydrogen must come from new generating capacity (built within 3 years of the hydrogen facility). The goal is to prevent electrolyzers from drawing on existing grid power and claiming credit for hydrogen that indirectly uses fossil fuel electricity. The 2024 Treasury final rules established the 3-year safe harbor for additionality compliance.' },
  { q: 'Can blue hydrogen (SMR + CCS) qualify for 45V?', a: 'Yes, if the carbon capture rate is sufficient to achieve lifecycle emissions below 4.0 kg CO2e/kg H2. Steam methane reforming (SMR) with high CCS capture rates (90%+) can qualify for the lower 45V tiers. The exact credit rate depends on the GREET lifecycle model calculation including Scope 1, 2, and some Scope 3 emissions.' },
  { q: 'Can 45V be stacked with the ITC on an electrolyzer?', a: 'Section 45V and Section 48 ITC cannot both be claimed on the same electrolyzer equipment. However, the renewable energy generation facility (solar, wind) that powers the electrolyzer can claim the ITC, while the electrolyzer facility claims the 45V. This is a common project structure — separate the generation asset from the hydrogen production asset.' },
  { q: 'How long can 45V credits be claimed?', a: 'The 45V credit is available for 10 years from the date the qualified clean hydrogen production facility is placed in service. For facilities placed in service before 2033, credits can be earned through the end of the 10-year window even if that extends past 2033.' },
];

export default function Section45VPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <IncentiveHeader
        breadcrumbs={[
          { label: 'Incentives', href: '/incentives' },
          { label: 'Federal Credits', href: '/incentives/federal' },
          { label: 'Section 45V' },
        ]}
      />

      <main className="flex-1">
        <section className="max-w-[900px] mx-auto px-6 pt-16 pb-12 md:pt-20">
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-flex items-center rounded-md px-3 py-1.5 text-sm font-bold font-mono bg-deep-900 text-white">
              §45V
            </span>
            <span className="text-[12px] text-deep-500 uppercase tracking-wider font-medium">Federal Tax Credit — Transferable</span>
          </div>
          <h1 className="font-sora text-4xl md:text-[46px] font-bold tracking-tight text-deep-900 leading-[1.1] mb-5">
            Section 45V Clean Hydrogen Production Tax Credit
          </h1>
          <p className="text-lg text-deep-500 mb-8 leading-relaxed">
            Section 45V provides a production tax credit of up to $3.00 per kilogram for clean
            hydrogen based on lifecycle greenhouse gas emissions. Created by the Inflation Reduction
            Act, 45V is the cornerstone incentive for the US clean hydrogen economy, earned over
            a 10-year production window.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/signup" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-teal-600 text-white text-[14px] font-semibold hover:bg-teal-700 transition-colors">
              Calculate My 45V Credit Tier
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
              { label: 'Maximum Rate', value: '$3.00/kg' },
              { label: 'Minimum Rate', value: '$0.60/kg' },
              { label: 'Credit Window', value: '10 Years' },
              { label: 'Prevailing Wage', value: 'Required' },
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
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-5">Credit Tiers by Lifecycle Emissions</h2>
            <p className="text-deep-600 mb-8 leading-relaxed">
              The 45V credit rate is determined by a tiered structure based on the lifecycle
              greenhouse gas (GHG) emissions of the hydrogen production process, measured using
              the GREET (Greenhouse gases, Regulated Emissions, and Energy use in Technologies)
              model developed by Argonne National Laboratory.
            </p>
            <div className="space-y-4">
              {creditTiers.map((tier) => (
                <div key={tier.tier} className="rounded-xl border border-deep-100 p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold font-mono bg-deep-900 text-white">
                        {tier.tier}
                      </span>
                      <span className="font-mono text-xl font-bold text-teal-600">{tier.creditRate}</span>
                    </div>
                    <span className="text-sm font-mono text-deep-500">{tier.emissions}</span>
                  </div>
                  <p className="text-sm text-deep-700 font-medium mb-1">{tier.pathway}</p>
                  <p className="text-xs text-deep-500">{tier.note}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-deep-400 mt-4">
              Hydrogen with lifecycle emissions above 4.0 kg CO2e/kg does not qualify for any 45V credit.
              Prevailing wage and apprenticeship requirements apply; non-compliant projects receive 20% of the above rates.
            </p>
          </section>

          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-5">Additionality Requirements</h2>
            <p className="text-deep-600 mb-6 leading-relaxed">
              The Treasury Department's final 45V rules (January 2024) established additionality,
              temporal matching, and geographic deliverability requirements for electrolytic
              hydrogen to qualify for the credit. These rules are designed to ensure that clean
              hydrogen production genuinely reduces grid emissions.
            </p>
            <div className="space-y-4 mb-6">
              {additionalityRules.map((item) => (
                <div key={item.rule} className="rounded-xl border border-deep-100 p-5">
                  <h3 className="font-sora font-semibold text-deep-900 mb-1.5">{item.rule}</h3>
                  <p className="text-sm text-deep-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-5 py-4">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                <strong>Hourly Matching Transition:</strong> Annual matching is available as a safe
                harbor through 2027. Starting in 2028, hourly matching will be required, which demands
                more sophisticated energy attribute certificate (EAC) tracking systems. Plan accordingly.
              </p>
            </div>
          </section>

          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-5">Electrolyzer vs SMR Pathways</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-6">
                <h3 className="font-sora font-semibold text-deep-900 mb-3">Green Hydrogen (Electrolysis)</h3>
                <ul className="space-y-2 mb-4">
                  {[
                    'Electrolyzer powered by wind or solar',
                    'Achieves Tier 1 ($3.00/kg) if power is zero-carbon',
                    'Additionality, temporal, and geographic rules apply',
                    '45V on electrolyzer; ITC on generation asset',
                    'GREET model run required annually',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-deep-700">
                      <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-deep-100 p-6">
                <h3 className="font-sora font-semibold text-deep-900 mb-3">Blue Hydrogen (SMR + CCS)</h3>
                <ul className="space-y-2 mb-4">
                  {[
                    'Natural gas steam methane reforming + carbon capture',
                    'Tier 3–4 rates ($0.60–$1.00/kg) with 75–90% CCS',
                    'Higher capture rates unlock better tiers',
                    'Can also stack 45Q on the CCS equipment',
                    'Methane leakage rate affects GREET calculation',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-deep-700">
                      <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-5">Stacking 45V with ITC</h2>
            <p className="text-deep-600 mb-6 leading-relaxed">
              The most common and effective structure for green hydrogen projects separates the
              generation asset (eligible for ITC) from the electrolysis equipment (eligible for 45V).
            </p>
            <div className="rounded-xl border border-deep-100 overflow-hidden">
              <div className="bg-deep-50 px-6 py-4 border-b border-deep-100">
                <h3 className="font-sora font-semibold text-deep-900">Optimal Project Structure</h3>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { asset: 'Solar / Wind Farm', credit: 'ITC (§48/48E)', rate: '30%–70% of generation cost', note: 'Separate legal entity recommended' },
                  { asset: 'Electrolyzer', credit: '45V', rate: 'Up to $3.00/kg H2 for 10 years', note: 'Must meet additionality rules' },
                  { asset: 'CCS Equipment (if blue H2)', credit: '45Q', rate: '$85/ton CO2 stored', note: 'Can stack with 45V if separate equipment' },
                ].map((row) => (
                  <div key={row.asset} className="flex items-start gap-4 rounded-lg border border-deep-100 p-4">
                    <div className="flex-1">
                      <div className="font-semibold text-deep-900 text-sm">{row.asset}</div>
                      <div className="text-xs text-deep-500 mt-0.5">{row.note}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm font-bold text-teal-600">{row.credit}</div>
                      <div className="text-xs text-deep-500 mt-0.5">{row.rate}</div>
                    </div>
                  </div>
                ))}
              </div>
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
              headline="Calculate Your 45V Credit Tier"
              sub="IncentEdge models your production pathway, runs the GREET emissions calculation, identifies your credit tier, and structures the optimal ITC + 45V stacking strategy."
            />
          </section>
        </div>
      </main>

      <IncentiveFooter />
    </div>
  );
}
