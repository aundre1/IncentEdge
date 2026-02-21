/**
 * Custom Roles Management API
 *
 * GET    - List custom roles
 * POST   - Create custom role
 * PATCH  - Update custom role
 * DELETE - Delete custom role
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
  hasFeatureAccess,
  isAtLimit,
  Resource,
  Action,
} from '@/lib/permissions';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const permissionSchema = z.object({
  resource: z.enum([
    'project',
    'application',
    'document',
    'program',
    'report',
    'team',
    'settings',
    'billing',
    'financials',
    'incentive_match',
  ] as const),
  action: z.enum([
    'create',
    'read',
    'update',
    'delete',
    'submit',
    'approve',
    'export',
    'share',
    'manage',
    'invite',
  ] as const),
  scope: z.enum(['own', 'team', 'organization', 'all']).optional(),
  granted: z.boolean().default(true),
});

const createRoleSchema = z.object({
  name: z
    .string()
    .min(2, 'Role name must be at least 2 characters')
    .max(50, 'Role name cannot exceed 50 characters')
    .regex(/^[a-z0-9_-]+$/, 'Role name can only contain lowercase letters, numbers, hyphens, and underscores'),
  displayName: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  hierarchyLevel: z.number().min(1).max(89), // Cannot be 0 (viewer) or 90+ (admin)
  baseRole: z.enum(['admin', 'manager', 'analyst', 'viewer']).optional(),
  isProjectRole: z.boolean().default(true),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color')
    .optional(),
  permissions: z.array(permissionSchema).optional(),
});

const updateRoleSchema = z.object({
  roleId: z.string().uuid(),
  displayName: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  hierarchyLevel: z.number().min(1).max(89).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color')
    .optional(),
  permissions: z.array(permissionSchema).optional(),
});

// ============================================================================
// GET - List Custom Roles
// ============================================================================

async function getRoles(request: AuthenticatedRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { organization } = request;

  if (!organization) {
    return NextResponse.json({ error: 'Organization required' }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const includePermissions = searchParams.get('includePermissions') === 'true';
  const includeSystemRoles = searchParams.get('includeSystem') !== 'false';
  const projectRolesOnly = searchParams.get('projectOnly') === 'true';

  try {
    let query = supabase
      .from('team_roles')
      .select(`
        id,
        name,
        display_name,
        description,
        hierarchy_level,
        base_role,
        is_system_role,
        is_project_role,
        color,
        created_at,
        created_by
      `)
      .eq('organization_id', organization.id)
      .order('hierarchy_level', { ascending: false });

    if (!includeSystemRoles) {
      query = query.eq('is_system_role', false);
    }

    if (projectRolesOnly) {
      query = query.eq('is_project_role', true);
    }

    const { data: roles, error } = await query;

    if (error) {
      console.error('Error fetching roles:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch permissions if requested
    if (includePermissions && roles && roles.length > 0) {
      const roleIds = roles.map(r => r.id);

      const { data: permissions } = await supabase
        .from('role_permissions')
        .select('*')
        .in('role_id', roleIds);

      // Group permissions by role
      const permissionsByRole = (permissions || []).reduce((acc, perm) => {
        if (!acc[perm.role_id]) {
          acc[perm.role_id] = [];
        }
        acc[perm.role_id].push(perm);
        return acc;
      }, {} as Record<string, typeof permissions>);

      // Attach permissions to roles
      const rolesWithPermissions = roles.map(role => ({
        ...role,
        permissions: permissionsByRole[role.id] || [],
      }));

      return NextResponse.json({ data: rolesWithPermissions });
    }

    return NextResponse.json({ data: roles });
  } catch (error) {
    console.error('Error in GET /api/team/roles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const GET = withAuth(getRoles, { requireOrganization: true });

// ============================================================================
// POST - Create Custom Role
// ============================================================================

async function createRole(request: AuthenticatedRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { profile, organization } = request;

  if (!organization) {
    return NextResponse.json({ error: 'Organization required' }, { status: 400 });
  }

  // Check permission
  if (!hasOrgPermission(profile.role, 'settings', 'manage')) {
    return forbiddenResponse('Only administrators can manage roles');
  }

  // Check feature access
  if (!hasFeatureAccess(organization.subscription_tier, 'custom_roles')) {
    return NextResponse.json(
      {
        error: 'Custom roles are not available on your subscription tier',
        required_tier: 'team',
        current_tier: organization.subscription_tier,
      },
      { status: 402 }
    );
  }

  try {
    const body = await request.json();
    const validationResult = createRoleSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const {
      name,
      displayName,
      description,
      hierarchyLevel,
      baseRole,
      isProjectRole,
      color,
      permissions,
    } = validationResult.data;

    // Check custom role limit
    const { count: existingRoles } = await supabase
      .from('team_roles')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organization.id)
      .eq('is_system_role', false);

    if (isAtLimit(organization.subscription_tier, 'custom_roles', existingRoles || 0)) {
      return NextResponse.json(
        {
          error: 'Custom role limit reached',
          current_tier: organization.subscription_tier,
        },
        { status: 402 }
      );
    }

    // Check for duplicate name
    const { data: existingRole } = await supabase
      .from('team_roles')
      .select('id')
      .eq('organization_id', organization.id)
      .eq('name', name)
      .single();

    if (existingRole) {
      return NextResponse.json(
        { error: 'A role with this name already exists' },
        { status: 409 }
      );
    }

    // Create the role
    const { data: role, error: roleError } = await supabase
      .from('team_roles')
      .insert({
        organization_id: organization.id,
        name,
        display_name: displayName,
        description,
        hierarchy_level: hierarchyLevel,
        base_role: baseRole,
        is_system_role: false,
        is_project_role: isProjectRole,
        color: color || '#6B7280',
        created_by: profile.id,
      })
      .select()
      .single();

    if (roleError) {
      console.error('Error creating role:', roleError);
      return NextResponse.json({ error: roleError.message }, { status: 500 });
    }

    // Add permissions if provided
    if (permissions && permissions.length > 0) {
      const permissionRecords = permissions.map(perm => ({
        role_id: role.id,
        resource: perm.resource,
        action: perm.action,
        scope: perm.scope || 'own',
        granted: perm.granted,
      }));

      const { error: permError } = await supabase
        .from('role_permissions')
        .insert(permissionRecords);

      if (permError) {
        console.error('Error adding permissions:', permError);
        // Role was created, but permissions failed - continue but log
      }
    }

    // Log the action
    await supabase.rpc('log_permission_change', {
      p_organization_id: organization.id,
      p_actor_id: profile.id,
      p_target_type: 'role',
      p_target_id: role.id,
      p_action: 'create_role',
      p_new_value: { name, displayName, hierarchyLevel, permissions },
    });

    // Log activity
    await supabase.rpc('log_activity', {
      p_organization_id: organization.id,
      p_user_id: profile.id,
      p_action_type: 'create',
      p_entity_type: 'team_role',
      p_entity_id: role.id,
      p_entity_name: displayName,
    });

    return NextResponse.json(
      {
        data: role,
        message: 'Custom role created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/team/roles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const POST = withAuth(createRole, {
  requireOrganization: true,
  requiredRoles: ['admin'],
});

// ============================================================================
// PATCH - Update Custom Role
// ============================================================================

async function updateRole(request: AuthenticatedRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { profile, organization } = request;

  if (!organization) {
    return NextResponse.json({ error: 'Organization required' }, { status: 400 });
  }

  // Check permission
  if (!hasOrgPermission(profile.role, 'settings', 'manage')) {
    return forbiddenResponse('Only administrators can manage roles');
  }

  try {
    const body = await request.json();
    const validationResult = updateRoleSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { roleId, displayName, description, hierarchyLevel, color, permissions } =
      validationResult.data;

    // Get existing role
    const { data: existingRole } = await supabase
      .from('team_roles')
      .select('*')
      .eq('id', roleId)
      .eq('organization_id', organization.id)
      .single();

    if (!existingRole) {
      return notFoundResponse('Role not found');
    }

    // Cannot modify system roles
    if (existingRole.is_system_role) {
      return forbiddenResponse('System roles cannot be modified');
    }

    // Build update object
    const updateData: Record<string, unknown> = {};

    if (displayName !== undefined) updateData.display_name = displayName;
    if (description !== undefined) updateData.description = description;
    if (hierarchyLevel !== undefined) updateData.hierarchy_level = hierarchyLevel;
    if (color !== undefined) updateData.color = color;

    // Update role
    const { data: updatedRole, error: updateError } = await supabase
      .from('team_roles')
      .update(updateData)
      .eq('id', roleId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating role:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Update permissions if provided
    if (permissions !== undefined) {
      // Delete existing permissions
      await supabase.from('role_permissions').delete().eq('role_id', roleId);

      // Add new permissions
      if (permissions.length > 0) {
        const permissionRecords = permissions.map(perm => ({
          role_id: roleId,
          resource: perm.resource,
          action: perm.action,
          scope: perm.scope || 'own',
          granted: perm.granted,
        }));

        const { error: permError } = await supabase
          .from('role_permissions')
          .insert(permissionRecords);

        if (permError) {
          console.error('Error updating permissions:', permError);
        }
      }
    }

    // Log the action
    await supabase.rpc('log_permission_change', {
      p_organization_id: organization.id,
      p_actor_id: profile.id,
      p_target_type: 'role',
      p_target_id: roleId,
      p_action: 'modify',
      p_old_value: existingRole,
      p_new_value: { ...updatedRole, permissions },
    });

    return NextResponse.json({
      data: updatedRole,
      message: 'Role updated successfully',
    });
  } catch (error) {
    console.error('Error in PATCH /api/team/roles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const PATCH = withAuth(updateRole, {
  requireOrganization: true,
  requiredRoles: ['admin'],
});

// ============================================================================
// DELETE - Delete Custom Role
// ============================================================================

async function deleteRole(request: AuthenticatedRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { profile, organization } = request;

  if (!organization) {
    return NextResponse.json({ error: 'Organization required' }, { status: 400 });
  }

  // Check permission
  if (!hasOrgPermission(profile.role, 'settings', 'manage')) {
    return forbiddenResponse('Only administrators can manage roles');
  }

  const { searchParams } = new URL(request.url);
  const roleId = searchParams.get('id');
  const replacementRoleId = searchParams.get('replacementRole');

  if (!roleId) {
    return NextResponse.json({ error: 'Role ID required' }, { status: 400 });
  }

  try {
    // Get existing role
    const { data: existingRole } = await supabase
      .from('team_roles')
      .select('*')
      .eq('id', roleId)
      .eq('organization_id', organization.id)
      .single();

    if (!existingRole) {
      return notFoundResponse('Role not found');
    }

    // Cannot delete system roles
    if (existingRole.is_system_role) {
      return forbiddenResponse('System roles cannot be deleted');
    }

    // Check if role is in use
    const { count: usageCount } = await supabase
      .from('project_members')
      .select('*', { count: 'exact', head: true })
      .eq('custom_role_id', roleId);

    if (usageCount && usageCount > 0) {
      if (!replacementRoleId) {
        return NextResponse.json(
          {
            error: 'Role is in use',
            usage_count: usageCount,
            message: 'Provide a replacementRole parameter to reassign users',
          },
          { status: 409 }
        );
      }

      // Reassign users to replacement role
      const { error: reassignError } = await supabase
        .from('project_members')
        .update({ custom_role_id: replacementRoleId })
        .eq('custom_role_id', roleId);

      if (reassignError) {
        console.error('Error reassigning users:', reassignError);
        return NextResponse.json({ error: reassignError.message }, { status: 500 });
      }
    }

    // Delete role permissions first (should cascade, but be explicit)
    await supabase.from('role_permissions').delete().eq('role_id', roleId);

    // Delete the role
    const { error: deleteError } = await supabase
      .from('team_roles')
      .delete()
      .eq('id', roleId);

    if (deleteError) {
      console.error('Error deleting role:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Log the action
    await supabase.rpc('log_permission_change', {
      p_organization_id: organization.id,
      p_actor_id: profile.id,
      p_target_type: 'role',
      p_target_id: roleId,
      p_action: 'delete_role',
      p_old_value: existingRole,
    });

    // Log activity
    await supabase.rpc('log_activity', {
      p_organization_id: organization.id,
      p_user_id: profile.id,
      p_action_type: 'delete',
      p_entity_type: 'team_role',
      p_entity_id: roleId,
      p_entity_name: existingRole.display_name,
    });

    return NextResponse.json({
      message: 'Role deleted successfully',
      reassigned_count: usageCount || 0,
    });
  } catch (error) {
    console.error('Error in DELETE /api/team/roles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const DELETE = withAuth(deleteRole, {
  requireOrganization: true,
  requiredRoles: ['admin'],
});
