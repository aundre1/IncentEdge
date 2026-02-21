/**
 * IncentEdge Permissions Library
 *
 * Enterprise-grade permission system for team collaboration across multiple projects.
 * Supports role hierarchy, granular permissions, and project-level overrides.
 */

import { createClient } from '@/lib/supabase/server';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type OrganizationRole = 'admin' | 'manager' | 'analyst' | 'viewer';
export type ProjectRole = 'owner' | 'admin' | 'manager' | 'analyst' | 'viewer';

export type Resource =
  | 'project'
  | 'application'
  | 'document'
  | 'program'
  | 'report'
  | 'team'
  | 'settings'
  | 'billing'
  | 'financials'
  | 'incentive_match';

export type Action =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'submit'
  | 'approve'
  | 'export'
  | 'share'
  | 'manage'
  | 'invite';

export type PermissionScope = 'own' | 'team' | 'organization' | 'all';

export interface Permission {
  resource: Resource;
  action: Action;
  scope?: PermissionScope;
  conditions?: Record<string, unknown>;
}

export interface ProjectPermissions {
  can_view: boolean;
  can_view_financials: boolean;
  can_edit_project: boolean;
  can_manage_applications: boolean;
  can_submit_applications: boolean;
  can_upload_documents: boolean;
  can_invite_members: boolean;
  can_export_data: boolean;
  can_delete_project: boolean;
  role: ProjectRole;
  custom_role_id?: string;
  is_org_admin?: boolean;
  is_org_member?: boolean;
}

export interface UserContext {
  userId: string;
  email: string;
  organizationId: string | null;
  organizationRole: OrganizationRole;
  subscriptionTier: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: ProjectRole;
  custom_role_id?: string;
  can_view_financials: boolean;
  can_edit_project: boolean;
  can_manage_applications: boolean;
  can_submit_applications: boolean;
  can_upload_documents: boolean;
  can_invite_members: boolean;
  can_export_data: boolean;
  can_delete_project: boolean;
  permission_overrides: Record<string, boolean>;
}

// ============================================================================
// ROLE HIERARCHY
// ============================================================================

/**
 * Role hierarchy levels - higher number = more permissions
 */
export const ROLE_HIERARCHY: Record<ProjectRole, number> = {
  owner: 100,
  admin: 90,
  manager: 70,
  analyst: 50,
  viewer: 10,
};

export const ORG_ROLE_HIERARCHY: Record<OrganizationRole, number> = {
  admin: 100,
  manager: 70,
  analyst: 50,
  viewer: 10,
};

/**
 * Check if a role has equal or higher privilege than another role
 */
export function hasHigherOrEqualRole(
  userRole: ProjectRole | OrganizationRole,
  requiredRole: ProjectRole | OrganizationRole,
  isProjectRole = true
): boolean {
  const hierarchy = isProjectRole ? ROLE_HIERARCHY : ORG_ROLE_HIERARCHY;
  const userLevel = hierarchy[userRole as keyof typeof hierarchy] || 0;
  const requiredLevel = hierarchy[requiredRole as keyof typeof hierarchy] || 0;
  return userLevel >= requiredLevel;
}

// ============================================================================
// DEFAULT PERMISSIONS BY ROLE
// ============================================================================

/**
 * Default permissions granted to each project role
 */
export const DEFAULT_PROJECT_PERMISSIONS: Record<ProjectRole, Partial<ProjectPermissions>> = {
  owner: {
    can_view: true,
    can_view_financials: true,
    can_edit_project: true,
    can_manage_applications: true,
    can_submit_applications: true,
    can_upload_documents: true,
    can_invite_members: true,
    can_export_data: true,
    can_delete_project: true,
  },
  admin: {
    can_view: true,
    can_view_financials: true,
    can_edit_project: true,
    can_manage_applications: true,
    can_submit_applications: true,
    can_upload_documents: true,
    can_invite_members: true,
    can_export_data: true,
    can_delete_project: false,
  },
  manager: {
    can_view: true,
    can_view_financials: true,
    can_edit_project: true,
    can_manage_applications: true,
    can_submit_applications: true,
    can_upload_documents: true,
    can_invite_members: false,
    can_export_data: true,
    can_delete_project: false,
  },
  analyst: {
    can_view: true,
    can_view_financials: true,
    can_edit_project: false,
    can_manage_applications: false,
    can_submit_applications: false,
    can_upload_documents: true,
    can_invite_members: false,
    can_export_data: true,
    can_delete_project: false,
  },
  viewer: {
    can_view: true,
    can_view_financials: false,
    can_edit_project: false,
    can_manage_applications: false,
    can_submit_applications: false,
    can_upload_documents: false,
    can_invite_members: false,
    can_export_data: false,
    can_delete_project: false,
  },
};

