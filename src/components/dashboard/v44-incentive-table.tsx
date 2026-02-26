'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  ChevronDown,
  ChevronUp,
  Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Incentive } from '@/data/incentives';

// ============================================================================
// TYPES
// ============================================================================

type SortField = 'program' | 'agency' | 'type' | 'amount' | 'prob' | 'status' | 'deadline';
type SortDirection = 'asc' | 'desc';
type TypeFilter = 'all' | 'federal' | 'state' | 'local' | 'utility';

interface IncentiveRow extends Incentive {
  project: string;
  projectName: string;
}

interface V44IncentiveTableProps {
  incentives: IncentiveRow[];
  currentProject: string;
  onViewDetail: (id: string, project: string) => void;
}

// ============================================================================
// HELPERS
// ============================================================================

const LEVEL_COLORS: Record<string, string> = {
  federal: 'bg-navy text-white',
  state: 'bg-teal text-white',
  local: 'bg-sage-700 text-white',
  utility: 'bg-teal-400 text-white',
};

const STATUS_COLORS: Record<string, string> = {
  captured: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  pending: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  'at-risk': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const STATUS_LABELS: Record<string, string> = {
  captured: 'Captured',
  pending: 'Pending',
  'at-risk': 'At Risk',
};

const TYPE_TABS: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'federal', label: 'Federal' },
  { value: 'state', label: 'State' },
  { value: 'local', label: 'Local' },
  { value: 'utility', label: 'Utility' },
];

const DEFAULT_VISIBLE = 12;

function parseDeadlineDays(deadline: string): number {
  if (deadline === '-' || !deadline) return Infinity;
  const match = deadline.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : Infinity;
}

function getMatchColor(prob: number): string {
  if (prob >= 80) return 'bg-emerald-500';
  if (prob >= 60) return 'bg-teal-500';
  return 'bg-gray-400 dark:bg-gray-600';
}

