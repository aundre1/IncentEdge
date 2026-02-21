import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import type { ComplianceStatus, ComplianceCategory, VerificationMethod, PriorityLevel } from '@/types/compliance';

// Validation schema for creating a compliance item
const createItemSchema = z.object({
  compliance_requirement_id: z.string().uuid().optional(),
  custom_name: z.string().min(1).optional(),
  custom_description: z.string().optional(),
  category: z.enum(['prevailing_wage', 'domestic_content', 'apprenticeship', 'energy_community', 'low_income_community', 'environmental', 'reporting', 'certification', 'documentation', 'other']),
  target_value: z.number().optional(),
  value_unit: z.string().optional(),
  due_date: z.string().optional(),
  priority_level: z.enum(['low', 'medium', 'high', 'critical']).optional().default('medium'),
  internal_notes: z.string().optional(),
});

// Validation schema for updating a compliance item
const updateItemSchema = z.object({
  status: z.enum(['not_started', 'in_progress', 'pending_review', 'verified', 'non_compliant', 'waived', 'expired']).optional(),
  current_value: z.number().optional(),
  target_value: z.number().optional(),
  compliance_percentage: z.number().min(0).max(100).optional(),
  verification_method: z.enum(['self_attestation', 'third_party_certification', 'government_verification', 'audit', 'documentation_review', 'site_inspection', 'automated_check']).optional(),
  verification_notes: z.string().optional(),
  due_date: z.string().optional(),
  priority_level: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  internal_notes: z.string().optional(),
  action_items: z.array(z.object({
    item: z.string(),
    assigned_to: z.string().nullable().optional(),
    due_date: z.string().nullable().optional(),
    completed: z.boolean(),
  })).optional(),
});

