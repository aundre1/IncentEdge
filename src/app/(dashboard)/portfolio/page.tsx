'use client';

import * as React from 'react';
import {
  allIncentives,
  getActiveIncentives,
  getPortfolioStats,
  type Incentive,
} from '@/data/incentives';
import { V44KpiStrip } from '@/components/dashboard/v44-kpi-strip';
import { V44ScenarioStrip } from '@/components/dashboard/v44-scenario-strip';
import { V44TrustBadges } from '@/components/dashboard/v44-trust-badges';
import { V44ProjectSelector } from '@/components/dashboard/v44-project-selector';
import { V44IncentiveTable } from '@/components/dashboard/v44-incentive-table';
import { V44AiMatch } from '@/components/dashboard/v44-ai-match';
import { V44QuickActions } from '@/components/dashboard/v44-quick-actions';
import { V44IncentiveDetailModal } from '@/components/dashboard/v44-incentive-detail-modal';
import {
  IncentiveTypeChart,
  CaptureTimelineChart,
  StatusDistributionChart,
  PipelineBreakdownChart,
} from '@/components/dashboard/v44-charts';

export default function PortfolioPage() {
  const [currentProject, setCurrentProject] = React.useState('portfolio');
  const [selectedScenario, setSelectedScenario] = React.useState('expected');
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [selectedIncentive, setSelectedIncentive] = React.useState<Incentive | null>(null);

  const incentives = React.useMemo(
    () => getActiveIncentives(currentProject),
    [currentProject]
  );

  const stats = React.useMemo(
    () => getPortfolioStats(incentives),
    [incentives]
  );

  const handleViewDetail = (id: string, project: string) => {
    const projectIncentives = allIncentives[project] || [];
    const inc = projectIncentives.find(i => i.id === id);
    if (inc) {
      setSelectedIncentive(inc);
      setDetailOpen(true);
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Project Selector */}
      <V44ProjectSelector
        currentProject={currentProject}
        onSelect={setCurrentProject}
      />

      {/* KPI Strip */}
      <V44KpiStrip incentives={incentives} />

      {/* Scenario Strip */}
      <V44ScenarioStrip
        totalAmount={stats.total}
        selectedScenario={selectedScenario}
        onSelect={setSelectedScenario}
      />

      {/* Trust Badges */}
      <V44TrustBadges />

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <IncentiveTypeChart incentives={incentives} />
        <CaptureTimelineChart incentives={incentives} />
        <StatusDistributionChart incentives={incentives} />
      </div>

      {/* Main Table + Sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">
        <V44IncentiveTable
          incentives={incentives}
          currentProject={currentProject}
          onViewDetail={handleViewDetail}
        />

        {/* Right Sidebar */}
        <div className="flex flex-col gap-3">
          <V44AiMatch incentives={incentives} />
          <PipelineBreakdownChart incentives={incentives} />
          <V44QuickActions />
        </div>
      </div>

      {/* Detail Modal */}
      <V44IncentiveDetailModal
        incentive={selectedIncentive}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  );
}
