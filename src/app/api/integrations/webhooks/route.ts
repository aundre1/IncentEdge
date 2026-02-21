import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { randomBytes, createHash } from 'crypto';
import {
  handleApiError,
  handleDatabaseError,
  unauthorizedError,
  forbiddenError,
  notFoundError,
} from '@/lib/error-handler';

// Validation schema for creating/updating a webhook
const webhookSchema = z.object({
  name: z.string().min(1, 'Webhook name is required').max(255),
  description: z.string().optional(),
  url: z.string().url('Must be a valid URL'),
  events: z.array(z.string()).min(1, 'At least one event is required'),
  event_filters: z.record(z.unknown()).optional(),
  custom_headers: z.record(z.string()).optional(),
  is_active: z.boolean().optional().default(true),
  max_retries: z.number().min(0).max(10).optional().default(3),
  retry_interval_seconds: z.number().min(10).max(3600).optional().default(60),
  rate_limit_per_minute: z.number().min(1).max(1000).optional().default(60),
});

// Generate a secure webhook secret
function generateWebhookSecret(): string {
  return `whsec_${randomBytes(32).toString('hex')}`;
}

// GET /api/integrations/webhooks - List all webhooks for the organization
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

    // Only admins and managers can view webhooks
    if (!['admin', 'manager'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get('include_stats') === 'true';

    // Fetch webhooks
    let query = supabase
      .from('webhooks')
      .select('*')
      .eq('organization_id', profile.organization_id)
      .order('created_at', { ascending: false });

    const { data: webhooks, error } = await query;

    if (error) {
      return handleDatabaseError(error, { route: '/api/integrations/webhooks', method: 'GET' });
    }

    // If stats requested, fetch recent event counts
    let webhooksWithStats = webhooks;
    if (includeStats && webhooks && webhooks.length > 0) {
      const webhookIds = webhooks.map(w => w.id);

      // Get recent event counts per webhook
      const { data: eventCounts } = await supabase
        .from('webhook_events')
        .select('webhook_id, status')
        .in('webhook_id', webhookIds)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      // Aggregate counts
      const statsMap = new Map<string, { total: number; delivered: number; failed: number }>();
      eventCounts?.forEach(event => {
        const current = statsMap.get(event.webhook_id) || { total: 0, delivered: 0, failed: 0 };
        current.total++;
        if (event.status === 'delivered') current.delivered++;
        if (['failed', 'exhausted'].includes(event.status)) current.failed++;
        statsMap.set(event.webhook_id, current);
      });

      webhooksWithStats = webhooks.map(webhook => ({
        ...webhook,
        stats_24h: statsMap.get(webhook.id) || { total: 0, delivered: 0, failed: 0 },
      }));
    }

    // Mask secrets in response
    const safeWebhooks = webhooksWithStats?.map(webhook => ({
      ...webhook,
      secret: webhook.secret ? `${webhook.secret.substring(0, 12)}...` : null,
    }));

    return NextResponse.json({ data: safeWebhooks });
  } catch (error) {
    return handleApiError(error, { route: '/api/integrations/webhooks', method: 'GET' });
  }
}

// POST /api/integrations/webhooks - Create a new webhook
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

    // Only admins can create webhooks
    if (profile.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can create webhooks' }, { status: 403 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = webhookSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const webhookData = validationResult.data;

    // Generate secret
    const secret = generateWebhookSecret();

    // Create webhook
    const { data: webhook, error } = await supabase
      .from('webhooks')
      .insert({
        organization_id: profile.organization_id,
        name: webhookData.name,
        description: webhookData.description,
        url: webhookData.url,
        secret: secret,
        events: webhookData.events,
        event_filters: webhookData.event_filters || {},
        custom_headers: webhookData.custom_headers || {},
        is_active: webhookData.is_active,
        max_retries: webhookData.max_retries,
        retry_interval_seconds: webhookData.retry_interval_seconds,
        rate_limit_per_minute: webhookData.rate_limit_per_minute,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      return handleDatabaseError(error, { route: '/api/integrations/webhooks', method: 'POST' });
    }

    // Log activity
    await supabase.rpc('log_activity', {
      p_organization_id: profile.organization_id,
      p_user_id: user.id,
      p_action_type: 'create',
      p_entity_type: 'webhook',
      p_entity_id: webhook.id,
      p_entity_name: webhook.name,
    });

    // SECURITY: Return webhook data with secret separated and masked in main object
    // The secret is returned ONCE in a dedicated field, never in the data object
    const { secret: webhookSecret, ...safeWebhookData } = webhook;

    return NextResponse.json({
      data: {
        ...safeWebhookData,
        secret: `${secret.substring(0, 12)}...`, // Masked in data object
      },
      // Secret returned separately - displayed ONCE at creation, never retrievable again
      webhook_secret: secret,
      message: 'Webhook created successfully. Save the webhook_secret value - it will NEVER be shown again.',
    }, { status: 201 });
  } catch (error) {
    return handleApiError(error, { route: '/api/integrations/webhooks', method: 'POST' });
  }
}

