import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ============================================================================
// ALERTS & DEADLINES API
// Returns upcoming deadlines, urgent alerts, and warnings
// ============================================================================

export interface Alert {
  id: string;
  type: 'deadline' | 'expiring_program' | 'action_required' | 'milestone' | 'warning' | 'info';
  priority: 'urgent' | 'high' | 'normal' | 'low';
  title: string;
  description: string;
  dueDate?: string;
  daysRemaining?: number;
  project?: {
    id: string;
    name: string;
  };
  application?: {
    id: string;
    programName: string;
    programId: string;
  };
  incentiveProgram?: {
    id: string;
    name: string;
    estimatedValue: number;
  };
  actionUrl?: string;
  actionLabel?: string;
  createdAt: string;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    const orgId = profile.organization_id;
    const alerts: Alert[] = [];
    const now = new Date();

    // ========================================================================
    // 1. APPLICATION DEADLINES
    // ========================================================================
    const { data: applications } = await supabase
      .from('applications')
      .select(`
        id,
        status,
        deadline,
        project:projects!project_id (id, name),
        incentive_program:incentive_programs!incentive_program_id (id, name)
      `)
      .eq('organization_id', orgId)
      .in('status', ['draft', 'in-progress', 'ready-for-review'])
      .not('deadline', 'is', null)
      .gte('deadline', now.toISOString())
      .order('deadline', { ascending: true });

    applications?.forEach((app: any) => {
      const deadline = new Date(app.deadline);
      const daysRemaining = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      let priority: Alert['priority'] = 'normal';
      if (daysRemaining <= 3) priority = 'urgent';
      else if (daysRemaining <= 7) priority = 'high';
      else if (daysRemaining <= 14) priority = 'normal';
      else priority = 'low';

      alerts.push({
        id: `app-deadline-${app.id}`,
        type: 'deadline',
        priority,
        title: daysRemaining <= 3
          ? `Application expires in ${daysRemaining} days!`
          : `Application deadline approaching`,
        description: `${app.incentive_program?.name || 'Application'} for ${app.project?.name || 'project'}`,
        dueDate: app.deadline,
        daysRemaining,
        project: app.project ? { id: app.project.id, name: app.project.name } : undefined,
        application: {
          id: app.id,
          programName: app.incentive_program?.name || 'Unknown',
          programId: app.incentive_program?.id || '',
        },
        actionUrl: `/applications/${app.id}`,
        actionLabel: 'Complete Application',
        createdAt: now.toISOString(),
      });
    });

    // ========================================================================
    // 2. EXPIRING INCENTIVE PROGRAMS (matched to projects)
    // ========================================================================
    const thirtyDaysFromNow = new Date(now);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const { data: projectIds } = await supabase
      .from('projects')
      .select('id')
      .eq('organization_id', orgId);

    if (projectIds && projectIds.length > 0) {
      const { data: expiringMatches } = await supabase
        .from('project_incentive_matches')
        .select(`
          id,
          estimated_value,
          project:projects!project_id (id, name),
          incentive_program:incentive_programs!incentive_program_id (
            id,
            name,
            application_deadline,
            end_date
          )
        `)
        .in('project_id', projectIds.map((p: any) => p.id))
        .eq('status', 'matched');

      expiringMatches?.forEach((match: any) => {
        const program = match.incentive_program;
        const deadlineStr = program?.application_deadline || program?.end_date;

        if (deadlineStr) {
          const deadline = new Date(deadlineStr);
          if (deadline >= now && deadline <= thirtyDaysFromNow) {
            const daysRemaining = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            let priority: Alert['priority'] = 'normal';
            if (daysRemaining <= 3) priority = 'urgent';
            else if (daysRemaining <= 7) priority = 'high';

            alerts.push({
              id: `program-expiring-${match.id}`,
              type: 'expiring_program',
              priority,
              title: `Incentive program closing soon`,
              description: `${program?.name} deadline in ${daysRemaining} days - $${((match.estimated_value || 0) / 1000000).toFixed(1)}M at risk`,
              dueDate: deadlineStr,
              daysRemaining,
              project: match.project ? { id: match.project.id, name: match.project.name } : undefined,
              incentiveProgram: {
                id: program?.id || '',
                name: program?.name || 'Unknown',
                estimatedValue: match.estimated_value || 0,
              },
              actionUrl: `/projects/${match.project?.id}?tab=incentives`,
              actionLabel: 'Start Application',
              createdAt: now.toISOString(),
            });
          }
        }
      });
    }