/**
 * Resource-action matrix for organization-level permissions
 */
export const ORG_PERMISSIONS_MATRIX: Record<OrganizationRole, Record<Resource, Action[]>> = {
  admin: {
    project: ['create', 'read', 'update', 'delete', 'manage', 'share'],
    application: ['create', 'read', 'update', 'delete', 'submit', 'approve'],
    document: ['create', 'read', 'update', 'delete', 'export', 'share'],
    program: ['read', 'share'],
    report: ['create', 'read', 'export', 'share'],
    team: ['read', 'manage', 'invite'],
    settings: ['read', 'update', 'manage'],
    billing: ['read', 'manage'],
    financials: ['read', 'update', 'export'],
    incentive_match: ['read', 'update', 'delete'],
  },
  manager: {
    project: ['create', 'read', 'update', 'manage'],
    application: ['create', 'read', 'update', 'submit'],
    document: ['create', 'read', 'update', 'delete', 'export'],
    program: ['read'],
    report: ['create', 'read', 'export'],
    team: ['read', 'invite'],
    settings: ['read'],
    billing: [],
    financials: ['read', 'update', 'export'],
    incentive_match: ['read', 'update'],
  },
  analyst: {
    project: ['read', 'update'],
    application: ['read', 'update'],
    document: ['create', 'read', 'export'],
    program: ['read'],
    report: ['read', 'export'],
    team: ['read'],
    settings: [],
    billing: [],
    financials: ['read', 'export'],
    incentive_match: ['read'],
  },
  viewer: {
    project: ['read'],
    application: ['read'],
    document: ['read'],
    program: ['read'],
    report: ['read'],
    team: ['read'],
    settings: [],
    billing: [],
    financials: [],
    incentive_match: ['read'],
  },
};

// ============================================================================
// PERMISSION CHECK FUNCTIONS
// ============================================================================

/**
 * Check if a user has a specific organization-level permission
 */
export function hasOrgPermission(
  userRole: OrganizationRole,
  resource: Resource,
  action: Action
): boolean {
  const allowedActions = ORG_PERMISSIONS_MATRIX[userRole]?.[resource] || [];
  return allowedActions.includes(action);
}

/**
 * Check if a user has a specific project-level permission
 */
export function hasProjectPermission(
  permissions: ProjectPermissions,
  permission: keyof Omit<ProjectPermissions, 'role' | 'custom_role_id' | 'is_org_admin' | 'is_org_member'>
): boolean {
  // Org admins have all permissions
  if (permissions.is_org_admin) {
    return true;
  }
  return permissions[permission] === true;
}

/**
 * Get default permissions for a role
 */
export function getDefaultPermissionsForRole(role: ProjectRole): Partial<ProjectPermissions> {
  return { ...DEFAULT_PROJECT_PERMISSIONS[role] };
}

/**
 * Merge permission overrides with default role permissions
 */
export function mergePermissions(
  role: ProjectRole,
  overrides: Record<string, boolean> = {}
): Partial<ProjectPermissions> {
  const defaults = getDefaultPermissionsForRole(role);
  return {
    ...defaults,
    ...overrides,
    role,
  };
}

// ============================================================================
// PERMISSION SERVICE CLASS
// ============================================================================

/**
 * Server-side permission service for checking user access
 */
export class PermissionService {
  private supabase: Awaited<ReturnType<typeof createClient>> | null = null;

  /**
   * Initialize the permission service with a Supabase client
   */
  async init() {
    if (!this.supabase) {
      this.supabase = await createClient();
    }
    return this;
  }

  /**
   * Get the current authenticated user's context
   */
  async getUserContext(): Promise<UserContext | null> {
    await this.init();

    const { data: { user }, error: authError } = await this.supabase!.auth.getUser();
    if (authError || !user) {
      return null;
    }

    const { data: profile } = await this.supabase!
      .from('profiles')
      .select(`
        id,
        email,
        organization_id,
        role,
        organizations!inner (
          subscription_tier
        )
      `)
      .eq('id', user.id)
      .single();

    if (!profile) {
      return null;
    }

    return {
      userId: profile.id,
      email: profile.email,
      organizationId: profile.organization_id,
      organizationRole: profile.role as OrganizationRole,
      subscriptionTier: (profile.organizations as unknown as { subscription_tier: string } | null)?.subscription_tier || 'free',
    };
  }

