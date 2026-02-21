import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createHmac } from 'crypto';

// Test payload structure
interface TestPayload {
  event: string;
  timestamp: string;
  test: boolean;
  data: {
    message: string;
    webhook_id: string;
    webhook_name: string;
  };
}

// Generate webhook signature
function generateSignature(payload: string, secret: string): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const signaturePayload = `${timestamp}.${payload}`;
  const signature = createHmac('sha256', secret)
    .update(signaturePayload)
    .digest('hex');
  return `t=${timestamp},v1=${signature}`;
}

// POST /api/integrations/webhooks/test - Test webhook delivery
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

    // Only admins and managers can test webhooks
    if (!['admin', 'manager'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { webhook_id, custom_payload } = body;

    if (!webhook_id) {
      return NextResponse.json({ error: 'Webhook ID is required' }, { status: 400 });
    }

    // Get webhook
    const { data: webhook, error: webhookError } = await supabase
      .from('webhooks')
      .select('*')
      .eq('id', webhook_id)
      .eq('organization_id', profile.organization_id)
      .single();

    if (webhookError || !webhook) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
    }

    // Build test payload
    const testPayload: TestPayload = custom_payload || {
      event: 'webhook.test',
      timestamp: new Date().toISOString(),
      test: true,
      data: {
        message: 'This is a test webhook delivery from IncentEdge',
        webhook_id: webhook.id,
        webhook_name: webhook.name,
      },
    };

    const payloadString = JSON.stringify(testPayload);

    // Generate signature
    const signature = generateSignature(payloadString, webhook.secret);

    // Build headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'IncentEdge-Webhook/1.0',
      'X-IncentEdge-Signature': signature,
      'X-IncentEdge-Event': 'webhook.test',
      'X-IncentEdge-Delivery': `test_${Date.now()}`,
      ...(webhook.custom_headers || {}),
    };

    // Send test request
    const startTime = Date.now();
    let response: Response;
    let responseBody: string;
    let success = false;
    let errorMessage: string | null = null;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      response = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body: payloadString,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      responseBody = await response.text();
      success = response.ok;

      if (!success) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
    } catch (fetchError) {
      const error = fetchError as Error;
      success = false;
      errorMessage = error.name === 'AbortError'
        ? 'Request timed out after 30 seconds'
        : error.message || 'Failed to connect to webhook URL';
      responseBody = '';
      response = new Response(null, { status: 0 });
    }

    const endTime = Date.now();
    const responseTimeMs = endTime - startTime;

    // Log the test event
    const eventId = `test_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    await supabase.from('webhook_events').insert({
      webhook_id: webhook.id,
      organization_id: profile.organization_id,
      event_type: 'webhook.test',
      event_id: eventId,
      payload: testPayload,
      status: success ? 'delivered' : 'failed',
      request_url: webhook.url,
      request_headers: headers,
      request_body: payloadString,
      response_status_code: response.status || null,
      response_headers: response.headers ? Object.fromEntries(response.headers.entries()) : null,
      response_body: responseBody?.substring(0, 10000) || null,
      response_time_ms: responseTimeMs,
      attempt_count: 1,
      max_attempts: 1,
      error_message: errorMessage,
      sent_at: new Date(startTime).toISOString(),
      delivered_at: success ? new Date(endTime).toISOString() : null,
      failed_at: !success ? new Date(endTime).toISOString() : null,
    });

    // Update webhook stats
    if (success) {
      await supabase
        .from('webhooks')
        .update({
          last_triggered_at: new Date().toISOString(),
          last_success_at: new Date().toISOString(),
          success_count: webhook.success_count + 1,
        })
        .eq('id', webhook.id);
    } else {
      await supabase
        .from('webhooks')
        .update({
          last_triggered_at: new Date().toISOString(),
          last_failure_at: new Date().toISOString(),
          failure_count: webhook.failure_count + 1,
        })
        .eq('id', webhook.id);
    }

    // Log activity
    await supabase.rpc('log_activity', {
      p_organization_id: profile.organization_id,
      p_user_id: user.id,
      p_action_type: 'test',
      p_entity_type: 'webhook',
      p_entity_id: webhook.id,
      p_entity_name: webhook.name,
      p_details: { success, response_time_ms: responseTimeMs },
    });

    return NextResponse.json({
      success,
      data: {
        event_id: eventId,
        webhook_id: webhook.id,
        webhook_name: webhook.name,
        url: webhook.url,
        response: {
          status_code: response.status || null,
          status_text: response.statusText || null,
          body: responseBody?.substring(0, 1000) || null,
          headers: response.headers ? Object.fromEntries(response.headers.entries()) : null,
        },
        timing: {
          sent_at: new Date(startTime).toISOString(),
          received_at: new Date(endTime).toISOString(),
          duration_ms: responseTimeMs,
        },
        error: errorMessage,
      },
    });
  } catch (error) {
    console.error('Error in POST /api/integrations/webhooks/test:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