    // ========================================================================
    // 3. PROJECTS NEEDING ELIGIBILITY SCAN
    // ========================================================================
    const { data: projectsNeedingScan } = await supabase
      .from('projects')
      .select('id, name, last_eligibility_scan_at, total_potential_incentives')
      .eq('organization_id', orgId)
      .eq('project_status', 'active')
      .or('last_eligibility_scan_at.is.null,last_eligibility_scan_at.lt.' + new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString());

    projectsNeedingScan?.forEach((project: any) => {
      const hasNeverScanned = !project.last_eligibility_scan_at;

      alerts.push({
        id: `scan-needed-${project.id}`,
        type: 'action_required',
        priority: hasNeverScanned ? 'high' : 'normal',
        title: hasNeverScanned ? 'New project needs eligibility scan' : 'Eligibility scan may be outdated',
        description: hasNeverScanned
          ? `${project.name} hasn't been scanned for incentives yet`
          : `${project.name} was last scanned over 7 days ago`,
        project: { id: project.id, name: project.name },
        actionUrl: `/projects/${project.id}?action=scan`,
        actionLabel: 'Run Eligibility Scan',
        createdAt: now.toISOString(),
      });
    });

    // ========================================================================
    // 4. APPLICATIONS REQUIRING ACTION
    // ========================================================================
    const { data: appsNeedingAction } = await supabase
      .from('applications')
      .select(`
        id,
        status,
        project:projects!project_id (id, name),
        incentive_program:incentive_programs!incentive_program_id (id, name)
      `)
      .eq('organization_id', orgId)
      .in('status', ['ready-for-review', 'additional-info-requested']);

    appsNeedingAction?.forEach((app: any) => {
      const isInfoRequested = app.status === 'additional-info-requested';

      alerts.push({
        id: `action-${app.id}`,
        type: 'action_required',
        priority: isInfoRequested ? 'high' : 'normal',
        title: isInfoRequested ? 'Additional information requested' : 'Application ready for review',
        description: `${app.incentive_program?.name || 'Application'} for ${app.project?.name || 'project'}`,
        project: app.project ? { id: app.project.id, name: app.project.name } : undefined,
        application: {
          id: app.id,
          programName: app.incentive_program?.name || 'Unknown',
          programId: app.incentive_program?.id || '',
        },
        actionUrl: `/applications/${app.id}`,
        actionLabel: isInfoRequested ? 'Provide Information' : 'Review & Submit',
        createdAt: now.toISOString(),
      });
    });

    // ========================================================================
    // SORT BY PRIORITY AND DATE
    // ========================================================================
    const priorityOrder: Record<Alert['priority'], number> = {
      urgent: 0,
      high: 1,
      normal: 2,
      low: 3,
    };

    alerts.sort((a, b) => {
      // First sort by priority
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Then by days remaining (if applicable)
      if (a.daysRemaining !== undefined && b.daysRemaining !== undefined) {
        return a.daysRemaining - b.daysRemaining;
      }

      return 0;
    });

    // ========================================================================
    // RESPONSE
    // ========================================================================
    return NextResponse.json({
      data: {
        alerts,
        summary: {
          total: alerts.length,
          urgent: alerts.filter(a => a.priority === 'urgent').length,
          high: alerts.filter(a => a.priority === 'high').length,
          normal: alerts.filter(a => a.priority === 'normal').length,
          deadlines: alerts.filter(a => a.type === 'deadline').length,
          actionsRequired: alerts.filter(a => a.type === 'action_required').length,
        },
      },
    });
  } catch (error) {
    console.error('Error in GET /api/dashboard/alerts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
