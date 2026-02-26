/**
 * API: /api/marketplace/inquiries
 *
 * Marketplace Inquiries — Buyer interest in tax credit listings
 *
 * REGULATORY CONTEXT:
 * IncentEdge facilitates matching between credit sellers and buyers under
 * Section 6418 of the IRA. It is not a broker-dealer or financial intermediary.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// ============================================================================
// Validation Schema
// ============================================================================

const BUYER_TYPES = [
  'corporate', 'financial_institution', 'insurance', 'family_office', 'other',
] as const;

const createInquirySchema = z.object({
  listing_id: z.string().uuid('Invalid listing ID'),
  buyer_name: z.string().min(1, 'Name is required').max(200),
  buyer_email: z.string().email('Valid email is required').max(254),
  buyer_type: z.enum(BUYER_TYPES).optional().nullable(),
  purchase_amount_interested: z.number().positive().optional().nullable(),
  message: z.string().max(2000).optional().nullable(),
});

// ============================================================================
// POST /api/marketplace/inquiries — Express interest in a listing
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization (optional — external buyers might not have one)
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    // Parse and validate
    const body = await request.json();
    const validationResult = createInquirySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const inquiryData = validationResult.data;

    // Verify the listing exists and is active
    const { data: listing } = await supabase
      .from('tax_credit_listings')
      .select('id, status, title')
      .eq('id', inquiryData.listing_id)
      .single();

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }
    if (listing.status !== 'active') {
      return NextResponse.json({ error: 'This listing is no longer active' }, { status: 400 });
    }

    // Create inquiry
    const { data: inquiry, error } = await supabase
      .from('marketplace_inquiries')
      .insert({
        ...inquiryData,
        inquiring_organization_id: profile?.organization_id ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating inquiry:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log activity
    if (profile?.organization_id) {
      await supabase.rpc('log_activity', {
        p_organization_id: profile.organization_id,
        p_user_id: user.id,
        p_action_type: 'create',
        p_entity_type: 'marketplace_inquiry',
        p_entity_id: inquiry.id,
        p_entity_name: `Inquiry on: ${listing.title}`,
      });
    }

    return NextResponse.json({ data: inquiry }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/marketplace/inquiries:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
