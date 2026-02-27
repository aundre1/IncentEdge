'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Landmark,
  DollarSign,
  Globe,
  Zap,
  ArrowRight,
  Search,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FederalProgram {
  id: string;
  agency: 'IRS' | 'HUD' | 'USDA' | 'DOE' | 'EPA' | 'Other';
  name: string;
  type: string;
  amountLabel: string;
  description: string;
  tags: string[];
}

// ---------------------------------------------------------------------------
// IRA Featured Programs
// ---------------------------------------------------------------------------

const IRA_FEATURED = [
  {
    section: '§48',
    name: 'Investment Tax Credit (ITC)',
    baseRate: '30%',
    maxRate: '50% with adders',
    technologies: ['Solar PV', 'Battery Storage', 'Wind', 'Geothermal', 'Fuel Cells'],
    requirements: ['Prevailing Wage', 'Apprenticeship', 'Domestic Content (bonus)', 'Energy Community (bonus)'],
    color: 'from-teal-600 to-teal-800',
  },
  {
    section: '§45L',
    name: 'Energy Efficient Home Credit',
    baseRate: '$2,500/unit',
    maxRate: '$5,000 Zero Energy Ready',
    technologies: ['New Construction', 'Substantial Reconstruction', 'Single/Multi-family'],
    requirements: ['Energy Star Certification', 'Zero Energy Ready (for max)', 'Prevailing Wage'],
    color: 'from-emerald-600 to-emerald-800',
  },
  {
    section: '§179D',
    name: 'Commercial Buildings Deduction',
    baseRate: '$1.00/sq ft',
    maxRate: '$5.00/sq ft',
    technologies: ['Lighting', 'HVAC', 'Building Envelope', 'Commercial/Multifamily 4+ stories'],
    requirements: ['25% Energy Reduction vs. ASHRAE', 'Prevailing Wage (for max)', 'Qualified Certifier'],
    color: 'from-blue-600 to-blue-800',
  },
  {
    section: '§45',
    name: 'Production Tax Credit (PTC)',
    baseRate: '0.3¢/kWh',
    maxRate: '2.75¢/kWh',
    technologies: ['Wind', 'Solar', 'Geothermal', 'Biomass', 'Hydropower'],
    requirements: ['Prevailing Wage', 'Apprenticeship', 'Domestic Content (bonus)', 'Energy Community (bonus)'],
    color: 'from-violet-600 to-violet-800',
  },
  {
    section: '§6417',
    name: 'Direct Pay (Elective Payment)',
    baseRate: '100% of credit',
    maxRate: '100% cash equivalent',
    technologies: ['All IRA Clean Energy Credits', 'Tax-exempt entities', 'State/local governments'],
    requirements: ['Tax-Exempt Entity', 'Annual Election', 'Pre-filing Registration with IRS', 'Form 3800'],
    color: 'from-amber-600 to-amber-800',
  },
  {
    section: '§6418',
    name: 'Credit Transfer (Transferability)',
    baseRate: 'Market rate (85-95¢)',
    maxRate: '$1.00 per credit $',
    technologies: ['All IRA Transferable Credits', 'Tax equity investors', 'Credit buyers'],
    requirements: ['Election on Tax Return', 'Single Annual Transfer', 'Cash Consideration Only', 'Pre-filing Registration'],
    color: 'from-rose-600 to-rose-800',
  },
];

// ---------------------------------------------------------------------------
// All Federal Programs (searchable list)
// ---------------------------------------------------------------------------

