/**
 * API: /api/marketplace/cpace
 *
 * C-PACE (Commercial Property Assessed Clean Energy) Financing Referrals
 *
 * REGULATORY CONTEXT:
 * C-PACE provides 100% debt financing repaid through property tax assessment.
 * This is DEBT, not securities — no broker-dealer license required.
 * IncentEdge acts as a REFERRAL platform connecting developers with C-PACE
 * lenders (not a lender itself).
 * Revenue model: referral fee from C-PACE lenders ($500–$2,000 per closed deal).
 *
 * C-PACE benefits:
 *   - 100% financing available (no equity dilution)
 *   - No personal guarantee required
 *   - Transfers with property sale
 *   - Available in 40+ states
 *   - 10–25 year repayment terms
 *   - Interest may be tax deductible
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// ============================================================================
// Validation Schema
// ============================================================================

const PROJECT_TYPES = [
  'commercial', 'mixed_use', 'industrial', 'multifamily', 'hotel', 'office', 'retail', 'other',
] as const;

const createCpaceReferralSchema = z.object({
  project_id: z.string().uuid().optional().nullable(),
  project_name: z.string().min(1, 'Project name is required').max(200),
  project_type: z.enum(PROJECT_TYPES).optional().nullable(),
  state: z.string().length(2, 'State must be a 2-letter code'),
  county: z.string().max(100).optional().nullable(),
  property_value: z.number().positive().optional().nullable(),
  financing_amount_requested: z.number().positive('Financing amount must be greater than 0'),
  use_of_proceeds: z.string().max(500).optional().nullable(),
  contact_name: z.string().min(1, 'Contact name is required').max(200),
  contact_email: z.string().email('Valid email is required').max(254),
  contact_phone: z.string().max(20).optional().nullable(),
  notes: z.string().optional().nullable(),
});

// ============================================================================
// GET /api/marketplace/cpace — List user's referrals
// ============================================================================

export async function GET(request: NextRequest) {
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
      return NextResponse.json({ referrals: [], total: 0 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)));
    const offset = (page - 1) * pageSize;

    const { data: referrals, error, count } = await supabase
      .from('cpace_referrals')
      .select('*', { count: 'exact' })
      .eq('organization_id', profile.organization_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error('Error fetching C-PACE referrals:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      referrals: referrals ?? [],
      total: count ?? 0,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Error in GET /api/marketplace/cpace:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================================
// POST /api/marketplace/cpace — Submit a C-PACE referral request
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

    // Parse and validate
    const body = await request.json();
    const validationResult = createCpaceReferralSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const referralData = validationResult.data;

    // Create referral
    const { data: referral, error } = await supabase
      .from('cpace_referrals')
      .insert({
        ...referralData,
        organization_id: profile.organization_id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating C-PACE referral:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log activity
    await supabase.rpc('log_activity', {
      p_organization_id: profile.organization_id,
      p_user_id: user.id,
      p_action_type: 'create',
      p_entity_type: 'cpace_referral',
      p_entity_id: referral.id,
      p_entity_name: referral.project_name,
    });

    return NextResponse.json({ data: referral }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/marketplace/cpace:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
