/**
 * Semantic Search API Endpoint
 *
 * Performs hybrid semantic + keyword search on incentive programs with:
 * - Vector similarity matching (Anthropic embeddings)
 * - Full-text keyword search (Supabase FTS)
 * - Weighted re-ranking (configurable semantic/keyword weights)
 * - Geographic and technology filtering
 * - 9-second timeout with keyword-only fallback
 * - In-memory result caching (5-minute TTL)
 *
 * POST /api/programs/search/semantic
 * {
 *   "query": "solar energy credits",
 *   "location": "NY",
 *   "technologies": ["solar"],
 *   "maxResults": 20,
 *   "weights": { "semantic": 0.6, "keyword": 0.4 }
 * }
 *
 * Response:
 * {
 *   "results": [{ id, name, confidence_score, rank, citations: {...} }, ...],
 *   "query": "...",
 *   "filters": { location, technologies },
 *   "total": 15,
 *   "searchTime": 245,
 *   "cached": false,     // true when served from in-memory cache
 *   "degraded": false    // true when semantic search timed out and fell back to keyword
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { HybridSearchEngine, HybridSearchOptions } from '@/lib/knowledge-index';
import { sanitizeSearchTerm } from '@/lib/security/input-sanitizer';
import { searchCache } from '@/lib/cache';

const CACHE_MAX_AGE = 300; // 5 minutes for semantic search
const MAX_RESULTS = 100;
const MIN_CONFIDENCE = 0.2;
const SEARCH_TIMEOUT_MS = 9000; // 9 seconds — keeps us under Vercel's 10s limit

// ---------------------------------------------------------------------------
// Keyword fallback — direct Supabase query used when semantic search times out
// ---------------------------------------------------------------------------

interface FallbackResult {
  id: string;
  name: string;
  short_name: string | null;
  category: string | null;
  program_type: string | null;
  summary: string | null;
  amount_max: number | null;
  amount_type: string | null;
  state: string | null;
  status: string;
  semantic_score: number;
  keyword_score: number;
  confidence_score: number;
  rank: number;
}

async function keywordFallback(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  query: string,
  location?: string,
  limit = 20
): Promise<FallbackResult[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let dbQuery = supabase
    .from('incentive_programs')
    .select(
      'id, name, short_name, category, program_type, summary, amount_max, amount_type, state, status'
    )
    .eq('status', 'active');

  if (location) {
    dbQuery = dbQuery.or(`state.eq.${location},state.is.null`);
  }

  if (query.trim()) {
    dbQuery = dbQuery.textSearch('fts', query.trim(), {
      type: 'websearch',
      config: 'english',
    });
  }

  dbQuery = dbQuery
    .order('popularity_score', { ascending: false })
    .limit(limit);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await dbQuery;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data || []).map((r: any, i: number) => ({
    ...r,
    semantic_score: 0,
    keyword_score: 0.5,
    confidence_score: 0.5,
    rank: i + 1,
  }));
}

// ---------------------------------------------------------------------------
// Timeout wrapper
// ---------------------------------------------------------------------------

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Search timed out after ${ms}ms`)), ms)
    ),
  ]);
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Parse and validate request body
    const body = await request.json();
    const { query, location, technologies, maxResults = 20, minConfidence = MIN_CONFIDENCE, weights } = body;

    // Validate inputs
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: 'query parameter is required and must be a non-empty string',
        },
        { status: 400 }
      );
    }

    // Sanitize search term
    const sanitized = sanitizeSearchTerm(query.trim());

    // Validate result limit
    const limit = Math.min(Math.max(parseInt(maxResults) || 20, 1), MAX_RESULTS);

    const sanitizedLocation = location ? sanitizeLocation(location) : undefined;

    // Check cache before executing search
    const cacheKey = `search:${sanitized.value}:${sanitizedLocation || ''}:${limit}`;
    const cached = searchCache.get(cacheKey);
    if (cached !== null) {
      const searchTime = Date.now() - startTime;
      const cachedPayload = cached as Record<string, unknown>;
      return NextResponse.json(
        {
          ...cachedPayload,
          cached: true,
          searchTime,
        },
        {
          status: 200,
          headers: {
            'Cache-Control': `public, s-maxage=${CACHE_MAX_AGE}`,
            'X-Response-Time': `${searchTime}ms`,
            'X-Cache': 'HIT',
            'X-Results-Count': String((cachedPayload.results as unknown[])?.length ?? 0),
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Initialize Supabase client for both search and potential fallback
    const supabase = await createClient();
    const searchEngine = new HybridSearchEngine(supabase);

    // Prepare search options
    const searchOptions: HybridSearchOptions = {
      query: sanitized.value,
      location: sanitizedLocation,
      technologies: Array.isArray(technologies) ? technologies.filter((t) => typeof t === 'string') : undefined,
      maxResults: limit,
      minConfidence,
      weights: weights && typeof weights === 'object' ? weights : undefined,
    };

    // Execute hybrid search with timeout; fall back to keyword-only on timeout
    let results: unknown[];
    let degraded = false;

    try {
      results = await withTimeout(searchEngine.search(searchOptions), SEARCH_TIMEOUT_MS);
    } catch (timeoutError) {
      console.warn(
        'Semantic search timed out — falling back to keyword search:',
        timeoutError instanceof Error ? timeoutError.message : timeoutError
      );
      results = await keywordFallback(supabase, sanitized.value, sanitizedLocation, limit);
      degraded = true;
    }

    const searchTime = Date.now() - startTime;

    const responsePayload = {
      results,
      query: sanitized.value,
      filters: {
        location,
        technologies,
        minConfidence,
      },
      total: results.length,
      searchTime,
      timestamp: new Date().toISOString(),
      cached: false,
      degraded,
    };

    // Store in cache (only successful, non-degraded results get a full 5-min TTL;
    // degraded results are cached for 60 seconds to avoid hammering the DB)
    const cacheTtlMs = degraded ? 60_000 : 5 * 60 * 1000;
    searchCache.set(cacheKey, responsePayload, cacheTtlMs);

    return NextResponse.json(responsePayload, {
      status: 200,
      headers: {
        'Cache-Control': `public, s-maxage=${CACHE_MAX_AGE}`,
        'X-Response-Time': `${searchTime}ms`,
        'X-Cache': 'MISS',
        'X-Results-Count': String(results.length),
        'X-Degraded': String(degraded),
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error in POST /api/programs/search/semantic:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        error: 'Search failed',
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

// ---------------------------------------------------------------------------
// GET handler — quick search via query parameters
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const url = new URL(request.url);

  try {
    const query = url.searchParams.get('q');
    const location = url.searchParams.get('location');
    const technologies = url.searchParams.getAll('technologies');
    const maxResults = url.searchParams.get('maxResults') || '20';
    const minConfidence = url.searchParams.get('minConfidence') || String(MIN_CONFIDENCE);

    // Validate query
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: 'q parameter is required',
        },
        { status: 400 }
      );
    }

    // Sanitize search term
    const sanitized = sanitizeSearchTerm(query.trim());

    // Validate result limit
    const limit = Math.min(Math.max(parseInt(maxResults) || 20, 1), MAX_RESULTS);

    const sanitizedLocation = location ? sanitizeLocation(location) : undefined;

    // Check cache before executing search
    const cacheKey = `search:${sanitized.value}:${sanitizedLocation || ''}:${limit}`;
    const cached = searchCache.get(cacheKey);
    if (cached !== null) {
      const searchTime = Date.now() - startTime;
      const cachedPayload = cached as Record<string, unknown>;
      return NextResponse.json(
        {
          ...cachedPayload,
          cached: true,
          searchTime,
        },
        {
          status: 200,
          headers: {
            'Cache-Control': `public, s-maxage=${CACHE_MAX_AGE}`,
            'X-Response-Time': `${searchTime}ms`,
            'X-Cache': 'HIT',
            'X-Results-Count': String((cachedPayload.results as unknown[])?.length ?? 0),
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Initialize search engine
    const supabase = await createClient();
    const searchEngine = new HybridSearchEngine(supabase);

    // Prepare search options
    const searchOptions: HybridSearchOptions = {
      query: sanitized.value,
      location: sanitizedLocation,
      technologies: technologies && technologies.length > 0 ? technologies : undefined,
      maxResults: limit,
      minConfidence: Math.min(Math.max(parseFloat(minConfidence), 0), 1),
    };

    // Execute hybrid search with timeout; fall back to keyword-only on timeout
    let results: unknown[];
    let degraded = false;

    try {
      results = await withTimeout(searchEngine.search(searchOptions), SEARCH_TIMEOUT_MS);
    } catch (timeoutError) {
      console.warn(
        'Semantic search timed out — falling back to keyword search:',
        timeoutError instanceof Error ? timeoutError.message : timeoutError
      );
      results = await keywordFallback(supabase, sanitized.value, sanitizedLocation, limit);
      degraded = true;
    }

    const searchTime = Date.now() - startTime;

    const responsePayload = {
      results,
      query: sanitized.value,
      filters: {
        location,
        technologies,
      },
      total: results.length,
      searchTime,
      timestamp: new Date().toISOString(),
      cached: false,
      degraded,
    };

    // Store in cache
    const cacheTtlMs = degraded ? 60_000 : 5 * 60 * 1000;
    searchCache.set(cacheKey, responsePayload, cacheTtlMs);

    return NextResponse.json(responsePayload, {
      status: 200,
      headers: {
        'Cache-Control': `public, s-maxage=${CACHE_MAX_AGE}`,
        'X-Response-Time': `${searchTime}ms`,
        'X-Cache': 'MISS',
        'X-Results-Count': String(results.length),
        'X-Degraded': String(degraded),
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error in GET /api/programs/search/semantic:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        error: 'Search failed',
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

// ---------------------------------------------------------------------------
// OPTIONS — CORS preflight
// ---------------------------------------------------------------------------

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Sanitize location parameter (should be 2-letter state code or similar)
 */
function sanitizeLocation(location: string): string {
  // Allow 2-letter state codes and simple location strings
  return location.toUpperCase().slice(0, 2).replace(/[^A-Z]/g, '');
}
