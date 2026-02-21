'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Building2,
  RefreshCw,
  Download,
  Share2,
  Loader2,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IncentiveMatcher } from '@/components/dashboard/incentive-matcher';
import { createClient } from '@/lib/supabase/client';
import type { Project, IncentiveProgram } from '@/types';

export default function MatchingPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [incentives, setIncentives] = useState<IncentiveProgram[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    const supabase = createClient();

    try {
      // Load projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;

      // Load incentive programs
      const { data: incentivesData, error: incentivesError } = await supabase
        .from('incentive_programs')
        .select('*')
        .eq('status', 'active')
        .limit(500);

      if (incentivesError) {
        // Fallback to incentive_awards if incentive_programs doesn't exist
        const { data: awardsData, error: awardsError } = await supabase
          .from('incentive_awards')
          .select('*')
          .limit(500);

        if (awardsError) throw awardsError;

        // Map awards to program format
        const mappedIncentives = (awardsData || []).map((award: Record<string, unknown>) => ({
          id: String(award.id),
          name: award.title || award.name || 'Unknown Program',
          category: award.category || 'state',
          jurisdiction_level: award.source === 'Federal' ? 'federal' :
            award.source === 'Utility' ? 'utility' :
            award.source === 'Local' ? 'local' : 'state',
          state: award.state,
          status: 'active',
          amount_max: award.funding_amount || award.amount_max,
          amount_fixed: award.amount_fixed,
          amount_percentage: award.amount_percentage,
          sector_types: award.sector_types || [],
          building_types: award.building_types || [],
          technology_types: award.technology_types || [],
          counties: award.counties || [],
          municipalities: award.municipalities || [],
        })) as IncentiveProgram[];

        setIncentives(mappedIncentives);
      } else {
        setIncentives(incentivesData || []);
      }

      setProjects(projectsData || []);

      // Auto-select first project
      if (projectsData && projectsData.length > 0 && !selectedProjectId) {
        setSelectedProjectId(projectsData[0].id);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  function handleExport() {
    // Export matching results as CSV
    if (!selectedProject) return;

    const csvContent = 'data:text/csv;charset=utf-8,' +
      'Program,Category,Match Score,Estimated Value\n' +
      'Export functionality coming soon';

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${selectedProject.name}-incentive-matches.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleViewIncentive(id: string) {
    router.push(`/discover/${id}`);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-slate-500">Loading matching engine...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardContent className="flex flex-col items-center py-8">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
              Error Loading Data
            </h3>
            <p className="mt-2 text-sm text-slate-500 text-center">{error}</p>
            <Button className="mt-4" onClick={loadData}>
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
              Create a project first to start matching it with incentive programs.
            </p>
            <Button className="mt-4 bg-blue-600 hover:bg-blue-700" onClick={() => router.push('/projects/new')}>
              Create Project
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-sora">
            Incentive Matching
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            AI-powered matching across {incentives.length.toLocaleString()}+ programs
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Project Selector */}
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400" />
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger className="w-[280px] bg-white dark:bg-navy-800 border-slate-200 dark:border-navy-700">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    <div className="flex items-center gap-2">
                      <span>{project.name}</span>
                      {project.state && (
                        <span className="text-xs text-slate-400">({project.state})</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={refreshing}
            className="border-slate-200 dark:border-navy-700"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleExport}
            className="border-slate-200 dark:border-navy-700"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Project Summary Card */}
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
                    {selectedProject.state} | {selectedProject.building_type || 'Mixed Use'} | {selectedProject.total_units || '—'} units
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm">
                {selectedProject.total_development_cost && (
                  <div>
                    <span className="text-slate-500">TDC:</span>{' '}
                    <span className="font-mono font-semibold text-slate-900 dark:text-white">
                      ${(selectedProject.total_development_cost / 1e6).toFixed(1)}M
                    </span>
                  </div>
                )}
                {selectedProject.affordable_units && selectedProject.total_units && (
                  <div>
                    <span className="text-slate-500">Affordable:</span>{' '}
                    <span className="font-mono font-semibold text-teal-600">
                      {((selectedProject.affordable_units / selectedProject.total_units) * 100).toFixed(0)}%
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

      {/* Matcher Component */}
      {selectedProject && (
        <IncentiveMatcher
          project={selectedProject}
          incentives={incentives}
          onViewIncentive={handleViewIncentive}
        />
      )}
    </div>
  );
}
