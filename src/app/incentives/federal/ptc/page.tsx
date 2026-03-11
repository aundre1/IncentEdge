import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { IncentiveHeader, IncentiveCTA, IncentiveFooter } from '@/components/incentives/IncentiveHeader';

export const metadata: Metadata = {
  title: 'Production Tax Credit (PTC) — Section 45 & 45Y | IncentEdge',
  description:
    'The PTC pays 2.75¢/kWh for clean electricity production for 10 years. Learn how to choose between ITC and PTC to maximize your project\'s tax credit value.',
  alternates: { canonical: 'https://incentedge.com/incentives/federal/ptc' },
  openGraph: {
    title: 'Production Tax Credit (PTC) — Section 45 & 45Y | IncentEdge',
    description:
      "The PTC pays 2.75¢/kWh for clean electricity production for 10 years. Learn how to choose between ITC and PTC to maximize your project's tax credit value.",
    url: 'https://incentedge.com/incentives/federal/ptc',
    siteName: 'IncentEdge',
    type: 'article',
  },
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Production Tax Credit (PTC) — Section 45 & 45Y Complete Guide',
  description: 'Complete guide to the PTC: 2.75¢/kWh for 10 years, eligible technologies, ITC vs PTC comparison, and transferability.',
  url: 'https://incentedge.com/incentives/federal/ptc',
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
      name: 'What is the PTC rate for wind in 2024?',
      acceptedAnswer: { '@type': 'Answer', text: 'The PTC rate for wind and other qualifying technologies is 2.75¢/kWh for 2024, adjusted for inflation annually. Projects without prevailing wage compliance receive only 0.3¢/kWh. The 10-year credit period begins when the facility is placed in service.' },
    },
    {
      '@type': 'Question',
      name: 'What is the difference between Section 45 and Section 45Y?',
      acceptedAnswer: { '@type': 'Answer', text: 'Section 45 is the legacy PTC that lists specific qualifying technologies (wind, solar, geothermal, etc.) for projects beginning construction through 2024. Section 45Y is the new technology-neutral Clean Electricity Production Credit that applies from 2025 forward for facilities with zero or net-negative greenhouse gas emissions.' },
    },
    {
      '@type': 'Question',
      name: 'Can you claim both PTC and ITC on the same project?',
      acceptedAnswer: { '@type': 'Answer', text: 'No. The ITC and PTC are mutually exclusive for the same energy property. Taxpayers must elect one or the other. The decision should be made based on which provides greater value given the project\'s cost, expected production, and capacity factor.' },
    },
    {
      '@type': 'Question',
      name: 'Is the PTC available for solar projects?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. The IRA made solar eligible for the PTC for the first time, beginning with projects that start construction after 2022. Previously, solar could only use the ITC. This change gives solar developers the option to choose the credit structure that maximizes their project value.' },
    },
    {
      '@type': 'Question',
      name: 'How long does the PTC last?',
      acceptedAnswer: { '@type': 'Answer', text: 'The PTC is earned for 10 years from the date the facility is placed in service. The credit rate is locked at the rate in effect during the year construction begins and is adjusted for inflation annually during the 10-year production period.' },
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
    { '@type': 'ListItem', position: 4, name: 'PTC', item: 'https://incentedge.com/incentives/federal/ptc' },
  ],
};

const eligibleTechnologies = [
  { tech: 'Wind (onshore)', ptcRate: '2.75¢/kWh', notes: 'Most common PTC technology' },
  { tech: 'Offshore Wind', ptcRate: '2.75¢/kWh', notes: 'High capacity factor; often PTC-optimal' },
  { tech: 'Solar PV', ptcRate: '2.75¢/kWh', notes: 'IRA made solar PTC-eligible for first time' },
  { tech: 'Geothermal', ptcRate: '2.75¢/kWh', notes: 'High capacity factor; PTC-favorable' },
  { tech: 'Run-of-River Hydro', ptcRate: '2.75¢/kWh', notes: 'Incremental hydropower production' },
  { tech: 'Marine/Tidal', ptcRate: '2.75¢/kWh', notes: 'Wave and tidal energy systems' },
  { tech: 'Landfill Gas', ptcRate: '2.75¢/kWh', notes: 'Electricity from gas recovery' },
  { tech: 'Municipal Solid Waste', ptcRate: '2.75¢/kWh', notes: 'Qualifying waste-to-energy facilities' },
];

