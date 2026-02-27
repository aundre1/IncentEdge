'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Clock,
  Search,
  Bell,
  AlertTriangle,
  Calendar,
  DollarSign,
  ArrowUpDown,
  ExternalLink,
  Landmark,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
// Types & mock data
// ---------------------------------------------------------------------------

interface DeadlineItem {
  id: string;
  name: string;
  agency: string;
  type: 'Federal' | 'State' | 'Local';
  deadline: Date;
  funding: string;
  fundingRaw: number;
  categories: string[];
  description: string;
}

const DEADLINES: DeadlineItem[] = [
  {
    id: 'd1',
    name: 'IRA Section 45L New Energy Efficient Homes Tax Credit',
    agency: 'Internal Revenue Service',
    type: 'Federal',
    deadline: new Date('2026-03-15'),
    funding: '$2,500 – $5,000 per unit',
    fundingRaw: 5000,
    categories: ['Tax Credit', 'Energy Efficiency'],
    description: 'Tax credit for contractors who build or substantially reconstruct qualified new energy efficient homes.',
  },
  {
    id: 'd2',
    name: 'LIHTC Round 1 Application — New York State',
    agency: 'New York State HCR',
    type: 'State',
    deadline: new Date('2026-03-28'),
    funding: 'Up to $15M equity',
    fundingRaw: 15_000_000,
    categories: ['Tax Credit', 'Affordable Housing'],
    description: 'First 9% LIHTC round for qualified affordable multifamily housing projects in New York.',
  },
  {
    id: 'd3',
    name: 'HUD Section 202 Supportive Housing for Elderly',
    agency: 'U.S. Department of HUD',
    type: 'Federal',
    deadline: new Date('2026-04-01'),
    funding: 'Up to $20M capital advance',
    fundingRaw: 20_000_000,
    categories: ['Grant', 'Affordable Housing'],
    description: 'Capital advances for development of affordable, supportive rental housing for very low-income elderly persons.',
  },
  {
    id: 'd4',
    name: 'California CPUC Self-Generation Incentive Program (SGIP)',
    agency: 'California PUC',
    type: 'State',
    deadline: new Date('2026-04-15'),
    funding: '$250 – $850 per kWh',
    fundingRaw: 850,
    categories: ['Rebate', 'Energy Storage'],
    description: 'Incentives for behind-the-meter energy storage systems installed on the customer side of the utility meter.',
  },
  {
    id: 'd5',
    name: 'USDA Rural Development Community Facilities Grant',
    agency: 'U.S. Department of Agriculture',
    type: 'Federal',
    deadline: new Date('2026-04-30'),
    funding: 'Up to $5M',
    fundingRaw: 5_000_000,
    categories: ['Grant', 'Rural Development'],
    description: 'Grants for essential community facilities in rural areas with populations of 20,000 or less.',
  },
  {
    id: 'd6',
    name: 'Illinois HOME Investment Partnerships Program',
    agency: 'Illinois DHCD',
    type: 'State',
    deadline: new Date('2026-05-01'),
    funding: '$500K – $3M per project',
    fundingRaw: 3_000_000,
    categories: ['Grant', 'Affordable Housing'],
    description: 'Federal HOME funds administered by Illinois for affordable housing development and preservation.',
  },
  {
    id: 'd7',
    name: 'NYC Industrial Business Incentive Area Tax Exemption',
    agency: 'NYC Department of Finance',
    type: 'Local',
    deadline: new Date('2026-05-15'),
    funding: 'Property tax exemption (10-year)',
    fundingRaw: 500_000,
    categories: ['Tax Benefit', 'Industrial'],
    description: 'Real property tax exemption for qualifying industrial and manufacturing businesses in designated IBZs.',
  },
  {
    id: 'd8',
    name: 'EPA Brownfields Assessment Grant',
    agency: 'U.S. Environmental Protection Agency',
    type: 'Federal',
    deadline: new Date('2026-05-29'),
    funding: 'Up to $500K',
    fundingRaw: 500_000,
    categories: ['Grant', 'Environmental'],
    description: 'Funding to assess the environmental conditions of brownfield sites and plan for their cleanup and reuse.',
  },
  {
    id: 'd9',
    name: 'Texas Chapter 380 Economic Development Agreement',
    agency: 'Texas Economic Development Corp',
    type: 'State',
    deadline: new Date('2026-06-01'),
    funding: 'Negotiated (up to $10M)',
    fundingRaw: 10_000_000,
    categories: ['Tax Abatement', 'Economic Development'],
    description: 'Municipal economic development incentive agreements for qualifying commercial and industrial projects.',
  },
  {
    id: 'd10',
    name: 'HUD Choice Neighborhoods Implementation Grant',
    agency: 'U.S. Department of HUD',
    type: 'Federal',
    deadline: new Date('2026-06-15'),
    funding: 'Up to $50M',
    fundingRaw: 50_000_000,
    categories: ['Grant', 'Affordable Housing'],
    description: 'Comprehensive grants supporting locally driven strategies for transforming distressed HUD-assisted housing.',
  },
  {
    id: 'd11',
    name: 'Florida Rebuild Florida Mitigation Program',
    agency: 'Florida DEO',
    type: 'State',
    deadline: new Date('2026-06-30'),
    funding: '$50K – $2M per project',
    fundingRaw: 2_000_000,
    categories: ['Grant', 'Resilience'],
    description: 'CDBG-MIT funds for projects that reduce the risk and impact of natural disasters on Florida communities.',
  },
  {
    id: 'd12',
    name: 'DOE Loan Guarantee Program — Clean Energy',
    agency: 'U.S. Department of Energy',
    type: 'Federal',
    deadline: new Date('2026-07-31'),
    funding: 'Loan guarantees up to $500M',
    fundingRaw: 500_000_000,
    categories: ['Loan', 'Clean Energy'],
    description: 'Loan guarantees for innovative clean energy projects that avoid, reduce, utilize, or sequester greenhouse gases.',
  },
  {
    id: 'd13',
    name: 'Georgia OneGeorgia Authority EDGE Grant',
    agency: 'OneGeorgia Authority',
    type: 'State',
    deadline: new Date('2026-08-15'),
    funding: 'Up to $1M',
    fundingRaw: 1_000_000,
    categories: ['Grant', 'Economic Development'],
    description: 'Economic infrastructure grants for development projects in Georgia\'s most economically distressed counties.',
  },
  {
    id: 'd14',
    name: 'Los Angeles Green Building Fee Reduction',
    agency: 'City of Los Angeles',
    type: 'Local',
    deadline: new Date('2026-09-01'),
    funding: '25–50% fee reduction',
    fundingRaw: 150_000,
    categories: ['Fee Reduction', 'Green Building'],
    description: 'Reduced building permit and plan check fees for projects achieving LEED Gold or Platinum certification.',
  },
  {
    id: 'd15',
    name: 'USDA Business & Industry Loan Guarantee (B&I)',
    agency: 'USDA Rural Development',
    type: 'Federal',
    deadline: new Date('2026-09-30'),
    funding: 'Loan guarantees up to $25M',
    fundingRaw: 25_000_000,
    categories: ['Loan Guarantee', 'Rural Development'],
    description: 'Guarantees of loans made by private lenders for projects in rural areas that create or save jobs.',
  },
  {
    id: 'd16',
    name: 'Massachusetts Clean Energy Center Solar Loan Program',
    agency: 'MassCEC',
    type: 'State',
    deadline: new Date('2026-10-15'),
    funding: '0% interest loans up to $100K',
    fundingRaw: 100_000,
    categories: ['Loan', 'Solar'],
    description: 'Below-market financing for solar PV systems installed at residences and commercial properties in Massachusetts.',
  },
  {
    id: 'd17',
    name: 'Chicago TIF Eligible Investment Program',
    agency: 'City of Chicago DPD',
    type: 'Local',
    deadline: new Date('2026-11-01'),
    funding: 'Up to 25% of project costs',
    fundingRaw: 2_500_000,
    categories: ['TIF', 'Economic Development'],
    description: 'Tax increment financing for development projects in designated Chicago TIF districts.',
  },
  {
    id: 'd18',
    name: 'IRA Section 48C Advanced Energy Project Credit',
    agency: 'Internal Revenue Service',
    type: 'Federal',
    deadline: new Date('2026-12-01'),
    funding: '30–50% investment tax credit',
    fundingRaw: 10_000_000,
    categories: ['Tax Credit', 'Clean Manufacturing'],
    description: 'Tax credit for qualifying advanced energy projects including clean energy manufacturing facilities.',
  },
];

