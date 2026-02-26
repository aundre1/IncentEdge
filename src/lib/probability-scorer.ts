/**
 * Probability Scorer — Computes approval probability for (project, program) pairs.
 *
 * Uses historical award data from `awarded_applications` (6.5M rows)
 * aggregated into the `program_award_stats` materialized view.
 * Results are cached in `probability_scores` with UPSERT semantics.
 *
 * @module probability-scorer
 */

import type { SupabaseClient } from '@supabase/supabase-js';

// ============================================================================
// TYPES
// ============================================================================

export interface ProbabilityInput {
  projectId: string;
  programId: string;
  projectType: string;    // 'commercial', 'residential', 'mixed_use', 'industrial', 'other'
  sector: string;         // 'clean_energy', 'affordable_housing', etc.
  state: string;          // 2-letter state code
  tdcRange: string;       // 'under_1m', '1m_5m', etc.
  applicantType: string;  // 'for_profit', 'nonprofit', etc.
}

export interface ProbabilityFactors {
  locationMatch: number;
  sectorMatch: number;
  projectTypeMatch: number;
  applicantTypeMatch: number;
  tdcRangeMatch: number;
}

export interface ProbabilityResult {
  approvalProbability: number;    // 0-100
  confidenceLevel: ConfidenceLevel;
  sampleSize: number;
  comparableAwardsCount: number;
  avgComparableAward: number;
  factors: ProbabilityFactors;
  basedOn: string;
  cached: boolean;
  computedAt: string;
}

export type ConfidenceLevel =
  | 'very_high'
  | 'high'
  | 'medium'
  | 'low'
  | 'insufficient_data';

// ============================================================================
// INTERNAL TYPES
// ============================================================================

interface CachedScore {
  approval_probability: number;
  confidence_level: ConfidenceLevel;
  sample_size: number;
  factors: ProbabilityFactors;
  comparable_awards_count: number;
  avg_comparable_award: number;
  computed_at: string;
  is_fresh: boolean;
}

interface AwardStatRow {
  program_id: string;
  project_type: string | null;
  jurisdiction_state: string | null;
  applicant_type: string | null;
  total_applications: number;
  total_funded: number;
  approval_rate_pct: number;
  avg_award_amount: number;
  median_award_amount: number;
  avg_processing_days: number;
}

// ============================================================================
// CONFIDENCE LEVEL ASSIGNMENT
// ============================================================================

function assignConfidenceLevel(sampleSize: number): ConfidenceLevel {
  if (sampleSize >= 500) return 'very_high';
  if (sampleSize >= 100) return 'high';
  if (sampleSize >= 25) return 'medium';
  if (sampleSize >= 5) return 'low';
  return 'insufficient_data';
}

// ============================================================================
// HUMAN-READABLE LABEL
// ============================================================================

function formatBasedOn(count: number): string {
  if (count === 0) return 'Insufficient historical data';
  const formatted = count.toLocaleString('en-US');
  return `Based on ${formatted} comparable award${count === 1 ? '' : 's'}`;
}

// ============================================================================
// PROGRESSIVE RELAXATION QUERIES
// ============================================================================

/**
 * Query program_award_stats with progressive relaxation.
 * Returns the most specific match available.
 */
async function queryAwardStats(
  supabase: SupabaseClient,
  input: ProbabilityInput,
): Promise<{ rows: AwardStatRow[]; matchLevel: number }> {
  // Level 1: Exact match — state + project_type + applicant_type
  {
    const { data, error } = await supabase
      .from('program_award_stats')
      .select('*')
      .eq('program_id', input.programId)
      .eq('jurisdiction_state', input.state)
      .eq('project_type', input.projectType)
      .eq('applicant_type', input.applicantType);

    if (!error && data && data.length > 0) {
      return { rows: data as AwardStatRow[], matchLevel: 1 };
    }
  }

  // Level 2: state + project_type (any applicant_type)
  {
    const { data, error } = await supabase
      .from('program_award_stats')
      .select('*')
      .eq('program_id', input.programId)
      .eq('jurisdiction_state', input.state)
      .eq('project_type', input.projectType);

    if (!error && data && data.length > 0) {
      return { rows: data as AwardStatRow[], matchLevel: 2 };
    }
  }

  // Level 3: state only (any project_type, any applicant_type)
  {
    const { data, error } = await supabase
      .from('program_award_stats')
      .select('*')
      .eq('program_id', input.programId)
      .eq('jurisdiction_state', input.state);

    if (!error && data && data.length > 0) {
      return { rows: data as AwardStatRow[], matchLevel: 3 };
    }
  }

  // Level 4: program-level aggregate (any state/type)
  {
    const { data, error } = await supabase
      .from('program_award_stats')
      .select('*')
      .eq('program_id', input.programId);

    if (!error && data && data.length > 0) {
      return { rows: data as AwardStatRow[], matchLevel: 4 };
    }
  }

  return { rows: [], matchLevel: 0 };
}

// ============================================================================
// FACTOR COMPUTATION
// ============================================================================

function computeFactors(
  rows: AwardStatRow[],
  matchLevel: number,
  input: ProbabilityInput,
): ProbabilityFactors {
  // Each factor is 0.0-1.0, representing how well the historical data
  // matches the specific project dimension.

  const hasStateMatch = rows.some(
    (r) => r.jurisdiction_state === input.state,
  );
  const hasProjectTypeMatch = rows.some(
    (r) => r.project_type === input.projectType,
  );
  const hasApplicantTypeMatch = rows.some(
    (r) => r.applicant_type === input.applicantType,
  );

  return {
    locationMatch: hasStateMatch ? 1.0 : matchLevel <= 3 ? 0.5 : 0.2,
    sectorMatch: matchLevel <= 2 ? 0.9 : matchLevel <= 3 ? 0.6 : 0.3,
    projectTypeMatch: hasProjectTypeMatch ? 1.0 : matchLevel <= 3 ? 0.5 : 0.2,
    applicantTypeMatch: hasApplicantTypeMatch ? 1.0 : matchLevel <= 2 ? 0.6 : 0.3,
    tdcRangeMatch: matchLevel <= 2 ? 0.8 : matchLevel <= 3 ? 0.5 : 0.3,
  };
}

