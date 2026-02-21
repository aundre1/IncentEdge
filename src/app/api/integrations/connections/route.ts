import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Supported integration providers
const INTEGRATION_PROVIDERS = {
  // Tax Credit Marketplaces
  crux: {
    name: 'Crux',
    displayName: 'Crux Climate',
    description: 'IRA tax credit marketplace for buying and selling transferable credits',
    category: 'tax_credit_marketplace',
    oauthSupported: true,
    scopes: ['credits:read', 'credits:write', 'transactions:read'],
  },
  foss_co: {
    name: 'foss_co',
    displayName: 'Foss & Company',
    description: 'Tax credit financing and syndication platform',
    category: 'tax_credit_marketplace',
    oauthSupported: true,
    scopes: ['projects:read', 'credits:read', 'credits:write'],
  },
  reunion: {
    name: 'reunion',
    displayName: 'Reunion Infrastructure',
    description: 'Tax credit marketplace specializing in clean energy',
    category: 'tax_credit_marketplace',
    oauthSupported: true,
    scopes: ['credits:read', 'credits:write'],
  },

  // Accounting Systems
  quickbooks: {
    name: 'quickbooks',
    displayName: 'QuickBooks',
    description: 'Accounting software for expense tracking and financial reporting',
    category: 'accounting',
    oauthSupported: true,
    scopes: ['accounting', 'payments', 'reports'],
  },
  xero: {
    name: 'xero',
    displayName: 'Xero',
    description: 'Cloud accounting for tracking incentive financials',
    category: 'accounting',
    oauthSupported: true,
    scopes: ['accounting.transactions', 'accounting.reports.read'],
  },
  sage: {
    name: 'sage',
    displayName: 'Sage Intacct',
    description: 'Enterprise accounting for real estate developers',
    category: 'accounting',
    oauthSupported: true,
    scopes: ['general_ledger', 'accounts_payable', 'accounts_receivable'],
  },

  // CRM Systems
  salesforce: {
    name: 'salesforce',
    displayName: 'Salesforce',
    description: 'CRM for managing incentive program relationships',
    category: 'crm',
    oauthSupported: true,
    scopes: ['api', 'refresh_token', 'offline_access'],
  },
  hubspot: {
    name: 'hubspot',
    displayName: 'HubSpot',
    description: 'CRM and marketing platform',
    category: 'crm',
    oauthSupported: true,
    scopes: ['crm.objects.contacts', 'crm.objects.deals'],
  },

  // Automation Platforms
  zapier: {
    name: 'zapier',
    displayName: 'Zapier',
    description: 'Connect IncentEdge to 5,000+ apps with automated workflows',
    category: 'automation',
    oauthSupported: true,
    scopes: ['zap:read', 'zap:write'],
  },
  make: {
    name: 'make',
    displayName: 'Make (Integromat)',
    description: 'Visual automation platform for complex workflows',
    category: 'automation',
    oauthSupported: true,
    scopes: ['scenarios:read', 'scenarios:write'],
  },

  // Document Management
  docusign: {
    name: 'docusign',
    displayName: 'DocuSign',
    description: 'Electronic signature for incentive applications',
    category: 'document_management',
    oauthSupported: true,
    scopes: ['signature', 'impersonation'],
  },
  google_drive: {
    name: 'google_drive',
    displayName: 'Google Drive',
    description: 'Cloud storage for project documents',
    category: 'document_management',
    oauthSupported: true,
    scopes: ['drive.file', 'drive.readonly'],
  },
  dropbox: {
    name: 'dropbox',
    displayName: 'Dropbox',
    description: 'File storage and sharing',
    category: 'document_management',
    oauthSupported: true,
    scopes: ['files.content.read', 'files.content.write'],
  },

  // Project Management
  procore: {
    name: 'procore',
    displayName: 'Procore',
    description: 'Construction management platform integration',
    category: 'project_management',
    oauthSupported: true,
    scopes: ['projects:read', 'documents:read'],
  },
} as const;

type ProviderKey = keyof typeof INTEGRATION_PROVIDERS;

// Validation schema for initiating OAuth connection
const initiateConnectionSchema = z.object({
  provider: z.enum(Object.keys(INTEGRATION_PROVIDERS) as [ProviderKey, ...ProviderKey[]]),
  redirect_uri: z.string().url().optional(),
  scopes: z.array(z.string()).optional(),
});

// Validation schema for completing OAuth connection
const completeConnectionSchema = z.object({
  provider: z.enum(Object.keys(INTEGRATION_PROVIDERS) as [ProviderKey, ...ProviderKey[]]),
  code: z.string(),
  state: z.string(),
});

