import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { randomBytes, createHash } from 'crypto';

// Available API scopes
const API_SCOPES = [
  'projects:read',
  'projects:write',
  'applications:read',
  'applications:write',
  'incentives:read',
  'documents:read',
  'documents:write',
  'webhooks:read',
  'webhooks:manage',
  'integrations:read',
  'integrations:manage',
  'reports:read',
  'reports:generate',
] as const;

// Validation schema for creating an API key
const createApiKeySchema = z.object({
  name: z.string().min(1, 'API key name is required').max(255),
  description: z.string().optional(),
  scopes: z.array(z.enum(API_SCOPES)).min(1, 'At least one scope is required'),
  allowed_ips: z.array(z.string()).optional(),
  allowed_domains: z.array(z.string()).optional(),
  rate_limit_per_minute: z.number().min(1).max(10000).optional().default(60),
  rate_limit_per_day: z.number().min(1).max(1000000).optional().default(10000),
  expires_at: z.string().datetime().optional(),
  environment: z.enum(['live', 'test']).optional().default('live'),
});

// Validation schema for updating an API key
const updateApiKeySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  scopes: z.array(z.enum(API_SCOPES)).optional(),
  allowed_ips: z.array(z.string()).optional(),
  allowed_domains: z.array(z.string()).optional(),
  rate_limit_per_minute: z.number().min(1).max(10000).optional(),
  rate_limit_per_day: z.number().min(1).max(1000000).optional(),
  is_active: z.boolean().optional(),
});

// Generate a secure API key
function generateApiKey(environment: 'live' | 'test'): { fullKey: string; prefix: string; hash: string } {
  const prefix = environment === 'test' ? 'ie_test_' : 'ie_live_';
  const randomPart = randomBytes(24).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
  const fullKey = `${prefix}${randomPart}`;
  const hash = createHash('sha256').update(fullKey).digest('hex');

  return {
    fullKey,
    prefix: fullKey.substring(0, 12),
    hash,
  };
}

