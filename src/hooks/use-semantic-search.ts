'use client';

import { useState, useRef, useCallback } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface SemanticSearchOptions {
  location?: string;
  technologies?: string[];
  maxResults?: number;
  minConfidence?: number;
  debounceMs?: number;
}

export interface SemanticSearchResult {
  id: string;
  name: string;
  short_name?: string;
  category: string;
  program_type: string;
  summary?: string;
  amount_max?: number;
  amount_type?: string;
  state?: string;
  status: string;
  confidence_score: number;
  semantic_score: number;
  keyword_score: number;
  rank: number;
  citations?: {
    query_match_fields: string[];
    semantic_similarity: number;
  };
}

interface SemanticSearchApiResponse {
  results: SemanticSearchResult[];
  total: number;
  searchTime: number;
  query: string;
  timestamp: string;
}

export interface UseSemanticSearchReturn {
  results: SemanticSearchResult[];
  loading: boolean;
  error: string | null;
  total: number;
  searchTime: number;
  search: (query: string) => void;
  clear: () => void;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState = {
  results: [] as SemanticSearchResult[],
  loading: false,
  error: null as string | null,
  total: 0,
  searchTime: 0,
};

// ============================================================================
// HOOK
// ============================================================================

export function useSemanticSearch(
  options?: SemanticSearchOptions
): UseSemanticSearchReturn {
  const {
    location,
    technologies,
    maxResults,
    minConfidence,
    debounceMs = 400,
  } = options ?? {};

  const [results, setResults] = useState<SemanticSearchResult[]>(
    initialState.results
  );
  const [loading, setLoading] = useState(initialState.loading);
  const [error, setError] = useState<string | null>(initialState.error);
  const [total, setTotal] = useState(initialState.total);
  const [searchTime, setSearchTime] = useState(initialState.searchTime);

  // Refs for debounce timer and AbortController so they persist across renders
  // without triggering re-renders themselves
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const clear = useCallback(() => {
    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    // Clear any pending debounce
    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    setResults(initialState.results);
    setLoading(initialState.loading);
    setError(initialState.error);
    setTotal(initialState.total);
    setSearchTime(initialState.searchTime);
  }, []);

  const executeSearch = useCallback(
    async (query: string) => {
      // Cancel any previous in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        const body: Record<string, unknown> = { query };
        if (location !== undefined) body.location = location;
        if (technologies !== undefined) body.technologies = technologies;
        if (maxResults !== undefined) body.maxResults = maxResults;
        if (minConfidence !== undefined) body.minConfidence = minConfidence;

        const response = await fetch('/api/programs/search/semantic', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => response.statusText);
          throw new Error(
            `Search failed (${response.status}): ${errorText}`
          );
        }

        const data: SemanticSearchApiResponse = await response.json();

        setResults(data.results ?? []);
        setTotal(data.total ?? 0);
        setSearchTime(data.searchTime ?? 0);
      } catch (err) {
        // AbortError is expected when a new search cancels an old one — ignore it
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        const message =
          err instanceof Error ? err.message : 'Search failed. Please try again.';
        setError(message);
        setResults([]);
        setTotal(0);
      } finally {
        // Only clear loading if this controller is still the active one
        if (abortControllerRef.current === controller) {
          setLoading(false);
        }
      }
    },
    [location, technologies, maxResults, minConfidence]
  );

  const search = useCallback(
    (query: string) => {
      // Clear any pending debounce timer
      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      if (!query.trim()) {
        // Empty query → clear results immediately without making a request
        clear();
        return;
      }

      debounceTimerRef.current = setTimeout(() => {
        debounceTimerRef.current = null;
        void executeSearch(query);
      }, debounceMs);
    },
    [clear, executeSearch, debounceMs]
  );

  return { results, loading, error, total, searchTime, search, clear };
}
