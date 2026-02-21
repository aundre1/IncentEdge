import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for creating a certification
const createCertificationSchema = z.object({
  compliance_item_id: z.string().uuid().optional(),
  certification_type: z.string().min(1),
  certification_name: z.string().min(1),
  description: z.string().optional(),
  certifying_organization: z.string().min(1),
  certifier_name: z.string().optional(),
  certifier_title: z.string().optional(),
  certifier_contact_email: z.string().email().optional(),
  certifier_contact_phone: z.string().optional(),
  certifier_license_number: z.string().optional(),
  issue_date: z.string(),
  effective_date: z.string().optional(),
  expiration_date: z.string().optional(),
  coverage_details: z.record(z.unknown()).optional(),
  coverage_amount: z.number().optional(),
  coverage_percentage: z.number().optional(),
  ira_form_reference: z.string().optional(),
  ira_bonus_type: z.enum(['prevailing_wage', 'domestic_content', 'energy_community', 'low_income']).optional(),
  ira_bonus_percentage: z.number().optional(),
  certificate_document_id: z.string().uuid().optional(),
  supporting_documents: z.array(z.string().uuid()).optional(),
  audit_notes: z.string().optional(),
});

// Validation schema for updating certification status
const updateCertificationSchema = z.object({
  certification_id: z.string().uuid(),
  status: z.enum(['pending', 'active', 'expired', 'revoked', 'suspended']).optional(),
  expiration_date: z.string().optional(),
  verification_entry: z.object({
    verifier: z.string(),
    method: z.string(),
    result: z.string(),
  }).optional(),
  audit_notes: z.string().optional(),
});