// GET /api/integrations/api-keys - List all API keys for the organization
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's profile with organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    // Only admins can view API keys
    if (profile.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can view API keys' }, { status: 403 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const environment = searchParams.get('environment');
    const includeRevoked = searchParams.get('include_revoked') === 'true';

    // Build query
    let query = supabase
      .from('api_keys')
      .select('*')
      .eq('organization_id', profile.organization_id)
      .order('created_at', { ascending: false });

    if (environment) {
      query = query.eq('environment', environment);
    }

    if (!includeRevoked) {
      query = query.is('revoked_at', null);
    }

    const { data: apiKeys, error } = await query;

    if (error) {
      console.error('Error fetching API keys:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Safe response (don't expose hash)
    const safeApiKeys = apiKeys?.map(key => ({
      id: key.id,
      name: key.name,
      description: key.description,
      key_prefix: key.key_prefix,
      scopes: key.scopes,
      allowed_ips: key.allowed_ips,
      allowed_domains: key.allowed_domains,
      rate_limit_per_minute: key.rate_limit_per_minute,
      rate_limit_per_day: key.rate_limit_per_day,
      last_used_at: key.last_used_at,
      request_count: key.request_count,
      is_active: key.is_active,
      expires_at: key.expires_at,
      environment: key.environment,
      created_at: key.created_at,
      revoked_at: key.revoked_at,
      revoked_reason: key.revoked_reason,
    }));

    return NextResponse.json({
      data: safeApiKeys,
      meta: {
        available_scopes: API_SCOPES,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/integrations/api-keys:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/integrations/api-keys - Create a new API key
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's profile with organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    // Only admins can create API keys
    if (profile.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can create API keys' }, { status: 403 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createApiKeySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const keyData = validationResult.data;

    // Generate the key
    const { fullKey, prefix, hash } = generateApiKey(keyData.environment || 'live');

    // Create API key
    const { data: apiKey, error } = await supabase
      .from('api_keys')
      .insert({
        organization_id: profile.organization_id,
        name: keyData.name,
        description: keyData.description,
        key_prefix: prefix,
        key_hash: hash,
        scopes: keyData.scopes,
        allowed_ips: keyData.allowed_ips || [],
        allowed_domains: keyData.allowed_domains || [],
        rate_limit_per_minute: keyData.rate_limit_per_minute,
        rate_limit_per_day: keyData.rate_limit_per_day,
        expires_at: keyData.expires_at,
        environment: keyData.environment,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating API key:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log activity
    await supabase.rpc('log_activity', {
      p_organization_id: profile.organization_id,
      p_user_id: user.id,
      p_action_type: 'create',
      p_entity_type: 'api_key',
      p_entity_id: apiKey.id,
      p_entity_name: apiKey.name,
    });

    // Return with full key (only shown once)
    return NextResponse.json({
      data: {
        id: apiKey.id,
        name: apiKey.name,
        description: apiKey.description,
        key: fullKey, // Full key only shown once
        key_prefix: apiKey.key_prefix,
        scopes: apiKey.scopes,
        allowed_ips: apiKey.allowed_ips,
        allowed_domains: apiKey.allowed_domains,
        rate_limit_per_minute: apiKey.rate_limit_per_minute,
        rate_limit_per_day: apiKey.rate_limit_per_day,
        expires_at: apiKey.expires_at,
        environment: apiKey.environment,
        created_at: apiKey.created_at,
      },
      message: 'API key created successfully. Copy the key now - it will not be shown again.',
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/integrations/api-keys:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/integrations/api-keys - Update an API key
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's profile with organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    // Only admins can update API keys
    if (profile.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can update API keys' }, { status: 403 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateApiKeySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { id, ...updateData } = validationResult.data;

    // Verify API key belongs to organization
    const { data: existingKey } = await supabase
      .from('api_keys')
      .select('id, name, organization_id, revoked_at')
      .eq('id', id)
      .eq('organization_id', profile.organization_id)
      .single();

    if (!existingKey) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    if (existingKey.revoked_at) {
      return NextResponse.json({ error: 'Cannot update a revoked API key' }, { status: 400 });
    }

    // Update API key
    const { data: apiKey, error } = await supabase
      .from('api_keys')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating API key:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log activity
    await supabase.rpc('log_activity', {
      p_organization_id: profile.organization_id,
      p_user_id: user.id,
      p_action_type: 'update',
      p_entity_type: 'api_key',
      p_entity_id: apiKey.id,
      p_entity_name: apiKey.name,
    });

    return NextResponse.json({
      data: {
        id: apiKey.id,
        name: apiKey.name,
        description: apiKey.description,
        key_prefix: apiKey.key_prefix,
        scopes: apiKey.scopes,
        allowed_ips: apiKey.allowed_ips,
        allowed_domains: apiKey.allowed_domains,
        rate_limit_per_minute: apiKey.rate_limit_per_minute,
        rate_limit_per_day: apiKey.rate_limit_per_day,
        is_active: apiKey.is_active,
        expires_at: apiKey.expires_at,
        environment: apiKey.environment,
        updated_at: apiKey.updated_at,
      },
    });
  } catch (error) {
    console.error('Error in PATCH /api/integrations/api-keys:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/integrations/api-keys - Revoke an API key
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's profile with organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    // Only admins can revoke API keys
    if (profile.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can revoke API keys' }, { status: 403 });
    }

    // Parse request body for revocation reason
    let reason: string | undefined;
    try {
      const body = await request.json();
      reason = body.reason;
    } catch {
      // No body provided
    }

    // Get API key ID from query params
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'API key ID is required' }, { status: 400 });
    }

    // Get API key for logging
    const { data: apiKey } = await supabase
      .from('api_keys')
      .select('id, name, organization_id, revoked_at')
      .eq('id', id)
      .eq('organization_id', profile.organization_id)
      .single();

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    if (apiKey.revoked_at) {
      return NextResponse.json({ error: 'API key is already revoked' }, { status: 400 });
    }

    // Revoke API key (soft delete - keep for audit trail)
    const { error } = await supabase
      .from('api_keys')
      .update({
        is_active: false,
        revoked_at: new Date().toISOString(),
        revoked_by: user.id,
        revoked_reason: reason || 'Revoked by admin',
      })
      .eq('id', id);

    if (error) {
      console.error('Error revoking API key:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log activity
    await supabase.rpc('log_activity', {
      p_organization_id: profile.organization_id,
      p_user_id: user.id,
      p_action_type: 'revoke',
      p_entity_type: 'api_key',
      p_entity_id: apiKey.id,
      p_entity_name: apiKey.name,
      p_details: { reason: reason || 'Revoked by admin' },
    });

    return NextResponse.json({ message: 'API key revoked successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/integrations/api-keys:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
