import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const createOrgSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
  legal_name: z.string().optional(),
  organization_type: z.string().optional(),
  tax_status: z.enum(['for-profit', 'nonprofit', 'municipal', 'tribal']).optional(),
  tax_exempt: z.boolean().optional(),
  ein: z.string().optional(),
  duns_number: z.string().optional(),
  sam_uei: z.string().optional(),
  mwbe_certified: z.boolean().optional(),
  sdvob_certified: z.boolean().optional(),
  hubzone_certified: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's profile to find their organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id) {
      return NextResponse.json({ data: null, message: 'No organization found' });
    }

    // Get organization details
    const { data: organization, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', profile.organization_id)
      .single();

    if (error) {
      console.error('Error fetching organization:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: organization });
  } catch (error) {
    console.error('Error in GET /api/organizations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user already has an organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (profile?.organization_id) {
      return NextResponse.json(
        { error: 'User already belongs to an organization' },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createOrgSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const orgData = validationResult.data;

    // Create organization
    const { data: organization, error: createError } = await supabase
      .from('organizations')
      .insert(orgData)
      .select()
      .single();

    if (createError) {
      console.error('Error creating organization:', createError);
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    // Update user's profile with new organization
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ organization_id: organization.id, role: 'admin' })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      // Rollback organization creation
      await supabase.from('organizations').delete().eq('id', organization.id);
      return NextResponse.json({ error: 'Failed to link organization to profile' }, { status: 500 });
    }

    // Log activity
    await supabase.rpc('log_activity', {
      p_organization_id: organization.id,
      p_user_id: user.id,
      p_action_type: 'create',
      p_entity_type: 'organization',
      p_entity_id: organization.id,
      p_entity_name: organization.name,
    });

    return NextResponse.json({ data: organization }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/organizations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
