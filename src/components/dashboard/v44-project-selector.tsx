'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { formatCompactCurrency } from '@/lib/utils';
import { projectData, allIncentives, type ProjectInfo } from '@/data/incentives';
import { Plus, Building2, ChevronDown, ChevronUp } from 'lucide-react';

interface V44ProjectSelectorProps {
  currentProject: string;
  onSelect: (project: string) => void;
}

// Number of project cards per row
const CARDS_PER_ROW = 10;

export function V44ProjectSelector({
  currentProject,
  onSelect,
}: V44ProjectSelectorProps) {
  const [showAll, setShowAll] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const projectKeys = Object.keys(projectData);
  const totalProjects = projectKeys.length;

  // Always include "Portfolio" as first item
  const allItems = ['portfolio', ...projectKeys];
  const visibleItems = showAll ? allItems : allItems.slice(0, CARDS_PER_ROW);
  const hasOverflow = allItems.length > CARDS_PER_ROW;

  const selectedProject = currentProject !== 'portfolio' ? projectData[currentProject] : null;
  const incentiveCount =
    currentProject === 'portfolio'
      ? Object.values(allIncentives).reduce((sum, arr) => sum + arr.length, 0)
      : (allIncentives[currentProject] || []).length;

  return (
    <div className="space-y-4">
      {/* Project Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3">
        {visibleItems.map((key) => {
          const isPortfolio = key === 'portfolio';
          const project = isPortfolio ? null : projectData[key];
          const isActive = currentProject === key;
          const count = isPortfolio
            ? Object.values(allIncentives).reduce((sum, arr) => sum + arr.length, 0)
            : (allIncentives[key] || []).length;

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(key)}
              className={cn(
                'relative flex flex-col items-center gap-1.5 p-3 rounded-xl text-center transition-all duration-150 min-h-[100px]',
                isActive
                  ? 'bg-deep-900 dark:bg-teal-600 text-white shadow-md ring-2 ring-deep-900/20 dark:ring-teal-400/30'
                  : 'bg-white dark:bg-deep-800 text-deep-600 dark:text-sage-400 border border-deep-100 dark:border-deep-700 hover:border-teal-300 dark:hover:border-teal-600 hover:shadow-sm'
              )}
            >
              <div className={cn(
                'w-9 h-9 rounded-lg flex items-center justify-center',
                isActive
                  ? 'bg-white/20'
                  : 'bg-deep-50 dark:bg-deep-700'
              )}>
                <Building2 className={cn(
                  'h-4 w-4',
                  isActive ? 'text-white' : 'text-teal-500'
                )} />
              </div>

              <span className={cn(
                'text-xs font-semibold leading-tight',
                isActive ? 'text-white' : 'text-deep-800 dark:text-deep-200'
              )}>
                {isPortfolio ? 'Portfolio' : project?.name?.split(' ').slice(0, 2).join(' ') || key}
              </span>

              {!isPortfolio && project && (
                <span className={cn(
                  'text-[10px] font-mono',
                  isActive ? 'text-white/70' : 'text-sage-500'
                )}>
                  {project.units}
                </span>
              )}

              <span className={cn(
                'text-[10px] font-mono',
                isActive ? 'text-white/70' : 'text-sage-400'
              )}>
                {count} incentive{count !== 1 ? 's' : ''}
              </span>
            </button>
          );
        })}

        {/* Add Project Card */}
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border-2 border-dashed border-deep-200 dark:border-deep-700 text-sage-400 hover:border-teal-300 dark:hover:border-teal-600 hover:text-teal-500 transition-all min-h-[100px]"
        >
          <div className="w-9 h-9 rounded-lg bg-deep-50 dark:bg-deep-800 flex items-center justify-center">
            <Plus className="h-4 w-4" />
          </div>
          <span className="text-xs font-semibold">Add Project</span>
        </button>
      </div>

      {/* Show More / Less toggle for large portfolios */}
      {hasOverflow && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="flex items-center gap-1 text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline mx-auto"
        >
          {showAll ? (
            <>Show less <ChevronUp className="h-3 w-3" /></>
          ) : (
            <>Show all {allItems.length} projects <ChevronDown className="h-3 w-3" /></>
          )}
        </button>
      )}

      {/* Project meta */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        {selectedProject ? (
          <>
            <span className="text-sage-600 dark:text-sage-500">
              Units:{' '}
              <span className="font-mono font-semibold text-deep-950 dark:text-sage-200">
                {selectedProject.units}
              </span>
            </span>
            <span className="text-sage-300 dark:text-teal-800">|</span>
            <span className="text-sage-600 dark:text-sage-500">
              TDC:{' '}
              <span className="font-mono font-semibold text-deep-950 dark:text-sage-200">
                {formatCompactCurrency(selectedProject.tdc * 1_000_000)}
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
                {totalProjects}
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

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-deep-900 rounded-2xl shadow-2xl border border-deep-100 dark:border-deep-700 w-full max-w-lg mx-4 p-6">
            <h3 className="font-sora text-lg font-bold text-deep-900 dark:text-white mb-4">
              Add New Project
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-deep-700 dark:text-sage-300 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Bronx Gateway Tower"
                  className="w-full px-3 py-2 rounded-lg border border-deep-200 dark:border-deep-700 bg-white dark:bg-deep-800 text-deep-900 dark:text-deep-100 text-sm placeholder:text-sage-400 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-deep-700 dark:text-sage-300 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  placeholder="e.g., 225 Grand Concourse, Bronx, NY 10451"
                  className="w-full px-3 py-2 rounded-lg border border-deep-200 dark:border-deep-700 bg-white dark:bg-deep-800 text-deep-900 dark:text-deep-100 text-sm placeholder:text-sage-400 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-deep-700 dark:text-sage-300 mb-1">
                    Units
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 312"
                    className="w-full px-3 py-2 rounded-lg border border-deep-200 dark:border-deep-700 bg-white dark:bg-deep-800 text-deep-900 dark:text-deep-100 text-sm placeholder:text-sage-400 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-deep-700 dark:text-sage-300 mb-1">
                    Project Type
                  </label>
                  <select className="w-full px-3 py-2 rounded-lg border border-deep-200 dark:border-deep-700 bg-white dark:bg-deep-800 text-deep-900 dark:text-deep-100 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none">
                    <option value="">Select type</option>
                    <option value="mixed-use">Mixed-Use</option>
                    <option value="affordable-housing">Affordable Housing</option>
                    <option value="transit-oriented">Transit-Oriented</option>
                    <option value="commercial">Commercial</option>
                    <option value="industrial">Industrial</option>
                    <option value="residential">Residential</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-deep-700 dark:text-sage-300 mb-1">
                  Total Development Cost (TDC)
                </label>
                <input
                  type="text"
                  placeholder="e.g., $125,000,000"
                  className="w-full px-3 py-2 rounded-lg border border-deep-200 dark:border-deep-700 bg-white dark:bg-deep-800 text-deep-900 dark:text-deep-100 text-sm placeholder:text-sage-400 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm font-medium text-deep-600 dark:text-sage-400 hover:text-deep-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="px-5 py-2 rounded-lg bg-deep-900 dark:bg-teal-600 text-white text-sm font-semibold hover:bg-deep-800 dark:hover:bg-teal-500 transition-colors"
              >
                Add Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
