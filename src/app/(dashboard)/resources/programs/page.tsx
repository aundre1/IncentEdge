'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Search,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  ExternalLink,
  Database,
  CheckCircle2,
  Landmark,
  MapPin,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Program {
  id: string;
  name: string;
  agency: string;
  state: string;
  type: 'Tax Credit' | 'Grant' | 'Loan' | 'Rebate';
  jurisdiction: 'federal' | 'state' | 'local' | 'utility';
  status: 'active' | 'closing' | 'expired';
  amountMin: number;
  amountMax: number;
  deadline?: string;
  description: string;
}

// ---------------------------------------------------------------------------
// Mock Data — 25 realistic programs
// ---------------------------------------------------------------------------

const MOCK_PROGRAMS: Program[] = [
  {
    id: 'sec-48-itc',
    name: 'Section 48 Investment Tax Credit (ITC)',
    agency: 'IRS / U.S. Treasury',
    state: 'Federal',
    type: 'Tax Credit',
    jurisdiction: 'federal',
    status: 'active',
    amountMin: 30000,
    amountMax: 500000000,
    deadline: undefined,
    description: 'A federal tax credit for investment in eligible energy property including solar, wind, and storage systems. Base rate 30%, with bonus adders up to 50%.',
  },
  {
    id: 'sec-45l',
    name: 'Section 45L Energy Efficient Home Credit',
    agency: 'IRS / U.S. Treasury',
    state: 'Federal',
    type: 'Tax Credit',
    jurisdiction: 'federal',
    status: 'active',
    amountMin: 500,
    amountMax: 5000,
    description: 'Credit for construction of energy-efficient new homes or substantial reconstruction. $2,500 per unit meeting Energy Star standards; $5,000 per Zero Energy Ready unit.',
  },
  {
    id: 'sec-179d',
    name: 'Section 179D Commercial Buildings Deduction',
    agency: 'IRS / U.S. Treasury',
    state: 'Federal',
    type: 'Tax Credit',
    jurisdiction: 'federal',
    status: 'active',
    amountMin: 1,
    amountMax: 5,
    description: 'Deduction for energy-efficient commercial and multifamily buildings. Up to $5.00 per sq ft for qualifying properties with prevailing wage compliance.',
  },
  {
    id: 'lihtc-9pct',
    name: 'Low-Income Housing Tax Credit (9%)',
    agency: 'IRS / State HFAs',
    state: 'Federal',
    type: 'Tax Credit',
    jurisdiction: 'federal',
    status: 'active',
    amountMin: 500000,
    amountMax: 15000000,
    description: 'Competitive 9% LIHTC for new construction or substantial rehabilitation of affordable rental housing. Allocated annually by state housing finance agencies.',
  },
  {
    id: 'lihtc-4pct',
    name: 'Low-Income Housing Tax Credit (4%)',
    agency: 'IRS / State HFAs',
    state: 'Federal',
    type: 'Tax Credit',
    jurisdiction: 'federal',
    status: 'active',
    amountMin: 200000,
    amountMax: 8000000,
    description: 'Non-competitive 4% LIHTC paired with Private Activity Bonds. Used for acquisition/rehab or new construction of affordable housing.',
  },
  {
    id: 'nmtc',
    name: 'New Markets Tax Credit (NMTC)',
    agency: 'CDFI Fund / U.S. Treasury',
    state: 'Federal',
    type: 'Tax Credit',
    jurisdiction: 'federal',
    status: 'active',
    amountMin: 1000000,
    amountMax: 65000000,
    description: 'Incentivizes investment in low-income communities. Credit equals 39% of qualified equity investment, claimed over 7 years.',
  },
  {
    id: 'hud-cdbg',
    name: 'Community Development Block Grant (CDBG)',
    agency: 'HUD',
    state: 'Federal',
    type: 'Grant',
    jurisdiction: 'federal',
    status: 'active',
    amountMin: 100000,
    amountMax: 5000000,
    description: 'Flexible federal grant for community development activities — housing, infrastructure, economic development in low- and moderate-income areas.',
  },
  {
    id: 'hud-home',
    name: 'HOME Investment Partnerships Program',
    agency: 'HUD',
    state: 'Federal',
    type: 'Grant',
    jurisdiction: 'federal',
    status: 'active',
    amountMin: 50000,
    amountMax: 1000000,
    description: 'Funds affordable housing activities including homebuyer assistance, rental housing, and rehabilitation for low-income households.',
  },
  {
    id: 'hud-108',
    name: 'HUD Section 108 Loan Guarantee',
    agency: 'HUD',
    state: 'Federal',
    type: 'Loan',
    jurisdiction: 'federal',
    status: 'active',
    amountMin: 1000000,
    amountMax: 35000000,
    description: 'Loan guarantee program that allows communities to leverage CDBG grants for large-scale economic development and housing projects.',
  },
  {
    id: 'usda-rdlf',
    name: 'USDA Rural Development Loan Fund',
    agency: 'USDA Rural Development',
    state: 'Federal',
    type: 'Loan',
    jurisdiction: 'federal',
    status: 'active',
    amountMin: 250000,
    amountMax: 10000000,
    description: 'Competitive loans to finance essential community facilities, housing, and business development in rural areas.',
  },
  {
    id: 'ny-affordable',
    name: '485-x Affordable Neighborhoods Tax Exemption',
    agency: 'NYC HPD',
    state: 'NY',
    type: 'Tax Credit',
    jurisdiction: 'local',
    status: 'active',
    amountMin: 1000000,
    amountMax: 30000000,
    description: 'Active NYC program replacing the expired 421-a. Up to 40-year property tax exemption for new multifamily construction with minimum 25% affordable units. No sunset date. Prevailing wage required for buildings over 100 units.',
  },
  {
    id: 'ny-htf',
    name: 'New York Housing Trust Fund',
    agency: 'DHCR',
    state: 'NY',
    type: 'Grant',
    jurisdiction: 'state',
    status: 'active',
    amountMin: 100000,
    amountMax: 2000000,
    description: 'State grants for construction, rehabilitation, or conversion of affordable housing in New York. Priority for projects serving lowest-income households.',
  },
  {
    id: 'ca-tax-credit',
    name: 'California Low-Income Housing Tax Credit',
    agency: 'CTCAC',
    state: 'CA',
    type: 'Tax Credit',
    jurisdiction: 'state',
    status: 'active',
    amountMin: 500000,
    amountMax: 10000000,
    description: 'California state supplement to federal LIHTC. Provides additional credit dollars for affordable housing construction in high-cost markets.',
  },
  {
    id: 'ca-infill',
    name: 'Infill Infrastructure Grant Program',
    agency: 'HCD California',
    state: 'CA',
    type: 'Grant',
    jurisdiction: 'state',
    status: 'active',
    amountMin: 500000,
    amountMax: 7000000,
    description: 'California grants for infrastructure improvements supporting infill housing development. Reduces costs for transit-oriented and urban infill projects.',
  },
  {
    id: 'tx-hhsc',
    name: 'Texas HOME Program',
    agency: 'TDHCA',
    state: 'TX',
    type: 'Grant',
    jurisdiction: 'state',
    status: 'active',
    amountMin: 50000,
    amountMax: 1500000,
    description: 'Texas allocation of federal HOME funds for affordable housing development, rehabilitation, and homebuyer assistance programs.',
  },
  {
    id: 'tx-lihtc',
    name: 'Texas LIHTC Program',
    agency: 'TDHCA',
    state: 'TX',
    type: 'Tax Credit',
    jurisdiction: 'state',
    status: 'active',
    amountMin: 300000,
    amountMax: 5000000,
    description: 'Texas allocation of 9% and 4% LIHTC. Competitive application through Texas Department of Housing and Community Affairs QAP.',
  },
  {
    id: 'fl-surtax',
    name: 'Florida Affordable Housing Surtax',
    agency: 'FL Housing Finance Corp',
    state: 'FL',
    type: 'Grant',
    jurisdiction: 'state',
    status: 'active',
    amountMin: 100000,
    amountMax: 3000000,
    description: 'Documentary stamp surtax revenues used to fund affordable housing in Florida counties. Administered locally with varying priorities by county.',
  },
  {
    id: 'fl-sail',
    name: 'Florida SAIL Program',
    agency: 'FL Housing Finance Corp',
    state: 'FL',
    type: 'Loan',
    jurisdiction: 'state',
    status: 'active',
    amountMin: 500000,
    amountMax: 4000000,
    description: 'State Apartment Incentive Loan (SAIL) for affordable rental housing development. Below-market interest rate loans for developments serving very low-income households.',
  },
  {
    id: 'il-multifamily',
    name: 'Illinois Multifamily Finance Program',
    agency: 'IHDA',
    state: 'IL',
    type: 'Loan',
    jurisdiction: 'state',
    status: 'active',
    amountMin: 500000,
    amountMax: 6000000,
    description: 'IHDA financing for affordable multifamily rental housing. Combines LIHTC with below-market first mortgage and subordinate loan products.',
  },
  {
    id: 'co-lihtc',
    name: 'Colorado LIHTC Contribution Credit',
    agency: 'CHFA',
    state: 'CO',
    type: 'Tax Credit',
    jurisdiction: 'state',
    status: 'active',
    amountMin: 100000,
    amountMax: 1000000,
    description: 'Colorado state income tax credit for contributions to affordable housing projects. Donors receive 25% credit on donations to CHFA-approved developments.',
  },
  {
    id: 'wa-htf',
    name: 'Washington Housing Trust Fund',
    agency: 'Commerce Washington',
    state: 'WA',
    type: 'Grant',
    jurisdiction: 'state',
    status: 'active',
    amountMin: 250000,
    amountMax: 3000000,
    description: 'Washington State grants for affordable housing development, preservation, and operations. Competitive twice-annual funding rounds.',
  },
  {
    id: 'nyc-485x',
    name: 'NYC 485-x Affordable Neighborhoods for New Yorkers Tax Exemption',
    agency: 'NYC HPD',
    state: 'NY',
    type: 'Tax Credit',
    jurisdiction: 'local',
    status: 'active',
    amountMin: 1000000,
    amountMax: 30000000,
    deadline: undefined,
    description: 'Active NYC program — replaces the expired 421-a (which ended June 2022). Up to 40-year property tax exemption for new multifamily with minimum 25% affordable units. No sunset. Prevailing wage required for 100+ unit projects. Two tracks: Track A (Class A residential) and Track B (deeper affordability).',
  },
  {
    id: 'pg-e-rebate',
    name: 'PG&E Residential Solar Rebate',
    agency: 'Pacific Gas & Electric',
    state: 'CA',
    type: 'Rebate',
    jurisdiction: 'utility',
    status: 'active',
    amountMin: 500,
    amountMax: 25000,
    description: 'PG&E utility rebate for qualifying solar PV and energy storage installations. Available to residential and small commercial customers in PG&E service territory.',
  },
  {
    id: 'con-ed-rebate',
    name: 'Con Edison Multi-Family Energy Efficiency',
    agency: 'Consolidated Edison',
    state: 'NY',
    type: 'Rebate',
    jurisdiction: 'utility',
    status: 'active',
    amountMin: 5000,
    amountMax: 200000,
    description: 'Con Edison rebates for energy efficiency upgrades in multifamily buildings. Covers lighting, HVAC, insulation, and building envelope improvements.',
  },
  {
    id: 'doe-better-buildings',
    name: 'DOE Better Buildings Challenge',
    agency: 'U.S. Department of Energy',
    state: 'Federal',
    type: 'Grant',
    jurisdiction: 'federal',
    status: 'active',
    amountMin: 100000,
    amountMax: 2000000,
    description: 'DOE technical assistance and recognition program for organizations committing to 20% energy reduction over 10 years. Includes competitive grants and project financing support.',
  },
];