const FEDERAL_PROGRAMS: FederalProgram[] = [
  { id: 'lihtc-9', agency: 'IRS', name: 'LIHTC 9% Competitive', type: 'Tax Credit', amountLabel: '$500K – $15M', description: 'Competitive 9% Low-Income Housing Tax Credit for new construction or substantial rehab of affordable rental housing.', tags: ['Affordable Housing', 'Rental'] },
  { id: 'lihtc-4', agency: 'IRS', name: 'LIHTC 4% Non-Competitive', type: 'Tax Credit', amountLabel: '$200K – $8M', description: 'Non-competitive 4% LIHTC paired with Private Activity Bonds for acquisition/rehab or new construction.', tags: ['Affordable Housing', 'Bonds'] },
  { id: 'nmtc', agency: 'IRS', name: 'New Markets Tax Credit', type: 'Tax Credit', amountLabel: '$1M – $65M', description: 'Credits equal to 39% of qualified equity investment in low-income communities, claimed over 7 years.', tags: ['Community Development', 'Low-Income'] },
  { id: 'htc', agency: 'IRS', name: 'Historic Tax Credit (HTC)', type: 'Tax Credit', amountLabel: '20% of qualified rehab expenses', description: '20% federal income tax credit for certified rehabilitation of historic buildings listed on the National Register.', tags: ['Historic', 'Rehab'] },
  { id: 'oz', agency: 'IRS', name: 'Opportunity Zone Investment', type: 'Tax Credit', amountLabel: 'Capital gains deferral', description: 'Tax incentive for investing realized capital gains in Qualified Opportunity Funds targeting designated low-income communities.', tags: ['Investment', 'Capital Gains'] },
  { id: 'cdbg', agency: 'HUD', name: 'Community Development Block Grant (CDBG)', type: 'Grant', amountLabel: '$100K – $5M', description: 'Flexible grants for community development activities in low- and moderate-income areas.', tags: ['Community', 'Flexible'] },
  { id: 'home', agency: 'HUD', name: 'HOME Investment Partnerships', type: 'Grant', amountLabel: '$50K – $1M', description: 'Funds affordable housing activities including homebuyer assistance and rental housing development.', tags: ['Affordable Housing', 'Homebuyer'] },
  { id: 'choice', agency: 'HUD', name: 'Choice Neighborhoods Initiative', type: 'Grant', amountLabel: '$5M – $30M', description: 'Competitive grants for comprehensive neighborhood transformation, public housing revitalization, and community development.', tags: ['Neighborhood', 'Transformation'] },
  { id: 'sec-108', agency: 'HUD', name: 'Section 108 Loan Guarantee', type: 'Loan', amountLabel: '$1M – $35M', description: 'Federal loan guarantees allowing communities to leverage CDBG for large-scale economic development.', tags: ['Economic Development', 'Guarantee'] },
  { id: 'hop', agency: 'HUD', name: 'Housing Opportunities for Persons with AIDS (HOPWA)', type: 'Grant', amountLabel: '$100K – $2M', description: 'Formula and competitive grants for housing assistance for low-income persons with HIV/AIDS.', tags: ['Housing', 'Healthcare'] },
  { id: 'usda-rdlf', agency: 'USDA', name: 'Rural Development Loan Fund', type: 'Loan', amountLabel: '$250K – $10M', description: 'Competitive loans for essential community facilities, housing, and business development in rural areas.', tags: ['Rural', 'Community'] },
  { id: 'usda-grant', agency: 'USDA', name: 'Rural Community Development Initiative', type: 'Grant', amountLabel: '$50K – $500K', description: 'Grants to develop the capacity of nonprofit organizations and public bodies providing housing in rural areas.', tags: ['Rural', 'Capacity Building'] },
  { id: 'usda-538', agency: 'USDA', name: 'Section 538 Rural Rental Housing Guarantee', type: 'Loan', amountLabel: '$500K – $5M', description: 'Loan guarantee for construction or substantial rehab of affordable multifamily rural rental housing.', tags: ['Rural', 'Rental', 'Guarantee'] },
  { id: 'doe-retrofit', agency: 'DOE', name: 'Weatherization Assistance Program', type: 'Grant', amountLabel: 'Varies', description: 'Federal grants to improve energy efficiency of low-income households. Administered through states.', tags: ['Energy', 'Low-Income', 'Retrofit'] },
  { id: 'doe-better', agency: 'DOE', name: 'Better Buildings Challenge', type: 'Grant', amountLabel: '$100K – $2M', description: 'Technical assistance and grants for organizations committing to 20% energy reduction over 10 years.', tags: ['Energy Efficiency', 'Commercial'] },
  { id: 'doe-solar', agency: 'DOE', name: 'Solar Energy Technologies Office Grants', type: 'Grant', amountLabel: '$500K – $10M', description: 'R&D and deployment grants for solar energy technologies. Multiple annual funding announcements.', tags: ['Solar', 'R&D'] },
  { id: 'epa-brownfields', agency: 'EPA', name: 'Brownfields Assessment & Cleanup Grants', type: 'Grant', amountLabel: '$200K – $2M', description: 'EPA grants for environmental assessment and cleanup of contaminated brownfield sites for redevelopment.', tags: ['Brownfields', 'Cleanup'] },
  { id: 'epa-eja', agency: 'EPA', name: 'Environmental Justice Collaborative Problem-Solving', type: 'Grant', amountLabel: '$100K – $1M', description: 'Grants for collaborative approaches to environmental and public health challenges in disadvantaged communities.', tags: ['Environmental Justice', 'Community'] },
  { id: 'cdfi-award', agency: 'Other', name: 'CDFI Fund Awards', type: 'Grant', amountLabel: '$500K – $5M', description: 'Annual competitive awards to certified Community Development Financial Institutions for lending in underserved markets.', tags: ['CDFI', 'Lending'] },
  { id: 'arc', agency: 'Other', name: 'Appalachian Regional Commission Grants', type: 'Grant', amountLabel: '$100K – $3M', description: 'Grants for economic development, infrastructure, workforce training, and housing in Appalachian communities.', tags: ['Regional', 'Economic Development'] },
];

