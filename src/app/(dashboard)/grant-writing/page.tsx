'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  PenLine,
  Search,
  Loader2,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  DollarSign,
  FileText,
  ClipboardList,
  Building2,
  Users,
  BarChart3,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';

// ============================================================================
// TYPES
// ============================================================================

interface ProgramOption {
  id: string;
  name: string;
  short_name: string | null;
  category: string;
  program_type: string;
  amount_max: number | null;
  amount_type: string | null;
  state: string | null;
  status: string;
}

interface ProbabilityFactors {
  locationMatch: number;
  sectorMatch: number;
  projectTypeMatch: number;
  applicantTypeMatch: number;
  tdcRangeMatch: number;
}

interface ProbabilityScore {
  programId: string;
  approvalProbability: number;
  confidenceLevel: string;
  sampleSize: number;
  comparableAwardsCount: number;
  avgComparableAward: number;
  factors: ProbabilityFactors;
  basedOn: string;
  cached: boolean;
  computedAt: string;
}

interface NarrativeResponse {
  narrative: string;
  sectionType: string;
  wordCount: number;
  suggestedRevisions: string[];
  programName: string;
}

interface ProjectOption {
  id: string;
  name: string;
  state: string | null;
  building_type: string | null;
  total_development_cost: number | null;
}

type SectionType =
  | 'project_description'
  | 'need_statement'
  | 'budget_narrative'
  | 'impact_statement'
  | 'organizational_capacity';

// ============================================================================
// CONSTANTS
// ============================================================================

const SECTION_TABS: { value: SectionType; label: string; icon: React.ElementType }[] = [
  { value: 'project_description', label: 'Project Description', icon: FileText },
  { value: 'need_statement', label: 'Need Statement', icon: ClipboardList },
  { value: 'budget_narrative', label: 'Budget Narrative', icon: DollarSign },
  { value: 'impact_statement', label: 'Impact Statement', icon: TrendingUp },
  { value: 'organizational_capacity', label: 'Org Capacity', icon: Users },
];

// ============================================================================
// HELPERS
// ============================================================================

