'use client';

import { cn } from '@/lib/utils';
import { type ProjectInfo } from '@/data/incentives';
import { ChevronRight, Home } from 'lucide-react';

interface FreshnessIndicator {
  label: string;
  status: 'live' | 'fresh' | 'stale';
}

const freshnessData: FreshnessIndicator[] = [
  { label: 'Federal DB', status: 'live' },
  { label: 'State DB', status: 'fresh' },
  { label: 'Utility DB', status: 'fresh' },
];

interface V44BreadcrumbProps {
  currentProject: string;
  projectData?: Record<string, ProjectInfo>;
}

export function V44Breadcrumb({ currentProject, projectData }: V44BreadcrumbProps) {
  const project = projectData?.[currentProject];
  const displayName = project?.name || (currentProject === 'portfolio' ? 'Portfolio Overview' : currentProject);
  const contextInfo = project ? `${project.units} | ${project.type} | ${project.tier}` : '3 Active Projects';

  return (
    <div className="h-[42px] bg-white dark:bg-deep-800 border-b border-sage-200 dark:border-deep-700 px-4 lg:px-6 flex items-center justify-between">
      {/* Left: Breadcrumb path */}
      <div className="flex items-center gap-2 text-sm min-w-0">
        <Home className="w-3.5 h-3.5 text-sage shrink-0" />
        <ChevronRight className="w-3 h-3 text-sage/50 shrink-0" />
        <span className="text-sage dark:text-sage/70 shrink-0">IncentEdge</span>
        <ChevronRight className="w-3 h-3 text-sage/50 shrink-0" />
        <span className="font-semibold text-deep dark:text-white truncate">
          {displayName}
        </span>
        {contextInfo && (
          <span className="hidden md:inline-block text-sage/60 dark:text-sage/40 font-mono text-xs ml-2 truncate">
            {contextInfo}
          </span>
        )}
      </div>

      {/* Right: Data freshness indicators */}
      <div className="hidden sm:flex items-center gap-4">
        {freshnessData.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span
              className={cn(
                'w-2 h-2 rounded-full shrink-0',
                item.status === 'live' && 'bg-freshness-live animate-pulse',
                item.status === 'fresh' && 'bg-freshness-fresh',
                item.status === 'stale' && 'bg-freshness-stale'
              )}
            />
            <span className="font-mono text-[10px] uppercase tracking-wider text-sage/60 dark:text-sage/40">
              {item.label}
            </span>
            <span
              className={cn(
                'font-mono text-[10px] font-semibold uppercase tracking-wider',
                item.status === 'live' && 'text-freshness-live',
                item.status === 'fresh' && 'text-freshness-fresh',
                item.status === 'stale' && 'text-freshness-stale'
              )}
            >
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