type SortKey = 'deadline' | 'funding' | 'type';
type TypeFilter = 'All' | 'Federal' | 'State' | 'Local';
type StatusFilter = 'Upcoming' | 'Open Now' | 'Closing Soon';

function getDaysUntil(date: Date): number {
  const now = new Date();
  return Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDeadline(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function getDaysColor(days: number): string {
  if (days < 30) return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
  if (days < 60) return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
  return 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DeadlinesPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('All');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('Upcoming');
  const [sortBy, setSortBy] = useState<SortKey>('deadline');
  const [remindedIds, setRemindedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    let items = DEADLINES.filter((d) => {
      if (typeFilter !== 'All' && d.type !== typeFilter) return false;
      if (search && !d.name.toLowerCase().includes(search.toLowerCase()) && !d.agency.toLowerCase().includes(search.toLowerCase())) return false;
      const days = getDaysUntil(d.deadline);
      if (statusFilter === 'Closing Soon' && days >= 30) return false;
      if (statusFilter === 'Open Now' && days < 0) return false;
      return true;
    });

    items.sort((a, b) => {
      if (sortBy === 'deadline') return a.deadline.getTime() - b.deadline.getTime();
      if (sortBy === 'funding') return b.fundingRaw - a.fundingRaw;
      if (sortBy === 'type') return a.type.localeCompare(b.type);
      return 0;
    });

    return items;
  }, [search, typeFilter, statusFilter, sortBy]);

  const openNow = DEADLINES.filter((d) => getDaysUntil(d.deadline) > 0).length;
  const closingSoon = DEADLINES.filter((d) => { const days = getDaysUntil(d.deadline); return days > 0 && days < 30; }).length;
  const federalCount = DEADLINES.filter((d) => d.type === 'Federal').length;
  const stateLocalCount = DEADLINES.filter((d) => d.type === 'State' || d.type === 'Local').length;

  const handleRemind = (id: string, name: string) => {
    setRemindedIds((prev) => new Set([...prev, id]));
    alert(`Reminder set for: ${name}`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 shadow-lg shadow-teal-500/20 shrink-0">
          <Clock className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-sora text-slate-900 dark:text-white">
            Deadline Tracker
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Upcoming application deadlines across all incentive programs
          </p>
        </div>
      </div>

      {/* Alert Banner */}
      <Card className="card-v41 border-amber-500/30 bg-gradient-to-r from-amber-500/5 to-transparent dark:from-amber-900/10">
        <CardContent className="flex items-center gap-3 py-3 px-4">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-300">
            <strong>Pro tip:</strong> Set reminders to never miss a funding deadline. Many programs close once oversubscribed — apply early.
          </p>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Open Now', value: openNow, icon: Bell },
          { label: 'Closing This Month', value: closingSoon, icon: AlertTriangle },
          { label: 'Federal', value: federalCount, icon: Landmark },
          { label: 'State + Local', value: stateLocalCount, icon: Calendar },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label} className="card-v41">
            <CardContent className="flex items-center gap-3 py-3 px-4">
              <Icon className="h-4 w-4 text-teal-500 shrink-0" />
              <div>
                <p className="text-xl font-bold font-mono text-teal-600 dark:text-teal-400">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search programs or agencies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
          />
        </div>
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TypeFilter)}>
          <SelectTrigger className="w-full sm:w-36 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Types</SelectItem>
            <SelectItem value="Federal">Federal</SelectItem>
            <SelectItem value="State">State</SelectItem>
            <SelectItem value="Local">Local</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger className="w-full sm:w-40 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Upcoming">Upcoming</SelectItem>
            <SelectItem value="Open Now">Open Now</SelectItem>
            <SelectItem value="Closing Soon">Closing Soon</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
          <SelectTrigger className="w-full sm:w-44 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
            <ArrowUpDown className="mr-2 h-4 w-4 text-slate-400" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="deadline">Sort: Deadline</SelectItem>
            <SelectItem value="funding">Sort: Funding Amount</SelectItem>
            <SelectItem value="type">Sort: Program Type</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Showing <span className="font-mono font-medium text-teal-600 dark:text-teal-400">{filtered.length}</span> deadlines
      </p>

      {/* Deadline Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card className="card-v41">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Clock className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
              <p className="font-medium text-slate-700 dark:text-slate-300">No deadlines match your filters</p>
              <p className="text-sm text-slate-400 mt-1">Try adjusting your search or filter criteria</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((item) => {
            const days = getDaysUntil(item.deadline);
            const daysColor = getDaysColor(days);
            const reminded = remindedIds.has(item.id);

            return (
              <Card
                key={item.id}
                className="card-v41 hover:border-teal-500/30 transition-colors"
              >
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1 space-y-2 min-w-0">
                      {/* Title Row */}
                      <div className="flex flex-wrap items-start gap-2">
                        <h3 className="font-semibold font-sora text-slate-900 dark:text-white text-sm leading-snug">
                          {item.name}
                        </h3>
                      </div>

                      {/* Agency */}
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.agency}</p>

                      {/* Description */}
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {item.description}
                      </p>

                      {/* Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          className={`text-xs ${
                            item.type === 'Federal'
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                              : item.type === 'State'
                              ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20'
                              : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                          }`}
                        >
                          {item.type}
                        </Badge>
                        {item.categories.map((cat) => (
                          <Badge
                            key={cat}
                            variant="outline"
                            className="text-xs border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                          >
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-2 sm:ml-4 sm:shrink-0">
                      {/* Days badge */}
                      <Badge className={`font-mono text-xs ${daysColor} shrink-0`}>
                        {days <= 0 ? 'Closed' : days === 1 ? '1 day left' : `${days} days`}
                      </Badge>

                      {/* Deadline date */}
                      <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 shrink-0">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDeadline(item.deadline)}</span>
                      </div>

                      {/* Funding */}
                      <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 shrink-0">
                        <DollarSign className="h-3 w-3" />
                        <span>{item.funding}</span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className={`text-xs border-slate-200 dark:border-slate-700 h-8 ${reminded ? 'text-teal-600 border-teal-500/40' : ''}`}
                          onClick={() => handleRemind(item.id, item.name)}
                          disabled={reminded}
                        >
                          <Bell className="mr-1 h-3 w-3" />
                          {reminded ? 'Set' : 'Remind'}
                        </Button>
                        <Button
                          size="sm"
                          className="text-xs bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 h-8"
                          asChild
                        >
                          <Link href="/discover">
                            View
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

