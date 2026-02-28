'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Building2,
  RefreshCw,
  Download,
  Loader2,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Layers,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IncentiveMatcher } from '@/components/dashboard/incentive-matcher';
import { createClient } from '@/lib/supabase/client';
import { useEligibility } from '@/hooks/use-eligibility';
import type { Project, IncentiveProgram } from '@/types';
import type { EligibilityMatchedProgram, EligibilityResult } from '@/hooks/use-eligibility';
import {
  projectData,
  allIncentives,
  type Incentive as DemoIncentive,
} from '@/data/incentives';

// ============================================================================
// DEMO DATA HELPERS
// ============================================================================

/** Convert the projectData entries into Project objects the page can use. */
function buildDemoProjects(): Project[] {
  return Object.entries(projectData).map(([key, info]) => {
    const unitsNum = parseInt(info.units.replace(/\D/g, ''), 10);
    const tierMap: Record<string, string> = {
      'Tier 1': 'tier_1_efficient',
      'Tier 2': 'tier_2_high_performance',
      'Tier 3': 'tier_3_net_zero',
    };
    return {
      id: key,
      organization_id: 'demo',
      name: info.name,
      description: null,
      address_line1: info.address,
      city: info.address.split(',')[1]?.trim() ?? null,
      state: 'NY',
      zip_code: info.address.match(/\d{5}/)?.[0] ?? null,
      county: 'Westchester',
      census_tract: null,
      latitude: null,
      longitude: null,
      sector_type: 'real-estate',
      building_type: info.type,
      construction_type: 'new-construction',
      total_units: unitsNum,
      affordable_units: Math.round(unitsNum * 0.3),
      affordable_breakdown: null,
      total_sqft: unitsNum * 900,
      capacity_mw: null,
      total_development_cost: info.tdc * 1_000_000,
      hard_costs: null,
      soft_costs: null,
      target_certification: tierMap[info.tier] ?? null,
      renewable_energy_types: ['solar', 'storage'],
      projected_energy_reduction_pct: 50,
      domestic_content_eligible: true,
      prevailing_wage_commitment: true,
      project_status: 'active',
      estimated_start_date: null,
      estimated_completion_date: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } satisfies Project;
  });
}

/** Convert a demo Incentive to EligibilityMatchedProgram. */
function demoIncentiveToMatched(inc: DemoIncentive): EligibilityMatchedProgram {
  const bonusOpportunities: Record<string, number> = {};
  if (inc.type === 'federal' && inc.prob >= 80) {
    bonusOpportunities['domestic_content'] = inc.amount * 0.1 * 1_000_000;
    bonusOpportunities['energy_community'] = inc.amount * 0.1 * 1_000_000;
  }

  const stackableWith: Record<string, string[]> = {
    'lihtc-4': ['Section 48 ITC', 'HCR Gap Financing'],
    's48-itc': ['179D Deduction', 'Section 45L'],
    'nmtc': ['LIHTC 4%', 'HCR Gap Financing'],
    'ida-pilot': ['IDA Sales Tax Exemption', 'IDA Mortgage Tax Exemption'],
  };

  return {
    program_id: inc.id,
    program_name: inc.fullName ?? inc.program,
    match_confidence: inc.prob / 100,
    estimated_value_best: inc.amount * 1_000_000,
    bonus_opportunities: bonusOpportunities,
    stacking_opportunities: stackableWith[inc.id] ?? [],
    reasons: [inc.desc, `Administered by ${inc.agency}`],
  };
}

/** Build a full EligibilityResult from demo data for a given project key. */
function buildDemoResult(projectKey: string): EligibilityResult {
  const incentives = allIncentives[projectKey] ?? [];
  const matchingPrograms = incentives.map(demoIncentiveToMatched);

  const totalPotentialValue = matchingPrograms.reduce(
    (sum, p) => sum + p.estimated_value_best,
    0
  );
  const stackingBonus = totalPotentialValue * 0.15;

  const recommendations = [
    'Prioritize LIHTC and IDA applications — highest confidence and largest value.',
    'Bundle Section 48 ITC with energy community and domestic content adders for maximum federal credit.',
    'Submit IDA PILOT application within 60 days to lock in property tax abatement.',
    'Layer Con Edison utility incentives on top of state NYSERDA programs — both are stackable.',
  ];

  return {
    project_id: projectKey,
    total_programs_analyzed: 30007,
    matching_programs: matchingPrograms,
    total_potential_value: totalPotentialValue,
    total_potential_with_stacking: totalPotentialValue + stackingBonus,
    recommendations,
    last_calculated_at: new Date().toISOString(),
  };
}

