/**
 * Team Member Management API
 *
 * GET    - Get team member details
 * PATCH  - Update team member role/permissions
 * DELETE - Remove team member
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import {
  withAuth,
  AuthenticatedRequest,
  forbiddenResponse,
  notFoundResponse,
} from '@/lib/auth-middleware';
import {
  hasOrgPermission,
  hasHigherOrEqualRole,
  OrganizationRole,
  ProjectRole,
  ROLE_HIERARCHY,
} from '@/lib/permissions';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const updateMemberSchema = z.object({
  role: z.enum(['admin', 'manager', 'analyst', 'viewer']).optional(),
  projectRole: z.enum(['owner', 'admin', 'manager', 'analyst', 'viewer']).optional(),
  customRoleId: z.string().uuid().optional(),
  permissions: z.object({
    can_view_financials: z.boolean().optional(),
    can_edit_project: z.boolean().optional(),
    can_manage_applications: z.boolean().optional(),
    can_submit_applications: z.boolean().optional(),
    can_upload_documents: z.boolean().optional(),
    can_invite_members: z.boolean().optional(),
    can_export_data: z.boolean().optional(),
    can_delete_project: z.boolean().optional(),
  }).optional(),
  notifications: z.object({
    notify_on_updates: z.boolean().optional(),
    notify_on_deadlines: z.boolean().optional(),
    notify_on_status_changes: z.boolean().optional(),
  }).optional(),
  projectId: z.string().uuid().optional(), // For project-specific updates
});

// ============================================================================
// GET - Get Team Member Details
// ============================================================================

async function getTeamMember(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ userId: string }> }
): Promise<NextResponse> {
  const { userId } = await params;
  const supabase = await createClient();
  const { profile, organization } = request;

  if (!organization) {
    return NextResponse.json({ error: 'Organization required' }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');

  try {
    if (projectId) {
      // Get project member details
      const { data: member, error } = await supabase
        .from('project_members')
        .select(`
          *,
          profiles!inner (
            id,
            email,
            full_name,
            avatar_url,
            job_title,
            role
          ),
          team_roles (
            id,
            name,
            display_name,
            description,
            color
          )
        `)
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .single();

      if (error || !member) {
        return notFoundResponse('Project member not found');
      }

      // Get activity stats
      const { count: activityCount } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      return NextResponse.json({
        data: {
          ...member,
          activity_count_30d: activityCount || 0,
        },
      });
    } else {
      // Get organization member details
      const { data: member, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .eq('organization_id', organization.id)
        .single();

      if (error || !member) {
        return notFoundResponse('Team member not found');
      }

      // Get projects user has access to
      const { data: projectAccess } = await supabase
        .from('project_members')
        .select(`
          project_id,
          role,
          projects!inner (
            id,
            name,
            project_status
          )
        `)
        .eq('user_id', userId);

      // Get activity stats
      const { count: activityCount } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      return NextResponse.json({
        data: {
          ...member,
          project_access: projectAccess || [],
          activity_count_30d: activityCount || 0,
        },
      });
    }
  } catch (error) {
    console.error('Error in GET /api/team/[userId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const GET = withAuth(
  (req, ctx) => getTeamMember(req, ctx as unknown as { params: Promise<{ userId: string }> }),
  { requireOrganization: true }
);

// ============================================================================
// PATCH - Update Team Member
// ============================================================================

async function updateTeamMember(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ userId: string }> }
): Promise<NextResponse> {
  const { userId } = await params;
  const supabase = await createClient();
  const { profile, organization } = request;

  if (!organization) {
    return NextResponse.json({ error: 'Organization required' }, { status: 400 });
  }

  // Cannot modify self (for role changes)
  // Note: Self can update notification preferences
  const isSelf = profile.id === userId;

  try {
    const body = await request.json();
    const validationResult = updateMemberSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { role, projectRole, customRoleId, permissions, notifications, projectId } = validationResult.data;

    // Role changes require manage permission and cannot be self
    if ((role || projectRole) && isSelf) {
      return forbiddenResponse('Cannot change your own role');
    }

    if (projectId) {
      // Update project member
      const { data: targetMember } = await supabase
        .from('project_members')
        .select('role')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .single();

      if (!targetMember) {
        return notFoundResponse('Project member not found');
      }

      // Check if user can manage this member
      const { data: userMembership } = await supabase
        .from('project_members')
        .select('role')
        .eq('project_id', projectId)
        .eq('user_id', profile.id)
        .single();

      const userRole = profile.role === 'admin' ? 'admin' : (userMembership?.role as ProjectRole || 'viewer');

      // Must have higher role to modify
      if (projectRole && !hasHigherOrEqualRole(userRole, targetMember.role as ProjectRole, true)) {
        return forbiddenResponse('Cannot modify a user with equal or higher role');
      }

      // Cannot assign a role higher than own
      if (projectRole) {
        const userLevel = ROLE_HIERARCHY[userRole as ProjectRole] || 0;
        const newLevel = ROLE_HIERARCHY[projectRole];

        if (newLevel >= userLevel) {
          return forbiddenResponse('Cannot assign a role equal to or higher than your own');
        }
      }

      // Build update object
      const updateData: Record<string, unknown> = {};

      if (projectRole) {
        updateData.role = projectRole;
      }

      if (customRoleId !== undefined) {
        updateData.custom_role_id = customRoleId;
      }

      if (permissions) {
        Object.entries(permissions).forEach(([key, value]) => {
          if (value !== undefined) {
            updateData[key] = value;
          }
        });
      }

      if (notifications) {
        Object.entries(notifications).forEach(([key, value]) => {
          if (value !== undefined) {
            updateData[key] = value;
          }
        });
      }

      // Get old values for audit
      const { data: oldMember } = await supabase
        .from('project_members')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .single();

      // Perform update
      const { data: updatedMember, error } = await supabase
        .from('project_members')
        .update(updateData)
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating project member:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Log permission change
      if (projectRole || permissions) {
        await supabase.rpc('log_permission_change', {
          p_organization_id: organization.id,
          p_actor_id: profile.id,
          p_target_type: 'project_member',
          p_target_id: userId,
          p_action: 'modify',
          p_old_value: oldMember,
          p_new_value: updatedMember,
          p_project_id: projectId,
        });
      }

      return NextResponse.json({
        data: updatedMember,
        message: 'Project member updated successfully',
      });
    } else {
      // Update organization member role
      if (!hasOrgPermission(profile.role, 'team', 'manage')) {
        return forbiddenResponse('Permission denied');
      }

      // Get target user
      const { data: targetUser } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .eq('organization_id', organization.id)
        .single();

      if (!targetUser) {
        return notFoundResponse('Team member not found');
      }

      // Check role hierarchy
      if (role) {
        if (!hasHigherOrEqualRole(profile.role, targetUser.role as OrganizationRole, false)) {
          return forbiddenResponse('Cannot modify a user with equal or higher role');
        }

        // Cannot assign role higher than own
        const userLevel = ROLE_HIERARCHY[profile.role as keyof typeof ROLE_HIERARCHY] || 0;
        const newLevel = ROLE_HIERARCHY[role as keyof typeof ROLE_HIERARCHY] || 0;

        if (newLevel >= userLevel) {
          return forbiddenResponse('Cannot assign a role equal to or higher than your own');
        }
      }

      // Perform update
      const { data: updatedUser, error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating team member:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Log permission change
      await supabase.rpc('log_permission_change', {
        p_organization_id: organization.id,
        p_actor_id: profile.id,
        p_target_type: 'user',
        p_target_id: userId,
        p_action: 'modify',
        p_old_value: { role: targetUser.role },
        p_new_value: { role },
      });

      // Log activity
      await supabase.rpc('log_activity', {
        p_organization_id: organization.id,
        p_user_id: profile.id,
        p_action_type: 'update',
        p_entity_type: 'team_member',
        p_entity_id: userId,
        p_entity_name: updatedUser.email,
        p_details: { old_role: targetUser.role, new_role: role },
      });

      return NextResponse.json({
        data: updatedUser,
        message: 'Team member updated successfully',
      });
    }
  } catch (error) {
    console.error('Error in PATCH /api/team/[userId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const PATCH = withAuth(
  (req, ctx) => updateTeamMember(req, ctx as unknown as { params: Promise<{ userId: string }> }),
  { requireOrganization: true }
);

// ============================================================================
// DELETE - Remove Team Member
// ============================================================================

async function removeTeamMember(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ userId: string }> }
): Promise<NextResponse> {
  const { userId } = await params;
  const supabase = await createClient();
  const { profile, organization } = request;

  if (!organization) {
    return NextResponse.json({ error: 'Organization required' }, { status: 400 });
  }

  // Cannot remove self
  if (profile.id === userId) {
    return forbiddenResponse('Cannot remove yourself');
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');

  try {
    if (projectId) {
      // Remove from project
      const { data: targetMember } = await supabase
        .from('project_members')
        .select('role, user_id')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .single();

      if (!targetMember) {
        return notFoundResponse('Project member not found');
      }

      // Cannot remove owner
      if (targetMember.role === 'owner') {
        return forbiddenResponse('Cannot remove project owner');
      }

      // Check if user can manage this member
      const { data: userMembership } = await supabase
        .from('project_members')
        .select('role, can_invite_members')
        .eq('project_id', projectId)
        .eq('user_id', profile.id)
        .single();

      const isOrgAdmin = profile.role === 'admin';
      const canManage = isOrgAdmin || (userMembership?.can_invite_members ?? false);

      if (!canManage) {
        return forbiddenResponse('Permission denied');
      }

      // Check role hierarchy
      if (!isOrgAdmin && userMembership) {
        if (!hasHigherOrEqualRole(userMembership.role as ProjectRole, targetMember.role as ProjectRole, true)) {
          return forbiddenResponse('Cannot remove a user with equal or higher role');
        }
      }

      // Get user email for logging
      const { data: targetProfile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single();

      // Remove member
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error removing project member:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Log permission change
      await supabase.rpc('log_permission_change', {
        p_organization_id: organization.id,
        p_actor_id: profile.id,
        p_target_type: 'project_member',
        p_target_id: userId,
        p_action: 'remove',
        p_old_value: { role: targetMember.role, project_id: projectId },
        p_project_id: projectId,
      });

      return NextResponse.json({
        message: 'Member removed from project successfully',
      });
    } else {
      // Remove from organization
      if (!hasOrgPermission(profile.role, 'team', 'manage')) {
        return forbiddenResponse('Permission denied');
      }

      const { data: targetUser } = await supabase
        .from('profiles')
        .select('role, email')
        .eq('id', userId)
        .eq('organization_id', organization.id)
        .single();

      if (!targetUser) {
        return notFoundResponse('Team member not found');
      }

      // Check role hierarchy
      if (!hasHigherOrEqualRole(profile.role, targetUser.role as OrganizationRole, false)) {
        return forbiddenResponse('Cannot remove a user with equal or higher role');
      }

      // Remove from organization (set organization_id to null)
      const { error } = await supabase
        .from('profiles')
        .update({
          organization_id: null,
          role: 'viewer', // Reset to default role
        })
        .eq('id', userId);

      if (error) {
        console.error('Error removing team member:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Also remove from all projects in this org
      const { data: orgProjects } = await supabase
        .from('projects')
        .select('id')
        .eq('organization_id', organization.id);

      if (orgProjects && orgProjects.length > 0) {
        await supabase
          .from('project_members')
          .delete()
          .eq('user_id', userId)
          .in('project_id', orgProjects.map(p => p.id));
      }

      // Log permission change
      await supabase.rpc('log_permission_change', {
        p_organization_id: organization.id,
        p_actor_id: profile.id,
        p_target_type: 'user',
        p_target_id: userId,
        p_action: 'remove',
        p_old_value: { role: targetUser.role, organization_id: organization.id },
      });

      // Log activity
      await supabase.rpc('log_activity', {
        p_organization_id: organization.id,
        p_user_id: profile.id,
        p_action_type: 'delete',
        p_entity_type: 'team_member',
        p_entity_id: userId,
        p_entity_name: targetUser.email,
      });

      return NextResponse.json({
        message: 'Team member removed from organization successfully',
      });
    }
  } catch (error) {
    console.error('Error in DELETE /api/team/[userId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const DELETE = withAuth(
  (req, ctx) => removeTeamMember(req, ctx as unknown as { params: Promise<{ userId: string }> }),
  { requireOrganization: true }
);
