/**
 * Team Management API
 *
 * GET  - List team members for organization or project
 * POST - Invite a new team member
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import {
  withAuth,
  withPermission,
  AuthenticatedRequest,
} from '@/lib/auth-middleware';
import { hasOrgPermission, isAtLimit } from '@/lib/permissions';
import crypto from 'crypto';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'manager', 'analyst', 'viewer']),
  projectId: z.string().uuid().optional(), // For project-specific invites
  message: z.string().max(500).optional(),
  permissions: z.record(z.boolean()).optional(), // Custom permission overrides
  expiresInDays: z.number().min(1).max(30).default(7),
});

// ============================================================================
// GET - List Team Members
// ============================================================================

async function getTeamMembers(request: AuthenticatedRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { profile, organization } = request;

  if (!organization) {
    return NextResponse.json({ error: 'Organization required' }, { status: 400 });
  }

  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  const search = searchParams.get('search');
  const role = searchParams.get('role');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = (page - 1) * limit;

  try {
    if (projectId) {
      // Get project members
      let query = supabase
        .from('project_members')
        .select(`
          id,
          project_id,
          user_id,
          role,
          custom_role_id,
          can_view_financials,
          can_edit_project,
          can_manage_applications,
          can_submit_applications,
          can_upload_documents,
          can_invite_members,
          can_export_data,
          can_delete_project,
          permission_overrides,
          notify_on_updates,
          notify_on_deadlines,
          notify_on_status_changes,
          last_accessed_at,
          added_at,
          notes,
          profiles!inner (
            id,
            email,
            full_name,
            avatar_url,
            job_title
          ),
          team_roles (
            id,
            name,
            display_name,
            color
          )
        `, { count: 'exact' })
        .eq('project_id', projectId);

      if (role) {
        query = query.eq('role', role);
      }

      if (search) {
        // Need to use a different approach for searching nested fields
        query = query.or(`profiles.email.ilike.%${search}%,profiles.full_name.ilike.%${search}%`);
      }

      query = query.order('added_at', { ascending: false }).range(offset, offset + limit - 1);

      const { data: members, error, count } = await query;

      if (error) {
        console.error('Error fetching project members:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        data: members,
        meta: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      });
    } else {
      // Get organization members
      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .eq('organization_id', organization.id);

      if (role) {
        query = query.eq('role', role);
      }

      if (search) {
        query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
      }

      query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

      const { data: members, error, count } = await query;

      if (error) {
        console.error('Error fetching org members:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Get pending invitations count
      const { count: pendingInvites } = await supabase
        .from('invitations')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organization.id)
        .eq('status', 'pending');

      return NextResponse.json({
        data: members,
        meta: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
          pendingInvitations: pendingInvites || 0,
        },
      });
    }
  } catch (error) {
    console.error('Error in GET /api/team:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const GET = withAuth(getTeamMembers, { requireOrganization: true });

// ============================================================================
// POST - Invite Team Member
// ============================================================================

async function inviteTeamMember(request: AuthenticatedRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { profile, organization } = request;

  if (!organization) {
    return NextResponse.json({ error: 'Organization required' }, { status: 400 });
  }

  // Check permission to invite
  if (!hasOrgPermission(profile.role, 'team', 'invite')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = inviteSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { email, role, projectId, message, permissions, expiresInDays } = validationResult.data;

    // Check tier limits for team members
    if (!projectId) {
      const { count: memberCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organization.id);

      if (isAtLimit(organization.subscription_tier, 'team_members', memberCount || 0)) {
        return NextResponse.json(
          {
            error: 'Team member limit reached',
            current_tier: organization.subscription_tier,
          },
          { status: 402 }
        );
      }
    }

    // Check if user already exists in organization
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id, organization_id')
      .eq('email', email)
      .single();

    if (existingUser?.organization_id === organization.id) {
      // User already in org, handle project-specific invite
      if (projectId) {
        // Check if already a project member
        const { data: existingMember } = await supabase
          .from('project_members')
          .select('id')
          .eq('project_id', projectId)
          .eq('user_id', existingUser.id)
          .single();

        if (existingMember) {
          return NextResponse.json(
            { error: 'User is already a member of this project' },
            { status: 409 }
          );
        }

        // Add directly as project member
        const { data: member, error: memberError } = await supabase.rpc('add_project_member', {
          p_project_id: projectId,
          p_user_id: existingUser.id,
          p_role: role,
          p_added_by: profile.id,
        });

        if (memberError) {
          console.error('Error adding project member:', memberError);
          return NextResponse.json({ error: memberError.message }, { status: 500 });
        }

        return NextResponse.json({
          data: { member_id: member },
          message: 'User added to project successfully',
        });
      } else {
        return NextResponse.json(
          { error: 'User is already a member of this organization' },
          { status: 409 }
        );
      }
    }

    // Check for existing pending invitation
    const { data: existingInvite } = await supabase
      .from(projectId ? 'project_invitations' : 'invitations')
      .select('id, created_at')
      .eq('email', email)
      .eq('status', 'pending')
      .eq(projectId ? 'project_id' : 'organization_id', projectId || organization.id)
      .single();

    if (existingInvite) {
      // Calculate time since last invite
      const hoursSinceInvite = (Date.now() - new Date(existingInvite.created_at).getTime()) / (1000 * 60 * 60);

      if (hoursSinceInvite < 24) {
        return NextResponse.json(
          { error: 'An invitation was already sent recently. Please wait before sending another.' },
          { status: 429 }
        );
      }

      // Revoke old invitation
      await supabase
        .from(projectId ? 'project_invitations' : 'invitations')
        .update({ status: 'revoked' })
        .eq('id', existingInvite.id);
    }

    // Generate invitation token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

    if (projectId) {
      // Create project invitation
      const { data: invitation, error } = await supabase
        .from('project_invitations')
        .insert({
          project_id: projectId,
          organization_id: organization.id,
          email,
          role,
          message,
          permissions: permissions || {},
          invited_by: profile.id,
          token,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating project invitation:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Log the invitation
      await supabase.rpc('log_permission_change', {
        p_organization_id: organization.id,
        p_actor_id: profile.id,
        p_target_type: 'invitation',
        p_target_id: invitation.id,
        p_action: 'invite',
        p_new_value: { email, role, project_id: projectId },
        p_project_id: projectId,
      });

      // TODO: Send invitation email via email service
      // await sendProjectInvitationEmail(email, token, project, profile, message);

      return NextResponse.json({
        data: {
          id: invitation.id,
          email,
          role,
          expires_at: expiresAt,
          project_id: projectId,
        },
        message: 'Invitation sent successfully',
      }, { status: 201 });
    } else {
      // Create organization invitation
      const { data: invitation, error } = await supabase
        .from('invitations')
        .insert({
          organization_id: organization.id,
          email,
          role,
          invited_by: profile.id,
          token,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating invitation:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Log activity
      await supabase.rpc('log_activity', {
        p_organization_id: organization.id,
        p_user_id: profile.id,
        p_action_type: 'invite',
        p_entity_type: 'invitation',
        p_entity_id: invitation.id,
        p_entity_name: email,
        p_details: { role },
      });

      // TODO: Send invitation email via email service
      // await sendOrganizationInvitationEmail(email, token, organization, profile);

      return NextResponse.json({
        data: {
          id: invitation.id,
          email,
          role,
          expires_at: expiresAt,
        },
        message: 'Invitation sent successfully',
      }, { status: 201 });
    }
  } catch (error) {
    console.error('Error in POST /api/team:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const POST = withAuth(inviteTeamMember, {
  requireOrganization: true,
  requiredRoles: ['admin', 'manager'],
});
