import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ============================================================================
// ACTIVITY FEED API
// Returns recent activity for the organization
// ============================================================================

export interface ActivityItem {
  id: string;
  type: 'project_created' | 'project_updated' | 'application_submitted' | 'application_status_changed' |
        'eligibility_scan' | 'document_uploaded' | 'deadline_approaching' | 'incentive_captured';
  title: string;
  description: string;
  timestamp: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
  project?: {
    id: string;
    name: string;
  };
  application?: {
    id: string;
    programName: string;
  };
  metadata?: Record<string, unknown>;
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type'); // Filter by activity type

    // Build query
    let query = supabase
      .from('activity_logs')
      .select(`
        id,
        action_type,
        entity_type,
        entity_id,
        entity_name,
        details,
        created_at,
        user:profiles!user_id (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('organization_id', profile.organization_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (type) {
      query = query.eq('action_type', type);
    }

    const { data: logs, error } = await query;

    if (error) {
      console.error('Error fetching activity logs:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform to ActivityItem format
    const activities: ActivityItem[] = (logs || []).map((log: any) => {
      const activityType = mapActionToActivityType(log.action_type, log.entity_type);
      const { title, description } = generateActivityText(log);

      return {
        id: log.id,
        type: activityType,
        title,
        description,
        timestamp: log.created_at,
        user: log.user ? {
          id: log.user.id,
          name: log.user.full_name || 'Unknown User',
          avatar: log.user.avatar_url,
        } : undefined,
        project: log.entity_type === 'project' ? {
          id: log.entity_id,
          name: log.entity_name,
        } : undefined,
        application: log.entity_type === 'application' ? {
          id: log.entity_id,
          programName: log.entity_name,
        } : undefined,
        metadata: log.details,
      };
    });

    return NextResponse.json({ data: activities });
  } catch (error) {
    console.error('Error in GET /api/dashboard/activity:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper functions
function mapActionToActivityType(
  actionType: string,
  entityType: string
): ActivityItem['type'] {
  const mapping: Record<string, Record<string, ActivityItem['type']>> = {
    create: {
      project: 'project_created',
      application: 'application_submitted',
      document: 'document_uploaded',
    },
    update: {
      project: 'project_updated',
      application: 'application_status_changed',
    },
    eligibility_scan: {
      project: 'eligibility_scan',
    },
    status_change: {
      application: 'application_status_changed',
    },
  };

  return mapping[actionType]?.[entityType] || 'project_updated';
}

function generateActivityText(log: any): { title: string; description: string } {
  const entityName = log.entity_name || 'Item';
  const details = log.details || {};

  switch (log.action_type) {
    case 'create':
      if (log.entity_type === 'project') {
        return {
          title: 'New project created',
          description: `${entityName} was added to the portfolio`,
        };
      }
      if (log.entity_type === 'application') {
        return {
          title: 'Application started',
          description: `Started application for ${entityName}`,
        };
      }
      return {
        title: `${log.entity_type} created`,
        description: entityName,
      };

    case 'update':
      return {
        title: `${log.entity_type} updated`,
        description: `${entityName} was modified`,
      };

    case 'eligibility_scan':
      return {
        title: 'Eligibility scan completed',
        description: `Found ${details.matches_found || 0} matching programs for ${entityName} ($${((details.total_potential || 0) / 1000000).toFixed(1)}M potential)`,
      };

    case 'status_change':
      return {
        title: 'Application status changed',
        description: `${entityName}: ${details.old_status || 'unknown'} → ${details.new_status || 'unknown'}`,
      };

    case 'submit':
      return {
        title: 'Application submitted',
        description: `${entityName} submitted for review`,
      };

    default:
      return {
        title: log.action_type,
        description: entityName,
      };
  }
}
