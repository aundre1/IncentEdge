'use client';

import { useState, useCallback } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface EligibilityMatchedProgram {
  program_id: string;
  program_name: string;
  match_confidence: number;
  estimated_value_best: number;
  bonus_opportunities: Record<string, number>;
  stacking_opportunities: string[];
  reasons: string[];
}

export interface EligibilityResult {
  project_id: string;
  total_programs_analyzed: number;
  matching_programs: EligibilityMatchedProgram[];
  total_potential_value: number;
  total_potential_with_stacking: number;
  recommendations: string[];
  last_calculated_at: string;
}

export interface UseEligibilityReturn {
  result: EligibilityResult | null;
  loading: boolean;
  error: string | null;
  checkEligibility: (projectId: string) => Promise<void>;
  reset: () => void;
}

// ============================================================================
// MODULE-LEVEL CACHE (30-minute TTL)
// ============================================================================

interface CacheEntry {
  result: EligibilityResult;
  cachedAt: number;
}

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const eligibilityCache = new Map<string, CacheEntry>();

function getCached(projectId: string): EligibilityResult | null {
  const entry = eligibilityCache.get(projectId);
  if (!entry) return null;
  if (Date.now() - entry.cachedAt > CACHE_TTL_MS) {
    eligibilityCache.delete(projectId);
    return null;
  }
  return entry.result;
}

function setCached(projectId: string, result: EligibilityResult): void {
  eligibilityCache.set(projectId, { result, cachedAt: Date.now() });
}

// ============================================================================
// HOOK
// ============================================================================

export function useEligibility(): UseEligibilityReturn {
  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setResult(null);
    setLoading(false);
    setError(null);
  }, []);

  const checkEligibility = useCallback(async (projectId: string): Promise<void> => {
    if (!projectId) {
      setError('A project must be selected before checking eligibility.');
      return;
    }

    // Return cached result if still fresh
    const cached = getCached(projectId);
    if (cached) {
      setResult(cached);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/programs/eligible', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId }),
      });

      if (response.status === 404) {
        throw new Error(
          'Project not found. It may have been deleted or you may not have access to it.'
        );
      }

      if (response.status >= 500) {
        throw new Error(
          'The eligibility engine encountered an error. Please try again in a moment.'
        );
      }

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null) as
          | { error?: string }
          | null;
        throw new Error(
          errorBody?.error ??
            `Eligibility check failed (${response.status}). Please try again.`
        );
      }

      const data: EligibilityResult = await response.json();
      setCached(projectId, data);
      setResult(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to check eligibility. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { result, loading, error, checkEligibility, reset };
}