/**
 * GET /api/compliance/[projectId]/certify
 * Get all certifications for a project
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const supabase = await createClient();
    const { projectId } = params;

    // Get current user
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
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    // Verify project belongs to organization
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name')
      .eq('id', projectId)
      .eq('organization_id', profile.organization_id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const iraBonus = searchParams.get('ira_bonus');

    // Build query
    let query = supabase
      .from('compliance_certifications')
      .select(`
        *,
        compliance_item:project_compliance_items (
          id,
          custom_name,
          category,
          status
        ),
        certificate_document:compliance_documents (
          id,
          name,
          file_path
        ),
        created_by_profile:profiles!compliance_certifications_created_by_fkey (full_name, email)
      `)
      .eq('project_id', projectId)
      .order('issue_date', { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (type) {
      query = query.eq('certification_type', type);
    }
    if (iraBonus === 'true') {
      query = query.eq('ira_bonus_certified', true);
    }

    const { data: certifications, error } = await query;

    if (error) {
      console.error('Error fetching certifications:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculate summary statistics
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    const summary = {
      total: certifications?.length || 0,
      by_status: {
        pending: certifications?.filter(c => c.status === 'pending').length || 0,
        active: certifications?.filter(c => c.status === 'active').length || 0,
        expired: certifications?.filter(c => c.status === 'expired').length || 0,
        revoked: certifications?.filter(c => c.status === 'revoked').length || 0,
        suspended: certifications?.filter(c => c.status === 'suspended').length || 0,
      },
      ira_certified: certifications?.filter(c => c.ira_bonus_certified).length || 0,
      expiring_30_days: certifications?.filter(c => {
        if (!c.expiration_date || c.status !== 'active') return false;
        const expDate = new Date(c.expiration_date);
        return expDate <= thirtyDaysFromNow && expDate > now;
      }).length || 0,
      expiring_90_days: certifications?.filter(c => {
        if (!c.expiration_date || c.status !== 'active') return false;
        const expDate = new Date(c.expiration_date);
        return expDate <= ninetyDaysFromNow && expDate > now;
      }).length || 0,
    };

    // Group by IRA bonus type
    const iraBonuses = {
      prevailing_wage: certifications?.filter(c => c.ira_bonus_type === 'prevailing_wage') || [],
      domestic_content: certifications?.filter(c => c.ira_bonus_type === 'domestic_content') || [],
      energy_community: certifications?.filter(c => c.ira_bonus_type === 'energy_community') || [],
      low_income: certifications?.filter(c => c.ira_bonus_type === 'low_income') || [],
    };

    return NextResponse.json({
      data: {
        certifications: certifications || [],
        summary,
        ira_bonuses: {
          prevailing_wage: {
            count: iraBonuses.prevailing_wage.length,
            certified: iraBonuses.prevailing_wage.filter(c => c.status === 'active').length > 0,
          },
          domestic_content: {
            count: iraBonuses.domestic_content.length,
            certified: iraBonuses.domestic_content.filter(c => c.status === 'active').length > 0,
          },
          energy_community: {
            count: iraBonuses.energy_community.length,
            certified: iraBonuses.energy_community.filter(c => c.status === 'active').length > 0,
          },
          low_income: {
            count: iraBonuses.low_income.length,
            certified: iraBonuses.low_income.filter(c => c.status === 'active').length > 0,
          },
        },
      },
    });
  } catch (error) {
    console.error('Error in GET /api/compliance/[projectId]/certify:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/compliance/[projectId]/certify
 * Record a new certification for the project
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const supabase = await createClient();
    const { projectId } = params;

    // Get current user
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
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    // Verify project belongs to organization
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name')
      .eq('id', projectId)
      .eq('organization_id', profile.organization_id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createCertificationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const certData = validationResult.data;

    // Determine if this is an IRA bonus certification
    const isIraBonusCertified = Boolean(certData.ira_bonus_type);

    // Initial verification chain entry
    const initialVerification = {
      verifier: user.id,
      date: new Date().toISOString(),
      method: 'initial_submission',
      result: 'pending_review',
    };

    // Create the certification
    const { data: newCert, error: insertError } = await supabase
      .from('compliance_certifications')
      .insert({
        project_id: projectId,
        organization_id: profile.organization_id,
        compliance_item_id: certData.compliance_item_id,
        certification_type: certData.certification_type,
        certification_name: certData.certification_name,
        description: certData.description,
        certifying_organization: certData.certifying_organization,
        certifier_name: certData.certifier_name,
        certifier_title: certData.certifier_title,
        certifier_contact_email: certData.certifier_contact_email,
        certifier_contact_phone: certData.certifier_contact_phone,
        certifier_license_number: certData.certifier_license_number,
        status: 'pending',
        issue_date: certData.issue_date,
        effective_date: certData.effective_date || certData.issue_date,
        expiration_date: certData.expiration_date,
        coverage_details: certData.coverage_details,
        coverage_amount: certData.coverage_amount,
        coverage_percentage: certData.coverage_percentage,
        ira_form_reference: certData.ira_form_reference,
        ira_bonus_certified: isIraBonusCertified,
        ira_bonus_type: certData.ira_bonus_type,
        ira_bonus_percentage: certData.ira_bonus_percentage,
        certificate_document_id: certData.certificate_document_id,
        supporting_documents: certData.supporting_documents || [],
        verification_chain: [initialVerification],
        audit_notes: certData.audit_notes,
        created_by: user.id,
      })
      .select(`
        *,
        compliance_item:project_compliance_items (id, custom_name, category)
      `)
      .single();

    if (insertError) {
      console.error('Error creating certification:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // If linked to a compliance item, update its status
    if (certData.compliance_item_id) {
      await supabase
        .from('project_compliance_items')
        .update({
          status: 'pending_review',
          verification_method: 'third_party_certification',
        })
        .eq('id', certData.compliance_item_id);
    }

    // Log activity
    await supabase.rpc('log_activity', {
      p_organization_id: profile.organization_id,
      p_user_id: user.id,
      p_action_type: 'create',
      p_entity_type: 'certification',
      p_entity_id: newCert.id,
      p_entity_name: certData.certification_name,
      p_details: {
        project_id: projectId,
        certification_type: certData.certification_type,
        ira_bonus_type: certData.ira_bonus_type,
      },
    });

    return NextResponse.json({ data: newCert }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/compliance/[projectId]/certify:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/compliance/[projectId]/certify
 * Update certification status or add verification
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const supabase = await createClient();
    const { projectId } = params;

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization and profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, full_name')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateCertificationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { certification_id, status, expiration_date, verification_entry, audit_notes } = validationResult.data;

    // Get existing certification
    const { data: existingCert, error: fetchError } = await supabase
      .from('compliance_certifications')
      .select('*, project:projects!inner(organization_id)')
      .eq('id', certification_id)
      .eq('project_id', projectId)
      .single();

    if (fetchError || !existingCert) {
      return NextResponse.json({ error: 'Certification not found' }, { status: 404 });
    }

    if ((existingCert.project as any).organization_id !== profile.organization_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Build update object
    const updateObj: Record<string, any> = {};

    if (status) {
      updateObj.status = status;

      // If activating, update linked compliance item
      if (status === 'active' && existingCert.compliance_item_id) {
        await supabase
          .from('project_compliance_items')
          .update({
            status: 'verified',
            verified_by: user.id,
            verified_at: new Date().toISOString(),
            bonus_secured: existingCert.ira_bonus_certified,
          })
          .eq('id', existingCert.compliance_item_id);
      }
    }

    if (expiration_date) {
      updateObj.expiration_date = expiration_date;
      updateObj.last_renewal_date = new Date().toISOString().split('T')[0];
    }

    if (verification_entry) {
      const newEntry = {
        ...verification_entry,
        date: new Date().toISOString(),
      };
      updateObj.verification_chain = [...(existingCert.verification_chain || []), newEntry];
    }

    if (audit_notes) {
      updateObj.audit_notes = existingCert.audit_notes
        ? `${existingCert.audit_notes}\n\n[${new Date().toISOString()}] ${audit_notes}`
        : `[${new Date().toISOString()}] ${audit_notes}`;
    }

    // Perform update
    const { data: updatedCert, error: updateError } = await supabase
      .from('compliance_certifications')
      .update(updateObj)
      .eq('id', certification_id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating certification:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Log activity
    await supabase.rpc('log_activity', {
      p_organization_id: profile.organization_id,
      p_user_id: user.id,
      p_action_type: 'update',
      p_entity_type: 'certification',
      p_entity_id: certification_id,
      p_entity_name: existingCert.certification_name,
      p_details: {
        project_id: projectId,
        changes: Object.keys(updateObj),
        new_status: status,
      },
    });

    return NextResponse.json({ data: updatedCert });
  } catch (error) {
    console.error('Error in PATCH /api/compliance/[projectId]/certify:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/compliance/[projectId]/certify
 * Delete a certification
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const supabase = await createClient();
    const { projectId } = params;

    // Get current user
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
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    // Get certification ID from query params
    const { searchParams } = new URL(request.url);
    const certificationId = searchParams.get('certificationId');

    if (!certificationId) {
      return NextResponse.json({ error: 'certificationId is required' }, { status: 400 });
    }

    // Verify certification exists and belongs to org
    const { data: existingCert, error: fetchError } = await supabase
      .from('compliance_certifications')
      .select('*, project:projects!inner(organization_id)')
      .eq('id', certificationId)
      .eq('project_id', projectId)
      .single();

    if (fetchError || !existingCert) {
      return NextResponse.json({ error: 'Certification not found' }, { status: 404 });
    }

    if ((existingCert.project as any).organization_id !== profile.organization_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete the certification
    const { error: deleteError } = await supabase
      .from('compliance_certifications')
      .delete()
      .eq('id', certificationId);

    if (deleteError) {
      console.error('Error deleting certification:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Log activity
    await supabase.rpc('log_activity', {
      p_organization_id: profile.organization_id,
      p_user_id: user.id,
      p_action_type: 'delete',
      p_entity_type: 'certification',
      p_entity_id: certificationId,
      p_entity_name: existingCert.certification_name,
      p_details: { project_id: projectId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/compliance/[projectId]/certify:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
