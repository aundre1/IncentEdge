import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { computeProbability } from '@/lib/probability-scorer';
import type { ProbabilityResult } from '@/lib/probability-scorer';

// ============================================================================
// VALIDATION
// ============================================================================

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const requestSchema = z.object({
  projectId: z.string().regex(UUID_REGEX, 'Invalid project UUID'),
  programIds: z
    .array(z.string().regex(UUID_REGEX, 'Invalid program UUID'))
    .min(1, 'At least one programId is required')
    .max(20, 'Maximum 20 programIds per batch'),
});

// ============================================================================
// ROUTE HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // ------------------------------------------------------------------
    // Auth check
    // ------------------------------------------------------------------
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    // ------------------------------------------------------------------
    // Parse & validate request body
    // ------------------------------------------------------------------
    const body: unknown = await request.json();
    const validation = requestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: validation.error.errors,
        },
        { status: 400 },
      );
    }

    const { projectId, programIds } = validation.data;

    // ------------------------------------------------------------------
    // Fetch project details for probability input context
    // ------------------------------------------------------------------
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name, sector_type, building_type, state, total_development_cost')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 },
      );
    }

    // Derive TDC range from total_development_cost
    const tdcRange = deriveTdcRange(project.total_development_cost as number | null);

    // Derive project type from building_type
    const projectType = deriveProjectType(project.building_type as string | null);

    // ------------------------------------------------------------------
    // Compute probability for each program in parallel
    // ------------------------------------------------------------------
    const results = await Promise.all(
      programIds.map(async (programId) => {
        try {
          const result = await computeProbability(supabase, {
            projectId,
            programId,
            projectType,
            sector: (project.sector_type as string) ?? 'other',
            state: (project.state as string) ?? '',
            tdcRange,
            applicantType: 'for_profit', // Default; could be fetched from org profile
          });

          return {
            programId,
            ...result,
          };
        } catch (err) {
          console.error(
            `[grant-writing/probability] Error scoring program ${programId}:`,
            err,
          );
          // Return a degraded result rather than failing the whole batch
          return {
            programId,
            approvalProbability: 0,
            confidenceLevel: 'insufficient_data' as const,
            sampleSize: 0,
            comparableAwardsCount: 0,
            avgComparableAward: 0,
            factors: {
              locationMatch: 0,
              sectorMatch: 0,
              projectTypeMatch: 0,
              applicantTypeMatch: 0,
              tdcRangeMatch: 0,
            },
            basedOn: 'Insufficient historical data',
            cached: false,
            computedAt: new Date().toISOString(),
          } satisfies { programId: string } & ProbabilityResult;
        }
      }),
    );

    return NextResponse.json({
      results,
      projectId,
      computedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[grant-writing/probability] Unhandled error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// ============================================================================
// HELPERS
// ============================================================================

function deriveTdcRange(tdc: number | null): string {
  if (!tdc) return 'under_1m';
  if (tdc < 1_000_000) return 'under_1m';
  if (tdc < 5_000_000) return '1m_5m';
  if (tdc < 25_000_000) return '5m_25m';
  if (tdc < 100_000_000) return '25m_100m';
  return 'over_100m';
}

function deriveProjectType(buildingType: string | null): string {
  if (!buildingType) return 'other';
  const bt = buildingType.toLowerCase();
  if (bt.includes('residential') || bt.includes('multifamily') || bt.includes('apartment')) {
    return 'residential';
  }
  if (bt.includes('commercial') || bt.includes('office') || bt.includes('retail')) {
    return 'commercial';
  }
  if (bt.includes('mixed')) return 'mixed_use';
  if (bt.includes('industrial') || bt.includes('warehouse')) return 'industrial';
  return 'other';
}
