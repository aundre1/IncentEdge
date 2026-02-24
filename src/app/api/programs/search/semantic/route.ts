/**
 * Semantic Search API Endpoint
 *
 * Performs hybrid semantic + keyword search on incentive programs with:
 * - Vector similarity matching (Anthropic embeddings)
 * - Full-text keyword search (Supabase FTS)
 * - Weighted re-ranking (configurable semantic/keyword weights)
 * - Geographic and technology filtering
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
 *   "searchTime": 245
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { HybridSearchEngine, HybridSearchOptions } from '@/lib/knowledge-index';
import { sanitizeSearchTerm } from '@/lib/security/input-sanitizer';

const CACHE_MAX_AGE = 300; // 5 minutes for semantic search
const MAX_RESULTS = 100;
const MIN_CONFIDENCE = 0.2;

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
    if (!sanitized.valid) {
      return NextResponse.json(
        {
          error: 'Invalid search query',
          details: sanitized.error,
        },
        { status: 400 }
      );
    }

    // Validate result limit
    const limit = Math.min(Math.max(parseInt(maxResults) || 20, 1), MAX_RESULTS);

    // Initialize search engine
    const supabase = await createClient();
    const searchEngine = new HybridSearchEngine(supabase);

    // Prepare search options
    const searchOptions: HybridSearchOptions = {
      query: sanitized.value,
      location: location ? sanitizeLocation(location) : undefined,
      technologies: Array.isArray(technologies) ? technologies.filter((t) => typeof t === 'string') : undefined,
      maxResults: limit,
      minConfidence,
      weights: weights && typeof weights === 'object' ? weights : undefined,
    };

    // Execute hybrid search
    const results = await searchEngine.search(searchOptions);

    const searchTime = Date.now() - startTime;

    return NextResponse.json(
      {
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
      },
      {
        status: 200,
        headers: {
          'Cache-Control': `public, s-maxage=${CACHE_MAX_AGE}`,
          'X-Response-Time': `${searchTime}ms`,
          'X-Results-Count': String(results.length),
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
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

/**
 * GET endpoint for quick semantic search with query parameters
 * Useful for simple use cases where POST is overkill
 */
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
    if (!sanitized.valid) {
      return NextResponse.json(
        {
          error: 'Invalid search query',
          details: sanitized.error,
        },
        { status: 400 }
      );
    }

    // Validate result limit
    const limit = Math.min(Math.max(parseInt(maxResults) || 20, 1), MAX_RESULTS);

    // Initialize search engine
    const supabase = await createClient();
    const searchEngine = new HybridSearchEngine(supabase);

    // Prepare search options
    const searchOptions: HybridSearchOptions = {
      query: sanitized.value,
      location: location ? sanitizeLocation(location) : undefined,
      technologies: technologies && technologies.length > 0 ? technologies : undefined,
      maxResults: limit,
      minConfidence: Math.min(Math.max(parseFloat(minConfidence), 0), 1),
    };

    // Execute hybrid search
    const results = await searchEngine.search(searchOptions);

    const searchTime = Date.now() - startTime;

    return NextResponse.json(
      {
        results,
        query: sanitized.value,
        filters: {
          location,
          technologies,
        },
        total: results.length,
        searchTime,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          'Cache-Control': `public, s-maxage=${CACHE_MAX_AGE}`,
          'X-Response-Time': `${searchTime}ms`,
          'X-Results-Count': String(results.length),
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
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

/**
 * OPTIONS handler for CORS preflight
 */
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

/**
 * Sanitize location parameter (should be 2-letter state code or similar)
 */
function sanitizeLocation(location: string): string {
  // Allow 2-letter state codes and simple location strings
  return location.toUpperCase().slice(0, 2).replace(/[^A-Z]/g, '');
}