const faqs = [
  { q: 'What is the PTC rate for wind in 2024?', a: 'The PTC rate for wind and other qualifying technologies is 2.75¢/kWh for 2024, adjusted for inflation annually. Projects without prevailing wage compliance receive only 0.3¢/kWh. The 10-year credit period begins when the facility is placed in service.' },
  { q: 'What is the difference between Section 45 and Section 45Y?', a: 'Section 45 is the legacy PTC that lists specific qualifying technologies (wind, solar, geothermal, etc.) for projects beginning construction through 2024. Section 45Y is the new technology-neutral Clean Electricity Production Credit that applies from 2025 forward for facilities with zero or net-negative greenhouse gas emissions.' },
  { q: 'Can you claim both PTC and ITC on the same project?', a: "No. The ITC and PTC are mutually exclusive for the same energy property. Taxpayers must elect one or the other. The decision should be made based on which provides greater value given the project's cost, expected production, and capacity factor." },
  { q: 'Is the PTC available for solar projects?', a: 'Yes. The IRA made solar eligible for the PTC for the first time, beginning with projects that start construction after 2022. Previously, solar could only use the ITC. This change gives solar developers the option to choose the credit structure that maximizes their project value.' },
  { q: 'How long does the PTC last?', a: 'The PTC is earned for 10 years from the date the facility is placed in service. The credit rate is locked at the rate in effect during the year construction begins and is adjusted for inflation annually during the 10-year production period.' },
];

