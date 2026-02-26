'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Database,
  Building2,
  DollarSign,
  Target,
  Plus,
  FileText,
  ArrowRight,
  ArrowUpRight,
  Search,
  Clock,
  TrendingUp,
  Zap,
  CheckCircle2,
  FileSearch,
  Loader2,
  Sparkles,
  CircleDot,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatsCard } from '@/components/StatsCard';
import { DirectPayBadge } from '@/components/DirectPayBadge';
import { formatCompactCurrency, formatRelativeTime } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

interface DashboardStats {
  programCount: number;
  projectsAnalyzed: number;
  totalValueFound: number;
  averageMatchScore: number;
  recentActivity: RecentActivityItem[];
}

interface RecentActivityItem {
  id: string;
  type: 'analysis' | 'application' | 'report';
  title: string;
  subtitle: string;
  timestamp: string;
  value?: number;
  matchScore?: number;
}

const activityIcons = {
  analysis: Search,
  application: FileText,
  report: FileSearch,
};

const activityColors = {
  analysis: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
  application: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30',
  report: 'text-amber-500 bg-amber-100 dark:bg-amber-900/30',
};

export default function DashboardPage() {
  const { profile, user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'there';
  const isNewUser = !loading && stats?.projectsAnalyzed === 0;

  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        const response = await fetch('/api/dashboard/stats');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard stats');
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Unable to load dashboard stats');
        // Set fallback demo data
        setStats({
          programCount: 24805,
          projectsAnalyzed: 12,
          totalValueFound: 4850000,
          averageMatchScore: 87,
          recentActivity: [
            {
              id: 'demo-1',
              type: 'analysis',
              title: 'Downtown Mixed-Use Development',
              subtitle: 'Federal + State incentives identified',
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              value: 1250000,
              matchScore: 92,
            },
            {
              id: 'demo-2',
              type: 'analysis',
              title: 'Solar Farm - Phase 2',
              subtitle: 'IRA Direct Pay eligible',
              timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
              value: 3200000,
              matchScore: 95,
            },
            {
              id: 'demo-3',
              type: 'application',
              title: '45L Tax Credit Application',
              subtitle: 'Status: Under Review',
              timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              value: 250000,
            },
          ],
        });
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-sora text-navy-900 dark:text-white">
            Welcome back, {displayName}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Here&apos;s your incentive discovery overview.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild className="border-navy-200 dark:border-navy-700">
            <Link href="/reports">
              <FileText className="mr-2 h-4 w-4" />
              View Reports
            </Link>
          </Button>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/analysis">
              <Plus className="mr-2 h-4 w-4" />
              New Analysis
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Programs in Database"
          value={stats?.programCount ?? 0}
          description="Active incentive programs"
          icon={Database}
          loading={loading}
        />
        <StatsCard
          title="Projects Analyzed"
          value={stats?.projectsAnalyzed ?? 0}
          description="Your analysis history"
          icon={Building2}
          loading={loading}
          trend={stats?.projectsAnalyzed ? { value: 12, direction: 'up', label: 'this month' } : undefined}
        />
        <StatsCard
          title="Total Value Found"
          value={stats?.totalValueFound ? formatCompactCurrency(stats.totalValueFound) : '$0'}
          description="Potential incentive value"
          icon={DollarSign}
          loading={loading}
        />
        <StatsCard
          title="Avg Match Score"
          value={stats?.averageMatchScore ? `${stats.averageMatchScore}%` : '0%'}
          description="Eligibility confidence"
          icon={Target}
          loading={loading}
        />
      </div>

      {/* Getting Started Checklist — shown when no projects exist */}
      {isNewUser && (
        <Card className="card-v41 border-blue-200 dark:border-blue-800/50 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-900/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-500" />
              <CardTitle className="font-sora text-base">Getting Started</CardTitle>
            </div>
            <CardDescription>Complete these steps to unlock the full power of IncentEdge</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href="/projects/new"
              className="flex items-center gap-3 p-3 rounded-lg border border-navy-200 dark:border-navy-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group"
            >
              <CircleDot className="h-5 w-5 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-colors" />
              <div className="flex-1">
                <p className="font-medium text-navy-900 dark:text-white">Create your first project</p>
                <p className="text-xs text-slate-500">Add a real estate project to start discovering incentives</p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
            </Link>
            <Link
              href="/matching"
              className="flex items-center gap-3 p-3 rounded-lg border border-navy-200 dark:border-navy-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group"
            >
              <CircleDot className="h-5 w-5 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-colors" />
              <div className="flex-1">
                <p className="font-medium text-navy-900 dark:text-white">Run incentive matching</p>
                <p className="text-xs text-slate-500">Our AI matches your project to eligible programs</p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
            </Link>
            <Link
              href="/green"
              className="flex items-center gap-3 p-3 rounded-lg border border-navy-200 dark:border-navy-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group"
            >
              <CircleDot className="h-5 w-5 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-colors" />
              <div className="flex-1">
                <p className="font-medium text-navy-900 dark:text-white">Explore green incentives</p>
                <p className="text-xs text-slate-500">IRA, clean energy, and sustainability programs</p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
            </Link>
            <Link
              href="/discover"
              className="flex items-center gap-3 p-3 rounded-lg border border-navy-200 dark:border-navy-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group"
            >
              <CircleDot className="h-5 w-5 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-colors" />
              <div className="flex-1">
                <p className="font-medium text-navy-900 dark:text-white">Browse the marketplace</p>
                <p className="text-xs text-slate-500">Search {stats?.programCount ? stats.programCount.toLocaleString() : '24,000+'} incentive programs</p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity - Takes 2 columns */}
        <Card className="card-v41 lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-sora">Recent Activity</CardTitle>
                <CardDescription>Your latest analyses and applications</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/portfolio" className="text-blue-600 hover:text-blue-700">
                  View All
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {stats.recentActivity.map((activity) => {
                  const Icon = activityIcons[activity.type];
                  const colorClass = activityColors[activity.type];

                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-navy-800/50 transition-colors"
                    >
                      <div className={`rounded-lg p-2 ${colorClass}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-navy-900 dark:text-white truncate">
                            {activity.title}
                          </p>
                          {activity.matchScore && activity.matchScore >= 90 && (
                            <Badge variant="success" className="text-xs">
                              {activity.matchScore}% match
                            </Badge>
                          )}
                          {activity.subtitle.includes('Direct Pay') && (
                            <DirectPayBadge eligible={true} size="sm" />
                          )}
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                          {activity.subtitle}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatRelativeTime(activity.timestamp)}
                          </span>
                          {activity.value && (
                            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                              {formatCompactCurrency(activity.value)} potential
                            </span>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="shrink-0" asChild>
                        <Link href={activity.type === 'analysis' ? `/projects/${activity.id}` : `/applications/${activity.id}`}>
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Search className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                <p className="mt-3 text-sm font-medium text-navy-900 dark:text-white">
                  No recent activity
                </p>
                <p className="text-sm text-slate-500">
                  Start by analyzing a project to discover incentives.
                </p>
                <Button className="mt-4 bg-blue-600 hover:bg-blue-700" asChild>
                  <Link href="/analysis">
                    <Plus className="mr-2 h-4 w-4" />
                    Run Analysis
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <Card className="card-v41">
            <CardHeader>
              <CardTitle className="font-sora text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button
                variant="outline"
                className="w-full justify-start h-auto py-3 px-4 border-navy-200 dark:border-navy-700"
                asChild
              >
                <Link href="/analysis">
                  <Zap className="mr-3 h-4 w-4 text-blue-500" />
                  <div className="text-left">
                    <div className="font-medium">New Analysis</div>
                    <div className="text-xs text-slate-500">Find incentives for a project</div>
                  </div>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start h-auto py-3 px-4 border-navy-200 dark:border-navy-700"
                asChild
              >
                <Link href="/projects/new">
                  <Building2 className="mr-3 h-4 w-4 text-teal-500" />
                  <div className="text-left">
                    <div className="font-medium">Add Project</div>
                    <div className="text-xs text-slate-500">Create a new project profile</div>
                  </div>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start h-auto py-3 px-4 border-navy-200 dark:border-navy-700"
                asChild
              >
                <Link href="/discover">
                  <Search className="mr-3 h-4 w-4 text-purple-500" />
                  <div className="text-left">
                    <div className="font-medium">Browse Programs</div>
                    <div className="text-xs text-slate-500">Explore {stats?.programCount ? stats.programCount.toLocaleString() : '24,000+'} incentives</div>
                  </div>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start h-auto py-3 px-4 border-navy-200 dark:border-navy-700"
                asChild
              >
                <Link href="/reports">
                  <FileText className="mr-3 h-4 w-4 text-amber-500" />
                  <div className="text-left">
                    <div className="font-medium">Generate Report</div>
                    <div className="text-xs text-slate-500">Export incentive analysis</div>
                  </div>
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Direct Pay Explainer Card */}
          <Card className="card-v41 border-emerald-200 dark:border-emerald-800/50 bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-900/20">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CardTitle className="font-sora text-base">Direct Pay Eligibility</CardTitle>
                <DirectPayBadge eligible={true} size="sm" showTooltip={false} />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                IRA Section 6417 allows tax-exempt entities to receive direct payments instead of tax credits.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-slate-700 dark:text-slate-300">Nonprofits (501(c)(3))</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-slate-700 dark:text-slate-300">Municipal governments</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-slate-700 dark:text-slate-300">Tribal governments</span>
                </div>
              </div>
              <Button variant="link" className="h-auto p-0 text-emerald-600 dark:text-emerald-400" asChild>
                <Link href="/discover?directPay=true">
                  Learn more
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Platform Stats Mini Card */}
          <Card className="card-v41">
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold font-mono text-navy-900 dark:text-white">50</p>
                  <p className="text-xs text-slate-500">States Covered</p>
                </div>
                <div>
                  <p className="text-2xl font-bold font-mono text-navy-900 dark:text-white">8M+</p>
                  <p className="text-xs text-slate-500">Awards Tracked</p>
                </div>
                <div>
                  <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">85%</p>
                  <p className="text-xs text-slate-500">Success Rate</p>
                </div>
                <div>
                  <p className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">$2.8B</p>
                  <p className="text-xs text-slate-500">Value Identified</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom CTA */}
      <Card className="card-v41 bg-gradient-to-r from-blue-600 to-blue-700 text-white border-none">
        <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-white/20 p-3">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold font-sora">Ready to maximize your incentive capture?</h3>
              <p className="text-sm text-blue-100">
                Run a comprehensive analysis to find all eligible programs for your project.
              </p>
            </div>
          </div>
          <Button variant="secondary" className="shrink-0" asChild>
            <Link href="/analysis">
              Start Analysis
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
