/**
 * API: /api/marketplace/listings/[id]
 *
 * Single listing operations — GET, PATCH, DELETE
 *
 * REGULATORY CONTEXT:
 * Section 6418 (IRA) permits direct sale of tax credits.
 * IncentEdge is a matching platform, not a broker-dealer or financial intermediary.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// ============================================================================
// Validation Schema (partial update)
// ============================================================================

const LISTING_STATUSES = [
  'draft', 'active', 'under_review', 'matched', 'sold', 'cancelled',
] as const;

const updateListingSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional().nullable(),
  asking_price_cents_on_dollar: z
    .number()
    .min(50)
    .max(100)
    .optional()
    .nullable(),
  minimum_purchase: z.number().positive().optional().nullable(),
  status: z.enum(LISTING_STATUSES).optional(),
  state: z.string().length(2).optional().nullable(),
  irs_pre_filing_complete: z.boolean().optional(),
  direct_pay_elected: z.boolean().optional(),
  listing_date: z.string().datetime().optional().nullable(),
  expires_at: z.string().datetime().optional().nullable(),
});

// ============================================================================
// Helper: get user's organization_id
// ============================================================================

async function getUserOrgId(supabase: Awaited<ReturnType<typeof createClient>>, userId: string): Promise<string | null> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', userId)
    .single();
  return profile?.organization_id ?? null;
}

// ============================================================================
// GET /api/marketplace/listings/[id]
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: listing, error } = await supabase
      .from('tax_credit_listings')
      .select(`
        *,
        organization:organizations(id, name)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
      }
      console.error('Error fetching listing:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: listing });
  } catch (error) {
    console.error('Error in GET /api/marketplace/listings/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================================
// PATCH /api/marketplace/listings/[id] — Update (own org only)
// ============================================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orgId = await getUserOrgId(supabase, user.id);
    if (!orgId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    // Verify ownership
    const { data: existing } = await supabase
      .from('tax_credit_listings')
      .select('organization_id')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }
    if (existing.organization_id !== orgId) {
      return NextResponse.json({ error: 'You can only update your own organization\'s listings' }, { status: 403 });
    }

    // Parse and validate
    const body = await request.json();
    const validationResult = updateListingSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

    const { data: listing, error } = await supabase
      .from('tax_credit_listings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating listing:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log activity
    await supabase.rpc('log_activity', {
      p_organization_id: orgId,
      p_user_id: user.id,
      p_action_type: 'update',
      p_entity_type: 'tax_credit_listing',
      p_entity_id: listing.id,
      p_entity_name: listing.title,
    });

    return NextResponse.json({ data: listing });
  } catch (error) {
    console.error('Error in PATCH /api/marketplace/listings/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================================
// DELETE /api/marketplace/listings/[id] — Soft delete (set status to 'cancelled')
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orgId = await getUserOrgId(supabase, user.id);
    if (!orgId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    // Verify ownership
    const { data: existing } = await supabase
      .from('tax_credit_listings')
      .select('organization_id, title')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }
    if (existing.organization_id !== orgId) {
      return NextResponse.json({ error: 'You can only cancel your own organization\'s listings' }, { status: 403 });
    }

    // Soft delete: set status to 'cancelled'
    const { error } = await supabase
      .from('tax_credit_listings')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (error) {
      console.error('Error cancelling listing:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log activity
    await supabase.rpc('log_activity', {
      p_organization_id: orgId,
      p_user_id: user.id,
      p_action_type: 'delete',
      p_entity_type: 'tax_credit_listing',
      p_entity_id: id,
      p_entity_name: existing.title,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/marketplace/listings/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