// ============================================================================
// ANIMATED PROGRESS INDICATOR
// ============================================================================

const ANALYSIS_MESSAGES = [
  'Analyzing 30,007 programs...',
  'Evaluating federal tax credits...',
  'Checking state incentives...',
  'Scoring local programs...',
  'Calculating stacking opportunities...',
  'Evaluating bonus adders...',
  'Generating recommendations...',
  'Finalizing results...',
];

function EligibilityLoader() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(5);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % ANALYSIS_MESSAGES.length);
    }, 1200);

    const progressInterval = setInterval(() => {
      setProgress((p) => {
        // Asymptote toward 90 — the real completion sets it to 100
        if (p >= 90) return p;
        return Math.min(90, p + Math.random() * 8);
      });
    }, 600);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <Card className="card-v41">
      <CardContent className="py-12">
        <div className="flex flex-col items-center gap-6 max-w-md mx-auto text-center">
          <div className="relative">
            <Sparkles className="w-10 h-10 text-blue-500 animate-pulse" />
          </div>
          <div className="w-full space-y-3">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-slate-500 dark:text-slate-400 min-h-[1.25rem] transition-opacity">
              {ANALYSIS_MESSAGES[messageIndex]}
            </p>
          </div>
          <p className="text-xs text-slate-400">
            AI analysis typically takes 3–10 seconds
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// CONFIDENCE BAR
// ============================================================================

function ConfidenceBar({ value }: { value: number }) {
  // value is 0–1
  const pct = Math.round(value * 100);

  const colorClass =
    pct >= 80
      ? 'bg-emerald-500'
      : pct >= 60
      ? 'bg-blue-500'
      : 'bg-amber-500';

  const labelClass =
    pct >= 80
      ? 'text-emerald-600 dark:text-emerald-400'
      : pct >= 60
      ? 'text-blue-600 dark:text-blue-400'
      : 'text-amber-600 dark:text-amber-400';

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 relative h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className={`h-full rounded-full transition-all ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-xs font-semibold tabular-nums ${labelClass}`}>
        {pct}%
      </span>
    </div>
  );
}

// ============================================================================
// PROGRAM CARD
// ============================================================================