  /**
   * Check if user has access to an organization
   */
  async hasOrganizationAccess(organizationId: string): Promise<boolean> {
    const context = await this.getUserContext();
    if (!context) return false;
    return context.organizationId === organizationId;
  }

  /**
   * Check if user has a specific organization permission
   */
  async checkOrgPermission(resource: Resource, action: Action): Promise<boolean> {
    const context = await this.getUserContext();
    if (!context) return false;
    return hasOrgPermission(context.organizationRole, resource, action);
  }

  /**
   * Get user's permissions for a specific project
   */
  async getProjectPermissions(projectId: string): Promise<ProjectPermissions | null> {
    await this.init();

    const context = await this.getUserContext();
    if (!context) return null;

    // Use the database function for consistent permission calculation
    const { data, error } = await this.supabase!
      .rpc('get_project_permissions', {
        p_user_id: context.userId,
        p_project_id: projectId,
      });

    if (error) {
      console.error('Error getting project permissions:', error);
      return null;
    }

    return data as ProjectPermissions;
  }

  /**
   * Check if user has a specific permission on a project
   */
  async checkProjectPermission(
    projectId: string,
    permission: keyof Omit<ProjectPermissions, 'role' | 'custom_role_id' | 'is_org_admin' | 'is_org_member'>
  ): Promise<boolean> {
    const permissions = await this.getProjectPermissions(projectId);
    if (!permissions) return false;
    return hasProjectPermission(permissions, permission);
  }

  /**
   * Check if user can perform an action on a project
   */
  async canPerformAction(
    projectId: string,
    action: 'view' | 'edit' | 'delete' | 'submit' | 'manage' | 'invite' | 'export'
  ): Promise<boolean> {
    const permissionMap: Record<string, keyof ProjectPermissions> = {
      view: 'can_view',
      edit: 'can_edit_project',
      delete: 'can_delete_project',
      submit: 'can_submit_applications',
      manage: 'can_manage_applications',
      invite: 'can_invite_members',
      export: 'can_export_data',
    };

    const permission = permissionMap[action];
    if (!permission) return false;

    return this.checkProjectPermission(projectId, permission as keyof Omit<ProjectPermissions, 'role' | 'custom_role_id' | 'is_org_admin' | 'is_org_member'>);
  }

  /**
   * Get all projects the user has access to
   */
  async getAccessibleProjects(): Promise<string[]> {
    await this.init();

    const context = await this.getUserContext();
    if (!context || !context.organizationId) return [];

    // Org admins can see all org projects
    if (context.organizationRole === 'admin') {
      const { data } = await this.supabase!
        .from('projects')
        .select('id')
        .eq('organization_id', context.organizationId);
      return data?.map(p => p.id) || [];
    }

    // Other users see projects they're members of
    const { data } = await this.supabase!
      .from('project_members')
      .select('project_id')
      .eq('user_id', context.userId);

    return data?.map(m => m.project_id) || [];
  }

  /**
   * Check if user can manage another user (for role changes, removal)
   */
  async canManageUser(targetUserId: string, projectId?: string): Promise<boolean> {
    const context = await this.getUserContext();
    if (!context) return false;

    // Cannot manage self
    if (context.userId === targetUserId) return false;

    // Org admins can manage anyone in the org
    if (context.organizationRole === 'admin') return true;

    // For project-specific management
    if (projectId) {
      const permissions = await this.getProjectPermissions(projectId);
      if (!permissions) return false;

      // Need invite permission to manage project members
      if (!permissions.can_invite_members) return false;

      // Check target user's role in the project
      const { data: targetMember } = await this.supabase!
        .from('project_members')
        .select('role')
        .eq('project_id', projectId)
        .eq('user_id', targetUserId)
        .single();

      if (!targetMember) return false;

      // Can only manage users with lower role
      return hasHigherOrEqualRole(permissions.role, targetMember.role as ProjectRole, true) &&
             permissions.role !== targetMember.role;
    }

    return false;
  }

