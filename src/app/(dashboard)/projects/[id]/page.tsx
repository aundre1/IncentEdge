'use client';

import { use } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Download,
  Edit,
  Zap,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  Sun,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock projects data (matching projects/page.tsx)
const projects = [
  {
    id: '1',
    name: 'Mount Vernon Mixed-Use',
    description: 'Mixed-use development with 200 residential units and ground floor retail',
    sector_type: 'real-estate',
    building_type: 'Mixed-Use',
    status: 'active',
    address: '123 Main St, Mount Vernon, NY',
    state: 'NY',
    municipality: 'Mount Vernon',
    total_units: 200,
    affordable_units: 120,
    total_sqft: 250000,
    affordability_pct: 60,
    total_development_cost: 85000000,
    total_potential_incentives: 45200000,
    total_captured_incentives: 12500000,
    applications: 3,
    matches: 12,
    progress: 65,
    match_score: 87,
    estimated_completion: '2027-06-30',
    created_at: '2025-11-15',
    last_analysis: '2026-02-20',
    first_application: '2025-12-10',
    certifications: ['LEED Silver', 'ENERGY STAR'],
    entity_type: 'LLC',
    project_type: 'New Construction',
  },
  {
    id: '2',
    name: 'Yonkers Affordable Housing',
    description: 'LIHTC affordable housing project with 150 units',
    sector_type: 'real-estate',
    building_type: 'Multifamily',
    status: 'active',
    address: '456 Oak Ave, Yonkers, NY',
    state: 'NY',
    municipality: 'Yonkers',
    total_units: 150,
    affordable_units: 150,
    total_sqft: 180000,
    affordability_pct: 100,
    total_development_cost: 55000000,
    total_potential_incentives: 28500000,
    total_captured_incentives: 0,
    applications: 2,
    matches: 8,
    progress: 40,
    match_score: 92,
    estimated_completion: '2027-12-15',
    created_at: '2025-12-01',
    last_analysis: '2026-02-18',
    first_application: '2026-01-05',
    certifications: ['ENERGY STAR'],
    entity_type: 'Nonprofit',
    project_type: 'New Construction',
  },
  {
    id: '3',
    name: 'New Rochelle Solar Farm',
    description: '25 MW utility-scale solar installation',
    sector_type: 'clean-energy',
    building_type: 'Solar',
    status: 'on-hold',
    address: 'Industrial Park Rd, New Rochelle, NY',
    state: 'NY',
    municipality: 'New Rochelle',
    total_units: null,
    affordable_units: null,
    total_sqft: null,
    affordability_pct: null,
    capacity_mw: 25,
    total_development_cost: 32000000,
    total_potential_incentives: 15800000,
    total_captured_incentives: 0,
    applications: 1,
    matches: 15,
    progress: 20,
    match_score: 78,
    estimated_completion: '2026-09-30',
    created_at: '2026-01-05',
    last_analysis: '2026-02-15',
    first_application: null,
    certifications: ['Solar/Renewable'],
    entity_type: 'LLC',
    project_type: 'New Construction',
  },
  {
    id: '4',
    name: 'White Plains Office Conversion',
    description: 'Office-to-residential conversion project',
    sector_type: 'real-estate',
    building_type: 'Mixed-Use',
    status: 'active',
    address: '789 Corporate Blvd, White Plains, NY',
    state: 'NY',
    municipality: 'White Plains',
    total_units: 180,
    affordable_units: 54,
    total_sqft: 220000,
    affordability_pct: 30,
    total_development_cost: 72000000,
    total_potential_incentives: 38400000,
    total_captured_incentives: 8200000,
    applications: 4,
    matches: 10,
    progress: 55,
    match_score: 83,
    estimated_completion: '2027-03-15',
    created_at: '2025-10-20',
    last_analysis: '2026-02-22',
    first_application: '2025-11-30',
    certifications: ['LEED Gold', 'Prevailing Wage'],
    entity_type: 'Corp',
    project_type: 'Rehabilitation',
  },
];

