/**
 * Project Eligibility API Endpoint
 *
 * Calculates which incentive programs a project is eligible for, with:
 * - Comprehensive eligibility matching (geography, sector, size, entity type)
 * - Bonus opportunity detection (domestic content, prevailing wage, energy community)
 * - Stacking analysis (compatible programs)
 * - Actionable recommendations ranked by value and achievability
 *
 * POST /api/programs/eligible
 * {
 *   "project_id": "uuid",
 *   // Optional: override project profile for analysis
 *   "profile": {
 *     "sector_type": "real-estate",
 *     "state": "NY",
 *     "total_development_cost": 5000000,
 *     ...
 *   }
 * }
 *
 * Response:
 * {
 *   "project_id": "uuid",
 *   "total_programs_analyzed": 500,
 *   "matching_programs": [
 *     {
 *       "program_id": "uuid",
 *       "program_name": "Section 45L Credit",
 *       "match_confidence": 0.92,
 *       "estimated_value_best": 150000,
 *       "bonus_opportunities": { "domestic_content": 25000, ... },
 *       "stacking_opportunities": ["prog-id-2", "prog-id-3"],
 *       "reasons": ["Located in NY", "Commercial building eligible", ...]
 *     }
 *   ],
 *   "total_potential_value": 2500000,
 *   "total_potential_with_stacking": 3200000,
 *   "recommendations": ["Apply for 45L...", "Pursue prevailing wage...", ...],
 *   "last_calculated_at": "2026-02-24T15:30:00Z"
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import EligibilityChecker, { ProjectProfile } from '@/lib/eligibility-checker';

const CACHE_MAX_AGE = 1800; // 30 minutes for eligibility results

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { project_id, profile } = body;

    // Validate project_id
    if (!project_id || typeof project_id !== 'string') {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: 'project_id is required and must be a string',
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Fetch project if profile not provided
    let projectProfile: ProjectProfile;

    if (profile) {
      // Use provided profile
      projectProfile = {
        id: project_id,
        ...profile,
      } as ProjectProfile;
    } else {
      // Fetch from database
      const { data: project, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', project_id)
        .single();

      if (error || !project) {
        return NextResponse.json(
          {
            error: 'Project not found',
            details: `Project ${project_id} not found in database`,
          },
          { status: 404 }
        );
      }

      projectProfile = {
        id: project.id,
        sector_type: project.sector_type,
        building_type: project.building_type,
        state: project.state,
        city: project.city,
        county: project.county,
        total_sqft: project.total_sqft,
        total_units: project.total_units,
        affordable_units: project.affordable_units,
        total_development_cost: project.total_development_cost,
        construction_type: project.construction_type,
        technologies: project.renewable_energy_types || [],
        certifications: project.certifications_achieved || [],
        domestic_content_eligible: project.domestic_content_eligible || false,
        prevailing_wage_commitment: project.prevailing_wage_commitment || false,
        energy_community_eligible: project.energy_community_eligible || false,
        low_income_community_eligible: project.low_income_community_eligible || false,
        entity_type: 'for-profit', // TODO: Get from organization
        organization_id: project.organization_id,
      };
    }

    // Run eligibility check
    const checker = new EligibilityChecker(supabase);
    const result = await checker.calculateEligibility(projectProfile);

    // Cache successful results
    const cacheTime = Date.now() - startTime;

    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Cache-Control': `public, s-maxage=${CACHE_MAX_AGE}`,
        'X-Response-Time': `${cacheTime}ms`,
        'X-Programs-Found': String(result.matching_programs.length),
        'X-Total-Value': String(result.total_potential_value),
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error in POST /api/programs/eligible:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        error: 'Eligibility check failed',
        details: errorMessage,
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          'X-Response-Time': `${Date.now() - startTime}ms`,
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

/**
 * Batch eligibility check for multiple projects
 * POST /api/programs/eligible/batch
 */
export async function PUT(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { project_ids } = body;

    // Validate input
    if (!Array.isArray(project_ids) || project_ids.length === 0) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: 'project_ids must be a non-empty array',
        },
        { status: 400 }
      );
    }

    if (project_ids.length > 50) {
      return NextResponse.json(
        {
          error: 'Too many projects',
          details: 'Maximum 50 projects per batch request',
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const checker = new EligibilityChecker(supabase);

    // Process each project
    const results = await Promise.all(
      project_ids.map(async (projectId) => {
        try {
          const { data: project } = await supabase
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .single();

          if (!project) {
            return { project_id: projectId, error: 'Project not found' };
          }

          const projectProfile: ProjectProfile = {
            id: project.id,
            sector_type: project.sector_type,
            building_type: project.building_type,
            state: project.state,
            city: project.city,
            county: project.county,
            total_sqft: project.total_sqft,
            total_units: project.total_units,
            affordable_units: project.affordable_units,
            total_development_cost: project.total_development_cost,
            construction_type: project.construction_type,
            technologies: project.renewable_energy_types || [],
            certifications: project.certifications_achieved || [],
            domestic_content_eligible: project.domestic_content_eligible || false,
            prevailing_wage_commitment: project.prevailing_wage_commitment || false,
            energy_community_eligible: project.energy_community_eligible || false,
            low_income_community_eligible: project.low_income_community_eligible || false,
            entity_type: 'for-profit',
            organization_id: project.organization_id,
          };

          const result = await checker.calculateEligibility(projectProfile);
          return { ...result, project_id: projectId };
        } catch (error) {
          return {
            project_id: projectId,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      })
    );

    const responseTime = Date.now() - startTime;

    return NextResponse.json(
      {
        results,
        total_projects: project_ids.length,
        successful: results.filter((r) => !r.error).length,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          'Cache-Control': `public, s-maxage=${CACHE_MAX_AGE}`,
          'X-Response-Time': `${responseTime}ms`,
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Error in PUT /api/programs/eligible (batch):', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        error: 'Batch eligibility check failed',
        details: errorMessage,
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          'X-Response-Time': `${Date.now() - startTime}ms`,
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
