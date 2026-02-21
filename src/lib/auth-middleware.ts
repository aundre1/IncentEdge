/**
 * IncentEdge Auth Middleware
 *
 * Higher-order components and decorators for protecting API routes
 * with authentication and permission checks.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  PermissionService,
  OrganizationRole,
  ProjectPermissions,
  Resource,
  Action,
  hasOrgPermission,
} from '@/lib/permissions';

// ============================================================================
// TYPES
// ============================================================================

export interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string;
    email: string;
  };
  profile: {
    id: string;
    email: string;
    full_name: string | null;
    organization_id: string | null;
    role: OrganizationRole;
  };
  organization: {
    id: string;
    name: string;
    subscription_tier: string;
  } | null;
}

export interface ProjectAuthenticatedRequest extends AuthenticatedRequest {
  projectId: string;
  projectPermissions: ProjectPermissions;
}

export type RouteHandler<T = NextRequest> = (
  request: T,
  context?: { params?: Record<string, string | string[]> }
) => Promise<NextResponse>;

export type AuthenticatedHandler = RouteHandler<AuthenticatedRequest>;
export type ProjectAuthenticatedHandler = RouteHandler<ProjectAuthenticatedRequest>;

interface AuthOptions {
  requireOrganization?: boolean;
  requiredRoles?: OrganizationRole[];
}

interface PermissionOptions {
  resource: Resource;
  action: Action;
}

interface ProjectAccessOptions {
  permission?: keyof Omit<ProjectPermissions, 'role' | 'custom_role_id' | 'is_org_admin' | 'is_org_member'>;
  projectIdParam?: string; // Parameter name containing project ID
  projectIdSource?: 'params' | 'body' | 'query';
}

// ============================================================================
// ERROR RESPONSES
// ============================================================================

function unauthorizedResponse(message = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 });
}

function forbiddenResponse(message = 'Forbidden') {
  return NextResponse.json({ error: message }, { status: 403 });
}

function notFoundResponse(message = 'Not found') {
  return NextResponse.json({ error: message }, { status: 404 });
}

// ============================================================================
// withAuth HOC
// ============================================================================

/**
 * Higher-order function that wraps an API route handler with authentication.
 * Injects user and profile data into the request.
 *
 * @example
 * ```ts
 * export const GET = withAuth(async (request) => {
 *   const { user, profile, organization } = request;
 *   // Handler logic...
 * });
 * ```
 */