// Per-project incentive matches mock data
const incentiveMatchesByProject: Record<string, Array<{
  id: string;
  name: string;
  agency: string;
  confidence: number;
  estimated_value: number;
  reasons: string[];
  category: string;
}>> = {
  '1': [
    { id: 'm1', name: 'Low-Income Housing Tax Credit (LIHTC)', agency: 'NY HCR', confidence: 95, estimated_value: 18000000, reasons: ['60% affordable units meets threshold', 'Westchester County qualified census tract'], category: 'Tax Credit' },
    { id: 'm2', name: 'HUD HOME Investment Partnerships', agency: 'HUD', confidence: 88, estimated_value: 4500000, reasons: ['Mixed-use with affordable component', 'Mount Vernon priority area'], category: 'Grant' },
    { id: 'm3', name: 'NY State Affordable Housing Program', agency: 'NYSHCR', confidence: 85, estimated_value: 6200000, reasons: ['120 affordable units qualifies', 'Mixed-income development'], category: 'Grant' },
    { id: 'm4', name: '421-a Tax Exemption', agency: 'NYC/State', confidence: 82, estimated_value: 9800000, reasons: ['Residential units over retail base', 'Prevailing wage eligible'], category: 'Property Tax' },
    { id: 'm5', name: 'Community Development Block Grant', agency: 'HUD / Westchester', confidence: 75, estimated_value: 2100000, reasons: ['Serves low/mod income residents', 'Community impact area'], category: 'Grant' },
    { id: 'm6', name: 'Federal Historic Tax Credit', agency: 'IRS / NPS', confidence: 62, estimated_value: 3800000, reasons: ['Historic district adjacency', 'Rehabilitation of existing structures'], category: 'Tax Credit' },
  ],
  '2': [
    { id: 'm1', name: 'Low-Income Housing Tax Credit (LIHTC)', agency: 'NY HCR', confidence: 98, estimated_value: 14200000, reasons: ['100% affordable units — maximum LIHTC score', 'Yonkers priority jurisdiction'], category: 'Tax Credit' },
    { id: 'm2', name: 'HOME Investment Partnerships Program', agency: 'HUD', confidence: 91, estimated_value: 3800000, reasons: ['100% affordable qualifies for max HOME funds', 'Westchester HOME consortium'], category: 'Grant' },
    { id: 'm3', name: 'Federal Housing Trust Fund', agency: 'HUD', confidence: 87, estimated_value: 5200000, reasons: ['Extremely low-income set-aside', 'Nonprofit sponsor qualifies'], category: 'Grant' },
    { id: 'm4', name: 'NY Homes for Working Families', agency: 'NYSHCR', confidence: 84, estimated_value: 4100000, reasons: ['100% affordable multifamily', 'Working family income targeting'], category: 'Grant' },
    { id: 'm5', name: 'Community Renewal Tax Relief Act', agency: 'NYS', confidence: 71, estimated_value: 1200000, reasons: ['Yonkers designated renewal community', 'New construction affordable units'], category: 'Tax Credit' },
  ],
  '3': [
    { id: 'm1', name: 'Investment Tax Credit (ITC) — Clean Energy', agency: 'IRS', confidence: 96, estimated_value: 9600000, reasons: ['25 MW solar qualifies at 30% base ITC', 'Domestic content bonus eligible'], category: 'Tax Credit' },
    { id: 'm2', name: 'NY-Sun Megawatt Block Incentive', agency: 'NYSERDA', confidence: 90, estimated_value: 2500000, reasons: ['Utility-scale solar 25 MW', 'Westchester Block eligible'], category: 'Rebate' },
    { id: 'm3', name: 'IRA Energy Community Bonus Credit', agency: 'IRS', confidence: 78, estimated_value: 1600000, reasons: ['New Rochelle industrial zone classification', '10% bonus on top of base ITC'], category: 'Tax Credit' },
    { id: 'm4', name: 'NYPA Renewable Energy Certificate Program', agency: 'NYPA', confidence: 74, estimated_value: 1200000, reasons: ['Utility-scale qualifies for REC program', 'Grid interconnection ready'], category: 'Rebate' },
    { id: 'm5', name: 'USDA Rural Energy for America Program', agency: 'USDA', confidence: 58, estimated_value: 500000, reasons: ['Proximity to rural-adjacent zone', 'Energy efficiency improvement'], category: 'Grant' },
  ],
  '4': [
    { id: 'm1', name: 'Federal Historic Tax Credit', agency: 'IRS / NPS', confidence: 94, estimated_value: 14400000, reasons: ['Office-to-residential qualifies as substantial rehab', 'White Plains historic district eligible'], category: 'Tax Credit' },
    { id: 'm2', name: 'Low-Income Housing Tax Credit (LIHTC)', agency: 'NY HCR', confidence: 86, estimated_value: 8900000, reasons: ['30% affordable units meets minimum threshold', 'Conversion project bonus points'], category: 'Tax Credit' },
    { id: 'm3', name: 'NY Office Conversion Accelerator', agency: 'ESD / NYSHCR', confidence: 88, estimated_value: 7200000, reasons: ['Office-to-residential conversion program', 'White Plains Priority Growth Center'], category: 'Grant' },
    { id: 'm4', name: '421-g Office Conversion Tax Exemption', agency: 'NYS', confidence: 82, estimated_value: 5400000, reasons: ['Commercial-to-residential conversion', '12-year tax benefit period'], category: 'Property Tax' },
    { id: 'm5', name: 'HUD Community Development Loan', agency: 'HUD', confidence: 68, estimated_value: 2500000, reasons: ['Mixed-income housing component', 'Community revitalization area'], category: 'Loan' },
  ],
};