  /**
   * Get the list of roles a user can assign to others
   */
  async getAssignableRoles(projectId?: string): Promise<ProjectRole[]> {
    const context = await this.getUserContext();
    if (!context) return [];

    let userRole: ProjectRole = 'viewer';

    if (context.organizationRole === 'admin') {
      userRole = 'admin';
    } else if (projectId) {
      const permissions = await this.getProjectPermissions(projectId);
      userRole = permissions?.role || 'viewer';
    }

    // Can only assign roles lower than own role
    const userLevel = ROLE_HIERARCHY[userRole];
    return (Object.entries(ROLE_HIERARCHY) as [ProjectRole, number][])
      .filter(([_, level]) => level < userLevel)
      .map(([role]) => role);
  }
}

// ============================================================================
// PERMISSION UTILITIES
// ============================================================================

/**
 * Create a permission service instance
 */
export async function createPermissionService(): Promise<PermissionService> {
  const service = new PermissionService();
  await service.init();
  return service;
}

/**
 * Quick check for authenticated user
 */
export async function isAuthenticated(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return !!user;
}

/**
 * Get current user ID
 */
export async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

/**
 * Validate that a permission string is valid
 */
export function isValidPermission(
  permission: string
): permission is keyof Omit<ProjectPermissions, 'role' | 'custom_role_id' | 'is_org_admin' | 'is_org_member'> {
  const validPermissions = [
    'can_view',
    'can_view_financials',
    'can_edit_project',
    'can_manage_applications',
    'can_submit_applications',
    'can_upload_documents',
    'can_invite_members',
    'can_export_data',
    'can_delete_project',
  ];
  return validPermissions.includes(permission);
}

/**
 * Parse a permission string into resource and action
 */
export function parsePermission(permissionString: string): { resource: Resource; action: Action } | null {
  const mapping: Record<string, { resource: Resource; action: Action }> = {
    can_view: { resource: 'project', action: 'read' },
    can_view_financials: { resource: 'financials', action: 'read' },
    can_edit_project: { resource: 'project', action: 'update' },
    can_manage_applications: { resource: 'application', action: 'manage' },
    can_submit_applications: { resource: 'application', action: 'submit' },
    can_upload_documents: { resource: 'document', action: 'create' },
    can_invite_members: { resource: 'team', action: 'invite' },
    can_export_data: { resource: 'report', action: 'export' },
    can_delete_project: { resource: 'project', action: 'delete' },
  };
  return mapping[permissionString] || null;
}

// ============================================================================
// SUBSCRIPTION TIER LIMITS
// ============================================================================

export const TIER_LIMITS = {
  free: {
    max_projects: 1,
    max_team_members: 2,
    max_custom_roles: 0,
    features: ['basic_eligibility'],
  },
  starter: {
    max_projects: 5,
    max_team_members: 5,
    max_custom_roles: 0,
    features: ['basic_eligibility', 'document_upload'],
  },
  professional: {
    max_projects: 25,
    max_team_members: 15,
    max_custom_roles: 3,
    features: ['basic_eligibility', 'document_upload', 'ai_applications', 'reports'],
  },
  team: {
    max_projects: 100,
    max_team_members: 50,
    max_custom_roles: 10,
    features: ['basic_eligibility', 'document_upload', 'ai_applications', 'reports', 'custom_roles'],
  },
  enterprise: {
    max_projects: -1, // Unlimited
    max_team_members: -1,
    max_custom_roles: -1,
    features: ['basic_eligibility', 'document_upload', 'ai_applications', 'reports', 'custom_roles', 'api_access', 'sso', 'audit_logs'],
  },
};

/**
 * Check if a feature is available for a subscription tier
 */
export function hasFeatureAccess(tier: string, feature: string): boolean {
  const tierConfig = TIER_LIMITS[tier as keyof typeof TIER_LIMITS];
  if (!tierConfig) return false;
  return tierConfig.features.includes(feature);
}

/**
 * Check if organization has reached a limit
 */
export function isAtLimit(tier: string, limitType: 'projects' | 'team_members' | 'custom_roles', currentCount: number): boolean {
  const tierConfig = TIER_LIMITS[tier as keyof typeof TIER_LIMITS];
  if (!tierConfig) return true;

  const limitMap = {
    projects: tierConfig.max_projects,
    team_members: tierConfig.max_team_members,
    custom_roles: tierConfig.max_custom_roles,
  };

  const limit = limitMap[limitType];
  if (limit === -1) return false; // Unlimited
  return currentCount >= limit;
}

export default PermissionService;