export function withAuth(
  handler: AuthenticatedHandler,
  options: AuthOptions = {}
): RouteHandler {
  return async (request: NextRequest, context?: { params?: Record<string, string | string[]> }) => {
    try {
      const supabase = await createClient();

      // Get authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return unauthorizedResponse('Authentication required');
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        return unauthorizedResponse('User profile not found');
      }

      // Check if organization is required
      if (options.requireOrganization && !profile.organization_id) {
        return forbiddenResponse('Organization membership required');
      }

      // Get organization if exists
      let organization = null;
      if (profile.organization_id) {
        const { data: org } = await supabase
          .from('organizations')
          .select('id, name, subscription_tier')
          .eq('id', profile.organization_id)
          .single();
        organization = org;
      }

      // Check required roles
      if (options.requiredRoles && options.requiredRoles.length > 0) {
        if (!options.requiredRoles.includes(profile.role as OrganizationRole)) {
          return forbiddenResponse('Insufficient role permissions');
        }
      }

      // Create authenticated request
      const authenticatedRequest = request as AuthenticatedRequest;
      authenticatedRequest.user = {
        id: user.id,
        email: user.email!,
      };
      authenticatedRequest.profile = {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        organization_id: profile.organization_id,
        role: profile.role as OrganizationRole,
      };
      authenticatedRequest.organization = organization;

      return handler(authenticatedRequest, context);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}

// ============================================================================
// withPermission HOC
// ============================================================================

/**
 * Higher-order function that extends withAuth to also check for specific
 * organization-level permissions.
 *
 * @example
 * ```ts
 * export const POST = withPermission(
 *   async (request) => {
 *     // Only org admins and managers with 'team:manage' can access
 *   },
 *   { resource: 'team', action: 'manage' }
 * );
 * ```
 */
export function withPermission(
  handler: AuthenticatedHandler,
  permissionOptions: PermissionOptions,
  authOptions: AuthOptions = {}
): RouteHandler {
  return withAuth(async (request: AuthenticatedRequest, context) => {
    const { profile } = request;

    // Check if user has the required permission
    if (!hasOrgPermission(profile.role, permissionOptions.resource, permissionOptions.action)) {
      return forbiddenResponse(
        `Permission denied: ${permissionOptions.resource}:${permissionOptions.action}`
      );
    }

    return handler(request, context);
  }, { requireOrganization: true, ...authOptions });
}

// ============================================================================
// withProjectAccess HOC
// ============================================================================

/**
 * Higher-order function that extends withAuth to also validate project access
 * and inject project permissions.
 *
 * @example
 * ```ts
 * export const GET = withProjectAccess(
 *   async (request) => {
 *     const { projectId, projectPermissions } = request;
 *     if (!projectPermissions.can_view_financials) {
 *       return forbiddenResponse('Cannot view financials');
 *     }
 *     // Handler logic...
 *   },
 *   { permission: 'can_view', projectIdParam: 'id' }
 * );
 * ```
 */
export function withProjectAccess(
  handler: ProjectAuthenticatedHandler,
  projectOptions: ProjectAccessOptions = {},
  authOptions: AuthOptions = {}
): RouteHandler {
  const {
    permission = 'can_view',
    projectIdParam = 'id',
    projectIdSource = 'params',
  } = projectOptions;

  return withAuth(async (request: AuthenticatedRequest, context) => {
    let projectId: string | null = null;

    // Extract project ID based on source
    if (projectIdSource === 'params' && context?.params) {
      const paramValue = context.params[projectIdParam];
      projectId = Array.isArray(paramValue) ? paramValue[0] : paramValue;
    } else if (projectIdSource === 'query') {
      const url = new URL(request.url);
      projectId = url.searchParams.get(projectIdParam);
    } else if (projectIdSource === 'body') {
      try {
        const body = await request.clone().json();
        projectId = body[projectIdParam];
      } catch {
        // Body parsing failed
      }
    }

    if (!projectId) {
      return notFoundResponse('Project ID not provided');
    }

    // Get project permissions
    const permissionService = new PermissionService();
    await permissionService.init();
    const projectPermissions = await permissionService.getProjectPermissions(projectId);

    if (!projectPermissions) {
      return forbiddenResponse('No access to this project');
    }

    // Check specific permission if required
    if (permission && !projectPermissions[permission]) {
      return forbiddenResponse(`Permission denied: ${permission}`);
    }

    // Create project authenticated request
    const projectRequest = request as ProjectAuthenticatedRequest;
    projectRequest.projectId = projectId;
    projectRequest.projectPermissions = projectPermissions;

    return handler(projectRequest, context);
  }, { requireOrganization: true, ...authOptions });
}

// ============================================================================
// withAdminOnly HOC
// ============================================================================

/**
 * Shorthand for requiring admin role.
 */
export function withAdminOnly(handler: AuthenticatedHandler): RouteHandler {
  return withAuth(handler, {
    requireOrganization: true,
    requiredRoles: ['admin'],
  });
}

/**
 * Shorthand for requiring manager or admin role.
 */
export function withManagerAccess(handler: AuthenticatedHandler): RouteHandler {
  return withAuth(handler, {
    requireOrganization: true,
    requiredRoles: ['admin', 'manager'],
  });
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Validate API key for external integrations (enterprise feature)
 */
export async function validateApiKey(apiKey: string): Promise<{
  valid: boolean;
  organizationId?: string;
  permissions?: string[];
}> {
  const supabase = await createClient();

  // In a real implementation, you'd have an api_keys table
  // This is a placeholder for the enterprise API key validation
  const { data, error } = await supabase
    .from('api_keys')
    .select('organization_id, permissions, expires_at, is_active')
    .eq('key_hash', apiKey) // Keys should be hashed
    .single();

  if (error || !data || !data.is_active) {
    return { valid: false };
  }

  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { valid: false };
  }

  return {
    valid: true,
    organizationId: data.organization_id,
    permissions: data.permissions,
  };
}

/**
 * Rate limiting check (placeholder for enterprise feature)
 */
export async function checkRateLimit(
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  // In a real implementation, this would use Redis or a similar store
  // Placeholder that always allows
  return {
    allowed: true,
    remaining: limit,
    resetAt: new Date(Date.now() + windowSeconds * 1000),
  };
}

/**
 * Log API access for audit purposes
 */
export async function logApiAccess(
  userId: string | null,
  organizationId: string | null,
  endpoint: string,
  method: string,
  statusCode: number,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    const supabase = await createClient();

    await supabase.from('activity_logs').insert({
      user_id: userId,
      organization_id: organizationId,
      action_type: 'api_access',
      entity_type: 'api',
      entity_name: `${method} ${endpoint}`,
      details: {
        method,
        endpoint,
        status_code: statusCode,
        ...metadata,
      },
    });
  } catch (error) {
    // Don't fail the request if logging fails
    console.error('Failed to log API access:', error);
  }
}

// ============================================================================
// SUBSCRIPTION VALIDATION
// ============================================================================

/**
 * Check if organization has an active subscription with required features
 */
export function withSubscription(
  handler: AuthenticatedHandler,
  requiredTiers: string[] = ['starter', 'professional', 'team', 'enterprise']
): RouteHandler {
  return withAuth(async (request: AuthenticatedRequest, context) => {
    const { organization } = request;

    if (!organization) {
      return forbiddenResponse('Organization required');
    }

    if (!requiredTiers.includes(organization.subscription_tier)) {
      return NextResponse.json(
        {
          error: 'Subscription upgrade required',
          required_tier: requiredTiers[0],
          current_tier: organization.subscription_tier,
        },
        { status: 402 }
      );
    }

    return handler(request, context);
  }, { requireOrganization: true });
}

/**
 * Check specific feature access
 */
export function withFeature(
  handler: AuthenticatedHandler,
  feature: string
): RouteHandler {
  return withAuth(async (request: AuthenticatedRequest, context) => {
    const { organization } = request;

    if (!organization) {
      return forbiddenResponse('Organization required');
    }

    // Import tier limits to check feature access
    const { hasFeatureAccess } = await import('@/lib/permissions');

    if (!hasFeatureAccess(organization.subscription_tier, feature)) {
      return NextResponse.json(
        {
          error: 'Feature not available',
          feature,
          current_tier: organization.subscription_tier,
        },
        { status: 402 }
      );
    }

    return handler(request, context);
  }, { requireOrganization: true });
}

// ============================================================================
// CORS HEADERS (for API routes that need them)
// ============================================================================

export function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
    'Access-Control-Max-Age': '86400',
  };
}

/**
 * Handle OPTIONS request for CORS preflight
 */
export function handleCorsOptions(): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
};