// ============================================================================
// WEIGHTED PROBABILITY COMPUTATION
// ============================================================================

function computeWeightedProbability(
  rows: AwardStatRow[],
  matchLevel: number,
): { probability: number; sampleSize: number; totalFunded: number; avgAward: number } {
  if (rows.length === 0) {
    return { probability: 0, sampleSize: 0, totalFunded: 0, avgAward: 0 };
  }

  // Aggregate across matching rows
  let totalApplications = 0;
  let totalFunded = 0;
  let weightedAwardSum = 0;

  for (const row of rows) {
    totalApplications += row.total_applications;
    totalFunded += row.total_funded;
    weightedAwardSum += row.avg_award_amount * row.total_funded;
  }

  const baseRate = totalApplications > 0
    ? (totalFunded / totalApplications) * 100
    : 0;

  // Apply specificity discount: more relaxed matches get penalized
  const specificityMultipliers: Record<number, number> = {
    1: 1.0,   // exact match — full confidence
    2: 0.9,   // missing applicant_type
    3: 0.75,  // missing project_type + applicant_type
    4: 0.6,   // program-level only
  };

  const multiplier = specificityMultipliers[matchLevel] ?? 0.5;
  const probability = Math.min(100, Math.max(0, baseRate * multiplier));

  const avgAward = totalFunded > 0 ? weightedAwardSum / totalFunded : 0;

  return { probability, sampleSize: totalApplications, totalFunded, avgAward };
}

// ============================================================================
// UPSERT CACHE
// ============================================================================

async function upsertCache(
  supabase: SupabaseClient,
  input: ProbabilityInput,
  result: ProbabilityResult,
): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7-day TTL

  await supabase
    .from('probability_scores')
    .upsert(
      {
        project_id: input.projectId,
        program_id: input.programId,
        approval_probability: result.approvalProbability,
        confidence_level: result.confidenceLevel,
        sample_size: result.sampleSize,
        factors: result.factors,
        comparable_awards_count: result.comparableAwardsCount,
        avg_comparable_award: result.avgComparableAward,
        computed_at: result.computedAt,
        expires_at: expiresAt.toISOString(),
        is_stale: false,
      },
      {
        onConflict: 'project_id,program_id',
      },
    );
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Compute approval probability for a (project, program) pair.
 *
 * 1. Checks cache via `get_probability_score()` RPC
 * 2. On miss/stale, queries `program_award_stats` with progressive relaxation
 * 3. Computes weighted probability + factors
 * 4. Upserts result into `probability_scores` cache
 */
export async function computeProbability(
  supabase: SupabaseClient,
  input: ProbabilityInput,
): Promise<ProbabilityResult> {
  // ------------------------------------------------------------------
  // Step 1: Check cache
  // ------------------------------------------------------------------
  try {
    const { data: cached, error: cacheError } = await supabase
      .rpc('get_probability_score', {
        p_project_id: input.projectId,
        p_program_id: input.programId,
      })
      .single();

    if (!cacheError && cached) {
      const cachedScore = cached as unknown as CachedScore;
      if (cachedScore.is_fresh) {
        return {
          approvalProbability: Number(cachedScore.approval_probability),
          confidenceLevel: cachedScore.confidence_level,
          sampleSize: cachedScore.sample_size,
          comparableAwardsCount: cachedScore.comparable_awards_count,
          avgComparableAward: Number(cachedScore.avg_comparable_award),
          factors: cachedScore.factors,
          basedOn: formatBasedOn(cachedScore.comparable_awards_count),
          cached: true,
          computedAt: cachedScore.computed_at,
        };
      }
    }
  } catch {
    // Cache miss or RPC not available — fall through to compute
  }

  // ------------------------------------------------------------------
  // Step 2: Query award stats with progressive relaxation
  // ------------------------------------------------------------------
  const { rows, matchLevel } = await queryAwardStats(supabase, input);

  // ------------------------------------------------------------------
  // Step 3: Compute weighted probability
  // ------------------------------------------------------------------
  const { probability, sampleSize, totalFunded, avgAward } =
    computeWeightedProbability(rows, matchLevel);

  // ------------------------------------------------------------------
  // Step 4: Compute factors
  // ------------------------------------------------------------------
  const factors = computeFactors(rows, matchLevel, input);

  // ------------------------------------------------------------------
  // Step 5: Assign confidence level
  // ------------------------------------------------------------------
  const confidenceLevel = assignConfidenceLevel(sampleSize);

  // ------------------------------------------------------------------
  // Step 6: Build result
  // ------------------------------------------------------------------
  const now = new Date().toISOString();
  const result: ProbabilityResult = {
    approvalProbability: Math.round(probability * 100) / 100,
    confidenceLevel,
    sampleSize,
    comparableAwardsCount: totalFunded,
    avgComparableAward: Math.round(avgAward * 100) / 100,
    factors,
    basedOn: formatBasedOn(totalFunded),
    cached: false,
    computedAt: now,
  };

  // ------------------------------------------------------------------
  // Step 7: Upsert into cache (fire-and-forget)
  // ------------------------------------------------------------------
  upsertCache(supabase, input, result).catch((err) => {
    console.error('[probability-scorer] cache upsert failed:', err);
  });

  return result;
}