function formatCompactCurrency(value: number | null | undefined): string {
  if (!value) return 'Varies';
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

function getProbabilityColor(probability: number): string {
  if (probability >= 70) return 'text-emerald-600 dark:text-emerald-400';
  if (probability >= 40) return 'text-amber-600 dark:text-amber-400';
  return 'text-orange-600 dark:text-orange-400';
}

function getProbabilityBgColor(probability: number): string {
  if (probability >= 70) return 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800';
  if (probability >= 40) return 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800';
  return 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800';
}

function getConfidenceBadgeColor(level: string): string {
  switch (level) {
    case 'very_high':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    case 'high':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    case 'medium':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    case 'low':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
  }
}

function formatConfidenceLevel(level: string): string {
  return level.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// ============================================================================
// SKELETON LOADERS
// ============================================================================

function ProgramSelectorSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      <div className="grid gap-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
}

function ProbabilityScoreSkeleton() {
  return (
    <div className="card-v41 p-6">
      <div className="flex items-center gap-6">
        <Skeleton className="h-20 w-24" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// FACTOR BAR — visualizes a single match factor
// ============================================================================

function FactorBar({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 100);
  const barColor =
    pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-orange-500';

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-500 dark:text-slate-400 w-28 shrink-0 text-right">
        {label}
      </span>
      <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-mono text-slate-600 dark:text-slate-300 w-10 text-right">
        {pct}%
      </span>
    </div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function GrantWritingPage() {
  const { user, isLoading: authLoading } = useAuth();

  // Project selection
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [projectsLoading, setProjectsLoading] = useState(true);

  // Program selection
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [programSearch, setProgramSearch] = useState('');
  const [selectedProgramId, setSelectedProgramId] = useState<string>('');
  const [programsLoading, setProgramsLoading] = useState(false);

  // Probability
  const [probabilityScore, setProbabilityScore] = useState<ProbabilityScore | null>(null);
  const [probabilityLoading, setProbabilityLoading] = useState(false);
  const [probabilityError, setProbabilityError] = useState<string | null>(null);

  // Narrative generation
  const [sectionType, setSectionType] = useState<SectionType>('project_description');
  const [additionalContext, setAdditionalContext] = useState('');
  const [narrative, setNarrative] = useState<NarrativeResponse | null>(null);
  const [narrativeLoading, setNarrativeLoading] = useState(false);
  const [narrativeError, setNarrativeError] = useState<string | null>(null);

  // Copy state
  const [copied, setCopied] = useState(false);

  // ------------------------------------------------------------------
  // Fetch projects on mount
  // ------------------------------------------------------------------
  useEffect(() => {
    if (authLoading) return;

    const fetchProjects = async () => {
      setProjectsLoading(true);
      const supabase = createClient();

      const { data, error } = await supabase
        .from('projects')
        .select('id, name, state, building_type, total_development_cost')
        .eq('project_status', 'active')
        .order('updated_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        setProjects(data as ProjectOption[]);
        if (data.length > 0) {
          setSelectedProjectId((data[0] as ProjectOption).id);
        }
      }
      setProjectsLoading(false);
    };

    fetchProjects();
  }, [authLoading]);

  // ------------------------------------------------------------------
  // Fetch programs when project is selected
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!selectedProjectId) return;

    const fetchPrograms = async () => {
      setProgramsLoading(true);
      const supabase = createClient();

      let query = supabase
        .from('incentive_programs')
        .select('id, name, short_name, category, program_type, amount_max, amount_type, state, status')
        .eq('status', 'active')
        .order('name')
        .limit(100);

      if (programSearch.trim()) {
        query = query.or(
          `name.ilike.%${programSearch}%,short_name.ilike.%${programSearch}%`,
        );
      }

      const { data, error } = await query;

      if (!error && data) {
        setPrograms(data as ProgramOption[]);
      }
      setProgramsLoading(false);
    };

    const timer = setTimeout(fetchPrograms, 300);
    return () => clearTimeout(timer);
  }, [selectedProjectId, programSearch]);

  // ------------------------------------------------------------------
  // Fetch probability when program is selected
  // ------------------------------------------------------------------
  const fetchProbability = useCallback(async () => {
    if (!selectedProjectId || !selectedProgramId) return;

    setProbabilityLoading(true);
    setProbabilityError(null);

    try {
      const response = await fetch('/api/grant-writing/probability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProjectId,
          programIds: [selectedProgramId],
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(
          (errData as { error?: string }).error ?? `HTTP ${response.status}`,
        );
      }

      const data = await response.json();
      const results = (data as { results: ProbabilityScore[] }).results;
      if (results && results.length > 0) {
        setProbabilityScore(results[0]);
      }
    } catch (err) {
      setProbabilityError(
        err instanceof Error ? err.message : 'Failed to compute probability',
      );
    } finally {
      setProbabilityLoading(false);
    }
  }, [selectedProjectId, selectedProgramId]);

  useEffect(() => {
    if (selectedProgramId) {
      fetchProbability();
    } else {
      setProbabilityScore(null);
    }
  }, [selectedProgramId, fetchProbability]);

  // ------------------------------------------------------------------
  // Generate narrative
  // ------------------------------------------------------------------
  const generateNarrative = async () => {
    if (!selectedProjectId || !selectedProgramId) return;

    setNarrativeLoading(true);
    setNarrativeError(null);

    try {
      const response = await fetch('/api/grant-writing/narrative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProjectId,
          programId: selectedProgramId,
          sectionType,
          additionalContext: additionalContext.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(
          (errData as { error?: string }).error ?? `HTTP ${response.status}`,
        );
      }

      const data = (await response.json()) as NarrativeResponse;
      setNarrative(data);
    } catch (err) {
      setNarrativeError(
        err instanceof Error ? err.message : 'Failed to generate narrative',
      );
    } finally {
      setNarrativeLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // Copy to clipboard
  // ------------------------------------------------------------------
  const handleCopy = async () => {
    if (!narrative?.narrative) return;
    try {
      await navigator.clipboard.writeText(narrative.narrative);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = narrative.narrative;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ------------------------------------------------------------------
  // Selected program details
  // ------------------------------------------------------------------
  const selectedProgram = programs.find((p) => p.id === selectedProgramId);
  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  // ------------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------------
  return (
    <div className="space-y-8">
      {/* ================================================================ */}
      {/* PAGE HEADER                                                      */}
      {/* ================================================================ */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-500">
            <PenLine className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-sora tracking-tight text-slate-900 dark:text-white">
              Grant Writing AI
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              AI-powered application narratives with historical approval intelligence
            </p>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* STEP 1: PROJECT SELECTOR                                         */}
      {/* ================================================================ */}
      <Card className="card-v41">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-sora text-slate-900 dark:text-white flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-500 text-xs font-bold text-white">
              1
            </span>
            Select Project
          </CardTitle>
        </CardHeader>
        <CardContent>
          {projectsLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : projects.length === 0 ? (
            <div className="text-center py-6 text-slate-500 dark:text-slate-400">
              <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No active projects found. Create a project first.</p>
            </div>
          ) : (
            <select
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                setSelectedProgramId('');
                setProbabilityScore(null);
                setNarrative(null);
              }}
              className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                  {project.state ? ` (${project.state})` : ''}
                  {project.total_development_cost
                    ? ` — ${formatCompactCurrency(project.total_development_cost)}`
                    : ''}
                </option>
              ))}
            </select>
          )}
        </CardContent>
      </Card>

      {/* ================================================================ */}
      {/* STEP 2: PROGRAM SELECTOR                                         */}
      {/* ================================================================ */}
      {selectedProjectId && (
        <Card className="card-v41">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-sora text-slate-900 dark:text-white flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-500 text-xs font-bold text-white">
                2
              </span>
              Select Program
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search incentive programs..."
                value={programSearch}
                onChange={(e) => setProgramSearch(e.target.value)}
                className="pl-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
              />
            </div>

            {/* Program list */}
            {programsLoading ? (
              <ProgramSelectorSkeleton />
            ) : programs.length === 0 ? (
              <div className="text-center py-6 text-slate-500 dark:text-slate-400">
                <p className="text-sm">No programs found matching your search.</p>
              </div>
            ) : (
              <div className="max-h-[320px] overflow-y-auto space-y-2 pr-1">
                {programs.map((program) => {
                  const isSelected = selectedProgramId === program.id;
                  return (
                    <button
                      key={program.id}
                      onClick={() => {
                        setSelectedProgramId(program.id);
                        setNarrative(null);
                      }}
                      className={`w-full text-left rounded-lg border p-3 transition-all ${
                        isSelected
                          ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/20 dark:border-accent-500 ring-1 ring-accent-500'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                            {program.name}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            <Badge
                              variant="outline"
                              className="text-[10px] border-slate-200 dark:border-slate-700"
                            >
                              {program.category}
                            </Badge>
                            {program.state && (
                              <Badge
                                variant="outline"
                                className="text-[10px] border-slate-200 dark:border-slate-700"
                              >
                                {program.state}
                              </Badge>
                            )}
                            {program.program_type && (
                              <Badge
                                variant="outline"
                                className="text-[10px] border-slate-200 dark:border-slate-700"
                              >
                                {program.program_type}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCompactCurrency(program.amount_max)}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ================================================================ */}
      {/* STEP 3: PROBABILITY SCORE                                        */}
      {/* ================================================================ */}
      {selectedProgramId && (
        <div className="space-y-4">
          {probabilityLoading ? (
            <ProbabilityScoreSkeleton />
          ) : probabilityError ? (
            <Card className="card-v41 border-red-200 dark:border-red-800">
              <CardContent className="py-6">
                <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">
                      Could not compute probability
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {probabilityError}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchProbability}
                    className="ml-auto"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Retry
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : probabilityScore ? (
            <div
              className={`card-v41 border rounded-lg p-6 ${getProbabilityBgColor(
                probabilityScore.approvalProbability,
              )}`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                {/* Big probability number */}
                <div className="text-center lg:text-left shrink-0">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Approval Probability
                  </p>
                  <p
                    className={`text-5xl font-mono font-bold tracking-tight ${getProbabilityColor(
                      probabilityScore.approvalProbability,
                    )}`}
                  >
                    {Math.round(probabilityScore.approvalProbability)}%
                  </p>
                  <div className="flex items-center justify-center lg:justify-start gap-2 mt-2">
                    <Badge
                      className={`text-[10px] ${getConfidenceBadgeColor(
                        probabilityScore.confidenceLevel,
                      )}`}
                    >
                      {formatConfidenceLevel(probabilityScore.confidenceLevel)}
                    </Badge>
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 space-y-4">
                  {/* Program name + basedOn */}
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {selectedProgram?.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {probabilityScore.basedOn}
                    </p>
                  </div>

                  {/* Comparable award */}
                  {probabilityScore.avgComparableAward > 0 && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-slate-400" />
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        Avg. comparable award:{' '}
                        <span className="font-semibold font-mono">
                          {formatCompactCurrency(probabilityScore.avgComparableAward)}
                        </span>
                      </span>
                    </div>
                  )}

                  {/* Factor bars */}
                  <div className="space-y-1.5">
                    <FactorBar label="Location" value={probabilityScore.factors.locationMatch} />
                    <FactorBar label="Sector" value={probabilityScore.factors.sectorMatch} />
                    <FactorBar
                      label="Project Type"
                      value={probabilityScore.factors.projectTypeMatch}
                    />
                    <FactorBar
                      label="Applicant Type"
                      value={probabilityScore.factors.applicantTypeMatch}
                    />
                    <FactorBar label="TDC Range" value={probabilityScore.factors.tdcRangeMatch} />
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* ================================================================ */}
      {/* STEP 4: SECTION GENERATOR                                        */}
      {/* ================================================================ */}
      {selectedProgramId && (
        <Card className="card-v41">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-sora text-slate-900 dark:text-white flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-500 text-xs font-bold text-white">
                3
              </span>
              Generate Application Narrative
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Section type tabs */}
            <Tabs
              value={sectionType}
              onValueChange={(v) => setSectionType(v as SectionType)}
            >
              <TabsList className="flex flex-wrap h-auto gap-1 bg-slate-100 dark:bg-slate-800 p-1">
                {SECTION_TABS.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900"
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {/* All tabs share the same content area */}
              {SECTION_TABS.map((tab) => (
                <TabsContent key={tab.value} value={tab.value}>
                  <div className="space-y-4">
                    {/* Context textarea */}
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                        Additional Context{' '}
                        <span className="text-slate-400 font-normal">(optional)</span>
                      </label>
                      <textarea
                        placeholder="Add specific details about your project, unique qualifications, or key points to emphasize..."
                        value={additionalContext}
                        onChange={(e) => setAdditionalContext(e.target.value)}
                        rows={3}
                        maxLength={2000}
                        className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-500 resize-y"
                      />
                      <p className="text-xs text-slate-400 mt-1 text-right">
                        {additionalContext.length}/2,000
                      </p>
                    </div>

                    {/* Generate button */}
                    <Button
                      onClick={generateNarrative}
                      disabled={narrativeLoading || !selectedProjectId || !selectedProgramId}
                      className="bg-accent-500 hover:bg-accent-600 text-white font-medium"
                    >
                      {narrativeLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          Generate Narrative
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* ================================================================ */}
      {/* STEP 5: GENERATED NARRATIVE OUTPUT                               */}
      {/* ================================================================ */}
      {narrativeError && (
        <Card className="card-v41 border-red-200 dark:border-red-800">
          <CardContent className="py-6">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <div>
                <p className="text-sm font-medium">Narrative generation failed</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {narrativeError}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={generateNarrative}
                className="ml-auto"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {narrative && (
        <Card className="card-v41">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-sora text-slate-900 dark:text-white">
                Generated Narrative
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-[10px] border-slate-200 dark:border-slate-700"
                >
                  {narrative.wordCount} words
                </Badge>
                <Badge
                  variant="outline"
                  className="text-[10px] border-slate-200 dark:border-slate-700"
                >
                  {narrative.programName}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Editable narrative */}
            <textarea
              value={narrative.narrative}
              onChange={(e) =>
                setNarrative((prev) =>
                  prev
                    ? {
                        ...prev,
                        narrative: e.target.value,
                        wordCount: e.target.value
                          .split(/\s+/)
                          .filter(Boolean).length,
                      }
                    : null,
                )
              }
              rows={16}
              className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-white leading-relaxed focus:outline-none focus:ring-2 focus:ring-accent-500 resize-y font-[inherit]"
            />

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="border-slate-200 dark:border-slate-700"
              >
                {copied ? (
                  <>
                    <Check className="mr-1 h-3 w-3 text-emerald-500" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-1 h-3 w-3" />
                    Copy
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={generateNarrative}
                disabled={narrativeLoading}
                className="border-slate-200 dark:border-slate-700"
              >
                <RefreshCw
                  className={`mr-1 h-3 w-3 ${narrativeLoading ? 'animate-spin' : ''}`}
                />
                Regenerate
              </Button>
            </div>

            {/* Suggested revisions */}
            {narrative.suggestedRevisions.length > 0 && (
              <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
                  Suggested Improvements
                </p>
                <ul className="space-y-1.5">
                  {narrative.suggestedRevisions.map((rev, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-blue-700 dark:text-blue-300"
                    >
                      <BarChart3 className="h-3.5 w-3.5 mt-0.5 shrink-0 text-blue-400" />
                      {rev}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ================================================================ */}
      {/* APPLICATION TRACKER (placeholder for future)                     */}
      {/* ================================================================ */}
      <Card className="card-v41">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-sora text-slate-900 dark:text-white flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-accent-500" />
            Track Your Applications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Application tracking coming soon
            </p>
            <p className="text-xs mt-1">
              Track deadlines, submission status, and award outcomes for all your applications.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