const AGENCY_TABS = ['All', 'IRS', 'HUD', 'USDA', 'DOE', 'EPA', 'Other'] as const;
type AgencyTab = typeof AGENCY_TABS[number];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function FederalProgramsPage() {
  const [agencyTab, setAgencyTab] = useState<AgencyTab>('All');
  const [search, setSearch] = useState('');

  const filteredPrograms = FEDERAL_PROGRAMS.filter((p) => {
    const matchAgency = agencyTab === 'All' || p.agency === agencyTab;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q));
    return matchAgency && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-teal-700">
            <Landmark className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-sora tracking-tight text-slate-900 dark:text-white">
              Federal Programs
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              IRA, HUD, USDA, DOE and other federal incentive programs
            </p>
          </div>
        </div>
      </div>

      {/* HERO STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'IRA Authorization', value: '$369B', icon: DollarSign, color: 'text-teal-600 dark:text-teal-400' },
          { label: 'Federal Programs', value: '847', icon: Landmark, color: 'text-blue-600 dark:text-blue-400' },
          { label: 'States Covered', value: '50', icon: Globe, color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Credits Deployed', value: '$2.8B', icon: Zap, color: 'text-violet-600 dark:text-violet-400' },
        ].map((stat) => (
          <Card key={stat.label} className="card-v41">
            <CardContent className="p-4 flex items-center gap-3">
              <stat.icon className={`h-5 w-5 shrink-0 ${stat.color}`} />
              <div>
                <p className={`text-xl font-mono font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* IRA SPOTLIGHT */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-sora font-semibold text-slate-900 dark:text-white">
            IRA Featured Programs
          </h2>
          <Badge className="bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 text-xs">
            Inflation Reduction Act 2022
          </Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {IRA_FEATURED.map((prog) => (
            <Card key={prog.section} className="card-v41 overflow-hidden">
              <div className={`h-1.5 w-full bg-gradient-to-r ${prog.color}`} />
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Badge className={`font-mono text-xs bg-gradient-to-r ${prog.color} text-white border-0 mb-2`}>
                      {prog.section}
                    </Badge>
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm leading-snug">
                      {prog.name}
                    </h3>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Base Rate</span>
                    <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">{prog.baseRate}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Maximum</span>
                    <span className="font-mono font-semibold text-teal-600 dark:text-teal-400">{prog.maxRate}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-medium">Eligible Technologies</p>
                  <div className="flex flex-wrap gap-1">
                    {prog.technologies.slice(0, 3).map((t) => (
                      <span key={t} className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded px-1.5 py-0.5">
                        {t}
                      </span>
                    ))}
                    {prog.technologies.length > 3 && (
                      <span className="text-xs text-slate-400">+{prog.technologies.length - 3} more</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-medium">Key Requirements</p>
                  <ul className="space-y-0.5">
                    {prog.requirements.slice(0, 3).map((r) => (
                      <li key={r} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link href={`/discover?q=${encodeURIComponent(prog.name)}`}>
                  <Button size="sm" className="w-full text-xs bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white border-0">
                    Explore Program
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ALL FEDERAL PROGRAMS LIST */}
      <div>
        <h2 className="text-lg font-sora font-semibold text-slate-900 dark:text-white mb-3">
          All Federal Programs
        </h2>
        <Card className="card-v41">
          <CardContent className="p-4 pb-0">
            <Tabs value={agencyTab} onValueChange={(v) => setAgencyTab(v as AgencyTab)}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                <TabsList className="flex-wrap h-auto gap-1 bg-slate-100 dark:bg-slate-800 p-1">
                  {AGENCY_TABS.map((t) => (
                    <TabsTrigger key={t} value={t} className="text-xs px-3 py-1">
                      {t}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <div className="relative sm:ml-auto sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    className="pl-8 h-8 text-xs"
                    placeholder="Search programs..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              {AGENCY_TABS.map((tab) => (
                <TabsContent key={tab} value={tab} className="mt-0">
                  <div className="space-y-2 pb-4">
                    {filteredPrograms.length === 0 ? (
                      <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
                        No programs found. Try different filters.
                      </p>
                    ) : (
                      filteredPrograms.map((program) => (
                        <div
                          key={program.id}
                          className="flex items-start justify-between gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-teal-300 dark:hover:border-teal-600 transition-colors"
                        >
                          <div className="flex-1 min-w-0 space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge className="text-xs bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 px-2 py-0">
                                {program.agency}
                              </Badge>
                              <span className="font-semibold text-sm text-slate-900 dark:text-white">
                                {program.name}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {program.type}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                              {program.description}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {program.tags.map((tag) => (
                                <span key={tag} className="text-xs bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 rounded px-1.5 py-0.5">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm whitespace-nowrap">
                              {program.amountLabel}
                            </p>
                            <Link href={`/discover?q=${encodeURIComponent(program.name)}`}>
                              <Button size="sm" variant="outline" className="text-xs">
                                View
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
