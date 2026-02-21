import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for updating a project
const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  sector_type: z.enum(['real-estate', 'clean-energy', 'water', 'waste', 'transportation', 'industrial']).optional(),
  building_type: z.string().optional(),
  construction_type: z.enum(['new-construction', 'substantial-rehab', 'acquisition', 'refinance']).optional(),
  address_line1: z.string().optional(),
  city: z.string().optional(),
  state: z.string().length(2).optional(),
  zip_code: z.string().optional(),
  county: z.string().optional(),
  total_sqft: z.number().optional(),
  total_units: z.number().optional(),
  affordable_units: z.number().optional(),
  capacity_mw: z.number().optional(),
  stories: z.number().optional(),
  total_development_cost: z.number().optional(),
  hard_costs: z.number().optional(),
  soft_costs: z.number().optional(),
  target_certification: z.string().optional(),
  renewable_energy_types: z.array(z.string()).optional(),
  projected_energy_reduction_pct: z.number().optional(),
  domestic_content_eligible: z.boolean().optional(),
  prevailing_wage_commitment: z.boolean().optional(),
  estimated_start_date: z.string().optional(),
  estimated_completion_date: z.string().optional(),
  project_status: z.enum(['active', 'on-hold', 'completed', 'archived']).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id } = params;

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get project with related data
    const { data: project, error } = await supabase
      .from('projects')
      .select(`
        *,
        project_incentive_matches (
          id,
          overall_score,
          estimated_value,
          status,
          incentive_program:incentive_programs (
            id,
            name,
            category,
            incentive_type,
            amount_max
          )
        ),
        applications (
          id,
          status,
          amount_requested,
          deadline
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }
      console.error('Error fetching project:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: project });
  } catch (error) {
    console.error('Error in GET /api/projects/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id } = params;

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateProjectSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

    // Update project
    const { data: project, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }
      console.error('Error updating project:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log activity
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (profile?.organization_id) {
      await supabase.rpc('log_activity', {
        p_organization_id: profile.organization_id,
        p_user_id: user.id,
        p_action_type: 'update',
        p_entity_type: 'project',
        p_entity_id: project.id,
        p_entity_name: project.name,
      });
    }

    return NextResponse.json({ data: project });
  } catch (error) {
    console.error('Error in PATCH /api/projects/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id } = params;

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get project name for logging before deletion
    const { data: existingProject } = await supabase
      .from('projects')
      .select('name, organization_id')
      .eq('id', id)
      .single();

    // Delete project (cascade will handle related records)
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting project:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log activity
    if (existingProject) {
      await supabase.rpc('log_activity', {
        p_organization_id: existingProject.organization_id,
        p_user_id: user.id,
        p_action_type: 'delete',
        p_entity_type: 'project',
        p_entity_id: id,
        p_entity_name: existingProject.name,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/projects/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