export default function PTCPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <IncentiveHeader
        breadcrumbs={[
          { label: 'Incentives', href: '/incentives' },
          { label: 'Federal Credits', href: '/incentives/federal' },
          { label: 'PTC' },
        ]}
      />

      <main className="flex-1">
        <section className="max-w-[900px] mx-auto px-6 pt-16 pb-12 md:pt-20">
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-flex items-center rounded-md px-3 py-1.5 text-sm font-bold font-mono bg-deep-900 text-white">
              §45 / §45Y
            </span>
            <span className="text-[12px] text-deep-500 uppercase tracking-wider font-medium">Federal Tax Credit — Transferable</span>
          </div>
          <h1 className="font-sora text-4xl md:text-[46px] font-bold tracking-tight text-deep-900 leading-[1.1] mb-5">
            Production Tax Credit (PTC) for Clean Energy
          </h1>
          <p className="text-lg text-deep-500 mb-8 leading-relaxed">
            The Production Tax Credit pays 2.75¢ per kilowatt-hour of clean electricity generated
            over a 10-year period. For high-capacity-factor projects like wind and geothermal,
            the PTC can significantly outperform the ITC over the credit window.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/signup" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-teal-600 text-white text-[14px] font-semibold hover:bg-teal-700 transition-colors">
              Model PTC vs ITC for My Project
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/incentives/federal/itc" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg border border-deep-200 text-deep-700 text-[14px] font-semibold hover:bg-deep-50 transition-colors">
              Compare with ITC
            </Link>
          </div>
        </section>

        <section className="border-y border-deep-100 bg-deep-50/50">
          <div className="max-w-[900px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-deep-100">
            {[
              { label: 'Credit Rate', value: '2.75¢/kWh' },
              { label: 'Credit Period', value: '10 Years' },
              { label: 'Without PW', value: '0.3¢/kWh' },
              { label: 'Adjusted', value: 'Annually (CPI)' },
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
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-5">How the PTC Works</h2>
            <p className="text-deep-600 leading-relaxed mb-4">
              The Production Tax Credit is an output-based credit — you earn it only when your
              facility actually generates electricity. At 2.75¢/kWh (2024 rate, adjusted annually
              for inflation), a 100 MW wind farm operating at a 35% capacity factor generates
              roughly $8.4 million in annual PTC value.
            </p>
            <p className="text-deep-600 leading-relaxed mb-4">
              The PTC is earned for 10 years from the date the facility is placed in service.
              The credit rate in effect at the time construction begins is locked in, providing
              long-term financial certainty even if statutory rates change.
            </p>
            <p className="text-deep-600 leading-relaxed">
              Like the ITC, the IRA made the PTC transferable and available as direct pay for
              tax-exempt entities, dramatically expanding who can benefit from clean energy credits.
            </p>
          </section>

          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-5">Eligible Technologies</h2>
            <div className="overflow-x-auto rounded-xl border border-deep-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-deep-50 border-b border-deep-100">
                    <th className="px-5 py-3.5 text-left font-semibold text-deep-700">Technology</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-deep-700">PTC Rate</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-deep-700 hidden md:table-cell">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-deep-100">
                  {eligibleTechnologies.map((row) => (
                    <tr key={row.tech} className="hover:bg-deep-50/50">
                      <td className="px-5 py-4 font-medium text-deep-900">{row.tech}</td>
                      <td className="px-5 py-4 font-mono font-bold text-teal-600">{row.ptcRate}</td>
                      <td className="px-5 py-4 text-deep-600 hidden md:table-cell">{row.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-5">ITC vs PTC — Comparison</h2>
            <p className="text-deep-600 mb-6 leading-relaxed">
              The choice between ITC and PTC often depends on project type. Wind projects at high
              capacity factors typically favor PTC. Solar projects at lower capacity factors may
              favor the ITC. IncentEdge models both automatically.
            </p>
            <div className="overflow-x-auto rounded-xl border border-deep-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-deep-50 border-b border-deep-100">
                    <th className="px-5 py-3.5 text-left font-semibold text-deep-700">Factor</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-deep-700">ITC</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-deep-700">PTC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-deep-100 text-deep-700">
                  {[
                    { factor: 'Credit Basis', itc: '% of capital cost', ptc: '¢/kWh produced' },
                    { factor: 'Credit Timing', itc: 'Year 1 (upfront)', ptc: 'Years 1–10 (ongoing)' },
                    { factor: 'Best for wind (35%+ CF)', itc: 'Lower value', ptc: 'Higher value typically' },
                    { factor: 'Best for solar (20–25% CF)', itc: 'Often higher value', ptc: 'May be lower value' },
                    { factor: 'Risk', itc: 'Lower (one-time, certain)', ptc: 'Higher (production-dependent)' },
                    { factor: 'Bonus adders', itc: 'Energy community, domestic content', ptc: 'Same adders available' },
                  ].map((row) => (
                    <tr key={row.factor} className="hover:bg-deep-50/50">
                      <td className="px-5 py-4 font-medium">{row.factor}</td>
                      <td className="px-5 py-4">{row.itc}</td>
                      <td className="px-5 py-4">{row.ptc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="py-14 border-b border-deep-100">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-5">Transferability &amp; Direct Pay</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {[
                {
                  title: 'Credit Transfer (Sale)',
                  items: ['Sell credits to unrelated buyers for cash', 'For-profit taxpayers only', 'Sale must occur in credit year', 'Market rate: ~90–95 cents per dollar'],
                },
                {
                  title: 'Direct Pay Election',
                  items: ['Cash payment from IRS in lieu of credit', 'Available to nonprofits, gov, tribal entities', 'For-profit entities: limited direct pay available', 'Election made at tax filing'],
                },
              ].map((box) => (
                <div key={box.title} className="rounded-xl border border-deep-100 p-6">
                  <h3 className="font-sora font-semibold text-deep-900 mb-3">{box.title}</h3>
                  <ul className="space-y-2">
                    {box.items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-deep-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" /> {item}
                      </li>
                    ))}
                  </ul>
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
              headline="Find Out if PTC or ITC Maximizes Your Project Value"
              sub="IncentEdge models your project's exact economics using real production estimates, current credit rates, and all applicable bonus adders to find the optimal credit election."
            />
          </section>
        </div>
      </main>

      <IncentiveFooter />
    </div>
  );
}