function ProgramCard({ program }: { program: EligibilityMatchedProgram }) {
  const bonusEntries = Object.entries(program.bonus_opportunities);
  const topReasons = program.reasons.slice(0, 2);

  return (
    <Card className="card-v41 hover:shadow-md transition-shadow">
      <CardContent className="p-5 space-y-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <p className="font-semibold text-slate-900 dark:text-white leading-snug">
            {program.program_name}
          </p>
          <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums whitespace-nowrap">
            ${(program.estimated_value_best / 1000).toFixed(0)}K
          </span>
        </div>

        {/* Match confidence */}
        <div className="space-y-1">
          <p className="text-xs text-slate-500 uppercase tracking-wide">
            Match Confidence
          </p>
          <ConfidenceBar value={program.match_confidence} />
        </div>

        {/* Bonus opportunities */}
        {bonusEntries.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {bonusEntries.map(([key, val]) => (
              <Badge
                key={key}
                variant="info"
                className="text-xs"
              >
                {key.replace(/_/g, ' ')} +${(val / 1000).toFixed(0)}K
              </Badge>
            ))}
          </div>
        )}

        {/* Stacking opportunities */}
        {program.stacking_opportunities.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
            <span className="text-xs text-slate-500">
              Stackable with:{' '}
              <span className="text-slate-700 dark:text-slate-300">
                {program.stacking_opportunities.join(', ')}
              </span>
            </span>
          </div>
        )}

        {/* Top reasons */}
        {topReasons.length > 0 && (
          <ul className="space-y-1">
            {topReasons.map((reason, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {reason}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// ELIGIBILITY RESULTS VIEW
// ============================================================================

function EligibilityResults({
  result,
  projectName,
}: {
  result: NonNullable<ReturnType<typeof useEligibility>['result']>;
  projectName: string;
}) {
  return (
    <div className="space-y-6">
      {/* Summary banner */}
      <Card className="card-v41 border-emerald-500/20 bg-gradient-to-r from-emerald-500/5 to-transparent">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Sparkles className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {result.matching_programs.length} eligible programs found
                </p>
                <p className="text-xs text-slate-500">
                  Analyzed {result.total_programs_analyzed.toLocaleString()} total programs
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="text-center">
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-lg tabular-nums">
                  <DollarSign className="w-4 h-4" />
                  {(result.total_potential_value / 1e6).toFixed(1)}M
                </div>
                <p className="text-xs text-slate-500">Potential value</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold text-lg tabular-nums">
                  <TrendingUp className="w-4 h-4" />
                  {(result.total_potential_with_stacking / 1e6).toFixed(1)}M
                </div>
                <p className="text-xs text-slate-500">With stacking</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Program cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {result.matching_programs.map((program) => (
          <ProgramCard key={program.program_id} program={program} />
        ))}
      </div>

      {/* Recommendations */}
      {result.recommendations.length > 0 && (
        <Card className="card-v41 border-blue-500/20 bg-blue-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-blue-700 dark:text-blue-400">
              <Info className="w-4 h-4" />
              Recommendations for {projectName}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-2">
              {result.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold text-sm mt-0.5">
                    {i + 1}.
                  </span>
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {rec}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

/** Returns a promise that rejects after `ms` milliseconds. */
function timeout(ms: number): Promise<never> {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms)
  );
}

export default function MatchingPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [pageLoading, setPageLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoResult, setDemoResult] = useState<EligibilityResult | null>(null);

  // Fallback: keep IncentiveMatcher data only if eligibility API hard-fails
  const [fallbackIncentives, setFallbackIncentives] = useState<IncentiveProgram[]>([]);
  const [useFallback, setUseFallback] = useState(false);

  const { result, loading: eligibilityLoading, error: eligibilityError, checkEligibility, reset: resetEligibility } =
    useEligibility();

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  // ---- initial data load (projects only) ----
  const loadProjects = useCallback(async () => {
    setPageLoading(true);
    setPageError(null);

    const supabase = createClient();

    try {
      const projectsQuery = supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: projectsData, error: projectsError } = await Promise.race([
        projectsQuery,
        timeout(5000),
      ]);

      if (projectsError) throw projectsError;

      if (!projectsData || projectsData.length === 0) {
        // No projects returned — fall back to demo
        const demoProjects = buildDemoProjects();
        const firstKey = demoProjects[0].id;
        setProjects(demoProjects);
        setIsDemoMode(true);
        setDemoResult(buildDemoResult(firstKey));
        if (!selectedProjectId) {
          setSelectedProjectId(firstKey);
        }
      } else {
        setProjects(projectsData);
        setIsDemoMode(false);
        if (!selectedProjectId) {
          setSelectedProjectId(projectsData[0].id);
        }
      }
    } catch (err) {
      console.warn('Projects load failed or timed out, switching to demo mode:', err);
      const demoProjects = buildDemoProjects();
      const firstKey = demoProjects[0].id;
      setProjects(demoProjects);
      setIsDemoMode(true);
      setDemoResult(buildDemoResult(firstKey));
      if (!selectedProjectId) {
        setSelectedProjectId(firstKey);
      }
    } finally {
      setPageLoading(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    void loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- trigger eligibility check when project selection changes ----
  useEffect(() => {
    if (!selectedProjectId) return;

    if (isDemoMode) {
      // In demo mode: build results from local data immediately
      setDemoResult(buildDemoResult(selectedProjectId));
      resetEligibility();
      return;
    }

    setUseFallback(false);
    setDemoResult(null);
    void checkEligibility(selectedProjectId);
  }, [selectedProjectId, isDemoMode, checkEligibility, resetEligibility]);

  // ---- if eligibility API errors, load fallback incentives once ----
  useEffect(() => {
    if (!eligibilityError || isDemoMode) return;

    setUseFallback(true);

    if (fallbackIncentives.length > 0) return; // already loaded

    const supabase = createClient();

    void (async () => {
      const { data: incentivesData, error: incentivesError } = await supabase
        .from('incentive_programs')
        .select('*')
        .eq('status', 'active')
        .limit(500);

      if (incentivesError) {
        const { data: awardsData } = await supabase
          .from('incentive_awards')
          .select('*')
          .limit(500);

        const mapped = ((awardsData ?? []) as Record<string, unknown>[]).map(
          (award) => ({
            id: String(award.id),
            name: String(award.title ?? award.name ?? 'Unknown Program'),
            category: (award.category as string) ?? 'state',
            jurisdiction_level:
              award.source === 'Federal'
                ? 'federal'
                : award.source === 'Utility'
                ? 'utility'
                : award.source === 'Local'
                ? 'local'
                : 'state',
            state: award.state,
            status: 'active',
            amount_max: award.funding_amount ?? award.amount_max,
            amount_fixed: award.amount_fixed,
            amount_percentage: award.amount_percentage,
            sector_types: (award.sector_types as string[]) ?? [],
            building_types: (award.building_types as string[]) ?? [],
            technology_types: (award.technology_types as string[]) ?? [],
            counties: (award.counties as string[]) ?? [],
            municipalities: (award.municipalities as string[]) ?? [],
          })
        ) as IncentiveProgram[];

        setFallbackIncentives(mapped);
      } else {
        setFallbackIncentives(incentivesData ?? []);
      }
    })();
  }, [eligibilityError, isDemoMode, fallbackIncentives.length]);

  // ---- refresh handler ----
  async function handleRefresh() {
    setRefreshing(true);
    resetEligibility();
    setUseFallback(false);
    setDemoResult(null);
    setIsDemoMode(false);
    await loadProjects();
    if (selectedProjectId && !isDemoMode) {
      await checkEligibility(selectedProjectId);
    }
    setRefreshing(false);
  }

  // ---- export handler ----
  function handleExport() {
    if (!selectedProject) return;

    const activeResult = isDemoMode ? demoResult : result;
    let csvContent: string;

    if (activeResult && !useFallback) {
      const rows = activeResult.matching_programs.map((p) => {
        const confidence = `${Math.round(p.match_confidence * 100)}%`;
        const stackingCount = p.stacking_opportunities.length;
        return [
          `"${p.program_name.replace(/"/g, '""')}"`,
          confidence,
          p.estimated_value_best,
          stackingCount,
        ].join(',');
      });
      csvContent =
        'data:text/csv;charset=utf-8,' +
        'Program,Match Confidence,Estimated Value,Stacking Opportunities\n' +
        rows.join('\n');
    } else {
      csvContent =
        'data:text/csv;charset=utf-8,Program,Match Confidence,Estimated Value,Stacking Opportunities\n';
    }

    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute(
      'download',
      `${selectedProject.name.replace(/\s+/g, '-')}-incentive-matches.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleViewIncentive(id: string) {
    router.push(`/discover/${id}`);
  }

  // The result to render (live API result or demo result)
  const activeResult = isDemoMode ? demoResult : result;

  // ============================================================================
  // RENDER — loading / error / empty states
  // ============================================================================

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-slate-500">Loading matching engine...</p>
        </div>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardContent className="flex flex-col items-center py-8">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
              Error Loading Data
            </h3>
            <p className="mt-2 text-sm text-slate-500 text-center">
              {pageError}
            </p>
            <Button className="mt-4" onClick={() => void loadProjects()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-sora">
            Incentive Matching
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Match your projects to eligible incentive programs
          </p>
        </div>
        <Card className="card-v41">
          <CardContent className="flex flex-col items-center py-12">
            <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-600" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
              No Projects Found
            </h3>
            <p className="mt-2 text-sm text-slate-500 text-center max-w-md">
              Create a project first to start matching it with incentive
              programs.
            </p>
            <Button
              className="mt-4 bg-blue-600 hover:bg-blue-700"
              onClick={() => router.push('/projects/new')}
            >
              Create Project
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============================================================================
  // RENDER — main view
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-sora">
                Incentive Matching
              </h1>
              {isDemoMode && (
                <Badge
                  variant="outline"
                  className="text-xs border-amber-400 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20"
                >
                  Demo Mode
                </Badge>
              )}
            </div>
            <p className="text-slate-500 dark:text-slate-400">
              AI-powered matching across 30,007+ verified programs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Project Selector */}
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400" />
            <Select
              value={selectedProjectId}
              onValueChange={(id) => {
                setSelectedProjectId(id);
                resetEligibility();
                setDemoResult(null);
              }}
            >
              <SelectTrigger className="w-[280px] bg-white dark:bg-navy-800 border-slate-200 dark:border-navy-700">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    <div className="flex items-center gap-2">
                      <span>{project.name}</span>
                      {project.state && (
                        <span className="text-xs text-slate-400">
                          ({project.state})
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Refresh */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => void handleRefresh()}
            disabled={refreshing || eligibilityLoading}
            className="border-slate-200 dark:border-navy-700"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
            />
          </Button>

          {/* Export */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleExport}
            disabled={!activeResult && !useFallback}
            className="border-slate-200 dark:border-navy-700"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Selected Project Summary Card */}
      {selectedProject && (
        <Card className="card-v41 border-blue-500/20 bg-gradient-to-r from-blue-500/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {selectedProject.name}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {selectedProject.city && `${selectedProject.city}, `}
                    {selectedProject.state} |{' '}
                    {selectedProject.building_type ?? 'Mixed Use'} |{' '}
                    {selectedProject.total_units ?? '—'} units
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm">
                {selectedProject.total_development_cost && (
                  <div>
                    <span className="text-slate-500">TDC:</span>{' '}
                    <span className="font-mono font-semibold text-slate-900 dark:text-white">
                      $
                      {(
                        selectedProject.total_development_cost / 1e6
                      ).toFixed(1)}
                      M
                    </span>
                  </div>
                )}
                {selectedProject.affordable_units &&
                  selectedProject.total_units && (
                    <div>
                      <span className="text-slate-500">Affordable:</span>{' '}
                      <span className="font-mono font-semibold text-teal-600">
                        {(
                          (selectedProject.affordable_units /
                            selectedProject.total_units) *
                          100
                        ).toFixed(0)}
                        %
                      </span>
                    </div>
                  )}
                {selectedProject.target_certification && (
                  <div>
                    <span className="text-slate-500">Cert:</span>{' '}
                    <span className="font-semibold text-emerald-600">
                      {selectedProject.target_certification}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ---- Results area ---- */}
      {selectedProject && (
        <>
          {/* Demo mode: show results (or loader if result not yet built) */}
          {isDemoMode && demoResult && (
            <EligibilityResults
              result={demoResult}
              projectName={selectedProject.name}
            />
          )}
          {isDemoMode && !demoResult && <EligibilityLoader />}

          {/* Live mode: eligibility API loading state */}
          {!isDemoMode && eligibilityLoading && <EligibilityLoader />}

          {/* Live mode: eligibility API error → show fallback banner + IncentiveMatcher */}
          {!isDemoMode && !eligibilityLoading && useFallback && eligibilityError && (
            <>
              <Card className="card-v41 border-amber-500/20 bg-amber-500/5">
                <CardContent className="flex items-center gap-3 py-4">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-400">
                      AI Eligibility API unavailable
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-500">
                      {eligibilityError} — Showing local matching results
                      instead.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="ml-auto border-amber-400 text-amber-700 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-400"
                    onClick={() => {
                      setUseFallback(false);
                      void checkEligibility(selectedProjectId);
                    }}
                  >
                    Retry
                  </Button>
                </CardContent>
              </Card>

              <IncentiveMatcher
                project={selectedProject}
                incentives={fallbackIncentives}
                onViewIncentive={handleViewIncentive}
              />
            </>
          )}

          {/* Live mode: eligibility API success */}
          {!isDemoMode && !eligibilityLoading && !useFallback && result && (
            <EligibilityResults
              result={result}
              projectName={selectedProject.name}
            />
          )}

          {/* Live mode: no results yet and not loading */}
          {!isDemoMode && !eligibilityLoading && !result && !eligibilityError && (
            <Card className="card-v41">
              <CardContent className="flex flex-col items-center py-12">
                <Sparkles className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                <p className="mt-4 text-slate-500">
                  Select a project to run AI eligibility analysis.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
