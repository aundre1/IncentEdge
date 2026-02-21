import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const updateOrgSchema = z.object({
  name: z.string().min(1).optional(),
  legal_name: z.string().optional(),
  organization_type: z.string().optional(),
  tax_status: z.enum(['for-profit', 'nonprofit', 'municipal', 'tribal']).optional(),
  tax_exempt: z.boolean().optional(),
  ein: z.string().optional(),
  duns_number: z.string().optional(),
  sam_uei: z.string().optional(),
  mwbe_certified: z.boolean().optional(),
  mwbe_certification_state: z.string().optional(),
  mwbe_certification_expiry: z.string().optional(),
  sdvob_certified: z.boolean().optional(),
  sdvob_certification_expiry: z.string().optional(),
  hubzone_certified: z.boolean().optional(),
  settings: z.record(z.unknown()).optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user belongs to this organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (profile?.organization_id !== id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: organization, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: organization });
  } catch (error) {
    console.error('Error in GET /api/organizations/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is admin of this organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single();

    if (profile?.organization_id !== id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (profile.role !== 'admin' && profile.role !== 'manager') {
      return NextResponse.json(
        { error: 'Only admins and managers can update organization' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validationResult = updateOrgSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

    const { data: organization, error } = await supabase
      .from('organizations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating organization:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log activity
    await supabase.rpc('log_activity', {
      p_organization_id: id,
      p_user_id: user.id,
      p_action_type: 'update',
      p_entity_type: 'organization',
      p_entity_id: id,
      p_entity_name: organization.name,
    });

    return NextResponse.json({ data: organization });
  } catch (error) {
    console.error('Error in PUT /api/organizations/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is admin of this organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single();

    if (profile?.organization_id !== id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can delete organization' },
        { status: 403 }
      );
    }

    // Get org name for logging before deletion
    const { data: org } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('organizations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting organization:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Organization deleted' });
  } catch (error) {
    console.error('Error in DELETE /api/organizations/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
