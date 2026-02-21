/**
 * Team Invitations API
 *
 * GET    - List pending invitations
 * POST   - Accept/decline invitation (via token)
 * DELETE - Revoke invitation
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
import { hasOrgPermission } from '@/lib/permissions';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const acceptInvitationSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  action: z.enum(['accept', 'decline']),
});

const revokeInvitationSchema = z.object({
  invitationId: z.string().uuid('Invalid invitation ID'),
  type: z.enum(['organization', 'project']).default('organization'),
});

// ============================================================================
// GET - List Pending Invitations
// ============================================================================

async function getInvitations(request: AuthenticatedRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { profile, organization } = request;

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'all'; // 'organization', 'project', 'all'
  const status = searchParams.get('status') || 'pending';
  const projectId = searchParams.get('projectId');
  const myInvitations = searchParams.get('my') === 'true'; // Get invitations sent to current user

  try {
    const results: {
      organization_invitations?: unknown[];
      project_invitations?: unknown[];
      my_invitations?: unknown[];
    } = {};

    // Get invitations sent to the current user (regardless of organization)
    if (myInvitations) {
      const { data: orgInvites } = await supabase
        .from('invitations')
        .select(`
          id,
          email,
          role,
          status,
          expires_at,
          created_at,
          organizations!inner (
            id,
            name
          ),
          invited_by_profile:profiles!invitations_invited_by_fkey (
            full_name,
            email
          )
        `)
        .eq('email', profile.email)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString());

      const { data: projectInvites } = await supabase
        .from('project_invitations')
        .select(`
          id,
          email,
          role,
          status,
          message,
          expires_at,
          created_at,
          projects!inner (
            id,
            name
          ),
          organizations!inner (
            id,
            name
          ),
          invited_by_profile:profiles!project_invitations_invited_by_fkey (
            full_name,
            email
          )
        `)
        .eq('email', profile.email)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString());

      return NextResponse.json({
        data: {
          organization_invitations: orgInvites || [],
          project_invitations: projectInvites || [],
        },
      });
    }

    // Need organization for listing sent invitations
    if (!organization) {
      return NextResponse.json({ error: 'Organization required' }, { status: 400 });
    }

    // Check permission to view invitations
    if (!hasOrgPermission(profile.role, 'team', 'read')) {
      return forbiddenResponse('Permission denied');
    }

    // Get organization invitations
    if (type === 'organization' || type === 'all') {
      let query = supabase
        .from('invitations')
        .select(`
          id,
          email,
          role,
          status,
          expires_at,
          created_at,
          invited_by,
          invited_by_profile:profiles!invitations_invited_by_fkey (
            full_name,
            email
          )
        `)
        .eq('organization_id', organization.id);

      if (status !== 'all') {
        query = query.eq('status', status);
      }

      query = query.order('created_at', { ascending: false });

      const { data: orgInvitations, error } = await query;

      if (error) {
        console.error('Error fetching org invitations:', error);
      } else {
        results.organization_invitations = orgInvitations;
      }
    }

    // Get project invitations
    if (type === 'project' || type === 'all') {
      let query = supabase
        .from('project_invitations')
        .select(`
          id,
          email,
          role,
          status,
          message,
          expires_at,
          created_at,
          project_id,
          projects!inner (
            id,
            name
          ),
          invited_by,
          invited_by_profile:profiles!project_invitations_invited_by_fkey (
            full_name,
            email
          )
        `)
        .eq('organization_id', organization.id);

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      if (status !== 'all') {
        query = query.eq('status', status);
      }

      query = query.order('created_at', { ascending: false });

      const { data: projectInvitations, error } = await query;

      if (error) {
        console.error('Error fetching project invitations:', error);
      } else {
        results.project_invitations = projectInvitations;
      }
    }

    return NextResponse.json({ data: results });
  } catch (error) {
    console.error('Error in GET /api/team/invitations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const GET = withAuth(getInvitations);

// ============================================================================
// POST - Accept or Decline Invitation
// ============================================================================

async function respondToInvitation(request: AuthenticatedRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { profile } = request;

  try {
    const body = await request.json();
    const validationResult = acceptInvitationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { token, action } = validationResult.data;

    // Try to find the invitation (check both tables)
    let invitation = null;
    let isProjectInvitation = false;

    // Check organization invitations first
    const { data: orgInvitation } = await supabase
      .from('invitations')
      .select(`
        *,
        organizations!inner (
          id,
          name
        )
      `)
      .eq('token', token)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .single();

    if (orgInvitation) {
      invitation = orgInvitation;
    } else {
      // Check project invitations
      const { data: projectInvitation } = await supabase
        .from('project_invitations')
        .select(`
          *,
          projects!inner (
            id,
            name,
            organization_id
          ),
          organizations!inner (
            id,
            name
          )
        `)
        .eq('token', token)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .single();

      if (projectInvitation) {
        invitation = projectInvitation;
        isProjectInvitation = true;
      }
    }

    if (!invitation) {
      return notFoundResponse('Invitation not found or has expired');
    }

    // Verify the invitation is for this user
    if (invitation.email.toLowerCase() !== profile.email.toLowerCase()) {
      return forbiddenResponse('This invitation is for a different email address');
    }

    if (action === 'decline') {
      // Decline the invitation
      const table = isProjectInvitation ? 'project_invitations' : 'invitations';
      const { error } = await supabase
        .from(table)
        .update({
          status: 'declined',
          declined_at: new Date().toISOString(),
        })
        .eq('id', invitation.id);

      if (error) {
        console.error('Error declining invitation:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        message: 'Invitation declined',
      });
    }

    // Accept the invitation
    if (isProjectInvitation) {
      // Use the database function to accept project invitation
      const { data: result, error } = await supabase.rpc('accept_project_invitation', {
        p_token: token,
        p_user_id: profile.id,
      });

      if (error) {
        console.error('Error accepting project invitation:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({
        message: 'Invitation accepted',
        data: {
          project_id: result.project_id,
          member_id: result.member_id,
        },
      });
    } else {
      // Accept organization invitation
      // Check if user is already in an organization
      if (profile.organization_id && profile.organization_id !== invitation.organization_id) {
        return NextResponse.json(
          {
            error: 'You are already a member of another organization',
            current_organization: profile.organization_id,
          },
          { status: 409 }
        );
      }

      // Update user profile to join organization
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          organization_id: invitation.organization_id,
          role: invitation.role,
        })
        .eq('id', profile.id);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      // Update invitation status
      const { error: inviteError } = await supabase
        .from('invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
        })
        .eq('id', invitation.id);

      if (inviteError) {
        console.error('Error updating invitation:', inviteError);
      }

      // Log activity
      await supabase.rpc('log_activity', {
        p_organization_id: invitation.organization_id,
        p_user_id: profile.id,
        p_action_type: 'join',
        p_entity_type: 'organization',
        p_entity_id: invitation.organization_id,
        p_entity_name: invitation.organizations.name,
      });

      return NextResponse.json({
        message: 'Invitation accepted',
        data: {
          organization_id: invitation.organization_id,
          role: invitation.role,
        },
      });
    }
  } catch (error) {
    console.error('Error in POST /api/team/invitations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const POST = withAuth(respondToInvitation);

// ============================================================================
// DELETE - Revoke Invitation
// ============================================================================

async function revokeInvitation(request: AuthenticatedRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { profile, organization } = request;

  if (!organization) {
    return NextResponse.json({ error: 'Organization required' }, { status: 400 });
  }

  // Check permission
  if (!hasOrgPermission(profile.role, 'team', 'manage')) {
    return forbiddenResponse('Permission denied');
  }

  try {
    const { searchParams } = new URL(request.url);
    const invitationId = searchParams.get('id');
    const type = searchParams.get('type') || 'organization';

    if (!invitationId) {
      return NextResponse.json({ error: 'Invitation ID required' }, { status: 400 });
    }

    const table = type === 'project' ? 'project_invitations' : 'invitations';

    // Verify invitation belongs to organization
    const { data: invitation } = await supabase
      .from(table)
      .select('id, email, status')
      .eq('id', invitationId)
      .eq('organization_id', organization.id)
      .single();

    if (!invitation) {
      return notFoundResponse('Invitation not found');
    }

    if (invitation.status !== 'pending') {
      return NextResponse.json(
        { error: `Cannot revoke invitation with status: ${invitation.status}` },
        { status: 400 }
      );
    }

    // Revoke the invitation
    const { error } = await supabase
      .from(table)
      .update({ status: 'revoked' })
      .eq('id', invitationId);

    if (error) {
      console.error('Error revoking invitation:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log the action
    await supabase.rpc('log_permission_change', {
      p_organization_id: organization.id,
      p_actor_id: profile.id,
      p_target_type: 'invitation',
      p_target_id: invitationId,
      p_action: 'revoke',
      p_old_value: { email: invitation.email, status: 'pending' },
      p_new_value: { status: 'revoked' },
    });

    return NextResponse.json({
      message: 'Invitation revoked successfully',
    });
  } catch (error) {
    console.error('Error in DELETE /api/team/invitations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const DELETE = withAuth(revokeInvitation, { requireOrganization: true });

// ============================================================================
// PATCH - Resend Invitation
// ============================================================================

async function resendInvitation(request: AuthenticatedRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { profile, organization } = request;

  if (!organization) {
    return NextResponse.json({ error: 'Organization required' }, { status: 400 });
  }

  // Check permission
  if (!hasOrgPermission(profile.role, 'team', 'invite')) {
    return forbiddenResponse('Permission denied');
  }

  try {
    const body = await request.json();
    const { invitationId, type = 'organization' } = body;

    if (!invitationId) {
      return NextResponse.json({ error: 'Invitation ID required' }, { status: 400 });
    }

    const table = type === 'project' ? 'project_invitations' : 'invitations';

    // Get existing invitation
    const { data: invitation } = await supabase
      .from(table)
      .select('*')
      .eq('id', invitationId)
      .eq('organization_id', organization.id)
      .eq('status', 'pending')
      .single();

    if (!invitation) {
      return notFoundResponse('Invitation not found or is not pending');
    }

    // Check if enough time has passed (24 hours)
    const hoursSinceSent = (Date.now() - new Date(invitation.created_at).getTime()) / (1000 * 60 * 60);
    if (hoursSinceSent < 24) {
      return NextResponse.json(
        {
          error: 'Please wait at least 24 hours before resending an invitation',
          hours_remaining: Math.ceil(24 - hoursSinceSent),
        },
        { status: 429 }
      );
    }

    // Generate new token and expiry
    const crypto = await import('crypto');
    const newToken = crypto.randomBytes(32).toString('hex');
    const newExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Update invitation
    const { data: updatedInvitation, error } = await supabase
      .from(table)
      .update({
        token: newToken,
        expires_at: newExpiry.toISOString(),
        // Note: keeping created_at to track original invite date
      })
      .eq('id', invitationId)
      .select()
      .single();

    if (error) {
      console.error('Error resending invitation:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // TODO: Send new invitation email
    // await sendInvitationEmail(invitation.email, newToken, ...);

    return NextResponse.json({
      message: 'Invitation resent successfully',
      data: {
        id: updatedInvitation.id,
        email: updatedInvitation.email,
        expires_at: newExpiry,
      },
    });
  } catch (error) {
    console.error('Error in PATCH /api/team/invitations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const PATCH = withAuth(resendInvitation, { requireOrganization: true });