// Validation schema for updating connection settings
const updateConnectionSchema = z.object({
  id: z.string().uuid(),
  settings: z.record(z.unknown()).optional(),
  sync_enabled: z.boolean().optional(),
  sync_frequency: z.enum(['realtime', 'hourly', 'daily', 'manual']).optional(),
});

// GET /api/integrations/connections - List all connections for the organization
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

    // Only admins and managers can view connections
    if (!['admin', 'manager'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    // Build query
    let query = supabase
      .from('integration_connections')
      .select('*')
      .eq('organization_id', profile.organization_id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: connections, error } = await query;

    if (error) {
      console.error('Error fetching connections:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Filter by category if specified (done in JS since category is in provider config)
    let filteredConnections = connections || [];
    if (category) {
      filteredConnections = filteredConnections.filter(conn => {
        const provider = INTEGRATION_PROVIDERS[conn.provider as ProviderKey];
        return provider?.category === category;
      });
    }

    // Enrich connections with provider info and mask tokens
    const enrichedConnections = filteredConnections.map(conn => {
      const provider = INTEGRATION_PROVIDERS[conn.provider as ProviderKey];
      return {
        id: conn.id,
        provider: conn.provider,
        provider_display_name: provider?.displayName || conn.provider_display_name,
        provider_description: provider?.description,
        provider_category: provider?.category,
        provider_account_id: conn.provider_account_id,
        provider_account_name: conn.provider_account_name,
        scopes: conn.scopes,
        settings: conn.settings,
        sync_enabled: conn.sync_enabled,
        sync_frequency: conn.sync_frequency,
        last_sync_at: conn.last_sync_at,
        last_sync_status: conn.last_sync_status,
        status: conn.status,
        health_status: conn.health_status,
        health_check_at: conn.health_check_at,
        connected_at: conn.created_at,
        // Never expose tokens
        has_access_token: !!conn.access_token,
        token_expires_at: conn.token_expires_at,
      };
    });

    // Build available providers list
    const availableProviders = Object.entries(INTEGRATION_PROVIDERS).map(([key, provider]) => {
      const existingConnection = connections?.find(c => c.provider === key);
      return {
        provider: key,
        ...provider,
        connected: !!existingConnection,
        connection_id: existingConnection?.id,
        connection_status: existingConnection?.status,
      };
    });

    return NextResponse.json({
      data: {
        connections: enrichedConnections,
        available_providers: availableProviders,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/integrations/connections:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/integrations/connections - Initiate OAuth connection
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

    // Only admins can create connections
    if (profile.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can create integrations' }, { status: 403 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = initiateConnectionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { provider, redirect_uri, scopes } = validationResult.data;
    const providerConfig = INTEGRATION_PROVIDERS[provider];

    // Check if connection already exists
    const { data: existingConnection } = await supabase
      .from('integration_connections')
      .select('id, status')
      .eq('organization_id', profile.organization_id)
      .eq('provider', provider)
      .single();

    if (existingConnection && existingConnection.status !== 'expired') {
      return NextResponse.json(
        { error: `Connection to ${providerConfig.displayName} already exists` },
        { status: 400 }
      );
    }

    // Generate state token for CSRF protection
    const state = `${profile.organization_id}:${provider}:${Date.now()}`;
    const stateHash = Buffer.from(state).toString('base64');

    // In production, build OAuth authorization URL based on provider
    // For now, return the initiation data
    const defaultScopes = scopes || providerConfig.scopes;

    // Create pending connection record
    const connectionData = {
      organization_id: profile.organization_id,
      provider: provider,
      provider_display_name: providerConfig.displayName,
      status: 'pending',
      scopes: defaultScopes,
      connected_by: user.id,
    };

    // If updating existing expired connection
    let connection;
    if (existingConnection) {
      const { data, error } = await supabase
        .from('integration_connections')
        .update(connectionData)
        .eq('id', existingConnection.id)
        .select()
        .single();

      if (error) throw error;
      connection = data;
    } else {
      const { data, error } = await supabase
        .from('integration_connections')
        .insert(connectionData)
        .select()
        .single();

      if (error) throw error;
      connection = data;
    }

    // Build OAuth URL (example structure - actual URLs depend on provider)
    const oauthUrls: Record<string, string> = {
      crux: 'https://api.cruxclimate.com/oauth/authorize',
      foss_co: 'https://api.fossandco.com/oauth/authorize',
      quickbooks: 'https://appcenter.intuit.com/connect/oauth2',
      xero: 'https://login.xero.com/identity/connect/authorize',
      salesforce: 'https://login.salesforce.com/services/oauth2/authorize',
      hubspot: 'https://app.hubspot.com/oauth/authorize',
      zapier: 'https://zapier.com/oauth/authorize',
      make: 'https://www.make.com/en/oauth/authorize',
      docusign: 'https://account.docusign.com/oauth/auth',
      google_drive: 'https://accounts.google.com/o/oauth2/v2/auth',
      dropbox: 'https://www.dropbox.com/oauth2/authorize',
      procore: 'https://login.procore.com/oauth/authorize',
    };

    const baseOAuthUrl = oauthUrls[provider] || `https://api.${provider}.com/oauth/authorize`;
    const clientId = process.env[`${provider.toUpperCase()}_CLIENT_ID`] || 'PLACEHOLDER_CLIENT_ID';
    const callbackUrl = redirect_uri || `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/connections/callback`;

    const authorizationUrl = `${baseOAuthUrl}?` + new URLSearchParams({
      client_id: clientId,
      redirect_uri: callbackUrl,
      response_type: 'code',
      scope: defaultScopes.join(' '),
      state: stateHash,
    }).toString();

    // Log activity
    await supabase.rpc('log_activity', {
      p_organization_id: profile.organization_id,
      p_user_id: user.id,
      p_action_type: 'initiate',
      p_entity_type: 'integration_connection',
      p_entity_id: connection.id,
      p_entity_name: providerConfig.displayName,
    });

    return NextResponse.json({
      data: {
        connection_id: connection.id,
        provider: provider,
        provider_display_name: providerConfig.displayName,
        authorization_url: authorizationUrl,
        state: stateHash,
        scopes: defaultScopes,
      },
      message: `Redirect user to authorization_url to complete ${providerConfig.displayName} connection`,
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/integrations/connections:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/integrations/connections - Update connection settings
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

    // Only admins can update connections
    if (profile.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can update integrations' }, { status: 403 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateConnectionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { id, ...updateData } = validationResult.data;

    // Verify connection belongs to organization
    const { data: existingConnection } = await supabase
      .from('integration_connections')
      .select('id, provider, organization_id')
      .eq('id', id)
      .eq('organization_id', profile.organization_id)
      .single();

    if (!existingConnection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    // Update connection
    const { data: connection, error } = await supabase
      .from('integration_connections')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating connection:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const provider = INTEGRATION_PROVIDERS[connection.provider as ProviderKey];

    // Log activity
    await supabase.rpc('log_activity', {
      p_organization_id: profile.organization_id,
      p_user_id: user.id,
      p_action_type: 'update',
      p_entity_type: 'integration_connection',
      p_entity_id: connection.id,
      p_entity_name: provider?.displayName || connection.provider,
    });

    return NextResponse.json({
      data: {
        id: connection.id,
        provider: connection.provider,
        provider_display_name: provider?.displayName,
        settings: connection.settings,
        sync_enabled: connection.sync_enabled,
        sync_frequency: connection.sync_frequency,
        status: connection.status,
        updated_at: connection.updated_at,
      },
    });
  } catch (error) {
    console.error('Error in PATCH /api/integrations/connections:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/integrations/connections - Disconnect an integration
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

    // Only admins can disconnect integrations
    if (profile.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can disconnect integrations' }, { status: 403 });
    }

    // Get connection ID from query params
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Connection ID is required' }, { status: 400 });
    }

    // Parse reason from body if provided
    let reason: string | undefined;
    try {
      const body = await request.json();
      reason = body.reason;
    } catch {
      // No body provided
    }

    // Get connection for logging
    const { data: connection } = await supabase
      .from('integration_connections')
      .select('id, provider, organization_id')
      .eq('id', id)
      .eq('organization_id', profile.organization_id)
      .single();

    if (!connection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    const provider = INTEGRATION_PROVIDERS[connection.provider as ProviderKey];

    // Soft delete - mark as inactive and clear tokens
    const { error } = await supabase
      .from('integration_connections')
      .update({
        status: 'inactive',
        access_token: null,
        refresh_token: null,
        disconnected_by: user.id,
        disconnected_at: new Date().toISOString(),
        disconnected_reason: reason || 'Disconnected by admin',
      })
      .eq('id', id);

    if (error) {
      console.error('Error disconnecting integration:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log activity
    await supabase.rpc('log_activity', {
      p_organization_id: profile.organization_id,
      p_user_id: user.id,
      p_action_type: 'disconnect',
      p_entity_type: 'integration_connection',
      p_entity_id: connection.id,
      p_entity_name: provider?.displayName || connection.provider,
      p_details: { reason: reason || 'Disconnected by admin' },
    });

    return NextResponse.json({
      message: `${provider?.displayName || connection.provider} integration disconnected successfully`,
    });
  } catch (error) {
    console.error('Error in DELETE /api/integrations/connections:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
