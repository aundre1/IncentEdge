import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ============================================================================
// DASHBOARD STATS API - Summary metrics for dashboard cards
// ============================================================================

export interface DashboardStatsResponse {
  programCount: number;
  projectsAnalyzed: number;
  totalValueFound: number;
  averageMatchScore: number;
  recentActivity: RecentActivityItem[];
}

export interface RecentActivityItem {
  id: string;
  type: 'analysis' | 'application' | 'report';
  title: string;
  subtitle: string;
  timestamp: string;
  value?: number;
  matchScore?: number;
}

// Cache duration in seconds
const CACHE_MAX_AGE = 60;

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const supabase = await createClient();

    // Try to get authenticated user, but don't require it for demo data
    const { data: { user } } = await supabase.auth.getUser();

    // Get total program count from database
    const { count: programCount, error: programError } = await supabase
      .from('incentive_programs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    if (programError) {
      console.error('Error fetching program count:', programError);
    }

    // If user is authenticated, get their stats
    let userStats = {
      projectsAnalyzed: 0,
      totalValueFound: 0,
      averageMatchScore: 0,
      recentActivity: [] as RecentActivityItem[],
    };

    if (user) {
      // Get user's organization
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (profile?.organization_id) {
        const orgId = profile.organization_id;

        // Get projects analyzed
        const { data: projects, count: projectCount } = await supabase
          .from('projects')
          .select('id, name, total_potential_incentives, created_at', { count: 'exact' })
          .eq('organization_id', orgId)
          .order('created_at', { ascending: false })
          .limit(10);

        userStats.projectsAnalyzed = projectCount || 0;
        userStats.totalValueFound = projects?.reduce((sum, p) =>
          sum + (p.total_potential_incentives || 0), 0) || 0;

        // Get average match score from eligibility results
        const { data: matchScores } = await supabase
          .from('project_incentive_matches')
          .select('match_score')
          .in('project_id', projects?.map(p => p.id) || [])
          .not('match_score', 'is', null);

        if (matchScores && matchScores.length > 0) {
          const totalScore = matchScores.reduce((sum, m) => sum + (m.match_score || 0), 0);
          userStats.averageMatchScore = Math.round(totalScore / matchScores.length);
        }

        // Build recent activity from projects and applications
        const recentActivity: RecentActivityItem[] = [];

        // Add recent project analyses
        projects?.slice(0, 3).forEach((project) => {
          recentActivity.push({
            id: project.id,
            type: 'analysis',
            title: project.name || 'Unnamed Project',
            subtitle: `Analyzed ${new Date(project.created_at).toLocaleDateString()}`,
            timestamp: project.created_at,
            value: project.total_potential_incentives,
          });
        });

        // Get recent applications
        const { data: applications } = await supabase
          .from('applications')
          .select('id, program_name, status, created_at, estimated_value')
          .eq('organization_id', orgId)
          .order('created_at', { ascending: false })
          .limit(3);

        applications?.forEach((app) => {
          recentActivity.push({
            id: app.id,
            type: 'application',
            title: app.program_name || 'Unknown Program',
            subtitle: `Status: ${app.status}`,
            timestamp: app.created_at,
            value: app.estimated_value,
          });
        });

        // Sort by timestamp and take latest 5
        userStats.recentActivity = recentActivity
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 5);
      }
    } else {
      // Return demo data for unauthenticated users
      userStats = {
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
          {
            id: 'demo-4',
            type: 'report',
            title: 'Q4 Incentive Summary Report',
            subtitle: 'Generated for Board Review',
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'demo-5',
            type: 'analysis',
            title: 'Affordable Housing Complex',
            subtitle: 'LIHTC + local incentives',
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            value: 850000,
            matchScore: 88,
          },
        ],
      };
    }

    const response: DashboardStatsResponse = {
      programCount: programCount || 24805,
      ...userStats,
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': `private, s-maxage=${CACHE_MAX_AGE}`,
        'X-Response-Time': `${Date.now() - startTime}ms`,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/dashboard/stats:', error);

    // Return fallback demo data on error
    return NextResponse.json(
      {
        programCount: 24805,
        projectsAnalyzed: 12,
        totalValueFound: 4850000,
        averageMatchScore: 87,
        recentActivity: [
          {
            id: 'fallback-1',
            type: 'analysis' as const,
            title: 'Sample Project Analysis',
            subtitle: 'Demo data - connect to see real stats',
            timestamp: new Date().toISOString(),
            value: 500000,
          },
        ],
      },
      {
        status: 200,
        headers: {
          'X-Response-Time': `${Date.now() - startTime}ms`,
          'X-Fallback': 'true',
        },
      }
    );
  }
}
