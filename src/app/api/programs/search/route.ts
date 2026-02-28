/**
 * Incentive Programs Search API
 *
 * Optimized search endpoint for the Discover section.
 * Supports:
 * - Full-text search
 * - State filtering
 * - Category filtering (federal, state, local, utility)
 * - Sector filtering (multifamily, commercial, etc.)
 * - Quick suggestions for autocomplete
 *
 * Usage:
 *   GET /api/programs/search?q=solar&state=NY&category=federal
 *   GET /api/programs/search?suggest=true&q=45L
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sanitizeSearchTerm, sanitizeQueryParams } from '@/lib/security/input-sanitizer';

// Cache duration in seconds (1 minute for search results)
const CACHE_MAX_AGE = 60;

// Access control: limit results for unauthenticated users
// They can browse one-by-one via autocomplete but not bulk download
const PUBLIC_MAX_RESULTS = 8;
const AUTH_MAX_RESULTS = 100;

// Popular searches for suggestions
const POPULAR_SEARCHES = [
  { term: '45L', label: 'Section 45L Tax Credit', category: 'federal' },
  { term: '179D', label: 'Section 179D Deduction', category: 'federal' },
  { term: 'ITC', label: 'Investment Tax Credit', category: 'federal' },
  { term: 'LIHTC', label: 'Low-Income Housing Tax Credit', category: 'federal' },
  { term: 'NYSERDA', label: 'NYSERDA Programs', category: 'state' },
  { term: '485-x', label: 'NYC 485-x Affordable Neighborhoods Tax Exemption', category: 'local' },
  { term: 'solar', label: 'Solar Incentives', category: 'all' },
  { term: 'affordable housing', label: 'Affordable Housing Programs', category: 'all' },
  { term: 'energy efficiency', label: 'Energy Efficiency Rebates', category: 'all' },
  { term: 'multifamily', label: 'Multifamily Programs', category: 'all' },
];

// Fallback search results for demo mode
const FALLBACK_RESULTS = [
  {
    id: 'demo-1',
    name: 'Section 45L New Energy Efficient Home Credit',
    short_name: '45L Tax Credit',
    category: 'federal',
    program_type: 'tax_credit',
    summary: 'Up to $5,000 per dwelling unit for ENERGY STAR or Zero Energy Ready homes.',
    amount_max: 5000,
    amount_type: 'per_unit',
    state: null,
    status: 'active',
    direct_pay_eligible: true,
    transferable: true,
    popularity_score: 95,
  },
  {
    id: 'demo-2',
    name: 'Section 179D Commercial Buildings Energy Efficiency Deduction',
    short_name: '179D Deduction',
    category: 'federal',
    program_type: 'tax_deduction',
    summary: 'Up to $5/sq ft for buildings meeting efficiency targets.',
    amount_max: 5.0,
    amount_type: 'per_sqft',
    state: null,
    status: 'active',
    direct_pay_eligible: true,
    transferable: false,
    popularity_score: 92,
  },
  {
    id: 'demo-3',
    name: 'Investment Tax Credit for Solar and Storage',
    short_name: 'ITC Solar',
    category: 'federal',
    program_type: 'tax_credit',
    summary: '30% tax credit for solar + storage installations.',
    amount_percentage: 30,
    amount_type: 'percentage',
    state: null,
    status: 'active',
    direct_pay_eligible: true,
    transferable: true,
    popularity_score: 98,
  },
  {
    id: 'demo-4',
    name: 'NYSERDA Clean Energy Internship Program',
    short_name: 'PON 4000',
    category: 'state',
    program_type: 'grant',
    summary: 'Up to $10,000 per intern for clean energy workforce development.',
    amount_max: 10000,
    amount_type: 'per_unit',
    state: 'NY',
    status: 'active',
    direct_pay_eligible: false,
    transferable: false,
    popularity_score: 78,
  },
  {
    id: 'demo-5',
    name: 'New York State Low-Income Housing Tax Credit',
    short_name: 'NY LIHTC',
    category: 'state',
    program_type: 'tax_credit',
    summary: 'Up to 9% annual credit for 10 years for affordable housing.',
    amount_percentage: 9,
    amount_type: 'percentage',
    state: 'NY',
    status: 'active',
    direct_pay_eligible: false,
    transferable: true,
    popularity_score: 90,
  },
  {
    id: 'demo-6',
    name: '485-x Affordable Neighborhoods for New Yorkers Tax Exemption',
    short_name: '485-x',
    category: 'local',
    program_type: 'tax_exemption',
    summary: 'Up to 40-year property tax exemption for NYC new multifamily construction with min. 25% affordable units. Active — no sunset. Replaces expired 421-a.',
    amount_percentage: 100,
    amount_type: 'percentage',
    state: 'NY',
    status: 'active',
    direct_pay_eligible: false,
    transferable: false,
    popularity_score: 88,
  },
  {
    id: 'demo-7',
    name: 'Con Edison Multifamily Energy Efficiency Program',
    short_name: 'ConEd MF EE',
    category: 'utility',
    program_type: 'rebate',
    summary: 'Up to $1,000/unit for comprehensive energy efficiency improvements.',
    amount_max: 1000,
    amount_type: 'per_unit',
    state: 'NY',
    status: 'active',
    direct_pay_eligible: false,
    transferable: false,
    popularity_score: 75,
  },
  {
    id: 'demo-8',
    name: 'Westchester County Green Building Tax Credit',
    short_name: 'Greenprint',
    category: 'local',
    program_type: 'tax_abatement',
    summary: 'Up to 10-year property tax abatement for LEED Gold+ buildings.',
    amount_percentage: 50,
    amount_type: 'percentage',
    state: 'NY',
    status: 'active',
    direct_pay_eligible: false,
    transferable: false,
    popularity_score: 65,
  },
];

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const url = new URL(request.url);

  // Parse and sanitize query parameters
  const params = sanitizeQueryParams(url.searchParams);
  const query = params.getSearchTerm('q') || '';
  const state = params.getString('state', 2);
  const category = params.getEnum('category', ['all', 'federal', 'state', 'local', 'utility']);
  const sector = params.getString('sector', 50);
  const isSuggest = params.getBoolean('suggest') === true;
  const limitRaw = params.getNumber('limit', { min: 1, max: PUBLIC_MAX_RESULTS, integer: true });
  const limit = Math.min(limitRaw || PUBLIC_MAX_RESULTS, PUBLIC_MAX_RESULTS);

  // Return suggestions for autocomplete
  if (isSuggest) {
    const suggestions = POPULAR_SEARCHES.filter(
      (s) =>
        s.term.toLowerCase().includes(query.toLowerCase()) ||
        s.label.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);

    return NextResponse.json(
      {
        suggestions,
        query,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          'Cache-Control': `public, s-maxage=${CACHE_MAX_AGE}`,
          'X-Response-Time': `${Date.now() - startTime}ms`,
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }

  try {
    const supabase = await createClient();

    // Build search query
    // Public search returns limited fields — no bulk data extraction
    let dbQuery = supabase
      .from('incentive_programs')
      .select(
        `
        id,
        name,
        short_name,
        category,
        program_type,
        summary,
        amount_max,
        amount_percentage,
        amount_type,
        state,
        status,
        popularity_score
      `,
        { count: 'exact' }
      )
      .eq('status', 'active');

    // Apply filters
    if (state) {
      dbQuery = dbQuery.or(`state.eq.${state},state.is.null`);
    }

    if (category && category !== 'all') {
      dbQuery = dbQuery.eq('category', category);
    }

    if (sector) {
      dbQuery = dbQuery.contains('sector_types', [sector]);
    }

    // Apply search using sanitized term
    if (query.trim()) {
      // Sanitize the search term to prevent SQL injection
      const sanitized = sanitizeSearchTerm(query.trim());

      // Use Supabase's text search which properly escapes the input
      dbQuery = dbQuery.textSearch('fts', sanitized.value, {
        type: 'websearch',
        config: 'english',
      });

      // Fallback to OR condition with properly escaped ILIKE if text search not available
      // Note: The % wildcards are added by the .ilike operator, not concatenated
      // Using .or() with column.ilike format prevents SQL injection
      // dbQuery = dbQuery.or(
      //   `name.ilike.%${sanitized.value}%,` +
      //   `short_name.ilike.%${sanitized.value}%,` +
      //   `summary.ilike.%${sanitized.value}%,` +
      //   `description.ilike.%${sanitized.value}%`
      // );
    }

    // Sort by popularity and apply limit
    dbQuery = dbQuery.order('popularity_score', { ascending: false }).limit(limit);

    const { data: programs, error, count } = await dbQuery;

    if (error) {
      throw error;
    }

    return NextResponse.json(
      {
        results: programs || [],
        total: count || 0,
        query,
        filters: { state, category, sector },
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          'Cache-Control': `public, s-maxage=${CACHE_MAX_AGE}`,
          'X-Response-Time': `${Date.now() - startTime}ms`,
          'X-Total-Results': String(count || 0),
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Error in GET /api/programs/search:', error);

    // Apply filters to fallback data
    let results = [...FALLBACK_RESULTS];

    if (state) {
      results = results.filter((p) => p.state === state || p.state === null);
    }

    if (category && category !== 'all') {
      results = results.filter((p) => p.category === category);
    }

    if (query.trim()) {
      const term = query.toLowerCase();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.short_name.toLowerCase().includes(term) ||
          p.summary.toLowerCase().includes(term)
      );
    }

    // Sort by popularity and limit
    results = results
      .sort((a, b) => b.popularity_score - a.popularity_score)
      .slice(0, limit);

    return NextResponse.json(
      {
        results,
        total: results.length,
        query,
        filters: { state, category, sector },
        fallback: true,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-cache',
          'X-Response-Time': `${Date.now() - startTime}ms`,
          'X-Fallback': 'true',
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
