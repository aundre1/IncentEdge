'use client';

import { use, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  Sparkles,
  MapPin,
  DollarSign,
  Building2,
  Sun,
  AlertCircle,
  CheckCircle2,
  Download,
  ArrowRight,
  Zap,
  TrendingUp,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

// Mock projects data (matching projects/page.tsx)
const projects = [
  {
    id: '1',
    name: 'Mount Vernon Mixed-Use',
    description: 'Mixed-use development with 200 residential units and ground floor retail',
    building_type: 'Mixed-Use',
    sector_type: 'real-estate',
    project_type: 'New Construction',
    address: '123 Main St, Mount Vernon, NY',
    state: 'NY',
    total_development_cost: 85000000,
    total_units: 200,
    affordable_units: 120,
  },
  {
    id: '2',
    name: 'Yonkers Affordable Housing',
    description: 'LIHTC affordable housing project with 150 units',
    building_type: 'Multifamily',
    sector_type: 'real-estate',
    project_type: 'New Construction',
    address: '456 Oak Ave, Yonkers, NY',
    state: 'NY',
    total_development_cost: 55000000,
    total_units: 150,
    affordable_units: 150,
  },
  {
    id: '3',
    name: 'New Rochelle Solar Farm',
    description: '25 MW utility-scale solar installation',
    building_type: 'Solar',
    sector_type: 'clean-energy',
    project_type: 'New Construction',
    address: 'Industrial Park Rd, New Rochelle, NY',
    state: 'NY',
    total_development_cost: 32000000,
    total_units: null,
    affordable_units: null,
    capacity_mw: 25,
  },
  {
    id: '4',
    name: 'White Plains Office Conversion',
    description: 'Office-to-residential conversion project',
    building_type: 'Mixed-Use',
    sector_type: 'real-estate',
    project_type: 'Rehabilitation',
    address: '789 Corporate Blvd, White Plains, NY',
    state: 'NY',
    total_development_cost: 72000000,
    total_units: 180,
    affordable_units: 54,
  },
];

// Per-project eligibility scan results
const eligibilityResultsByProject: Record<string, {
  total_programs: number;
  total_potential_m: number;
  programs: Array<{
    id: string;
    name: string;
    agency: string;
    confidence: number;
    estimated_value: number;
    match_reason: string;
    stacking_count: number;
    category: string;
  }>;
  recommendations: string[];
}> = {
  '1': {
    total_programs: 12,
    total_potential_m: 45.2,
    programs: [
      { id: 'p1', name: 'Low-Income Housing Tax Credit (LIHTC)', agency: 'NY HCR', confidence: 95, estimated_value: 18000000, match_reason: '60% affordable units meets 9% LIHTC threshold', stacking_count: 4, category: 'Tax Credit' },
      { id: 'p2', name: 'HUD HOME Investment Partnerships', agency: 'HUD', confidence: 88, estimated_value: 4500000, match_reason: 'Mixed-income with affordable component in priority area', stacking_count: 3, category: 'Grant' },
      { id: 'p3', name: 'NY State Affordable Housing Program', agency: 'NYSHCR', confidence: 85, estimated_value: 6200000, match_reason: '120 affordable units qualifies for state AHP subsidy', stacking_count: 3, category: 'Grant' },
      { id: 'p4', name: '485-x Affordable Neighborhoods Tax Exemption', agency: 'NYC HPD', confidence: 82, estimated_value: 12000000, match_reason: 'Min. 25% affordable units qualifies for 40-year exemption — replaces expired 421-a', stacking_count: 2, category: 'Property Tax' },
      { id: 'p5', name: 'Community Development Block Grant', agency: 'HUD / Westchester', confidence: 75, estimated_value: 2100000, match_reason: 'Serves low/moderate income residents in CRA area', stacking_count: 2, category: 'Grant' },
      { id: 'p6', name: 'Federal Historic Tax Credit', agency: 'IRS / NPS', confidence: 62, estimated_value: 3800000, match_reason: 'Historic district adjacency enables 20% ITC', stacking_count: 2, category: 'Tax Credit' },
      { id: 'p7', name: 'NY Energy Efficiency Incentive', agency: 'NYSERDA', confidence: 71, estimated_value: 800000, match_reason: 'LEED Silver certification triggers utility incentive', stacking_count: 1, category: 'Rebate' },
    ],
    recommendations: [
      'Increase affordable units to 80%+ to qualify for deeper LIHTC basis boost',
      'File for Opportunity Zone designation — Mount Vernon census tract may qualify for 10% bonus',
      'Add Passive House certification to unlock additional NYSERDA incentives',
      'Prevailing wage commitment unlocks full 40-year 485-x exemption — critical for projects over 100 units',
    ],
  },
  '2': {
    total_programs: 8,
    total_potential_m: 28.5,
    programs: [
      { id: 'p1', name: 'Low-Income Housing Tax Credit (LIHTC) — 9%', agency: 'NY HCR', confidence: 98, estimated_value: 14200000, match_reason: '100% affordable units maximizes LIHTC allocation score', stacking_count: 5, category: 'Tax Credit' },
      { id: 'p2', name: 'HOME Investment Partnerships Program', agency: 'HUD', confidence: 91, estimated_value: 3800000, match_reason: '100% affordable multifamily — maximum HOME eligibility', stacking_count: 4, category: 'Grant' },
      { id: 'p3', name: 'Federal Housing Trust Fund', agency: 'HUD', confidence: 87, estimated_value: 5200000, match_reason: 'Extremely low-income set-aside + nonprofit sponsor', stacking_count: 3, category: 'Grant' },
      { id: 'p4', name: 'NY Homes for Working Families', agency: 'NYSHCR', confidence: 84, estimated_value: 4100000, match_reason: 'Working family income targeting for 100% affordable project', stacking_count: 3, category: 'Grant' },
      { id: 'p5', name: 'Community Renewal Tax Relief Act', agency: 'NYS', confidence: 71, estimated_value: 1200000, match_reason: 'Yonkers is a designated community renewal area', stacking_count: 2, category: 'Tax Credit' },
    ],
    recommendations: [
      'Elect Direct Pay under IRA Section 6417 — nonprofit status makes this highly advantageous',
      'Apply for NY Emergency Repair Fund allocation to increase AHP score',
      'Target Extremely Low-Income (ELI) unit set-aside at 10%+ for Federal HTF eligibility',
      'File for NYSERDA Multifamily Performance Program — all-electric bonus unlocks $2K/unit',
    ],
  },
  '3': {
    total_programs: 15,
    total_potential_m: 15.8,
    programs: [
      { id: 'p1', name: 'Investment Tax Credit (ITC) — 30% Base', agency: 'IRS', confidence: 96, estimated_value: 9600000, match_reason: '25 MW solar qualifies at full 30% ITC under IRA', stacking_count: 4, category: 'Tax Credit' },
      { id: 'p2', name: 'IRA Domestic Content Bonus (+10%)', agency: 'IRS', confidence: 83, estimated_value: 3200000, match_reason: 'Domestic steel and panel sourcing unlocks 10% adder', stacking_count: 3, category: 'Tax Credit' },
      { id: 'p3', name: 'NY-Sun Megawatt Block Incentive', agency: 'NYSERDA', confidence: 90, estimated_value: 2500000, match_reason: 'Utility-scale 25 MW qualifies for Block pricing tier', stacking_count: 2, category: 'Rebate' },
      { id: 'p4', name: 'IRA Energy Community Bonus (+10%)', agency: 'IRS', confidence: 78, estimated_value: 1600000, match_reason: 'New Rochelle industrial zone may qualify as Energy Community', stacking_count: 2, category: 'Tax Credit' },
      { id: 'p5', name: 'NYPA Renewable Energy Certificate Program', agency: 'NYPA', confidence: 74, estimated_value: 1200000, match_reason: 'Grid-interconnected utility solar qualifies for REC pricing', stacking_count: 1, category: 'Rebate' },
      { id: 'p6', name: 'USDA Rural Energy for America (REAP)', agency: 'USDA', confidence: 55, estimated_value: 500000, match_reason: 'Proximity to rural-adjacent census tract — conditional eligibility', stacking_count: 1, category: 'Grant' },
      { id: 'p7', name: 'NY Accelerated Renewable Energy Growth Program', agency: 'NYSERDA', confidence: 68, estimated_value: 750000, match_reason: 'Fast-track permitting for utility-scale solar projects', stacking_count: 1, category: 'Incentive' },
    ],
    recommendations: [
      'Confirm Energy Community designation for New Rochelle industrial zone — worth up to $3.2M',
      'Secure domestic content sourcing commitments from panel manufacturer before filing ITC',
      'Stack ITC + NY-Sun Block incentive — these programs are explicitly stackable',
      'Resolve on-hold status: NYSERDA NY-Sun requires active project timeline to hold allocation',
    ],
  },
  '4': {
    total_programs: 10,
    total_potential_m: 38.4,
    programs: [
      { id: 'p1', name: 'Federal Historic Tax Credit (20%)', agency: 'IRS / NPS', confidence: 94, estimated_value: 14400000, match_reason: 'Substantial rehab of historic office building — 20% HTC of qualified costs', stacking_count: 4, category: 'Tax Credit' },
      { id: 'p2', name: 'NY Office Conversion Accelerator', agency: 'ESD / NYSHCR', confidence: 88, estimated_value: 7200000, match_reason: 'White Plains Priority Growth Center — office-to-residential program', stacking_count: 3, category: 'Grant' },
      { id: 'p3', name: 'Low-Income Housing Tax Credit (LIHTC)', agency: 'NY HCR', confidence: 86, estimated_value: 8900000, match_reason: '30% affordable units meets minimum threshold for LIHTC basis', stacking_count: 4, category: 'Tax Credit' },
      { id: 'p4', name: '421-g Office Conversion Tax Exemption', agency: 'NYS', confidence: 82, estimated_value: 5400000, match_reason: 'Commercial-to-residential conversion — 12-year abatement period', stacking_count: 2, category: 'Property Tax' },
      { id: 'p5', name: 'HUD Community Development Loan', agency: 'HUD', confidence: 68, estimated_value: 2500000, match_reason: 'Mixed-income housing in community revitalization area', stacking_count: 2, category: 'Loan' },
    ],
    recommendations: [
      'Apply for Part 1 National Register nomination immediately — unlocks federal HTC claim',
      'Stack HTC + LIHTC using "HTC/LIHTC Combo" structure — 40%+ effective subsidy rate',
      'Increase affordable unit count from 30% to 40% to access deeper LIHTC basis boost',
      'Pursue EV Charging installation — unlocks NYSERDA EV Make-Ready grant ($4K/port)',
    ],
  },
};

function formatCurrency(value: number) {
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

function getConfidenceColor(confidence: number) {
  if (confidence >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (confidence >= 60) return 'text-blue-600 dark:text-blue-400';
  return 'text-amber-600 dark:text-amber-400';
}

function getConfidenceLabel(confidence: number) {
  if (confidence >= 80) return 'High Match';
  if (confidence >= 60) return 'Good Match';
  return 'Potential Match';
}

function getConfidenceBadge(confidence: number) {
  if (confidence >= 80) return <Badge variant="success">{getConfidenceLabel(confidence)}</Badge>;
  if (confidence >= 60) return <Badge variant="info">{getConfidenceLabel(confidence)}</Badge>;
  return <Badge variant="warning">{getConfidenceLabel(confidence)}</Badge>;
}

const SCAN_MESSAGES = [
  'Scanning 30,007 programs...',
  'Evaluating federal credits...',
  'Checking state programs...',
  'Calculating stacking opportunities...',
  'Generating recommendations...',
];

export default function EligibilityScanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const project = projects.find((p) => p.id === id);

  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'done'>('idle');
  const [scanProgress, setScanProgress] = useState(0);
  const [scanMessageIndex, setScanMessageIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const messageIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const results = eligibilityResultsByProject[id];

  const startScan = () => {
    setScanState('scanning');
    setScanProgress(0);
    setScanMessageIndex(0);

    // Progress animation
    intervalRef.current = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + Math.random() * 8 + 2;
      });
    }, 200);

    // Message cycling
    messageIntervalRef.current = setInterval(() => {
      setScanMessageIndex((prev) => (prev + 1) % SCAN_MESSAGES.length);
    }, 700);

    // Complete after ~3.5 seconds
    setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (messageIntervalRef.current) clearInterval(messageIntervalRef.current);
      setScanProgress(100);
      setScanMessageIndex(SCAN_MESSAGES.length - 1);
      setTimeout(() => {
        setScanState('done');
      }, 400);
    }, 3500);
  };

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (messageIntervalRef.current) clearInterval(messageIntervalRef.current);
    };
  }, []);

  if (!project) {
    return (
      <div className="space-y-6">
        <Link href="/projects">
          <Button variant="ghost" className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back to Projects
          </Button>
        </Link>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold font-sora">Project not found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              No project with ID <span className="font-mono font-medium">{id}</span> exists.
            </p>
            <Button className="mt-6" asChild>
              <Link href="/projects">View All Projects</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const SectorIcon = project.sector_type === 'clean-energy' ? Sun : Building2;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href={`/projects/${id}`}>
        <Button variant="ghost" className="gap-2 -ml-2">
          <ChevronLeft className="h-4 w-4" />
          Back to Project
        </Button>
      </Link>

      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-teal-600 shadow-sm">
            <Sparkles className="h-6 w-6 text-white" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-teal-400 text-white text-[9px] font-bold">AI</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight font-sora">Eligibility Scan</h1>
            <p className="text-sm text-muted-foreground">AI-powered matching across 30,007 programs</p>
          </div>
        </div>
      </div>

      {/* Project Summary Card */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600">
                <SectorIcon className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-semibold">{project.name}</p>
                <p className="text-xs text-muted-foreground">{project.building_type} · {project.project_type}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-teal-500" />
              <span>{project.address}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <DollarSign className="h-3.5 w-3.5 text-teal-500" />
              <span>TDC: <span className="font-mono font-semibold text-foreground">{formatCurrency(project.total_development_cost)}</span></span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scan Trigger / Loading / Results */}
      {scanState === 'idle' && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-teal-100 dark:from-violet-950/50 dark:to-teal-950/50">
              <Sparkles className="h-10 w-10 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="max-w-sm">
              <h2 className="text-lg font-semibold font-sora">Run Eligibility Scan</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Our AI will evaluate <span className="font-mono font-semibold text-foreground">30,007</span> federal, state, and local incentive programs
                against your project profile in seconds.
              </p>
            </div>
            <Button
              onClick={startScan}
              size="lg"
              className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-10 py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Run Eligibility Scan
            </Button>
            <p className="text-xs text-muted-foreground">Takes ~5 seconds · No credits consumed</p>
          </CardContent>
        </Card>
      )}

      {scanState === 'scanning' && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-100 to-emerald-100 dark:from-teal-950/50 dark:to-emerald-950/50 relative">
              <Sparkles className="h-10 w-10 text-teal-600 dark:text-teal-400 animate-pulse" />
            </div>
            <div className="w-full max-w-sm space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-teal-700 dark:text-teal-400 animate-pulse">
                    {SCAN_MESSAGES[scanMessageIndex]}
                  </span>
                  <span className="font-mono text-muted-foreground">{Math.round(scanProgress)}%</span>
                </div>
                <Progress value={scanProgress} className="h-2" />
              </div>
              <p className="text-xs text-muted-foreground">Evaluating {project.name} against program database...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {scanState === 'done' && results && (
        <div className="space-y-6">
          {/* Summary Banner */}
          <Card className="border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
            <CardContent className="p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-semibold font-sora text-lg">
                      Found <span className="text-emerald-700 dark:text-emerald-400 font-mono">{results.total_programs}</span> eligible programs
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Total potential: <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">${results.total_potential_m}M</span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => {
                    // Mock CSV download
                    const csv = `Program,Agency,Confidence,Estimated Value\n` +
                      results.programs.map(p => `"${p.name}","${p.agency}",${p.confidence}%,$${(p.estimated_value / 1e6).toFixed(1)}M`).join('\n');
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `eligibility-scan-${id}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}>
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                  </Button>
                  <Button size="sm" className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white" asChild>
                    <Link href="/grant-writing">
                      Apply to Top Programs
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Program Results */}
          <div>
            <h2 className="text-base font-semibold font-sora mb-3">Matched Programs</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {results.programs.map((program) => (
                <Card key={program.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm leading-snug">{program.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{program.agency}</p>
                      </div>
                      {getConfidenceBadge(program.confidence)}
                    </div>

                    {/* Confidence Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Match Confidence</span>
                        <span className={`font-mono font-bold ${getConfidenceColor(program.confidence)}`}>
                          {program.confidence}%
                        </span>
                      </div>
                      <Progress value={program.confidence} className="h-1.5" />
                    </div>

                    {/* Match Reason */}
                    <div className="flex items-start gap-2 text-xs text-muted-foreground">
                      <TrendingUp className="h-3 w-3 text-teal-500 mt-0.5 flex-shrink-0" />
                      <span>{program.match_reason}</span>
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center justify-between pt-1 border-t border-border/50">
                      <div>
                        <p className="text-xs text-muted-foreground">Est. Value</p>
                        <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(program.estimated_value)}
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Layers className="h-3 w-3" />
                          <span>{program.stacking_count} stackable</span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <Link href="/discover">View Program</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-teal-600" />
                <CardTitle className="font-sora text-base">Recommendations to Increase Eligibility</CardTitle>
              </div>
              <CardDescription>AI-identified actions to unlock additional incentives for this project</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {results.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-teal-50/50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/50 flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-teal-700 dark:text-teal-400">{i + 1}</span>
                    </div>
                    <p className="text-sm text-foreground">{rec}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-6">
            <Button variant="outline" onClick={() => { setScanState('idle'); setScanProgress(0); }}>
              <Sparkles className="mr-2 h-4 w-4" />
              Run New Scan
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => {
                const csv = `Program,Agency,Confidence,Estimated Value\n` +
                  results.programs.map(p => `"${p.name}","${p.agency}",${p.confidence}%,$${(p.estimated_value / 1e6).toFixed(1)}M`).join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `eligibility-results-${id}.csv`;
                a.click();
                URL.revokeObjectURL(url);
              }}>
                <Download className="mr-2 h-4 w-4" />
                Export Results
              </Button>
              <Button className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white" asChild>
                <Link href="/grant-writing">
                  Apply to Top Programs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