// Per-project applications mock data
const applicationsByProject: Record<string, Array<{
  id: string;
  program: string;
  status: 'Submitted' | 'Under Review' | 'Approved' | 'Denied';
  submitted_date: string;
  expected_decision: string;
  amount: number;
}>> = {
  '1': [
    { id: 'a1', program: 'Low-Income Housing Tax Credit (LIHTC)', status: 'Under Review', submitted_date: '2025-12-10', expected_decision: '2026-03-15', amount: 18000000 },
    { id: 'a2', program: 'HUD HOME Investment Partnerships', status: 'Approved', submitted_date: '2025-12-20', expected_decision: '2026-02-01', amount: 4500000 },
    { id: 'a3', program: 'NY State Affordable Housing Program', status: 'Submitted', submitted_date: '2026-01-15', expected_decision: '2026-04-01', amount: 6200000 },
  ],
  '2': [
    { id: 'a1', program: 'Low-Income Housing Tax Credit (LIHTC)', status: 'Under Review', submitted_date: '2026-01-05', expected_decision: '2026-04-10', amount: 14200000 },
    { id: 'a2', program: 'HOME Investment Partnerships Program', status: 'Submitted', submitted_date: '2026-01-20', expected_decision: '2026-05-01', amount: 3800000 },
  ],
  '3': [
    { id: 'a1', program: 'NY-Sun Megawatt Block Incentive', status: 'Denied', submitted_date: '2026-01-10', expected_decision: '2026-02-15', amount: 2500000 },
  ],
  '4': [
    { id: 'a1', program: 'Federal Historic Tax Credit', status: 'Approved', submitted_date: '2025-11-30', expected_decision: '2026-01-15', amount: 14400000 },
    { id: 'a2', program: 'NY Office Conversion Accelerator', status: 'Under Review', submitted_date: '2025-12-15', expected_decision: '2026-03-01', amount: 7200000 },
    { id: 'a3', program: 'Low-Income Housing Tax Credit (LIHTC)', status: 'Submitted', submitted_date: '2026-01-10', expected_decision: '2026-04-15', amount: 8900000 },
    { id: 'a4', program: '421-g Office Conversion Tax Exemption', status: 'Approved', submitted_date: '2025-12-01', expected_decision: '2026-01-20', amount: 5400000 },
  ],
};

function formatCurrency(value: number) {
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'active':
      return <Badge variant="success">Active</Badge>;
    case 'on-hold':
      return <Badge variant="warning">On Hold</Badge>;
    case 'completed':
      return <Badge variant="info">Completed</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}

function getApplicationStatusIcon(status: string) {
  switch (status) {
    case 'Approved':
      return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    case 'Denied':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'Under Review':
      return <Clock className="h-4 w-4 text-amber-500" />;
    default:
      return <Clock className="h-4 w-4 text-blue-500" />;
  }
}