// PATCH /api/integrations/webhooks - Update a webhook
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

    // Only admins can update webhooks
    if (profile.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can update webhooks' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { id, regenerate_secret, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Webhook ID is required' }, { status: 400 });
    }

    // Verify webhook belongs to organization
    const { data: existingWebhook } = await supabase
      .from('webhooks')
      .select('id, organization_id')
      .eq('id', id)
      .eq('organization_id', profile.organization_id)
      .single();

    if (!existingWebhook) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
    }

    // Prepare update object
    const updates: Record<string, unknown> = {
      updated_by: user.id,
    };

    // Add allowed fields
    const allowedFields = ['name', 'description', 'url', 'events', 'event_filters',
                          'custom_headers', 'is_active', 'max_retries',
                          'retry_interval_seconds', 'rate_limit_per_minute'];

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updates[field] = updateData[field];
      }
    }

    // Regenerate secret if requested
    let newSecret: string | null = null;
    if (regenerate_secret) {
      newSecret = generateWebhookSecret();
      updates.secret = newSecret;
    }

    // Update webhook
    const { data: webhook, error } = await supabase
      .from('webhooks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return handleDatabaseError(error, { route: '/api/integrations/webhooks', method: 'PATCH' });
    }

    // Log activity
    await supabase.rpc('log_activity', {
      p_organization_id: profile.organization_id,
      p_user_id: user.id,
      p_action_type: 'update',
      p_entity_type: 'webhook',
      p_entity_id: webhook.id,
      p_entity_name: webhook.name,
    });

    // SECURITY: Always mask secret in data object, return new secret separately if regenerated
    const { secret: webhookSecretFromDb, ...safeWebhookData } = webhook;
    const maskedSecret = newSecret
      ? `${newSecret.substring(0, 12)}...`
      : `${webhookSecretFromDb?.substring(0, 12)}...`;

    return NextResponse.json({
      data: {
        ...safeWebhookData,
        secret: maskedSecret, // Always masked in data object
      },
      // Only include new secret separately if regenerated
      ...(newSecret && {
        webhook_secret: newSecret,
        message: 'Secret regenerated. Save the webhook_secret value - it will NEVER be shown again.',
      }),
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/integrations/webhooks', method: 'PATCH' });
  }
}

// DELETE /api/integrations/webhooks - Delete a webhook
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

    // Only admins can delete webhooks
    if (profile.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can delete webhooks' }, { status: 403 });
    }

    // Get webhook ID from query params
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Webhook ID is required' }, { status: 400 });
    }

    // Get webhook for logging
    const { data: webhook } = await supabase
      .from('webhooks')
      .select('id, name, organization_id')
      .eq('id', id)
      .eq('organization_id', profile.organization_id)
      .single();

    if (!webhook) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
    }

    // Delete webhook (cascade will delete events)
    const { error } = await supabase
      .from('webhooks')
      .delete()
      .eq('id', id);

    if (error) {
      return handleDatabaseError(error, { route: '/api/integrations/webhooks', method: 'DELETE' });
    }

    // Log activity
    await supabase.rpc('log_activity', {
      p_organization_id: profile.organization_id,
      p_user_id: user.id,
      p_action_type: 'delete',
      p_entity_type: 'webhook',
      p_entity_id: webhook.id,
      p_entity_name: webhook.name,
    });

    return NextResponse.json({ message: 'Webhook deleted successfully' });
  } catch (error) {
    return handleApiError(error, { route: '/api/integrations/webhooks', method: 'DELETE' });
  }
}