function getMatchTextColor(prob: number): string {
  if (prob >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (prob >= 60) return 'text-teal-600 dark:text-teal-400';
  return 'text-gray-500 dark:text-gray-400';
}

// ============================================================================
// CSV EXPORT
// ============================================================================

function exportToCSV(incentives: IncentiveRow[], currentProject: string) {
  const isPortfolio = currentProject === 'portfolio';
  const headers = [
    'Program',
    'Description',
    isPortfolio ? 'Project' : 'Agency',
    'Level',
    'Amount ($M)',
    'AI Match (%)',
    'Status',
    'Deadline',
  ];

  const rows = incentives.map((inc) => [
    inc.program,
    inc.desc,
    isPortfolio ? inc.projectName : inc.agency,
    inc.type,
    inc.amount.toFixed(1),
    inc.prob.toString(),
    STATUS_LABELS[inc.status] || inc.status,
    inc.deadline,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `incentedge-incentives-${currentProject}-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============================================================================
// SORT HEADER
// ============================================================================

interface SortableHeaderProps {
  label: string;
  field: SortField;
  currentSort: SortField;
  direction: SortDirection;
  onSort: (field: SortField) => void;
  className?: string;
}

function SortableHeader({ label, field, currentSort, direction, onSort, className }: SortableHeaderProps) {
  const isActive = currentSort === field;

  return (
    <th
      className={cn(
        'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer select-none',
        'text-deep-500 dark:text-sage-400 hover:text-deep-800 dark:hover:text-white transition-colors',
        className
      )}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        <span>{label}</span>
        {isActive ? (
          direction === 'asc' ? (
            <ArrowUp className="w-3 h-3 text-teal" />
          ) : (
            <ArrowDown className="w-3 h-3 text-teal" />
          )
        ) : (
          <ArrowUpDown className="w-3 h-3 opacity-30" />
        )}
      </div>
    </th>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function V44IncentiveTable({ incentives, currentProject, onViewDetail }: V44IncentiveTableProps) {
  const [sortField, setSortField] = useState<SortField>('amount');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [showAll, setShowAll] = useState(false);

  const isPortfolio = currentProject === 'portfolio';

  // Sorting
  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        setSortDirection(field === 'amount' || field === 'prob' ? 'desc' : 'asc');
      }
    },
    [sortField]
  );

  // Filtered + sorted data
  const filteredData = useMemo(() => {
    let data = [...incentives];

    // Type filter
    if (typeFilter !== 'all') {
      data = data.filter((inc) => inc.type === typeFilter);
    }

    // Sort
    data.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'program':
          cmp = a.program.localeCompare(b.program);
          break;
        case 'agency':
          cmp = isPortfolio
            ? a.projectName.localeCompare(b.projectName)
            : a.agency.localeCompare(b.agency);
          break;
        case 'type':
          cmp = a.type.localeCompare(b.type);
          break;
        case 'amount':
          cmp = a.amount - b.amount;
          break;
        case 'prob':
          cmp = a.prob - b.prob;
          break;
        case 'status':
          cmp = a.status.localeCompare(b.status);
          break;
        case 'deadline':
          cmp = parseDeadlineDays(a.deadline) - parseDeadlineDays(b.deadline);
          break;
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });

    return data;
  }, [incentives, typeFilter, sortField, sortDirection, isPortfolio]);

  const visibleData = showAll ? filteredData : filteredData.slice(0, DEFAULT_VISIBLE);
  const hasMore = filteredData.length > DEFAULT_VISIBLE;

  // Type tab counts
  const typeCounts = useMemo(() => {
    const counts: Record<TypeFilter, number> = { all: incentives.length, federal: 0, state: 0, local: 0, utility: 0 };
    incentives.forEach((inc) => {
      if (inc.type in counts) counts[inc.type as TypeFilter]++;
    });
    return counts;
  }, [incentives]);

  return (
    <Card className="border-deep-100 dark:border-deep-700 bg-white dark:bg-deep-800 shadow-sm">
      {/* Header */}
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <CardTitle className="font-sora text-lg text-deep-900 dark:text-white">
              Incentive Programs
            </CardTitle>
            <span className="inline-flex items-center justify-center h-6 min-w-[28px] px-2 rounded-full bg-teal/10 text-teal text-xs font-semibold">
              {filteredData.length}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToCSV(filteredData, currentProject)}
            className="border-deep-200 dark:border-deep-600 text-deep-600 dark:text-sage-400 hover:bg-deep-50 dark:hover:bg-deep-700"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Export CSV
          </Button>
        </div>

        {/* Type Filter Tabs */}
        <div className="flex items-center gap-1.5 mt-3 overflow-x-auto">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setTypeFilter(tab.value)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all',
                typeFilter === tab.value
                  ? 'bg-white dark:bg-deep-700 text-teal shadow-sm ring-1 ring-deep-100 dark:ring-deep-600'
                  : 'bg-deep-50 dark:bg-deep-900 text-deep-500 dark:text-sage-500 hover:bg-deep-100 dark:hover:bg-deep-700'
              )}
            >
              {tab.label}
              <span className="ml-1 opacity-60">({typeCounts[tab.value]})</span>
            </button>
          ))}
        </div>
      </CardHeader>

      {/* Table */}
      <CardContent className="px-0 pb-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-y border-deep-100 dark:border-deep-700 bg-deep-50/50 dark:bg-deep-900/50">
                <SortableHeader
                  label="Program"
                  field="program"
                  currentSort={sortField}
                  direction={sortDirection}
                  onSort={handleSort}
                  className="min-w-[220px]"
                />
                <SortableHeader
                  label={isPortfolio ? 'Project' : 'Agency'}
                  field="agency"
                  currentSort={sortField}
                  direction={sortDirection}
                  onSort={handleSort}
                  className="min-w-[140px]"
                />
                <SortableHeader
                  label="Level"
                  field="type"
                  currentSort={sortField}
                  direction={sortDirection}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Amount"
                  field="amount"
                  currentSort={sortField}
                  direction={sortDirection}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="AI Match"
                  field="prob"
                  currentSort={sortField}
                  direction={sortDirection}
                  onSort={handleSort}
                  className="min-w-[120px]"
                />
                <SortableHeader
                  label="Status"
                  field="status"
                  currentSort={sortField}
                  direction={sortDirection}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Deadline"
                  field="deadline"
                  currentSort={sortField}
                  direction={sortDirection}
                  onSort={handleSort}
                />
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-deep-500 dark:text-sage-400">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-deep-50 dark:divide-deep-700/50">
              {visibleData.map((inc) => {
                const deadlineDays = parseDeadlineDays(inc.deadline);
                const isUrgent = deadlineDays <= 30;

                return (
                  <tr
                    key={`${inc.project}-${inc.id}`}
                    className="hover:bg-deep-50/50 dark:hover:bg-deep-900/30 transition-colors"
                  >
                    {/* Program */}
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-deep-900 dark:text-white leading-tight">
                          {inc.program}
                        </p>
                        <p className="text-xs text-deep-400 dark:text-sage-500 mt-0.5 line-clamp-1">
                          {inc.desc}
                        </p>
                      </div>
                    </td>

                    {/* Project/Agency */}
                    <td className="px-4 py-3">
                      <span className="text-sm text-deep-600 dark:text-sage-400">
                        {isPortfolio ? inc.projectName : inc.agency}
                      </span>
                    </td>

                    {/* Level Badge */}
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider',
                          LEVEL_COLORS[inc.type] || 'bg-gray-200 text-gray-700'
                        )}
                      >
                        {inc.type}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono font-semibold text-deep-900 dark:text-white">
                        ${inc.amount.toFixed(1)}M
                      </span>
                    </td>

                    {/* AI Match */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={cn('text-sm font-mono font-semibold', getMatchTextColor(inc.prob))}>
                          {inc.prob}%
                        </span>
                        <div className="w-16 h-1.5 rounded-full bg-deep-100 dark:bg-deep-700 overflow-hidden">
                          <div
                            className={cn('h-full rounded-full transition-all', getMatchColor(inc.prob))}
                            style={{ width: `${inc.prob}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold',
                          STATUS_COLORS[inc.status] || 'bg-gray-100 text-gray-600'
                        )}
                      >
                        {STATUS_LABELS[inc.status] || inc.status}
                      </span>
                    </td>

                    {/* Deadline */}
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'text-sm font-mono',
                          isUrgent
                            ? 'text-red-600 dark:text-red-400 font-semibold'
                            : 'text-deep-500 dark:text-sage-400'
                        )}
                      >
                        {inc.deadline}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetail(inc.id, inc.project)}
                        className="h-7 px-2.5 text-teal hover:text-teal-700 hover:bg-teal-50 dark:hover:bg-teal-900/20"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                );
              })}

              {visibleData.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <p className="text-sm text-deep-400 dark:text-sage-500">
                      No incentive programs match the current filter.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Show All / Show Less Toggle */}
        {hasMore && (
          <div className="border-t border-deep-100 dark:border-deep-700 px-4 py-3">
            <button
              onClick={() => setShowAll((s) => !s)}
              className="flex items-center justify-center gap-1.5 w-full text-sm font-medium text-teal hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
            >
              {showAll ? (
                <>
                  Show Less <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  View All {filteredData.length} Programs <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
