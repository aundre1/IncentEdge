import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import {
  calculateComplianceScore,
  checkPrevailingWageCompliance,
  checkDomesticContentCompliance,
  checkApprenticeshipCompliance,
} from '@/lib/compliance-checker';

// Query params schema
const querySchema = z.object({
  projectId: z.string().uuid().optional(),
  status: z.enum(['not_started', 'in_progress', 'pending_review', 'verified', 'non_compliant', 'waived', 'expired']).optional(),
  category: z.enum(['prevailing_wage', 'domestic_content', 'apprenticeship', 'energy_community', 'low_income_community', 'environmental', 'reporting', 'certification', 'documentation', 'other']).optional(),
});

/**
 * GET /api/compliance
 * Get compliance status overview across all projects or for a specific project
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    // If specific project requested
    if (projectId) {
      // Verify project belongs to organization
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select(`
          *,
          project_compliance_items (
            *,
            compliance_requirement:compliance_requirements (*)
          )
        `)
        .eq('id', projectId)
        .eq('organization_id', profile.organization_id)
        .single();

      if (projectError || !project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }

      // Get compliance data
      const [
        { data: prevailingWageRecords },
        { data: domesticContentRecords },
        { data: apprenticeshipRecords },
        { data: documents },
        { data: certifications },
        { data: energyCommunity },
        { data: lowIncome },
      ] = await Promise.all([
        supabase.from('prevailing_wage_records').select('*').eq('project_id', projectId),
        supabase.from('domestic_content_tracking').select('*').eq('project_id', projectId),
        supabase.from('apprenticeship_records').select('*').eq('project_id', projectId),
        supabase.from('compliance_documents').select('*').eq('project_id', projectId),
        supabase.from('compliance_certifications').select('*').eq('project_id', projectId),
        supabase.from('energy_community_eligibility').select('*').eq('project_id', projectId).single(),
        supabase.from('low_income_community_eligibility').select('*').eq('project_id', projectId).single(),
      ]);

      // Calculate compliance score
      const baseValue = project.total_potential_incentives || 0;
      const scoreResult = calculateComplianceScore(
        project.project_compliance_items || [],
        prevailingWageRecords || [],
        domesticContentRecords || [],
        apprenticeshipRecords || [],
        documents || [],
        certifications || [],
        baseValue,
        {
          energyCommunityEligible: energyCommunity?.is_eligible || false,
          lowIncomeEligible: lowIncome?.is_eligible || false,
          lowIncomeCategory: lowIncome?.category,
        }
      );

      // Build response
      const items = project.project_compliance_items || [];
      const itemsByStatus = {
        not_started: items.filter((i: any) => i.status === 'not_started').length,
        in_progress: items.filter((i: any) => i.status === 'in_progress').length,
        pending_review: items.filter((i: any) => i.status === 'pending_review').length,
        verified: items.filter((i: any) => i.status === 'verified').length,
        non_compliant: items.filter((i: any) => i.status === 'non_compliant').length,
      };

      // Get upcoming deadlines
      const upcomingDeadlines = items
        .filter((i: any) => i.due_date && i.status !== 'verified' && i.status !== 'waived')
        .map((i: any) => ({
          item_id: i.id,
          item_name: i.custom_name || i.compliance_requirement?.name || 'Unknown',
          due_date: i.due_date,
          days_remaining: i.days_until_due,
          priority: i.priority_level,
        }))
        .sort((a: any, b: any) => (a.days_remaining || 999) - (b.days_remaining || 999))
        .slice(0, 5);

      return NextResponse.json({
        data: {
          project_id: projectId,
          project_name: project.name,
          overall_score: scoreResult.overall_score,
          status: project.compliance_status || 'not_started',
          ira_bonuses: {
            prevailing_wage: {
              eligible: scoreResult.bonus_status.prevailing_wage_bonus.eligible,
              status: scoreResult.bonus_status.prevailing_wage_bonus.secured ? 'secured' : 'at_risk',
              bonus_percentage: 0.30,
              bonus_value: scoreResult.bonus_status.prevailing_wage_bonus.value,
            },
            domestic_content: {
              eligible: scoreResult.bonus_status.domestic_content_bonus.eligible,
              status: scoreResult.bonus_status.domestic_content_bonus.secured ? 'secured' : 'at_risk',
              bonus_percentage: 0.10,
              bonus_value: scoreResult.bonus_status.domestic_content_bonus.value,
            },
            energy_community: {
              eligible: scoreResult.bonus_status.energy_community_bonus.eligible,
              status: scoreResult.bonus_status.energy_community_bonus.secured ? 'secured' : 'not_applicable',
              bonus_percentage: 0.10,
              bonus_value: scoreResult.bonus_status.energy_community_bonus.value,
            },
            low_income_community: {
              eligible: scoreResult.bonus_status.low_income_bonus.eligible,
              status: scoreResult.bonus_status.low_income_bonus.secured ? 'secured' : 'not_applicable',
              bonus_percentage: lowIncome?.bonus_percentage || 0.10,
              bonus_value: scoreResult.bonus_status.low_income_bonus.value,
            },
          },
          total_potential_bonus: scoreResult.total_potential_bonus,
          secured_bonus: scoreResult.secured_bonus,
          at_risk_bonus: scoreResult.at_risk_bonus,
          items_summary: {
            total: items.length,
            ...itemsByStatus,
          },
          category_scores: scoreResult.category_scores,
          upcoming_deadlines: upcomingDeadlines,
          risk_factors: scoreResult.risk_factors,
          recommendations: scoreResult.recommendations,
        },
      });
    }

    // Get overview of all projects
    let projectsQuery = supabase
      .from('projects')
      .select(`
        id,
        name,
        compliance_score,
        compliance_status,
        ira_bonus_potential,
        ira_bonus_secured,
        ira_bonus_at_risk,
        last_compliance_check_at
      `)
      .eq('organization_id', profile.organization_id)
      .eq('project_status', 'active')
      .order('compliance_score', { ascending: true, nullsFirst: true });

    const { data: projects, error: projectsError } = await projectsQuery;

    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
      return NextResponse.json({ error: projectsError.message }, { status: 500 });
    }

    // Get overall compliance items summary
    const { data: itemsSummary } = await supabase
      .from('project_compliance_items')
      .select('status, project_id')
      .in('project_id', projects?.map(p => p.id) || []);

    const statusCounts = {
      total: itemsSummary?.length || 0,
      not_started: itemsSummary?.filter(i => i.status === 'not_started').length || 0,
      in_progress: itemsSummary?.filter(i => i.status === 'in_progress').length || 0,
      pending_review: itemsSummary?.filter(i => i.status === 'pending_review').length || 0,
      verified: itemsSummary?.filter(i => i.status === 'verified').length || 0,
      non_compliant: itemsSummary?.filter(i => i.status === 'non_compliant').length || 0,
    };

    // Calculate totals
    const totalPotentialBonus = projects?.reduce((sum, p) => sum + (p.ira_bonus_potential || 0), 0) || 0;
    const totalSecuredBonus = projects?.reduce((sum, p) => sum + (p.ira_bonus_secured || 0), 0) || 0;
    const totalAtRiskBonus = projects?.reduce((sum, p) => sum + (p.ira_bonus_at_risk || 0), 0) || 0;

    // Find projects needing attention
    const projectsNeedingAttention = projects?.filter(p =>
      p.compliance_status === 'non_compliant' ||
      (p.compliance_score !== null && p.compliance_score < 70)
    ) || [];

    return NextResponse.json({
      data: {
        summary: {
          total_projects: projects?.length || 0,
          projects_compliant: projects?.filter(p => p.compliance_status === 'verified').length || 0,
          projects_in_progress: projects?.filter(p => p.compliance_status === 'in_progress').length || 0,
          projects_at_risk: projectsNeedingAttention.length,
          average_score: projects && projects.length > 0
            ? Math.round(projects.reduce((sum, p) => sum + (p.compliance_score || 0), 0) / projects.length)
            : 0,
        },
        bonuses: {
          total_potential: totalPotentialBonus,
          secured: totalSecuredBonus,
          at_risk: totalAtRiskBonus,
        },
        items: statusCounts,
        projects: projects?.map(p => ({
          id: p.id,
          name: p.name,
          compliance_score: p.compliance_score,
          status: p.compliance_status,
          bonus_potential: p.ira_bonus_potential,
          bonus_secured: p.ira_bonus_secured,
          bonus_at_risk: p.ira_bonus_at_risk,
          last_check: p.last_compliance_check_at,
        })),
        attention_needed: projectsNeedingAttention.map(p => ({
          id: p.id,
          name: p.name,
          score: p.compliance_score,
          status: p.compliance_status,
        })),
      },
    });
  } catch (error) {
    console.error('Error in GET /api/compliance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/compliance
 * Trigger compliance check/recalculation for a project
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

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
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    // Verify project belongs to organization
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('organization_id', profile.organization_id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Call the database function to calculate compliance score
    const { data: scoreResult, error: scoreError } = await supabase
      .rpc('calculate_compliance_score', { p_project_id: projectId });

    if (scoreError) {
      console.error('Error calculating compliance score:', scoreError);
      return NextResponse.json({ error: scoreError.message }, { status: 500 });
    }

    // Get updated project data
    const { data: updatedProject } = await supabase
      .from('projects')
      .select('compliance_score, compliance_status, compliance_summary, ira_bonus_potential, ira_bonus_secured, ira_bonus_at_risk')
      .eq('id', projectId)
      .single();

    // Log activity
    await supabase.rpc('log_activity', {
      p_organization_id: profile.organization_id,
      p_user_id: user.id,
      p_action_type: 'compliance_check',
      p_entity_type: 'project',
      p_entity_id: projectId,
      p_entity_name: project.name,
      p_details: { new_score: scoreResult },
    });

    return NextResponse.json({
      data: {
        project_id: projectId,
        new_score: scoreResult,
        compliance_summary: updatedProject?.compliance_summary,
        bonus_potential: updatedProject?.ira_bonus_potential,
        bonus_secured: updatedProject?.ira_bonus_secured,
        bonus_at_risk: updatedProject?.ira_bonus_at_risk,
        calculated_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error in POST /api/compliance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