const PAGE_SIZE = 10;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatAmount(min: number, max: number): string {
  const fmt = (v: number) => {
    if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
    if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
    if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}K`;
    return `$${v}`;
  };
  if (min === max) return fmt(min);
  return `${fmt(min)} – ${fmt(max)}`;
}

const TYPE_COLORS: Record<string, string> = {
  'Tax Credit': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Grant: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Loan: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  Rebate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

const JURISDICTION_COLORS: Record<string, string> = {
  federal: 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900',
  state: 'bg-teal-700 text-white dark:bg-teal-600',
  local: 'bg-teal-500 text-white dark:bg-teal-500',
  utility: 'bg-teal-400 text-white dark:bg-teal-400',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  closing: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  expired: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ProgramDatabasePage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [jurisdictionFilter, setJurisdictionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let results = MOCK_PROGRAMS.filter((p) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.agency.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.state.toLowerCase().includes(q);
      const matchType = typeFilter === 'all' || p.type.toLowerCase() === typeFilter.toLowerCase();
      const matchJurisdiction = jurisdictionFilter === 'all' || p.jurisdiction === jurisdictionFilter;
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchSearch && matchType && matchJurisdiction && matchStatus;
    });

    if (sortBy === 'amount-high') {
      results = [...results].sort((a, b) => b.amountMax - a.amountMax);
    } else if (sortBy === 'deadline') {
      results = [...results].sort((a, b) => {
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return a.deadline.localeCompare(b.deadline);
      });
    } else if (sortBy === 'name') {
      results = [...results].sort((a, b) => a.name.localeCompare(b.name));
    }

    return results;
  }, [search, typeFilter, jurisdictionFilter, statusFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleFilterChange = () => {
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-teal-700">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-sora tracking-tight text-slate-900 dark:text-white">
              Program Database
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Comprehensive reference for all 30,007 incentive programs
            </p>
          </div>
        </div>
      </div>

      {/* STATS STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Programs', value: '30,007', icon: Database, color: 'text-teal-600 dark:text-teal-400' },
          { label: 'Active', value: '15,234', icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Federal', value: '8,491', icon: Landmark, color: 'text-blue-600 dark:text-blue-400' },
          { label: 'State', value: '12,482', icon: MapPin, color: 'text-violet-600 dark:text-violet-400' },
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

      {/* SEARCH + FILTERS */}
      <Card className="card-v41">
        <CardContent className="p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              className="pl-9"
              placeholder="Search programs, agencies, keywords..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <SlidersHorizontal className="h-4 w-4 text-slate-400 shrink-0" />
            <Select
              value={typeFilter}
              onValueChange={(v) => { setTypeFilter(v); handleFilterChange(); }}
            >
              <SelectTrigger className="w-36 h-8 text-xs">
                <SelectValue placeholder="Program Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="tax credit">Tax Credit</SelectItem>
                <SelectItem value="grant">Grant</SelectItem>
                <SelectItem value="loan">Loan</SelectItem>
                <SelectItem value="rebate">Rebate</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={jurisdictionFilter}
              onValueChange={(v) => { setJurisdictionFilter(v); handleFilterChange(); }}
            >
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue placeholder="Jurisdiction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="federal">Federal</SelectItem>
                <SelectItem value="state">State</SelectItem>
                <SelectItem value="local">Local</SelectItem>
                <SelectItem value="utility">Utility</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(v) => { setStatusFilter(v); handleFilterChange(); }}
            >
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="closing">Closing</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <div className="ml-auto">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-44 h-8 text-xs">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="amount-high">Amount (High → Low)</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                  <SelectItem value="name">Program Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* RESULTS */}
      <div className="space-y-3">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Showing{' '}
          <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
            {filtered.length}
          </span>{' '}
          programs
          {search && (
            <span>
              {' '}matching <span className="text-teal-600 dark:text-teal-400">"{search}"</span>
            </span>
          )}
        </p>

        {paginated.length === 0 ? (
          <Card className="card-v41">
            <CardContent className="py-16 flex flex-col items-center gap-4 text-center">
              <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-slate-400" />
              </div>
              <div>
                <p className="font-semibold text-slate-700 dark:text-slate-300">No programs found</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Try adjusting your search or filters
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => { setSearch(''); setTypeFilter('all'); setJurisdictionFilter('all'); setStatusFilter('all'); }}>
                Clear all filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          paginated.map((program) => (
            <Card key={program.id} className="card-v41">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white text-sm leading-tight">
                        {program.name}
                      </h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>{program.agency}</span>
                      <span className="text-slate-300 dark:text-slate-600">·</span>
                      <Badge className={`text-xs px-2 py-0 ${JURISDICTION_COLORS[program.jurisdiction]}`}>
                        {program.state}
                      </Badge>
                      <Badge className={`text-xs px-2 py-0 ${TYPE_COLORS[program.type]}`}>
                        {program.type}
                      </Badge>
                      <Badge className={`text-xs px-2 py-0 ${STATUS_COLORS[program.status]}`}>
                        {program.status.charAt(0).toUpperCase() + program.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      {program.description}
                    </p>
                    {program.deadline && (
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        Deadline: {program.deadline}
                      </p>
                    )}
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Amount</p>
                      <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                        {formatAmount(program.amountMin, program.amountMax)}
                      </p>
                    </div>
                    <Link href={`/discover?q=${encodeURIComponent(program.name)}`}>
                      <Button size="sm" variant="outline" className="text-xs whitespace-nowrap">
                        View Details
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Page{' '}
            <span className="font-mono font-semibold">{page}</span>
            {' '}of{' '}
            <span className="font-mono font-semibold">{totalPages}</span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
