/**
 * API: /api/marketplace/listings
 *
 * Tax Credit Marketplace — Section 6418 Transferable Credit Listings
 *
 * REGULATORY CONTEXT:
 * Section 6418 of the Inflation Reduction Act allows direct cash-for-credit
 * sales of certain tax credits. This does NOT require a broker-dealer license.
 * IncentEdge facilitates matching and documentation only — it is not a
 * financial intermediary. Revenue: 1% platform fee on matched deals (seller-paid).
 *
 * Eligible credit types:
 *   §45 (PTC) — wind/solar production
 *   §48 (ITC) — investment tax credit
 *   §45Q — carbon capture
 *   §45V — clean hydrogen
 *   §45X — advanced manufacturing
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// ============================================================================
// Validation Schemas
// ============================================================================

const CREDIT_TYPES = [
  'ITC_48', 'PTC_45', 'CARBON_45Q', 'HYDROGEN_45V', 'MANUFACTURING_45X', 'OTHER',
] as const;

const LISTING_STATUSES = [
  'draft', 'active', 'under_review', 'matched', 'sold', 'cancelled',
] as const;

const createListingSchema = z.object({
  credit_type: z.enum(CREDIT_TYPES),
  program_id: z.string().uuid().optional().nullable(),
  project_id: z.string().uuid().optional().nullable(),
  credit_amount: z.number().positive('Credit amount must be greater than 0'),
  asking_price_cents_on_dollar: z
    .number()
    .min(50, 'Asking price must be at least 50 cents')
    .max(100, 'Asking price cannot exceed 100 cents')
    .optional()
    .nullable(),
  minimum_purchase: z.number().positive().optional().nullable(),
  irs_pre_filing_complete: z.boolean().optional(),
  direct_pay_elected: z.boolean().optional(),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional().nullable(),
  state: z.string().length(2, 'State must be a 2-letter code').optional().nullable(),
  status: z.enum(LISTING_STATUSES).optional(),
  listing_date: z.string().datetime().optional().nullable(),
  expires_at: z.string().datetime().optional().nullable(),
});

// ============================================================================
// GET /api/marketplace/listings — Paginated listing search
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';
    const creditType = searchParams.get('creditType');
    const state = searchParams.get('state');
    const minAmount = searchParams.get('minAmount');
    const maxAmount = searchParams.get('maxAmount');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)));
    const offset = (page - 1) * pageSize;

    // Build query — join organization name
    let query = supabase
      .from('tax_credit_listings')
      .select(`
        *,
        organization:organizations(id, name)
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    // Filter by status
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Filter by credit type
    if (creditType) {
      query = query.eq('credit_type', creditType);
    }

    // Filter by state
    if (state) {
      query = query.eq('state', state);
    }

    // Filter by amount range
    if (minAmount) {
      const min = parseFloat(minAmount);
      if (!isNaN(min)) {
        query = query.gte('credit_amount', min);
      }
    }
    if (maxAmount) {
      const max = parseFloat(maxAmount);
      if (!isNaN(max)) {
        query = query.lte('credit_amount', max);
      }
    }

    // Pagination
    query = query.range(offset, offset + pageSize - 1);

    const { data: listings, error, count } = await query;

    if (error) {
      console.error('Error fetching marketplace listings:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      listings: listings ?? [],
      total: count ?? 0,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Error in GET /api/marketplace/listings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================================
// POST /api/marketplace/listings — Create a new listing
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id) {
      return NextResponse.json({ error: 'No organization found. Please join or create an organization first.' }, { status: 400 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createListingSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const listingData = validationResult.data;

    // Business rule: direct_pay_elected and 6418 transfer are mutually exclusive
    // If direct pay is elected, warn but allow (they might be listing for informational purposes)

    // Create listing
    const { data: listing, error } = await supabase
      .from('tax_credit_listings')
      .insert({
        ...listingData,
        organization_id: profile.organization_id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating listing:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log activity
    await supabase.rpc('log_activity', {
      p_organization_id: profile.organization_id,
      p_user_id: user.id,
      p_action_type: 'create',
      p_entity_type: 'tax_credit_listing',
      p_entity_id: listing.id,
      p_entity_name: listing.title,
    });

    return NextResponse.json({ data: listing }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/marketplace/listings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