function getApplicationStatusBadge(status: string) {
  switch (status) {
    case 'Approved':
      return <Badge variant="success">Approved</Badge>;
    case 'Denied':
      return <Badge variant="destructive">Denied</Badge>;
    case 'Under Review':
      return <Badge variant="warning">Under Review</Badge>;
    case 'Submitted':
      return <Badge variant="info">Submitted</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const project = projects.find((p) => p.id === id);

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
              The project ID <span className="font-mono font-medium">{id}</span> does not match any existing project.
            </p>
            <Button className="mt-6" asChild>
              <Link href="/projects">View All Projects</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const captureRate = project.total_potential_incentives > 0
    ? Math.round((project.total_captured_incentives / project.total_potential_incentives) * 100)
    : 0;

  const incentiveMatches = incentiveMatchesByProject[id] ?? [];
  const applications = applicationsByProject[id] ?? [];
  const totalMatchedValue = incentiveMatches.reduce((sum, m) => sum + m.estimated_value, 0);

  const SectorIcon = project.sector_type === 'clean-energy' ? Sun : Building2;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/projects">
        <Button variant="ghost" className="gap-2 -ml-2">
          <ChevronLeft className="h-4 w-4" />
          Back to Projects
        </Button>
      </Link>

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-sm">
            <SectorIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight font-sora">{project.name}</h1>
              {getStatusBadge(project.status)}
            </div>
            <p className="text-muted-foreground text-sm mt-0.5">{project.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/projects/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Project
            </Link>
          </Button>
          <Button size="sm" className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white" asChild>
            <Link href={`/projects/${id}/eligibility`}>
              <Zap className="mr-2 h-4 w-4" />
              Run Eligibility
            </Link>
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Address + Metadata Strip */}
      <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground border rounded-lg px-4 py-3 bg-muted/30">
        <span className="flex items-center gap-1.5">
          <MapPin className="h-4 w-4 text-teal-500" />
          {project.address}
        </span>
        <span className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4 text-teal-500" />
          Est. completion: {formatDate(project.estimated_completion)}
        </span>
        <span className="flex items-center gap-1.5">
          <DollarSign className="h-4 w-4 text-teal-500" />
          TDC: <span className="font-mono font-semibold text-foreground">{formatCurrency(project.total_development_cost)}</span>
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Dev Cost</p>
            <p className="mt-1 text-2xl font-mono font-bold text-foreground">
              {formatCurrency(project.total_development_cost)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{project.building_type}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Potential Incentives</p>
            <p className="mt-1 text-2xl font-mono font-bold text-emerald-600">
              {formatCurrency(project.total_potential_incentives)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{project.matches} matched programs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Captured</p>
            <p className="mt-1 text-2xl font-mono font-bold text-teal-600">
              {formatCurrency(project.total_captured_incentives)}
            </p>
            <Progress value={captureRate} className="mt-2 h-1.5" />
            <p className="text-xs text-muted-foreground mt-1">{captureRate}% of potential</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Match Score</p>
            <p className="mt-1 text-2xl font-mono font-bold text-blue-600">
              {project.match_score}%
            </p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              <p className="text-xs text-muted-foreground">AI confidence rating</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="matches">
            Incentive Matches
            <Badge variant="secondary" className="ml-2 text-xs">{incentiveMatches.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="applications">
            Applications
            <Badge variant="secondary" className="ml-2 text-xs">{applications.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Project Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="font-sora">Project Details</CardTitle>
                <CardDescription>Core specifications and attributes</CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <dt className="text-muted-foreground">Building Type</dt>
                    <dd className="font-medium">{project.building_type}</dd>
                  </div>
                  {project.total_units != null && (
                    <div className="flex justify-between py-1 border-b border-border/50">
                      <dt className="text-muted-foreground">Total Units</dt>
                      <dd className="font-mono font-medium">{project.total_units.toLocaleString()}</dd>
                    </div>
                  )}
                  {project.affordable_units != null && (
                    <div className="flex justify-between py-1 border-b border-border/50">
                      <dt className="text-muted-foreground">Affordable Units</dt>
                      <dd className="font-mono font-medium">{project.affordable_units.toLocaleString()}</dd>
                    </div>
                  )}
                  {project.total_sqft != null && (
                    <div className="flex justify-between py-1 border-b border-border/50">
                      <dt className="text-muted-foreground">Total SqFt</dt>
                      <dd className="font-mono font-medium">{project.total_sqft.toLocaleString()} sf</dd>
                    </div>
                  )}
                  {project.affordability_pct != null && (
                    <div className="flex justify-between py-1 border-b border-border/50">
                      <dt className="text-muted-foreground">Affordability</dt>
                      <dd className="font-mono font-medium">{project.affordability_pct}%</dd>
                    </div>
                  )}
                  {project.certifications && project.certifications.length > 0 && (
                    <div className="flex justify-between py-1 border-b border-border/50">
                      <dt className="text-muted-foreground">Certifications</dt>
                      <dd className="flex flex-wrap gap-1 justify-end">
                        {project.certifications.map((cert) => (
                          <Badge key={cert} variant="secondary" className="text-xs">{cert}</Badge>
                        ))}
                      </dd>
                    </div>
                  )}
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <dt className="text-muted-foreground">Project Type</dt>
                    <dd className="font-medium">{project.project_type}</dd>
                  </div>
                  <div className="flex justify-between py-1">
                    <dt className="text-muted-foreground">Entity Type</dt>
                    <dd className="font-medium">{project.entity_type}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {/* Progress Card */}
            <Card>
              <CardHeader>
                <CardTitle className="font-sora">Incentive Progress</CardTitle>
                <CardDescription>Capture rate and key milestones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Capture Rate</span>
                    <span className="font-mono font-semibold text-teal-600">{captureRate}%</span>
                  </div>
                  <Progress value={captureRate} className="h-3" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Captured: {formatCurrency(project.total_captured_incentives)}</span>
                    <span>Potential: {formatCurrency(project.total_potential_incentives)}</span>
                  </div>
                </div>

                {/* Milestones */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold">Key Milestones</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="text-muted-foreground">Project Created</span>
                      </div>
                      <span className="font-mono text-xs text-muted-foreground">{formatDate(project.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="text-muted-foreground">Last Analysis</span>
                      </div>
                      <span className="font-mono text-xs text-muted-foreground">{formatDate(project.last_analysis)}</span>
                    </div>
                    {project.first_application ? (
                      <div className="flex items-center gap-3 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                        <div className="flex-1">
                          <span className="text-muted-foreground">First Application</span>
                        </div>
                        <span className="font-mono text-xs text-muted-foreground">{formatDate(project.first_application)}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1">
                          <span className="text-muted-foreground">First Application</span>
                        </div>
                        <span className="text-xs text-muted-foreground italic">Not yet submitted</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="h-4 w-4 text-blue-400 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="text-muted-foreground">Est. Completion</span>
                      </div>
                      <span className="font-mono text-xs text-muted-foreground">{formatDate(project.estimated_completion)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Incentive Matches Tab */}
        <TabsContent value="matches" className="mt-6 space-y-4">
          {/* Total Matched Value */}
          <Card className="border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/20">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Matched Value</p>
                <p className="text-2xl font-mono font-bold text-teal-700 dark:text-teal-400">
                  {formatCurrency(totalMatchedValue)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">{incentiveMatches.length} programs matched</p>
                <Button size="sm" className="mt-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white" asChild>
                  <Link href={`/projects/${id}/eligibility`}>Run Full Scan</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Matched Programs */}
          <div className="space-y-3">
            {incentiveMatches.map((match) => (
              <Card key={match.id}>
                <CardContent className="p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm">{match.name}</h3>
                        <Badge variant="outline" className="text-xs">{match.category}</Badge>
                        <span className="text-xs text-muted-foreground">{match.agency}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Match Confidence</span>
                          <span className="font-mono font-semibold text-teal-600">{match.confidence}%</span>
                        </div>
                        <Progress value={match.confidence} className="h-1.5" />
                      </div>
                      <ul className="space-y-1">
                        {match.reasons.map((reason, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Est. Value</p>
                        <p className="font-mono font-bold text-emerald-600">{formatCurrency(match.estimated_value)}</p>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <Link href="/grant-writing">Apply Now</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications" className="mt-6">
          {applications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-10 w-10 text-muted-foreground" />
                <h3 className="mt-4 text-base font-semibold font-sora">No applications yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Run an eligibility scan to find programs and start applying.
                </p>
                <Button className="mt-4" asChild>
                  <Link href={`/projects/${id}/eligibility`}>
                    <Zap className="mr-2 h-4 w-4" />
                    Run Eligibility Scan
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="font-sora">Application Tracker</CardTitle>
                <CardDescription>Track all submitted applications and their statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {applications.map((app) => (
                    <div key={app.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
                      <div className="flex items-start gap-3 flex-1">
                        {getApplicationStatusIcon(app.status)}
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{app.program}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Submitted: <span className="font-mono">{formatDate(app.submitted_date)}</span>
                            {' · '}
                            Decision: <span className="font-mono">{formatDate(app.expected_decision)}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Amount</p>
                          <p className="font-mono font-semibold text-sm text-emerald-600">{formatCurrency(app.amount)}</p>
                        </div>
                        {getApplicationStatusBadge(app.status)}
                        <Button size="sm" variant="ghost">View</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold font-sora">Generated Reports</h2>
            <Button asChild>
              <Link href="/reports">
                <FileText className="mr-2 h-4 w-4" />
                Generate New Report
              </Link>
            </Button>
          </div>

          <div className="space-y-3">
            {[
              { name: `${project.name} — Investor Summary`, type: 'Investor', date: project.last_analysis },
              { name: `${project.name} — Incentive Analysis`, type: 'Analysis', date: project.created_at },
            ].map((report, i) => (
              <Card key={i}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{report.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="info" className="text-xs">{report.type}</Badge>
                        <span className="text-xs text-muted-foreground">Generated {formatDate(report.date)}</span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                </CardContent>
              </Card>
            ))}

            {applications.some((a) => a.status === 'Approved') && (
              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                      <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{project.name} — Compliance Report</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="success" className="text-xs">Compliance</Badge>
                        <span className="text-xs text-muted-foreground">Generated {formatDate(project.last_analysis)}</span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
