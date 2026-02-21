import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  calculateComplianceScore,
  checkPrevailingWageCompliance,
  checkDomesticContentCompliance,
  checkApprenticeshipCompliance,
  checkEnergyCommunityEligibility,
  checkLowIncomeCommunityEligibility,
  calculatePrevailingWageSummary,
  calculateDomesticContentPercentage,
  calculateApprenticeshipSummary,
} from '@/lib/compliance-checker';

/**
 * GET /api/compliance/[projectId]
 * Get detailed compliance status for a specific project
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

    // Get project with compliance data
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

    if (projectError) {
      if (projectError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }
      console.error('Error fetching project:', projectError);
      return NextResponse.json({ error: projectError.message }, { status: 500 });
    }

    // Fetch all related compliance data in parallel
    const [
      { data: prevailingWageRecords },
      { data: domesticContentRecords },
      { data: apprenticeshipRecords },
      { data: documents },
      { data: certifications },
      { data: energyCommunity },
      { data: lowIncome },
      { data: scoreHistory },
    ] = await Promise.all([
      supabase
        .from('prevailing_wage_records')
        .select('*')
        .eq('project_id', projectId)
        .order('period_start', { ascending: false }),
      supabase
        .from('domestic_content_tracking')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false }),
      supabase
        .from('apprenticeship_records')
        .select('*')
        .eq('project_id', projectId)
        .order('period_start', { ascending: false }),
      supabase
        .from('compliance_documents')
        .select('*')
        .eq('project_id', projectId)
        .eq('is_current', true)
        .order('created_at', { ascending: false }),
      supabase
        .from('compliance_certifications')
        .select('*')
        .eq('project_id', projectId)
        .order('issue_date', { ascending: false }),
      supabase
        .from('energy_community_eligibility')
        .select('*')
        .eq('project_id', projectId)
        .maybeSingle(),
      supabase
        .from('low_income_community_eligibility')
        .select('*')
        .eq('project_id', projectId)
        .maybeSingle(),
      supabase
        .from('compliance_score_history')
        .select('*')
        .eq('project_id', projectId)
        .order('calculated_at', { ascending: false })
        .limit(30),
    ]);

    // Calculate detailed compliance checks
    const pwCheck = checkPrevailingWageCompliance(prevailingWageRecords || []);
    const dcCheck = checkDomesticContentCompliance(domesticContentRecords || []);
    const appCheck = checkApprenticeshipCompliance(apprenticeshipRecords || []);

    // Calculate summaries
    const pwSummary = calculatePrevailingWageSummary(prevailingWageRecords || []);
    const dcSummary = calculateDomesticContentPercentage(domesticContentRecords || []);
    const appSummary = calculateApprenticeshipSummary(apprenticeshipRecords || []);

    // Calculate overall score
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

    // Process compliance items by category
    const items = project.project_compliance_items || [];
    const itemsByCategory = {
      prevailing_wage: items.filter((i: any) => i.category === 'prevailing_wage'),
      domestic_content: items.filter((i: any) => i.category === 'domestic_content'),
      apprenticeship: items.filter((i: any) => i.category === 'apprenticeship'),
      energy_community: items.filter((i: any) => i.category === 'energy_community'),
      low_income_community: items.filter((i: any) => i.category === 'low_income_community'),
      other: items.filter((i: any) =>
        !['prevailing_wage', 'domestic_content', 'apprenticeship', 'energy_community', 'low_income_community'].includes(i.category)
      ),
    };

    // Build comprehensive response
    return NextResponse.json({
      data: {
        project: {
          id: project.id,
          name: project.name,
          status: project.project_status,
          census_tract: project.census_tract,
          state: project.state,
          prevailing_wage_commitment: project.prevailing_wage_commitment,
          domestic_content_eligible: project.domestic_content_eligible,
          energy_community_eligible: project.energy_community_eligible,
          low_income_community_eligible: project.low_income_community_eligible,
        },
        compliance: {
          overall_score: scoreResult.overall_score,
          status: project.compliance_status || 'not_started',
          last_check: project.last_compliance_check_at,
          category_scores: scoreResult.category_scores,
        },
        ira_bonuses: {
          prevailing_wage: {
            eligible: project.prevailing_wage_commitment,
            secured: scoreResult.bonus_status.prevailing_wage_bonus.secured,
            bonus_percentage: 0.30,
            bonus_value: scoreResult.bonus_status.prevailing_wage_bonus.value,
            check_result: pwCheck,
            summary: pwSummary,
          },
          domestic_content: {
            eligible: project.domestic_content_eligible,
            secured: scoreResult.bonus_status.domestic_content_bonus.secured,
            bonus_percentage: 0.10,
            bonus_value: scoreResult.bonus_status.domestic_content_bonus.value,
            check_result: dcCheck,
            summary: dcSummary,
          },
          apprenticeship: {
            required: project.prevailing_wage_commitment,
            compliant: appCheck.is_compliant,
            check_result: appCheck,
            summary: appSummary,
          },
          energy_community: {
            eligible: energyCommunity?.is_eligible || false,
            secured: energyCommunity?.verified || false,
            bonus_percentage: 0.10,
            bonus_value: scoreResult.bonus_status.energy_community_bonus.value,
            eligibility_data: energyCommunity,
          },
          low_income_community: {
            eligible: lowIncome?.is_eligible || false,
            secured: lowIncome?.verified || false,
            category: lowIncome?.category,
            bonus_percentage: lowIncome?.bonus_percentage || 0,
            bonus_value: scoreResult.bonus_status.low_income_bonus.value,
            eligibility_data: lowIncome,
          },
        },
        bonus_totals: {
          potential: scoreResult.total_potential_bonus,
          secured: scoreResult.secured_bonus,
          at_risk: scoreResult.at_risk_bonus,
        },
        items: {
          total: items.length,
          by_status: {
            not_started: items.filter((i: any) => i.status === 'not_started').length,
            in_progress: items.filter((i: any) => i.status === 'in_progress').length,
            pending_review: items.filter((i: any) => i.status === 'pending_review').length,
            verified: items.filter((i: any) => i.status === 'verified').length,
            non_compliant: items.filter((i: any) => i.status === 'non_compliant').length,
          },
          by_category: {
            prevailing_wage: itemsByCategory.prevailing_wage.length,
            domestic_content: itemsByCategory.domestic_content.length,
            apprenticeship: itemsByCategory.apprenticeship.length,
            energy_community: itemsByCategory.energy_community.length,
            low_income_community: itemsByCategory.low_income_community.length,
            other: itemsByCategory.other.length,
          },
          list: items.map((item: any) => ({
            id: item.id,
            name: item.custom_name || item.compliance_requirement?.name || 'Unknown',
            category: item.category,
            status: item.status,
            priority: item.priority_level,
            due_date: item.due_date,
            days_until_due: item.days_until_due,
            compliance_percentage: item.compliance_percentage,
            bonus_at_risk: item.bonus_at_risk,
            requirement: item.compliance_requirement,
          })),
        },
        documents: {
          total: documents?.length || 0,
          by_status: {
            pending: documents?.filter((d: any) => d.review_status === 'pending').length || 0,
            approved: documents?.filter((d: any) => d.review_status === 'approved').length || 0,
            rejected: documents?.filter((d: any) => d.review_status === 'rejected').length || 0,
            needs_revision: documents?.filter((d: any) => d.review_status === 'needs_revision').length || 0,
          },
          recent: documents?.slice(0, 10).map((d: any) => ({
            id: d.id,
            name: d.name,
            type: d.document_type,
            review_status: d.review_status,
            uploaded_at: d.created_at,
          })) || [],
        },
        certifications: {
          total: certifications?.length || 0,
          active: certifications?.filter((c: any) => c.status === 'active').length || 0,
          expiring_soon: certifications?.filter((c: any) => {
            if (!c.expiration_date) return false;
            const expDate = new Date(c.expiration_date);
            const now = new Date();
            const daysUntilExpiry = (expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
            return daysUntilExpiry <= 90 && daysUntilExpiry > 0;
          }).length || 0,
          list: certifications?.map((c: any) => ({
            id: c.id,
            name: c.certification_name,
            type: c.certification_type,
            status: c.status,
            certifying_organization: c.certifying_organization,
            issue_date: c.issue_date,
            expiration_date: c.expiration_date,
            ira_bonus_certified: c.ira_bonus_certified,
          })) || [],
        },
        score_history: scoreHistory?.map((h: any) => ({
          overall_score: h.overall_score,
          prevailing_wage_score: h.prevailing_wage_score,
          domestic_content_score: h.domestic_content_score,
          apprenticeship_score: h.apprenticeship_score,
          calculated_at: h.calculated_at,
        })) || [],
        risk_factors: scoreResult.risk_factors,
        recommendations: scoreResult.recommendations,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/compliance/[projectId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/compliance/[projectId]
 * Trigger compliance recalculation for the project
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
      .select('id, name, organization_id, compliance_score')
      .eq('id', projectId)
      .eq('organization_id', profile.organization_id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Call the database function to calculate compliance score
    const { data: newScore, error: scoreError } = await supabase
      .rpc('calculate_compliance_score', { p_project_id: projectId });

    if (scoreError) {
      console.error('Error calculating compliance score:', scoreError);
      return NextResponse.json({ error: scoreError.message }, { status: 500 });
    }

    // Get updated project data
    const { data: updatedProject } = await supabase
      .from('projects')
      .select('compliance_score, compliance_status, compliance_summary, ira_bonus_potential, ira_bonus_secured, ira_bonus_at_risk, last_compliance_check_at')
      .eq('id', projectId)
      .single();

    // Log activity
    await supabase.rpc('log_activity', {
      p_organization_id: profile.organization_id,
      p_user_id: user.id,
      p_action_type: 'compliance_recalculate',
      p_entity_type: 'project',
      p_entity_id: projectId,
      p_entity_name: project.name,
      p_details: { previous_score: project.compliance_score, new_score: newScore },
    });

    return NextResponse.json({
      data: {
        project_id: projectId,
        compliance_score: newScore,
        compliance_status: updatedProject?.compliance_status,
        compliance_summary: updatedProject?.compliance_summary,
        bonus_potential: updatedProject?.ira_bonus_potential,
        bonus_secured: updatedProject?.ira_bonus_secured,
        bonus_at_risk: updatedProject?.ira_bonus_at_risk,
        calculated_at: updatedProject?.last_compliance_check_at,
      },
    });
  } catch (error) {
    console.error('Error in POST /api/compliance/[projectId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
