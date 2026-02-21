'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  FileText,
  Download,
  Printer,
  Share2,
  Calendar,
  Building2,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Clock,
  Leaf,
  BarChart3,
  PieChart,
  Filter,
  ChevronDown,
  Loader2,
  FileBarChart,
  FileSpreadsheet,
  Mail,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';

interface Project {
  id: string;
  name: string;
  city: string;
  state: string;
  building_type: string;
  total_development_cost: number;
  total_potential_incentives: number;
  total_captured_incentives: number;
}

interface ReportData {
  project: Project | null;
  incentives: any[];
  generatedAt: Date;
  reportType: string;
}

function formatCurrency(value: number): string {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

const REPORT_TYPES = [
  {
    id: 'portfolio-summary',
    name: 'Portfolio Summary',
    description: 'High-level overview of all projects and total incentive value',
    icon: FileBarChart,
  },
  {
    id: 'incentive-analysis',
    name: 'Incentive Analysis',
    description: 'Detailed breakdown of eligible incentives by category',
    icon: PieChart,
  },
  {
    id: 'project-detail',
    name: 'Project Detail Report',
    description: 'Comprehensive single-project incentive report for clients',
    icon: Building2,
  },
  {
    id: 'broker-summary',
    name: 'Broker Client Summary',
    description: 'Print-ready report for broker client presentations',
    icon: FileText,
  },
];

function ReportsContent() {
  const searchParams = useSearchParams();
  const { profile, user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedReportType, setSelectedReportType] = useState<string>('portfolio-summary');
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  // Load projects
  useEffect(() => {
    async function fetchProjects() {
      if (!profile?.organization_id) return;

      const supabase = createClient();
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (data) {
        setProjects(data);
      }
      setLoading(false);
    }

    fetchProjects();
  }, [profile?.organization_id]);

  // Check for project param in URL
  useEffect(() => {
    const projectId = searchParams.get('project');
    if (projectId) {
      setSelectedProject(projectId);
      setSelectedReportType('project-detail');
    }
  }, [searchParams]);

  // Generate report
  const handleGenerateReport = async () => {
    setGenerating(true);

    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 1000));

    const project = selectedProject !== 'all'
      ? projects.find(p => p.id === selectedProject) || null
      : null;

    setReportData({
      project,
      incentives: [],
      generatedAt: new Date(),
      reportType: selectedReportType,
    });

    setShowReport(true);
    setGenerating(false);
  };

  // Print report
  const handlePrint = () => {
    window.print();
  };

  // Calculate totals
  const totalPotential = projects.reduce((sum, p) => sum + (p.total_potential_incentives || 0), 0);
  const totalCaptured = projects.reduce((sum, p) => sum + (p.total_captured_incentives || 0), 0);
  const totalTDC = projects.reduce((sum, p) => sum + (p.total_development_cost || 0), 0);

  if (showReport && reportData) {
    return (
      <div className="space-y-6">
        {/* Report Header - No Print */}
        <div className="flex items-center justify-between no-print">
          <Button variant="outline" onClick={() => setShowReport(false)}>
            Back to Reports
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button variant="outline">
              <Mail className="mr-2 h-4 w-4" />
              Email
            </Button>
          </div>
        </div>

        {/* Print-Ready Report */}
        <div ref={reportRef} className="bg-white dark:bg-navy-900 rounded-lg shadow-lg p-8 print:p-0 print:shadow-none">
          {/* Report Header */}
          <div className="flex items-start justify-between border-b border-navy-200 dark:border-navy-700 pb-6 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold font-sora text-navy-900 dark:text-white">
                    {reportData.project ? reportData.project.name : 'Portfolio'} Incentive Report
                  </h1>
                  <p className="text-slate-500">
                    Generated by IncentEdge on {formatDate(reportData.generatedAt)}
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Prepared for</p>
              <p className="font-semibold text-navy-900 dark:text-white">
                {profile?.full_name || user?.email}
              </p>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold font-sora text-navy-900 dark:text-white mb-4">
              Executive Summary
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-navy-50 dark:bg-navy-800 rounded-lg">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Projects</p>
                <p className="text-2xl font-bold font-mono text-navy-900 dark:text-white">
                  {reportData.project ? 1 : projects.length}
                </p>
              </div>
              <div className="p-4 bg-navy-50 dark:bg-navy-800 rounded-lg">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Development Cost</p>
                <p className="text-2xl font-bold font-mono text-navy-900 dark:text-white">
                  {formatCurrency(reportData.project?.total_development_cost || totalTDC)}
                </p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-xs text-blue-600 uppercase tracking-wider mb-1">Potential Incentives</p>
                <p className="text-2xl font-bold font-mono text-blue-600">
                  {formatCurrency(reportData.project?.total_potential_incentives || totalPotential)}
                </p>
              </div>
              <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                <p className="text-xs text-teal-600 uppercase tracking-wider mb-1">ROI Ratio</p>
                <p className="text-2xl font-bold font-mono text-teal-600">
                  {(((reportData.project?.total_potential_incentives || totalPotential) /
                    (reportData.project?.total_development_cost || totalTDC || 1)) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {/* Value Proposition */}
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-500/10 to-teal-500/10 rounded-lg border border-blue-500/20">
            <h3 className="font-semibold text-navy-900 dark:text-white mb-2">
              Key Finding
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              {reportData.project ? (
                <>
                  <strong>{reportData.project.name}</strong> in {reportData.project.city}, {reportData.project.state} has{' '}
                  <strong className="text-blue-600">
                    {formatCurrency(reportData.project.total_potential_incentives)}
                  </strong>{' '}
                  in identified incentive opportunities, representing{' '}
                  <strong className="text-teal-600">
                    {((reportData.project.total_potential_incentives / (reportData.project.total_development_cost || 1)) * 100).toFixed(1)}%
                  </strong>{' '}
                  of the total development cost. This analysis includes federal tax credits, state grants,
                  and local incentive programs.
                </>
              ) : (
                <>
                  Your portfolio of <strong>{projects.length} projects</strong> has{' '}
                  <strong className="text-blue-600">{formatCurrency(totalPotential)}</strong>{' '}
                  in total identified incentive opportunities, representing{' '}
                  <strong className="text-teal-600">
                    {((totalPotential / (totalTDC || 1)) * 100).toFixed(1)}%
                  </strong>{' '}
                  of combined development costs.
                </>
              )}
            </p>
          </div>

          {/* Incentive Categories */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold font-sora text-navy-900 dark:text-white mb-4">
              Incentive Breakdown by Category
            </h2>
            <table className="data-table w-full">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Type</th>
                  <th className="text-right">Est. Value</th>
                  <th className="text-right">% of Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <span className="badge-federal text-xs px-2 py-1 rounded">Federal</span>
                  </td>
                  <td>ITC Solar (30%)</td>
                  <td className="text-right font-mono">{formatCurrency((reportData.project?.total_potential_incentives || totalPotential) * 0.35)}</td>
                  <td className="text-right">35%</td>
                </tr>
                <tr>
                  <td>
                    <span className="badge-federal text-xs px-2 py-1 rounded">Federal</span>
                  </td>
                  <td>179D Deduction</td>
                  <td className="text-right font-mono">{formatCurrency((reportData.project?.total_potential_incentives || totalPotential) * 0.15)}</td>
                  <td className="text-right">15%</td>
                </tr>
                <tr>
                  <td>
                    <span className="badge-state text-xs px-2 py-1 rounded">State</span>
                  </td>
                  <td>NYSERDA PON</td>
                  <td className="text-right font-mono">{formatCurrency((reportData.project?.total_potential_incentives || totalPotential) * 0.20)}</td>
                  <td className="text-right">20%</td>
                </tr>
                <tr>
                  <td>
                    <span className="badge-local text-xs px-2 py-1 rounded">Local</span>
                  </td>
                  <td>IDA PILOT Abatement</td>
                  <td className="text-right font-mono">{formatCurrency((reportData.project?.total_potential_incentives || totalPotential) * 0.25)}</td>
                  <td className="text-right">25%</td>
                </tr>
                <tr>
                  <td>
                    <span className="badge-utility text-xs px-2 py-1 rounded">Utility</span>
                  </td>
                  <td>Con Edison Rebates</td>
                  <td className="text-right font-mono">{formatCurrency((reportData.project?.total_potential_incentives || totalPotential) * 0.05)}</td>
                  <td className="text-right">5%</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="font-semibold">
                  <td colSpan={2}>Total</td>
                  <td className="text-right font-mono text-blue-600">
                    {formatCurrency(reportData.project?.total_potential_incentives || totalPotential)}
                  </td>
                  <td className="text-right">100%</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Green/IRA Incentives Highlight */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold font-sora text-navy-900 dark:text-white mb-4 flex items-center gap-2">
              <Leaf className="w-5 h-5 text-emerald-500" />
              Clean Energy & IRA Incentives
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <p className="text-xs text-emerald-600 uppercase tracking-wider mb-1">ITC Solar</p>
                <p className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400">30%</p>
                <p className="text-sm text-emerald-600 mt-1">Investment Tax Credit</p>
              </div>
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <p className="text-xs text-emerald-600 uppercase tracking-wider mb-1">179D Bonus</p>
                <p className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400">$5.36/sf</p>
                <p className="text-sm text-emerald-600 mt-1">Energy Efficiency Deduction</p>
              </div>
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <p className="text-xs text-emerald-600 uppercase tracking-wider mb-1">45L Credit</p>
                <p className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400">$5,000/unit</p>
                <p className="text-sm text-emerald-600 mt-1">New Energy Efficient Home</p>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold font-sora text-navy-900 dark:text-white mb-4">
              Recommended Next Steps
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-navy-50 dark:bg-navy-800 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-teal-500 mt-0.5" />
                <div>
                  <p className="font-medium text-navy-900 dark:text-white">Complete eligibility verification</p>
                  <p className="text-sm text-slate-500">Confirm project parameters meet program requirements</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-navy-50 dark:bg-navy-800 rounded-lg">
                <Clock className="w-5 h-5 text-amber-500 mt-0.5" />
                <div>
                  <p className="font-medium text-navy-900 dark:text-white">Review application deadlines</p>
                  <p className="text-sm text-slate-500">NYSERDA PON deadline: March 15, 2026</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-navy-50 dark:bg-navy-800 rounded-lg">
                <FileText className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium text-navy-900 dark:text-white">Prepare documentation</p>
                  <p className="text-sm text-slate-500">Energy models, cost certifications, and compliance reports</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-navy-200 dark:border-navy-700 pt-6 mt-8">
            <div className="flex items-center justify-between text-sm text-slate-500">
              <div>
                <p>Generated by IncentEdge V41</p>
                <p>Confidential - For Client Use Only</p>
              </div>
              <div className="text-right">
                <p>{formatDate(reportData.generatedAt)}</p>
                <p>Page 1 of 1</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-sora text-navy-900 dark:text-white">
          Reports
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Generate professional incentive analysis reports for clients
        </p>
      </div>

      {/* Report Generator */}
      <Card className="card-v41">
        <CardHeader>
          <CardTitle className="font-sora">Generate Report</CardTitle>
          <CardDescription>
            Create print-ready reports for brokers and client presentations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Type Selection */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {REPORT_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedReportType(type.id)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedReportType === type.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-navy-200 dark:border-navy-700 hover:border-blue-300'
                }`}
              >
                <type.icon className={`w-6 h-6 mb-2 ${
                  selectedReportType === type.id ? 'text-blue-600' : 'text-slate-400'
                }`} />
                <p className="font-medium text-navy-900 dark:text-white">{type.name}</p>
                <p className="text-xs text-slate-500 mt-1">{type.description}</p>
              </button>
            ))}
          </div>

          <Separator />

          {/* Project Selection */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Select Project</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects (Portfolio)</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name} - {project.city}, {project.state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex gap-3">
            <Button
              onClick={handleGenerateReport}
              disabled={generating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {generating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileText className="mr-2 h-4 w-4" />
              )}
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card className="card-v41">
        <CardHeader>
          <CardTitle className="font-sora">Recent Reports</CardTitle>
          <CardDescription>Previously generated reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p>No reports generated yet</p>
            <p className="text-sm">Generate your first report above</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="container py-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading reports...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ReportsContent />
    </Suspense>
  );
}
