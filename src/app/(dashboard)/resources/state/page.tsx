'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  ExternalLink,
  ArrowRight,
  MapPin,
  DollarSign,
  FileText,
  Banknote,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ---------------------------------------------------------------------------
// All 50 States
// ---------------------------------------------------------------------------

const US_STATES = [
  { value: 'AL', label: 'Alabama' }, { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' }, { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' }, { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' }, { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' }, { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' }, { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' }, { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' }, { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' }, { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' }, { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' }, { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' }, { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' }, { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' }, { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' }, { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' }, { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' }, { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' }, { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' }, { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' }, { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' }, { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' }, { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' }, { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' }, { value: 'WY', label: 'Wyoming' },
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StateProgram {
  id: string;
  name: string;
  type: 'Tax Credit' | 'Grant' | 'Loan' | 'Rebate';
  amount: string;
  agency: string;
  description: string;
}

interface StateData {
  name: string;
  totalPrograms: number;
  taxCredits: number;
  grants: number;
  loans: number;
  rebates: number;
  info: string;
  programs: StateProgram[];
}

// ---------------------------------------------------------------------------
// Mock State Data
// ---------------------------------------------------------------------------

const STATE_DATA: Record<string, StateData> = {
  NY: {
    name: 'New York',
    totalPrograms: 48,
    taxCredits: 18,
    grants: 16,
    loans: 8,
    rebates: 6,
    info: 'New York leads the nation in affordable housing investment with $25B committed over 5 years.',
    programs: [
      { id: 'ny-421a', name: 'Affordable New York (421-a)', type: 'Tax Credit', amount: '$1M – $25M', agency: 'NYC HPD', description: 'Real property tax exemption for multifamily residential construction with affordable units in NYC.' },
      { id: 'ny-htf', name: 'NYS Housing Trust Fund', type: 'Grant', amount: '$100K – $2M', agency: 'DHCR', description: 'State grants for construction or rehabilitation of affordable housing for low-income New Yorkers.' },
      { id: 'ny-lihtc', name: 'NY State LIHTC Supplement', type: 'Tax Credit', amount: '$300K – $5M', agency: 'HFA / DHCR', description: 'Additional state credit layered with federal LIHTC for qualified affordable housing projects.' },
      { id: 'ny-mwbe', name: 'M/WBE Construction Incentive', type: 'Grant', amount: '$50K – $500K', agency: 'DASNY', description: 'Grant incentive for projects meeting M/WBE participation thresholds on state-funded construction.' },
      { id: 'ny-arpa', name: 'NY ARPA Housing Program', type: 'Grant', amount: '$500K – $10M', agency: 'HCR', description: 'Federal ARPA funds allocated by New York for affordable housing production and preservation.' },
      { id: 'ny-nyserda', name: 'NYSERDA Multifamily Retrofit', type: 'Rebate', amount: '$5K – $200K', agency: 'NYSERDA', description: 'Rebates and incentives for energy efficiency improvements in multifamily buildings.' },
    ],
  },
  CA: {
    name: 'California',
    totalPrograms: 62,
    taxCredits: 22,
    grants: 24,
    loans: 12,
    rebates: 4,
    info: 'California allocates over $10B annually to housing through HCD, CTCAC, and local bond measures.',
    programs: [
      { id: 'ca-ctcac', name: 'CA LIHTC (CTCAC)', type: 'Tax Credit', amount: '$500K – $10M', agency: 'CTCAC', description: 'California state supplement to federal LIHTC for affordable housing in high-cost markets.' },
      { id: 'ca-mhp', name: 'Multifamily Housing Program (MHP)', type: 'Loan', amount: '$500K – $7M', agency: 'HCD', description: 'Deferred-payment loans for new construction, rehabilitation, or conversion of affordable rental housing.' },
      { id: 'ca-infill', name: 'Infill Infrastructure Grant', type: 'Grant', amount: '$500K – $7M', agency: 'HCD', description: 'Grants for infrastructure improvements supporting infill housing and transit-oriented development.' },
      { id: 'ca-ahvlp', name: 'Affordable Housing & Sustainable Communities', type: 'Grant', amount: '$2M – $20M', agency: 'HCD / SGC', description: 'Cap-and-trade funded grants for affordable housing and sustainable land use near transit.' },
      { id: 'ca-homekey', name: 'Homekey Program', type: 'Grant', amount: '$1M – $30M', agency: 'HCD', description: 'Grants for rapid acquisition and conversion of existing buildings into permanent supportive housing.' },
      { id: 'ca-calhome', name: 'CalHOME Program', type: 'Grant', amount: '$100K – $2M', agency: 'HCD', description: 'Grants and loans for homeownership, homebuyer assistance, and owner-occupied rehabilitation.' },
    ],
  },
  TX: {
    name: 'Texas',
    totalPrograms: 34,
    taxCredits: 12,
    grants: 14,
    loans: 6,
    rebates: 2,
    info: 'Texas allocates LIHTC, HOME, and CDBG through TDHCA with a competitive QAP process.',
    programs: [
      { id: 'tx-lihtc', name: 'Texas LIHTC Program', type: 'Tax Credit', amount: '$300K – $5M', agency: 'TDHCA', description: 'Competitive 9% and non-competitive 4% LIHTC allocation by Texas DHCA under annual QAP.' },
      { id: 'tx-home', name: 'Texas HOME Program', type: 'Grant', amount: '$50K – $1.5M', agency: 'TDHCA', description: 'Federal HOME funds for affordable housing development, rehabilitation, and homebuyer assistance.' },
      { id: 'tx-nsp', name: 'Neighborhood Stabilization Program', type: 'Grant', amount: '$100K – $2M', agency: 'TDHCA / Local', description: 'Funds for purchase and rehabilitation of foreclosed or abandoned properties.' },
      { id: 'tx-mf-direct', name: 'TDHCA Multifamily Direct Loan', type: 'Loan', amount: '$500K – $3M', agency: 'TDHCA', description: 'Below-market rate loans for affordable multifamily rental housing development.' },
      { id: 'tx-tcap', name: 'Tax Credit Assistance Program (TCAP)', type: 'Grant', amount: '$500K – $5M', agency: 'TDHCA', description: 'Grants to fill financing gaps in LIHTC projects experiencing equity or debt shortfalls.' },
    ],
  },
  FL: {
    name: 'Florida',
    totalPrograms: 29,
    taxCredits: 10,
    grants: 11,
    loans: 6,
    rebates: 2,
    info: 'Florida Housing Finance Corporation manages state housing resources via SAIL, SURTAX, and Catalyst programs.',
    programs: [
      { id: 'fl-sail', name: 'SAIL Program', type: 'Loan', amount: '$500K – $4M', agency: 'FL Housing', description: 'State Apartment Incentive Loans at below-market rates for affordable rental housing serving very low-income residents.' },
      { id: 'fl-surtax', name: 'Documentary Stamp Surtax', type: 'Grant', amount: '$100K – $3M', agency: 'County / FL Housing', description: 'County-collected documentary stamp surtax revenues distributed for affordable housing by local governments.' },
      { id: 'fl-cat', name: 'Catalyst Multifamily Lending', type: 'Loan', amount: '$500K – $5M', agency: 'FL Housing', description: 'First mortgage construction and permanent financing for affordable multifamily rental housing.' },
      { id: 'fl-home', name: 'Florida HOME Program', type: 'Grant', amount: '$50K – $1M', agency: 'FL Housing', description: 'State administration of federal HOME funds for affordable rental and homeownership programs.' },
      { id: 'fl-ship', name: 'State Housing Initiatives Partnership (SHIP)', type: 'Grant', amount: '$25K – $250K', agency: 'County / FL Housing', description: 'SHIP funds distributed to local governments for homebuyer assistance and affordable housing programs.' },
    ],
  },
  IL: {
    name: 'Illinois',
    totalPrograms: 38,
    taxCredits: 14,
    grants: 15,
    loans: 7,
    rebates: 2,
    info: 'IHDA coordinates Illinois housing finance with competitive LIHTC, first mortgage, and subordinate loan products.',
    programs: [
      { id: 'il-lihtc', name: 'Illinois LIHTC Program', type: 'Tax Credit', amount: '$400K – $7M', agency: 'IHDA', description: 'Competitive 9% and 4% LIHTC allocation for affordable rental housing development in Illinois.' },
      { id: 'il-mf-loan', name: 'IHDA Multifamily Loan Program', type: 'Loan', amount: '$500K – $6M', agency: 'IHDA', description: 'First mortgage and subordinate financing for affordable multifamily housing combined with LIHTC.' },
      { id: 'il-home', name: 'Illinois HOME Program', type: 'Grant', amount: '$100K – $1.5M', agency: 'IHDA', description: 'Federal HOME funds administered by IHDA for affordable housing development and rehabilitation.' },
      { id: 'il-ira', name: 'Illinois Rental Assistance Program', type: 'Grant', amount: '$50K – $500K', agency: 'IDHS', description: 'Emergency and transitional rental assistance for very low-income Illinois residents.' },
      { id: 'il-cdbg', name: 'Illinois CDBG Program', type: 'Grant', amount: '$100K – $2M', agency: 'DCEO', description: 'State administration of CDBG for community development and affordable housing in non-entitlement communities.' },
      { id: 'il-tax-credit', name: 'Illinois Historic Preservation Tax Credit', type: 'Tax Credit', amount: 'Up to $3M', agency: 'DCMS / IHPA', description: '25% state credit for certified rehabilitation of historic structures listed on Illinois Register or National Register.' },
    ],
  },
  CO: {
    name: 'Colorado',
    totalPrograms: 26,
    taxCredits: 10,
    grants: 9,
    loans: 5,
    rebates: 2,
    info: 'CHFA leads Colorado housing finance with LIHTC, loans, and homeownership programs.',
    programs: [
      { id: 'co-lihtc', name: 'Colorado LIHTC (CHFA)', type: 'Tax Credit', amount: '$400K – $6M', agency: 'CHFA', description: 'Competitive 9% and 4% LIHTC allocation for affordable rental housing development in Colorado.' },
      { id: 'co-contribution', name: 'LIHTC Contribution Tax Credit', type: 'Tax Credit', amount: '$100K – $1M', agency: 'CHFA', description: '25% Colorado income tax credit for private donations to CHFA-approved affordable housing projects.' },
      { id: 'co-mf', name: 'CHFA Multifamily Financing', type: 'Loan', amount: '$500K – $5M', agency: 'CHFA', description: 'Construction and permanent financing for affordable multifamily housing at below-market rates.' },
      { id: 'co-home', name: 'Colorado HOME Program', type: 'Grant', amount: '$100K – $1M', agency: 'DOLA', description: 'Federal HOME funds administered by DOLA for affordable housing development and homebuyer assistance.' },
    ],
  },
  WA: {
    name: 'Washington',
    totalPrograms: 31,
    taxCredits: 11,
    grants: 13,
    loans: 6,
    rebates: 1,
    info: 'Washington State combines HTF, LIHTC, and a robust community preservation investment program.',
    programs: [
      { id: 'wa-htf', name: 'Washington Housing Trust Fund', type: 'Grant', amount: '$250K – $3M', agency: 'Commerce WA', description: 'Competitive grants for affordable housing development, preservation, and operations in Washington.' },
      { id: 'wa-lihtc', name: 'Washington LIHTC Program', type: 'Tax Credit', amount: '$400K – $6M', agency: 'WSHFC', description: 'Annual competitive 9% and 4% LIHTC allocation managed by the Washington State HFC.' },
      { id: 'wa-mf', name: 'WSHFC Multifamily Bond Financing', type: 'Loan', amount: '$1M – $20M', agency: 'WSHFC', description: 'Tax-exempt bond financing for affordable multifamily rental housing development.' },
      { id: 'wa-apple', name: 'Apple Health & Homes', type: 'Grant', amount: '$500K – $5M', agency: 'HCA / Commerce WA', description: 'Integrated grants for permanent supportive housing serving adults exiting homelessness or institutions.' },
    ],
  },
  MA: {
    name: 'Massachusetts',
    totalPrograms: 35,
    taxCredits: 14,
    grants: 12,
    loans: 7,
    rebates: 2,
    info: 'MassHousing, DHCD, and the Community Preservation Act fund robust housing programs in Massachusetts.',
    programs: [
      { id: 'ma-lihtc', name: 'Massachusetts LIHTC', type: 'Tax Credit', amount: '$500K – $8M', agency: 'DHCD / MassHousing', description: 'Competitive state and federal LIHTC allocation for affordable rental housing development in Massachusetts.' },
      { id: 'ma-htf', name: 'Affordable Housing Trust Fund', type: 'Grant', amount: '$500K – $5M', agency: 'DHCD', description: 'State grants for the creation or preservation of affordable housing for income-eligible households.' },
      { id: 'ma-cpa', name: 'Community Preservation Act Funds', type: 'Grant', amount: '$100K – $2M', agency: 'CPC / Local', description: 'Local property tax surcharge funds for community housing, open space, historic preservation.' },
      { id: 'ma-mh', name: 'MassHousing Rental Financing', type: 'Loan', amount: '$1M – $15M', agency: 'MassHousing', description: 'Competitive low-interest financing for affordable rental housing development and preservation.' },
      { id: 'ma-arpa', name: 'MA ARPA Housing Stabilization Fund', type: 'Grant', amount: '$500K – $10M', agency: 'DHCD', description: 'Federal ARPA allocations for affordable housing production and housing stabilization in Massachusetts.' },
    ],
  },
  AZ: {
    name: 'Arizona',
    totalPrograms: 22,
    taxCredits: 8,
    grants: 9,
    loans: 4,
    rebates: 1,
    info: 'ADOH manages Arizona housing resources with LIHTC, HOME, and tribal housing initiatives.',
    programs: [
      { id: 'az-lihtc', name: 'Arizona LIHTC (ADOH)', type: 'Tax Credit', amount: '$300K – $4M', agency: 'ADOH', description: 'Competitive 9% and 4% LIHTC for affordable rental housing in Arizona, prioritizing rural and tribal areas.' },
      { id: 'az-home', name: 'Arizona HOME Program', type: 'Grant', amount: '$50K – $1M', agency: 'ADOH', description: 'Federal HOME funds for affordable housing development and rehabilitation statewide.' },
      { id: 'az-tribal', name: 'Tribal Housing Grant', type: 'Grant', amount: '$100K – $2M', agency: 'ADOH', description: 'Arizona grants supporting housing development on tribal lands and for Native American communities.' },
    ],
  },
  GA: {
    name: 'Georgia',
    totalPrograms: 24,
    taxCredits: 9,
    grants: 9,
    loans: 5,
    rebates: 1,
    info: 'DCA Georgia manages LIHTC, HOME, and CDBG-DR programs with strong rural housing focus.',
    programs: [
      { id: 'ga-lihtc', name: 'Georgia LIHTC (DCA)', type: 'Tax Credit', amount: '$300K – $5M', agency: 'DCA Georgia', description: 'Competitive 9% and 4% LIHTC for affordable housing in Georgia under the annual QAP.' },
      { id: 'ga-home', name: 'Georgia HOME Program', type: 'Grant', amount: '$50K – $1M', agency: 'DCA Georgia', description: 'Federal HOME funds for affordable housing development and homeownership programs across Georgia.' },
      { id: 'ga-rural', name: 'Rural Workforce Housing Initiative', type: 'Grant', amount: '$100K – $1.5M', agency: 'DCA Georgia', description: 'Targeted grants for workforce housing development in rural Georgia communities facing housing shortages.' },
      { id: 'ga-cdbg', name: 'Georgia CDBG Program', type: 'Grant', amount: '$100K – $2M', agency: 'DCA Georgia', description: 'CDBG funds for housing, infrastructure, and community development in non-entitlement Georgia communities.' },
    ],
  },
};

const POPULAR_STATES = ['NY', 'CA', 'TX', 'FL', 'IL', 'CO', 'WA', 'MA'];

const TYPE_COLORS: Record<string, string> = {
  'Tax Credit': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Grant: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Loan: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  Rebate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function StateProgramsPage() {
  const [selectedState, setSelectedState] = useState<string>('');

  const stateData = selectedState ? STATE_DATA[selectedState] : null;
  const stateName = selectedState
    ? US_STATES.find((s) => s.value === selectedState)?.label ?? selectedState
    : '';

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-teal-700">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-sora tracking-tight text-slate-900 dark:text-white">
              State Programs
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Browse incentive programs by state
            </p>
          </div>
        </div>
      </div>

      {/* STATE SELECTOR */}
      <Card className="card-v41">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Select a state</span>
            </div>
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Choose a state..." />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map((state) => (
                  <SelectItem key={state.value} value={state.value}>
                    {state.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* SELECTED STATE VIEW */}
      {selectedState && stateData ? (
        <div className="space-y-4">
          {/* State Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-sora font-bold text-slate-900 dark:text-white">
                {stateData.name}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {stateData.info}
              </p>
            </div>
            <Badge className="bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 self-start sm:self-auto">
              <span className="font-mono font-semibold">{stateData.totalPrograms}</span>&nbsp;Programs
            </Badge>
          </div>

          {/* State Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Tax Credits', value: stateData.taxCredits, icon: DollarSign, color: 'text-emerald-600 dark:text-emerald-400' },
              { label: 'Grants', value: stateData.grants, icon: FileText, color: 'text-blue-600 dark:text-blue-400' },
              { label: 'Loans', value: stateData.loans, icon: Banknote, color: 'text-violet-600 dark:text-violet-400' },
              { label: 'Rebates', value: stateData.rebates, icon: BarChart3, color: 'text-amber-600 dark:text-amber-400' },
            ].map((stat) => (
              <Card key={stat.label} className="card-v41">
                <CardContent className="p-3 flex items-center gap-2.5">
                  <stat.icon className={`h-4 w-4 shrink-0 ${stat.color}`} />
                  <div>
                    <p className={`text-lg font-mono font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Program List */}
          <div className="space-y-3">
            {stateData.programs.map((program) => (
              <Card key={program.id} className="card-v41">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                          {program.name}
                        </h3>
                        <Badge className={`text-xs px-2 py-0 ${TYPE_COLORS[program.type]}`}>
                          {program.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{program.agency}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                        {program.description}
                      </p>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end gap-3 shrink-0">
                      <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm whitespace-nowrap">
                        {program.amount}
                      </p>
                      <Link href={`/discover?q=${encodeURIComponent(program.name)}&state=${selectedState}`}>
                        <Button size="sm" variant="outline" className="text-xs">
                          View Details
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="pt-2 text-center">
            <Link href={`/discover?state=${selectedState}`}>
              <Button className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white border-0">
                See All {stateData.name} Programs in Discover
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      ) : selectedState ? (
        /* State selected but no mock data */
        <Card className="card-v41">
          <CardContent className="py-14 flex flex-col items-center gap-4 text-center">
            <div className="h-14 w-14 rounded-full bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center">
              <Building2 className="h-7 w-7 text-teal-500" />
            </div>
            <div>
              <p className="font-semibold text-slate-700 dark:text-slate-300 font-sora">
                Programs coming soon for {stateName}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                We&apos;re curating state-specific programs. Use Discover to search all 30,007 programs now.
              </p>
            </div>
            <Link href={`/discover?state=${selectedState}`}>
              <Button variant="outline">
                Search {stateName} in Discover
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        /* Default: prompt to select */
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">
              Popular states — quick select:
            </p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_STATES.map((code) => {
                const state = US_STATES.find((s) => s.value === code);
                return (
                  <button
                    key={code}
                    onClick={() => setSelectedState(code)}
                    className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-teal-400 dark:hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20 text-sm font-medium text-slate-700 dark:text-slate-300 transition-all"
                  >
                    {state?.label}
                  </button>
                );
              })}
            </div>
          </div>

          <Card className="card-v41">
            <CardContent className="py-14 flex flex-col items-center gap-4 text-center">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="font-semibold text-slate-700 dark:text-slate-300 font-sora text-lg">
                  Select a state to explore programs
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-md">
                  Browse incentive programs available in your state — tax credits, grants, loans, and rebates from state housing finance agencies and local governments.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
