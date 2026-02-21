import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// ============================================================================
// NOTIFICATIONS API
// Manages user notifications with real-time support via Supabase
// ============================================================================

export interface Notification {
  id: string;
  type: 'deadline' | 'status_change' | 'new_program' | 'application_update' | 'system' | 'incentive_captured';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  title: string;
  message: string;
  read: boolean;
  readAt: string | null;
  dismissed: boolean;
  actionUrl: string | null;
  actionLabel: string | null;
  projectId: string | null;
  applicationId: string | null;
  createdAt: string;
}

// ============================================================================
// GET: Retrieve user notifications
// ============================================================================
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type');

    // Build query
    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('dismissed', false)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (unreadOnly) {
      query = query.eq('read', false);
    }

    if (type) {
      query = query.eq('notification_type', type);
    }

    const { data: notifications, error, count } = await query;

    if (error) {
      console.error('Error fetching notifications:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform to API format
    const formattedNotifications: Notification[] = (notifications || []).map((n: any) => ({
      id: n.id,
      type: n.notification_type,
      priority: n.priority,
      title: n.title,
      message: n.message,
      read: n.read,
      readAt: n.read_at,
      dismissed: n.dismissed,
      actionUrl: n.action_url,
      actionLabel: n.action_label,
      projectId: n.project_id,
      applicationId: n.application_id,
      createdAt: n.created_at,
    }));

    // Get unread count
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false)
      .eq('dismissed', false);

    return NextResponse.json({
      data: {
        notifications: formattedNotifications,
        meta: {
          total: count || 0,
          unread: unreadCount || 0,
          limit,
          offset,
        },
      },
    });
  } catch (error) {
    console.error('Error in GET /api/notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================================
// POST: Create a notification (internal use / system)
// ============================================================================
const createNotificationSchema = z.object({
  userId: z.string().uuid(),
  type: z.enum(['deadline', 'status_change', 'new_program', 'application_update', 'system', 'incentive_captured']),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  title: z.string().min(1).max(255),
  message: z.string().min(1),
  actionUrl: z.string().optional(),
  actionLabel: z.string().optional(),
  projectId: z.string().uuid().optional(),
  applicationId: z.string().uuid().optional(),
  incentiveProgramId: z.string().uuid().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user (must be authenticated)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request
    const body = await request.json();
    const validationResult = createNotificationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Create notification
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: data.userId,
        notification_type: data.type,
        priority: data.priority,
        title: data.title,
        message: data.message,
        action_url: data.actionUrl,
        action_label: data.actionLabel,
        project_id: data.projectId,
        application_id: data.applicationId,
        incentive_program_id: data.incentiveProgramId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: notification }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================================
// PATCH: Mark notifications as read/dismissed
// ============================================================================
const updateNotificationSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
  action: z.enum(['mark_read', 'mark_unread', 'dismiss']),
});

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request
    const body = await request.json();
    const validationResult = updateNotificationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { ids, action } = validationResult.data;

    // Build update data
    let updateData: Record<string, unknown> = {};
    switch (action) {
      case 'mark_read':
        updateData = { read: true, read_at: new Date().toISOString() };
        break;
      case 'mark_unread':
        updateData = { read: false, read_at: null };
        break;
      case 'dismiss':
        updateData = { dismissed: true };
        break;
    }

    // Update notifications (only user's own)
    const { data, error } = await supabase
      .from('notifications')
      .update(updateData)
      .eq('user_id', user.id)
      .in('id', ids)
      .select();

    if (error) {
      console.error('Error updating notifications:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data: {
        updated: data?.length || 0,
        action,
      },
    });
  } catch (error) {
    console.error('Error in PATCH /api/notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
