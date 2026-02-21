'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Building2,
  DollarSign,
  TrendingUp,
  FileText,
  ArrowUpRight,
  MapPin,
  MoreVertical,
  Filter,
  Search,
  Calculator,
  Leaf,
  Clock,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { ROICalculator, ROIQuickView } from '@/components/dashboard/roi-calculator';

interface Project {
  id: string;
  name: string;
  description: string;
  address_line1: string;
  city: string;
  state: string;
  building_type: string;
  total_units: number;
  affordable_units: number;
  total_development_cost: number;
  total_potential_incentives: number;
  total_captured_incentives: number;
  project_status: string;
  created_at: string;
}

function formatCurrency(value: number) {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

function getStatusColor(status: string) {
  switch (status) {
    case 'active': return 'status-success';
    case 'on-hold': return 'status-warning';
    case 'completed': return 'status-info';
    default: return 'status-neutral';
  }
}

export default function PortfolioPage() {
  const { profile } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showROICalculator, setShowROICalculator] = useState(false);

  useEffect(() => {
    async function fetchProjects() {
      if (!profile?.organization_id) return;

      const supabase = createClient();
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setProjects(data);
      }
      setLoading(false);
    }

    fetchProjects();
  }, [profile?.organization_id]);

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate portfolio stats
  const totalPotential = projects.reduce((sum, p) => sum + (p.total_potential_incentives || 0), 0);
  const totalCaptured = projects.reduce((sum, p) => sum + (p.total_captured_incentives || 0), 0);
  const totalTDC = projects.reduce((sum, p) => sum + (p.total_development_cost || 0), 0);
  const overallCaptureRate = totalPotential > 0 ? (totalCaptured / totalPotential) * 100 : 0;
  const overallROI = totalTDC > 0 ? (totalPotential / totalTDC) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-sora text-navy-900 dark:text-white">
            Portfolio
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Manage your projects and track incentive value capture
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowROICalculator(!showROICalculator)}
            className="border-navy-200 dark:border-navy-700"
          >
            <Calculator className="mr-2 h-4 w-4" />
            ROI Calculator
          </Button>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/projects/new">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Link>
          </Button>
        </div>
      </div>

      {/* ROI Calculator (toggleable) */}
      {showROICalculator && (
        <ROICalculator
          initialTDC={totalTDC}
          initialPotentialIncentives={totalPotential}
          initialCapturedIncentives={totalCaptured}
          projectName="Portfolio Total"
        />
      )}

      {/* V41: Portfolio Stats - Bloomberg Style Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="card-v41 metric-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-blue-500" />
              <span className="metric-label">Total Projects</span>
            </div>
            <p className="metric-value font-mono">{projects.length}</p>
            <p className="text-xs text-slate-500 mt-1">
              {projects.filter(p => p.project_status === 'active').length} active
            </p>
          </CardContent>
        </Card>

        <Card className="card-v41 metric-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-slate-500" />
              <span className="metric-label">Total TDC</span>
            </div>
            <p className="metric-value font-mono">{formatCurrency(totalTDC)}</p>
            <p className="text-xs text-slate-500 mt-1">
              development cost
            </p>
          </CardContent>
        </Card>

        <Card className="card-v41 metric-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span className="metric-label">Potential Value</span>
            </div>
            <p className="metric-value highlight font-mono">{formatCurrency(totalPotential)}</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="metric-delta positive">
                <ArrowUpRight className="w-3 h-3" />
                {overallROI.toFixed(1)}%
              </span>
              <span className="text-xs text-slate-500">of TDC</span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-v41 metric-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-teal-500" />
              <span className="metric-label">Captured</span>
            </div>
            <p className="metric-value font-mono text-teal-600 dark:text-teal-400">
              {formatCurrency(totalCaptured)}
            </p>
            <div className="mt-2">
              <div className="progress-bar">
                <div
                  className="progress-fill bg-teal-500"
                  style={{ width: `${Math.min(overallCaptureRate, 100)}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {overallCaptureRate.toFixed(1)}% captured
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-v41 metric-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Leaf className="w-4 h-4 text-emerald-500" />
              <span className="metric-label">Green Incentives</span>
            </div>
            <p className="metric-value font-mono text-emerald-600 dark:text-emerald-400">
              ~{Math.round(totalPotential * 0.4 / 1000000)}M
            </p>
            <p className="text-xs text-slate-500 mt-1">
              IRA + clean energy
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white dark:bg-navy-900 border-navy-200 dark:border-navy-700"
          />
        </div>
        <Button variant="outline" className="border-navy-200 dark:border-navy-700">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card className="card-v41">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-slate-300 dark:text-slate-600" />
            <h3 className="mt-4 text-lg font-semibold font-sora text-navy-900 dark:text-white">
              No projects yet
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Create your first project to start discovering incentives.
            </p>
            <Button className="mt-4 bg-blue-600 hover:bg-blue-700" asChild>
              <Link href="/projects/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project) => {
            const captureRate = project.total_potential_incentives > 0
              ? (project.total_captured_incentives / project.total_potential_incentives) * 100
              : 0;
            const projectROI = project.total_development_cost > 0
              ? (project.total_potential_incentives / project.total_development_cost) * 100
              : 0;

            return (
              <Card
                key={project.id}
                className="card-v41 group"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg font-sora">
                        <Link
                          href={`/projects/${project.id}`}
                          className="text-navy-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          {project.name}
                        </Link>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {project.city}, {project.state}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`status-badge ${getStatusColor(project.project_status)}`}>
                        {project.project_status}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white dark:bg-navy-900 border-navy-200 dark:border-navy-700">
                          <DropdownMenuItem asChild>
                            <Link href={`/projects/${project.id}`}>View Details</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/analysis?project=${project.id}`}>Run Analysis</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/reports?project=${project.id}`}>Generate Report</Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Project Info */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-slate-500">Type:</span>{' '}
                      <span className="font-medium text-navy-900 dark:text-white">
                        {project.building_type || 'N/A'}
                      </span>
                    </div>
                    {project.total_units && (
                      <div>
                        <span className="text-slate-500">Units:</span>{' '}
                        <span className="font-medium text-navy-900 dark:text-white">
                          {project.total_units}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-slate-500">TDC:</span>{' '}
                      <span className="font-medium font-mono text-navy-900 dark:text-white">
                        {formatCurrency(project.total_development_cost || 0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">ROI:</span>{' '}
                      <span className="font-medium font-mono text-blue-600 dark:text-blue-400">
                        {projectROI.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Incentive Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Incentive Capture</span>
                      <span className="font-medium font-mono text-navy-900 dark:text-white">
                        {formatCurrency(project.total_captured_incentives || 0)} / {formatCurrency(project.total_potential_incentives || 0)}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${Math.min(captureRate, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-slate-500 text-right">
                      {captureRate.toFixed(0)}% captured
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-navy-200 dark:border-navy-700"
                      asChild
                    >
                      <Link href={`/projects/${project.id}`}>
                        View Details
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      asChild
                    >
                      <Link href={`/analysis?project=${project.id}`}>
                        <ArrowUpRight className="mr-1 h-3 w-3" />
                        Analyze
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Quick Actions */}
      <Card className="card-v41">
        <CardHeader>
          <CardTitle className="font-sora">Quick Actions</CardTitle>
          <CardDescription>Common tasks to accelerate your incentive capture</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto flex-col gap-2 p-4 border-navy-200 dark:border-navy-700" asChild>
              <Link href="/projects/new">
                <Building2 className="h-5 w-5 text-blue-500" />
                <span>New Project</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 p-4 border-navy-200 dark:border-navy-700" asChild>
              <Link href="/analysis">
                <Calculator className="h-5 w-5 text-teal-500" />
                <span>Run Analysis</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 p-4 border-navy-200 dark:border-navy-700" asChild>
              <Link href="/discover">
                <Search className="h-5 w-5 text-purple-500" />
                <span>Discover Incentives</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 p-4 border-navy-200 dark:border-navy-700" asChild>
              <Link href="/reports">
                <FileText className="h-5 w-5 text-amber-500" />
                <span>Generate Report</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
