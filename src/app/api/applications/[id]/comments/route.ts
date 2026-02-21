import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for creating a comment
const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment content is required').max(10000),
  content_html: z.string().optional(),
  comment_type: z.enum([
    'comment', 'status_change', 'task_update', 'system_notification',
    'question', 'answer', 'approval', 'rejection'
  ]).default('comment'),
  parent_comment_id: z.string().uuid().optional(),
  visibility: z.enum(['private', 'team', 'organization', 'public']).default('team'),
  is_internal: z.boolean().default(true),
  mentioned_user_ids: z.array(z.string().uuid()).optional(),
  related_task_id: z.string().uuid().optional(),
});

// Validation schema for updating a comment
const updateCommentSchema = z.object({
  content: z.string().min(1).max(10000).optional(),
  content_html: z.string().optional(),
  visibility: z.enum(['private', 'team', 'organization', 'public']).optional(),
});

// Validation schema for adding a reaction
const reactionSchema = z.object({
  comment_id: z.string().uuid(),
  reaction: z.string().min(1).max(50), // e.g., 'thumbs_up', 'heart', 'eyes'
  action: z.enum(['add', 'remove']),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/applications/[id]/comments
 * Get all comments for an application
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const supabase = await createClient();
    const { id: applicationId } = await params;

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify application access
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select('id, organization_id')
      .eq('id', applicationId)
      .single();

    if (appError || !application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const commentType = searchParams.get('type');
    const parentId = searchParams.get('parent_id');
    const includeDeleted = searchParams.get('include_deleted') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('application_comments')
      .select(`
        *,
        author:profiles!application_comments_author_id_fkey(
          id,
          full_name,
          email,
          avatar_url,
          job_title
        ),
        related_task:application_tasks(
          id,
          title,
          status
        ),
        replies:application_comments(
          id,
          content,
          created_at,
          author:profiles!application_comments_author_id_fkey(
            id,
            full_name,
            avatar_url
          )
        )
      `, { count: 'exact' })
      .eq('application_id', applicationId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (!includeDeleted) {
      query = query.eq('is_deleted', false);
    }

    if (commentType) {
      query = query.eq('comment_type', commentType);
    }

    if (parentId === 'null' || parentId === '') {
      // Get only top-level comments
      query = query.is('parent_comment_id', null);
    } else if (parentId) {
      // Get replies to specific comment
      query = query.eq('parent_comment_id', parentId);
    }

    const { data: comments, error, count } = await query;

    if (error) {
      console.error('Error fetching comments:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Process comments to add metadata
    const processedComments = comments?.map(comment => ({
      ...comment,
      can_edit: comment.author_id === user.id,
      can_delete: comment.author_id === user.id,
      reply_count: Array.isArray(comment.replies) ? comment.replies.length : 0,
      is_author: comment.author_id === user.id,
    }));

    return NextResponse.json({
      data: processedComments,
      meta: {
        total: count || 0,
        limit,
        offset,
        has_more: (count || 0) > offset + limit,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/applications/[id]/comments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/applications/[id]/comments
 * Create a new comment or add a reaction
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const supabase = await createClient();
    const { id: applicationId } = await params;

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, full_name')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    // Verify application exists and belongs to organization
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select('id, organization_id, created_by')
      .eq('id', applicationId)
      .eq('organization_id', profile.organization_id)
      .single();

    if (appError || !application) {
      return NextResponse.json(
        { error: 'Application not found or access denied' },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Check if this is a reaction action
    if (body.reaction !== undefined) {
      const reactionValidation = reactionSchema.safeParse(body);
      if (!reactionValidation.success) {
        return NextResponse.json(
          { error: 'Validation failed', details: reactionValidation.error.errors },
          { status: 400 }
        );
      }

      const { comment_id, reaction, action } = reactionValidation.data;

      // Get current reactions
      const { data: comment, error: fetchError } = await supabase
        .from('application_comments')
        .select('reactions')
        .eq('id', comment_id)
        .eq('application_id', applicationId)
        .single();

      if (fetchError || !comment) {
        return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
      }

      const reactions = (comment.reactions || {}) as Record<string, string[]>;
      const reactionUsers = reactions[reaction] || [];

      if (action === 'add' && !reactionUsers.includes(user.id)) {
        reactionUsers.push(user.id);
      } else if (action === 'remove') {
        const index = reactionUsers.indexOf(user.id);
        if (index > -1) {
          reactionUsers.splice(index, 1);
        }
      }

      reactions[reaction] = reactionUsers;

      // Update reactions
      const { error: updateError } = await supabase
        .from('application_comments')
        .update({ reactions })
        .eq('id', comment_id);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, reactions });
    }

    // Regular comment creation
    const validationResult = createCommentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const commentData = validationResult.data;

    // If this is a reply, verify parent exists
    if (commentData.parent_comment_id) {
      const { data: parentComment, error: parentError } = await supabase
        .from('application_comments')
        .select('id, thread_depth')
        .eq('id', commentData.parent_comment_id)
        .eq('application_id', applicationId)
        .single();

      if (parentError || !parentComment) {
        return NextResponse.json(
          { error: 'Parent comment not found' },
          { status: 404 }
        );
      }

      // Calculate thread depth (limit to 3 levels)
      const threadDepth = Math.min((parentComment.thread_depth || 0) + 1, 3);
      (commentData as Record<string, unknown>).thread_depth = threadDepth;
    }

    // If related_task_id is provided, verify it belongs to this application
    if (commentData.related_task_id) {
      const { data: task, error: taskError } = await supabase
        .from('application_tasks')
        .select('id')
        .eq('id', commentData.related_task_id)
        .eq('application_id', applicationId)
        .single();

      if (taskError || !task) {
        return NextResponse.json(
          { error: 'Related task not found' },
          { status: 404 }
        );
      }
    }

    // Create comment
    const { data: comment, error: createError } = await supabase
      .from('application_comments')
      .insert({
        application_id: applicationId,
        author_id: user.id,
        content: commentData.content,
        content_html: commentData.content_html,
        comment_type: commentData.comment_type,
        parent_comment_id: commentData.parent_comment_id,
        visibility: commentData.visibility,
        is_internal: commentData.is_internal,
        mentioned_user_ids: commentData.mentioned_user_ids || [],
        related_task_id: commentData.related_task_id,
        thread_depth: (commentData as Record<string, unknown>).thread_depth || 0,
      })
      .select(`
        *,
        author:profiles!application_comments_author_id_fkey(
          id,
          full_name,
          email,
          avatar_url
        )
      `)
      .single();

    if (createError) {
      console.error('Error creating comment:', createError);
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    // Create notifications for mentioned users
    if (commentData.mentioned_user_ids && commentData.mentioned_user_ids.length > 0) {
      const notifications = commentData.mentioned_user_ids
        .filter(id => id !== user.id) // Don't notify self
        .map(userId => ({
          user_id: userId,
          title: 'You were mentioned in a comment',
          message: `${profile.full_name} mentioned you in a comment on an application.`,
          notification_type: 'mention',
          priority: 'normal',
          application_id: applicationId,
          action_url: `/applications/${applicationId}?comment=${comment.id}`,
          action_label: 'View Comment',
        }));

      if (notifications.length > 0) {
        await supabase.from('notifications').insert(notifications);
      }
    }

    // Notify application creator if comment is from someone else
    if (application.created_by && application.created_by !== user.id) {
      await supabase.from('notifications').insert({
        user_id: application.created_by,
        title: 'New comment on your application',
        message: `${profile.full_name} commented on your application.`,
        notification_type: 'comment',
        priority: 'normal',
        application_id: applicationId,
        action_url: `/applications/${applicationId}?comment=${comment.id}`,
        action_label: 'View Comment',
      });
    }

    // Log activity
    await supabase.rpc('log_activity', {
      p_organization_id: profile.organization_id,
      p_user_id: user.id,
      p_action_type: 'create',
      p_entity_type: 'comment',
      p_entity_id: comment.id,
      p_entity_name: 'Comment',
      p_details: {
        application_id: applicationId,
        comment_type: commentData.comment_type,
        is_reply: !!commentData.parent_comment_id,
      },
    });

    return NextResponse.json({ data: comment }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/applications/[id]/comments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/applications/[id]/comments
 * Update a comment
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const supabase = await createClient();
    const { id: applicationId } = await params;

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('comment_id') || body.comment_id;

    if (!commentId) {
      return NextResponse.json(
        { error: 'comment_id is required' },
        { status: 400 }
      );
    }

    // Verify comment exists and user is the author
    const { data: existingComment, error: fetchError } = await supabase
      .from('application_comments')
      .select('id, author_id, content, edit_history')
      .eq('id', commentId)
      .eq('application_id', applicationId)
      .single();

    if (fetchError || !existingComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    if (existingComment.author_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only edit your own comments' },
        { status: 403 }
      );
    }

    // Validate update data
    const validationResult = updateCommentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

    // Build edit history
    const editHistory = existingComment.edit_history || [];
    if (updateData.content && updateData.content !== existingComment.content) {
      editHistory.push({
        content: existingComment.content,
        edited_at: new Date().toISOString(),
      });
    }

    // Update comment
    const { data: comment, error: updateError } = await supabase
      .from('application_comments')
      .update({
        ...updateData,
        is_edited: true,
        edited_at: new Date().toISOString(),
        edit_history: editHistory,
      })
      .eq('id', commentId)
      .select(`
        *,
        author:profiles!application_comments_author_id_fkey(
          id,
          full_name,
          email,
          avatar_url
        )
      `)
      .single();

    if (updateError) {
      console.error('Error updating comment:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ data: comment });
  } catch (error) {
    console.error('Error in PATCH /api/applications/[id]/comments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/applications/[id]/comments
 * Soft delete a comment
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const supabase = await createClient();
    const { id: applicationId } = await params;

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('comment_id');

    if (!commentId) {
      return NextResponse.json(
        { error: 'comment_id is required' },
        { status: 400 }
      );
    }

    // Verify comment exists and user is the author
    const { data: existingComment, error: fetchError } = await supabase
      .from('application_comments')
      .select('id, author_id')
      .eq('id', commentId)
      .eq('application_id', applicationId)
      .single();

    if (fetchError || !existingComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    if (existingComment.author_id !== user.id) {
      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        return NextResponse.json(
          { error: 'You can only delete your own comments' },
          { status: 403 }
        );
      }
    }

    // Soft delete comment
    const { error: deleteError } = await supabase
      .from('application_comments')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_by: user.id,
        content: '[This comment has been deleted]',
      })
      .eq('id', commentId);

    if (deleteError) {
      console.error('Error deleting comment:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/applications/[id]/comments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
