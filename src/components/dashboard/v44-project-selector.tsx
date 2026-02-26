'use client';

import { cn } from '@/lib/utils';
import { formatCompactCurrency } from '@/lib/utils';
import { projectData, allIncentives } from '@/data/incentives';

interface ProjectTab {
  key: string;
  label: string;
}

const tabs: ProjectTab[] = [
  { key: 'portfolio', label: 'Portfolio' },
  { key: 'mt-vernon', label: 'Mount Vernon' },
  { key: 'yonkers', label: 'Yonkers' },
  { key: 'new-rochelle', label: 'New Rochelle' },
];

interface V44ProjectSelectorProps {
  currentProject: string;
  onSelect: (project: string) => void;
}

export function V44ProjectSelector({
  currentProject,
  onSelect,
}: V44ProjectSelectorProps) {
  const project = currentProject !== 'portfolio' ? projectData[currentProject] : null;

  const incentiveCount =
    currentProject === 'portfolio'
      ? Object.values(allIncentives).reduce((sum, arr) => sum + arr.length, 0)
      : (allIncentives[currentProject] || []).length;

  return (
    <div className="space-y-3">
      {/* Tab buttons */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const isActive = currentProject === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onSelect(tab.key)}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-semibold transition-all duration-150',
                isActive
                  ? 'bg-deep-900 dark:bg-teal-600 text-white shadow-sm'
                  : 'bg-white dark:bg-deep-800 text-deep-600 dark:text-sage-400 border border-sage-300 dark:border-teal-800/30 hover:border-teal-400 dark:hover:border-teal-600'
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Project meta */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        {project ? (
          <>
            <span className="text-sage-600 dark:text-sage-500">
              Units:{' '}
              <span className="font-mono font-semibold text-deep-950 dark:text-sage-200">
                {project.units}
              </span>
            </span>
            <span className="text-sage-300 dark:text-teal-800">|</span>
            <span className="text-sage-600 dark:text-sage-500">
              TDC:{' '}
              <span className="font-mono font-semibold text-deep-950 dark:text-sage-200">
                {formatCompactCurrency(project.tdc * 1_000_000)}
              </span>
            </span>
            <span className="text-sage-300 dark:text-teal-800">|</span>
            <span className="text-sage-600 dark:text-sage-500">
              Incentives:{' '}
              <span className="font-mono font-semibold text-deep-950 dark:text-sage-200">
                {incentiveCount}
              </span>
            </span>
          </>
        ) : (
          <>
            <span className="text-sage-600 dark:text-sage-500">
              Projects:{' '}
              <span className="font-mono font-semibold text-deep-950 dark:text-sage-200">
                {Object.keys(projectData).length}
              </span>
            </span>
            <span className="text-sage-300 dark:text-teal-800">|</span>
            <span className="text-sage-600 dark:text-sage-500">
              Total Incentives:{' '}
              <span className="font-mono font-semibold text-deep-950 dark:text-sage-200">
                {incentiveCount}
              </span>
            </span>
          </>
        )}
      </div>
    </div>
  );
}