/**
 * GET /api/compliance/[projectId]/items
 * Get all compliance items for a project
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
      .select('id')
      .eq('id', projectId)
      .eq('organization_id', profile.organization_id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as ComplianceStatus | null;
    const category = searchParams.get('category') as ComplianceCategory | null;
    const priority = searchParams.get('priority') as PriorityLevel | null;

    // Build query
    let query = supabase
      .from('project_compliance_items')
      .select(`
        *,
        compliance_requirement:compliance_requirements (*),
        verified_by_profile:profiles!project_compliance_items_verified_by_fkey (full_name, email)
      `)
      .eq('project_id', projectId)
      .order('priority_level', { ascending: false })
      .order('due_date', { ascending: true, nullsFirst: false });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (category) {
      query = query.eq('category', category);
    }
    if (priority) {
      query = query.eq('priority_level', priority);
    }

    const { data: items, error } = await query;

    if (error) {
      console.error('Error fetching compliance items:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Group by category
    const grouped = {
      prevailing_wage: items?.filter(i => i.category === 'prevailing_wage') || [],
      domestic_content: items?.filter(i => i.category === 'domestic_content') || [],
      apprenticeship: items?.filter(i => i.category === 'apprenticeship') || [],
      energy_community: items?.filter(i => i.category === 'energy_community') || [],
      low_income_community: items?.filter(i => i.category === 'low_income_community') || [],
      other: items?.filter(i =>
        !['prevailing_wage', 'domestic_content', 'apprenticeship', 'energy_community', 'low_income_community'].includes(i.category)
      ) || [],
    };

    // Calculate summary statistics
    const summary = {
      total: items?.length || 0,
      by_status: {
        not_started: items?.filter(i => i.status === 'not_started').length || 0,
        in_progress: items?.filter(i => i.status === 'in_progress').length || 0,
        pending_review: items?.filter(i => i.status === 'pending_review').length || 0,
        verified: items?.filter(i => i.status === 'verified').length || 0,
        non_compliant: items?.filter(i => i.status === 'non_compliant').length || 0,
        waived: items?.filter(i => i.status === 'waived').length || 0,
        expired: items?.filter(i => i.status === 'expired').length || 0,
      },
      by_priority: {
        critical: items?.filter(i => i.priority_level === 'critical').length || 0,
        high: items?.filter(i => i.priority_level === 'high').length || 0,
        medium: items?.filter(i => i.priority_level === 'medium').length || 0,
        low: items?.filter(i => i.priority_level === 'low').length || 0,
      },
      total_bonus_at_risk: items?.reduce((sum, i) => sum + (i.bonus_at_risk || 0), 0) || 0,
      overdue: items?.filter(i => i.days_until_due !== null && i.days_until_due < 0).length || 0,
      due_this_week: items?.filter(i => i.days_until_due !== null && i.days_until_due >= 0 && i.days_until_due <= 7).length || 0,
      due_this_month: items?.filter(i => i.days_until_due !== null && i.days_until_due >= 0 && i.days_until_due <= 30).length || 0,
    };

    return NextResponse.json({
      data: {
        items: items?.map(item => ({
          ...item,
          name: item.custom_name || item.compliance_requirement?.name || 'Unknown',
          description: item.custom_description || item.compliance_requirement?.description,
        })) || [],
        grouped,
        summary,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/compliance/[projectId]/items:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/compliance/[projectId]/items
 * Create a new compliance item for the project
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
      .select('id, name, organization_id')
      .eq('id', projectId)
      .eq('organization_id', profile.organization_id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createItemSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const itemData = validationResult.data;

    // Ensure we have either a requirement reference or custom name
    if (!itemData.compliance_requirement_id && !itemData.custom_name) {
      return NextResponse.json(
        { error: 'Either compliance_requirement_id or custom_name is required' },
        { status: 400 }
      );
    }

    // If linking to a requirement, get the incentive_program_id
    let incentiveProgramId = null;
    if (itemData.compliance_requirement_id) {
      const { data: requirement } = await supabase
        .from('compliance_requirements')
        .select('incentive_program_id')
        .eq('id', itemData.compliance_requirement_id)
        .single();
      incentiveProgramId = requirement?.incentive_program_id;
    }

    // Create the compliance item
    const { data: newItem, error: insertError } = await supabase
      .from('project_compliance_items')
      .insert({
        project_id: projectId,
        compliance_requirement_id: itemData.compliance_requirement_id,
        incentive_program_id: incentiveProgramId,
        custom_name: itemData.custom_name,
        custom_description: itemData.custom_description,
        category: itemData.category,
        status: 'not_started',
        status_history: [{ status: 'not_started', timestamp: new Date().toISOString(), user_id: user.id, note: 'Item created' }],
        target_value: itemData.target_value,
        value_unit: itemData.value_unit,
        due_date: itemData.due_date,
        priority_level: itemData.priority_level,
        internal_notes: itemData.internal_notes,
        created_by: user.id,
      })
      .select(`
        *,
        compliance_requirement:compliance_requirements (*)
      `)
      .single();

    if (insertError) {
      console.error('Error creating compliance item:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Log activity
    await supabase.rpc('log_activity', {
      p_organization_id: profile.organization_id,
      p_user_id: user.id,
      p_action_type: 'create',
      p_entity_type: 'compliance_item',
      p_entity_id: newItem.id,
      p_entity_name: itemData.custom_name || 'Compliance Item',
      p_details: { project_id: projectId, category: itemData.category },
    });

    return NextResponse.json({ data: newItem }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/compliance/[projectId]/items:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/compliance/[projectId]/items
 * Update a compliance item (item ID in body)
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

    // Get user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    // Parse request body
    const body = await request.json();
    const { itemId, ...updateData } = body;

    if (!itemId) {
      return NextResponse.json({ error: 'itemId is required' }, { status: 400 });
    }

    // Validate update data
    const validationResult = updateItemSchema.safeParse(updateData);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    // Get existing item to verify ownership and get current status
    const { data: existingItem, error: fetchError } = await supabase
      .from('project_compliance_items')
      .select('*, project:projects!inner(organization_id)')
      .eq('id', itemId)
      .eq('project_id', projectId)
      .single();

    if (fetchError || !existingItem) {
      return NextResponse.json({ error: 'Compliance item not found' }, { status: 404 });
    }

    if ((existingItem.project as any).organization_id !== profile.organization_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const validated = validationResult.data;

    // Build update object
    const updateObj: Record<string, any> = {};

    if (validated.status !== undefined) {
      updateObj.status = validated.status;
      // Update status history
      const newHistoryEntry = {
        status: validated.status,
        timestamp: new Date().toISOString(),
        user_id: user.id,
        note: validated.verification_notes || null,
      };
      updateObj.status_history = [...(existingItem.status_history || []), newHistoryEntry];

      // If verified, set verified_by and verified_at
      if (validated.status === 'verified') {
        updateObj.verified_by = user.id;
        updateObj.verified_at = new Date().toISOString();
        updateObj.completed_date = new Date().toISOString().split('T')[0];
        updateObj.bonus_secured = true;
      }
    }

    if (validated.current_value !== undefined) updateObj.current_value = validated.current_value;
    if (validated.target_value !== undefined) updateObj.target_value = validated.target_value;
    if (validated.compliance_percentage !== undefined) updateObj.compliance_percentage = validated.compliance_percentage;
    if (validated.verification_method !== undefined) updateObj.verification_method = validated.verification_method;
    if (validated.verification_notes !== undefined) updateObj.verification_notes = validated.verification_notes;
    if (validated.due_date !== undefined) updateObj.due_date = validated.due_date;
    if (validated.priority_level !== undefined) updateObj.priority_level = validated.priority_level;
    if (validated.internal_notes !== undefined) updateObj.internal_notes = validated.internal_notes;
    if (validated.action_items !== undefined) updateObj.action_items = validated.action_items;

    // Perform update
    const { data: updatedItem, error: updateError } = await supabase
      .from('project_compliance_items')
      .update(updateObj)
      .eq('id', itemId)
      .select(`
        *,
        compliance_requirement:compliance_requirements (*)
      `)
      .single();

    if (updateError) {
      console.error('Error updating compliance item:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Log activity
    await supabase.rpc('log_activity', {
      p_organization_id: profile.organization_id,
      p_user_id: user.id,
      p_action_type: 'update',
      p_entity_type: 'compliance_item',
      p_entity_id: itemId,
      p_entity_name: existingItem.custom_name || 'Compliance Item',
      p_details: { project_id: projectId, changes: Object.keys(validated) },
    });

    return NextResponse.json({ data: updatedItem });
  } catch (error) {
    console.error('Error in PATCH /api/compliance/[projectId]/items:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/compliance/[projectId]/items
 * Delete a compliance item (item ID in query params)
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

    // Get item ID from query params
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json({ error: 'itemId is required' }, { status: 400 });
    }

    // Verify item exists and belongs to project/org
    const { data: existingItem, error: fetchError } = await supabase
      .from('project_compliance_items')
      .select('*, project:projects!inner(organization_id, name)')
      .eq('id', itemId)
      .eq('project_id', projectId)
      .single();

    if (fetchError || !existingItem) {
      return NextResponse.json({ error: 'Compliance item not found' }, { status: 404 });
    }

    if ((existingItem.project as any).organization_id !== profile.organization_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete the item
    const { error: deleteError } = await supabase
      .from('project_compliance_items')
      .delete()
      .eq('id', itemId);

    if (deleteError) {
      console.error('Error deleting compliance item:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Log activity
    await supabase.rpc('log_activity', {
      p_organization_id: profile.organization_id,
      p_user_id: user.id,
      p_action_type: 'delete',
      p_entity_type: 'compliance_item',
      p_entity_id: itemId,
      p_entity_name: existingItem.custom_name || 'Compliance Item',
      p_details: { project_id: projectId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/compliance/[projectId]/items:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
