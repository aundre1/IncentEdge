'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  SlidersHorizontal,
  Landmark,
  MapPin,
  ExternalLink,
  Bookmark,
  ChevronDown,
  X,
  Sparkles,
  LayoutGrid,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import { FreshnessBadge } from '@/components/ui/FreshnessBadge';
import { CategoryBadge } from '@/components/ui/CategoryBadge';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Incentive {
  id: number;
  title: string;
  agency: string;
  program_type: string;
  state: string;
  funding_amount: number;
  category: string;
  source: string;
  description?: string;
}

interface SemanticSearchResult {
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

interface SemanticSearchResponse {
  results: SemanticSearchResult[];
  query: string;
  total: number;
  searchTime: number;
  timestamp: string;
}

type SearchMode = 'ai' | 'browse';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

const CATEGORIES = [
  'Tax Credit',
  'Rebate',
  'Grant',
  'Loan',
  'Property Tax',
  'Other',
];

const PROGRAM_LEVELS = [
  { value: 'federal', label: 'Federal', color: 'bg-blue-700' },
  { value: 'state',   label: 'State',   color: 'bg-blue-600' },
  { value: 'local',   label: 'Local',   color: 'bg-blue-500' },
  { value: 'utility', label: 'Utility', color: 'bg-blue-400' },
];

// Placeholder date used until real `last_verified` data is available
const STALE_PLACEHOLDER_DATE = new Date('2025-01-01');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(value: number | undefined | null): string {
  if (!value) return 'Varies';
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${value}`;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SkeletonCard() {
  return (
    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 animate-pulse">
          <div className="flex items-start gap-3 flex-1">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
              <div className="flex gap-2 mt-2">
                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-full w-20" />
                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-full w-14" />
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16" />
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ConfidenceBarProps {
  score: number; // 0-1
}

function ConfidenceBar({ score }: ConfidenceBarProps) {
  const pct = Math.round(score * 100);
  const barColor =
    pct >= 75 ? 'bg-blue-500' : pct >= 50 ? 'bg-blue-400' : 'bg-slate-400';

  return (
    <div className="flex items-center gap-1.5" title={`AI confidence: ${pct}%`}>
      <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-slate-400 tabular-nums">{pct}%</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function DiscoverPage() {
  // Shared state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mode: 'ai' when query is entered, 'browse' otherwise
  const [searchMode, setSearchMode] = useState<SearchMode>('browse');

  // Browse-mode state (Supabase direct)
  const [incentives, setIncentives] = useState<Incentive[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  // AI-mode state (semantic search)
  const [semanticResults, setSemanticResults] = useState<SemanticSearchResult[]>([]);
  const [semanticTotal, setSemanticTotal] = useState(0);
  const [searchTimeMs, setSearchTimeMs] = useState<number | null>(null);
  const [fallbackActive, setFallbackActive] = useState(false);

  const hasFilters = searchQuery || selectedState || selectedCategory;

  // ------------------------------------------------------------------
  // Derived: switch mode whenever searchQuery changes
  // ------------------------------------------------------------------
  useEffect(() => {
    if (searchQuery.trim()) {
      setSearchMode('ai');
    } else {
      setSearchMode('browse');
      setSemanticResults([]);
      setSearchTimeMs(null);
      setFallbackActive(false);
    }
  }, [searchQuery]);

  // ------------------------------------------------------------------
  // Browse mode — Supabase direct query (unchanged from original)
  // ------------------------------------------------------------------
  const browseIncentives = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    let query = supabase
      .from('incentive_awards')
      .select('*', { count: 'exact' });

    if (selectedState) {
      query = query.eq('state', selectedState);
    }
    if (selectedCategory) {
      query = query.eq('category', selectedCategory);
    }

    query = query.limit(50);

    const { data, error, count } = await query;

    if (!error && data) {
      setIncentives(data as Incentive[]);
      setTotalCount(count ?? 0);
    } else {
      console.error('Error fetching incentives:', error);
      setIncentives([]);
    }

    setLoading(false);
  }, [selectedState, selectedCategory]);

  // ------------------------------------------------------------------
  // AI mode — semantic search API
  // ------------------------------------------------------------------
  const semanticSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setFallbackActive(false);

    try {
      const response = await fetch('/api/programs/search/semantic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery.trim(),
          ...(selectedState ? { location: selectedState } : {}),
          maxResults: 30,
        }),
      });

      if (!response.ok) {
        throw new Error(`Semantic search returned ${response.status}`);
      }

      const data: SemanticSearchResponse = await response.json();
      setSemanticResults(data.results);
      setSemanticTotal(data.total);
      setSearchTimeMs(data.searchTime);
    } catch (err) {
      console.error('Semantic search failed, falling back to Supabase:', err);
      setFallbackActive(true);
      // Fall back to direct Supabase query so the page stays useful
      const supabase = createClient();
      let query = supabase
        .from('incentive_awards')
        .select('*', { count: 'exact' })
        .or(`title.ilike.%${searchQuery}%,agency.ilike.%${searchQuery}%`);

      if (selectedState) query = query.eq('state', selectedState);
      if (selectedCategory) query = query.eq('category', selectedCategory);

      query = query.limit(50);

      const { data, count } = await query;
      if (data) {
        setIncentives(data as Incentive[]);
        setTotalCount(count ?? 0);
      }
      // Switch rendering to browse mode so we show the fallback cards
      setSearchMode('browse');
    }

    setLoading(false);
  }, [searchQuery, selectedState, selectedCategory]);

  // ------------------------------------------------------------------
  // Initial load + debounced re-fetch on filter change
  // ------------------------------------------------------------------
  useEffect(() => {
    browseIncentives();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchMode === 'ai') {
        semanticSearch();
      } else {
        browseIncentives();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedState, selectedCategory, searchMode, semanticSearch, browseIncentives]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedState('');
    setSelectedCategory('');
  };

  // ------------------------------------------------------------------
  // Result counts for status bar
  // ------------------------------------------------------------------
  const browseOverflow = searchMode === 'browse' && totalCount > 50;

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold font-sora tracking-tight text-slate-900 dark:text-white">
          Discover Incentives
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Search across {totalCount.toLocaleString()}+ incentive programs
        </p>
      </div>

      {/* Search Bar + mode toggle */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            {searchMode === 'ai' ? (
              <Sparkles className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-500" />
            ) : (
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            )}
            <Input
              placeholder="Search by program name, agency, keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
            />
          </div>

          {/* Mode toggle */}
          <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden h-12">
            <button
              onClick={() => setSearchMode('ai')}
              className={`flex items-center gap-1.5 px-3 text-sm transition-colors ${
                searchMode === 'ai'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              AI Search
            </button>
            <button
              onClick={() => setSearchMode('browse')}
              className={`flex items-center gap-1.5 px-3 text-sm transition-colors border-l border-slate-200 dark:border-slate-700 ${
                searchMode === 'browse'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Browse
            </button>
          </div>

          <Button
            variant="outline"
            className="h-12 px-4 border-slate-200 dark:border-slate-700"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters
            {hasFilters && (
              <Badge className="ml-2 bg-blue-600">
                {[selectedState, selectedCategory].filter(Boolean).length +
                  (searchQuery ? 1 : 0)}
              </Badge>
            )}
          </Button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardContent className="pt-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                    State
                  </label>
                  <Select value={selectedState} onValueChange={setSelectedState}>
                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                      <SelectValue placeholder="All States" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All States</SelectItem>
                      {STATES.map((state) => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                    Category
                  </label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="sm:col-span-2 flex items-end">
                  {hasFilters && (
                    <Button
                      variant="ghost"
                      onClick={clearFilters}
                      className="text-slate-500 hover:text-slate-700"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {PROGRAM_LEVELS.map((level) => (
            <Button
              key={level.value}
              variant="outline"
              size="sm"
              className="border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <span className={`w-2 h-2 rounded-full ${level.color} mr-2`} />
              {level.label}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="border-slate-200 dark:border-slate-700"
            onClick={() => setSelectedState('NY')}
          >
            <MapPin className="mr-1 h-3 w-3" />
            New York
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-slate-200 dark:border-slate-700"
            onClick={() => setSelectedCategory('Tax Credit')}
          >
            Tax Credits
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-slate-200 dark:border-slate-700"
            onClick={() => setSelectedCategory('Grant')}
          >
            Grants
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {/* Status bar */}
        <div className="flex items-center justify-between">
          {loading ? (
            <p className="text-sm text-slate-500">Searching...</p>
          ) : (
            <p className="text-sm text-slate-500 flex items-center gap-2">
              {searchMode === 'ai' && !fallbackActive ? (
                <>
                  <span>
                    {semanticTotal} result{semanticTotal !== 1 ? 's' : ''}
                    {searchTimeMs !== null && (
                      <> &middot; {searchTimeMs}ms &middot; <span className="text-blue-500">AI&#8209;powered</span></>
                    )}
                  </span>
                </>
              ) : (
                <span>
                  {incentives.length} result{incentives.length !== 1 ? 's' : ''}
                  {browseOverflow && ` of ${totalCount.toLocaleString()}`}
                </span>
              )}
              {fallbackActive && (
                <Badge
                  variant="outline"
                  className="text-xs border-amber-400 text-amber-600 dark:text-amber-400"
                >
                  Using cached results
                </Badge>
              )}
            </p>
          )}
        </div>

        {/* Loading skeleton */}
        {loading ? (
          <div className="grid gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : searchMode === 'ai' && !fallbackActive ? (
          /* ----------------------------------------------------------------
           * AI Search results
           * -------------------------------------------------------------- */
          semanticResults.length === 0 ? (
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Sparkles className="h-12 w-12 text-blue-300 dark:text-blue-700" />
                <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                  No AI results found
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Try rephrasing your query or switch to Browse mode
                </p>
                {hasFilters && (
                  <Button variant="outline" className="mt-4" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {semanticResults.map((result) => (
                <Card
                  key={result.id}
                  className="card-v41 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-500/50 transition-colors"
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Landmark className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold font-sora text-slate-900 dark:text-white truncate">
                              {result.name}
                            </h3>
                            {result.short_name && (
                              <p className="text-xs text-slate-400 dark:text-slate-500">
                                {result.short_name}
                              </p>
                            )}
                          </div>
                        </div>

                        {result.summary && (
                          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                            {result.summary}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <CategoryBadge category={result.category} />
                          {result.state && (
                            <Badge
                              variant="outline"
                              className="border-slate-200 dark:border-slate-700"
                            >
                              <MapPin className="mr-1 h-3 w-3" />
                              {result.state}
                            </Badge>
                          )}
                          {result.program_type && (
                            <Badge
                              variant="outline"
                              className="border-slate-200 dark:border-slate-700"
                            >
                              {result.program_type}
                            </Badge>
                          )}
                          <FreshnessBadge lastVerified={STALE_PLACEHOLDER_DATE} />
                        </div>

                        {/* Confidence bar */}
                        <ConfidenceBar score={result.confidence_score} />
                      </div>

                      <div className="flex flex-row lg:flex-col items-center lg:items-end gap-4 lg:gap-2">
                        <div className="text-right">
                          <p className="text-sm text-slate-500">Funding</p>
                          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(result.amount_max)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-slate-200 dark:border-slate-700"
                          >
                            <Bookmark className="h-4 w-4" />
                          </Button>
                          <Link href={`/discover/${result.id}`}>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                              View Details
                              <ExternalLink className="ml-1 h-3 w-3" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        ) : /* ----------------------------------------------------------------
             * Browse mode results (Supabase direct)
             * -------------------------------------------------------------- */
        incentives.length === 0 ? (
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="h-12 w-12 text-slate-300 dark:text-slate-600" />
              <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                No incentives found
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Try adjusting your search or filters
              </p>
              {hasFilters && (
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {incentives.map((incentive) => (
              <Card
                key={incentive.id}
                className="card-v41 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-500/50 transition-colors"
              >
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <Landmark className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold font-sora text-slate-900 dark:text-white truncate">
                            {incentive.title}
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {incentive.agency}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <CategoryBadge category={incentive.category || 'Other'} />
                        {incentive.state && (
                          <Badge
                            variant="outline"
                            className="border-slate-200 dark:border-slate-700"
                          >
                            <MapPin className="mr-1 h-3 w-3" />
                            {incentive.state}
                          </Badge>
                        )}
                        {incentive.program_type && (
                          <Badge
                            variant="outline"
                            className="border-slate-200 dark:border-slate-700"
                          >
                            {incentive.program_type}
                          </Badge>
                        )}
                        <FreshnessBadge lastVerified={STALE_PLACEHOLDER_DATE} />
                      </div>
                    </div>

                    <div className="flex flex-row lg:flex-col items-center lg:items-end gap-4 lg:gap-2">
                      <div className="text-right">
                        <p className="text-sm text-slate-500">Funding</p>
                        <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(incentive.funding_amount)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-200 dark:border-slate-700"
                        >
                          <Bookmark className="h-4 w-4" />
                        </Button>
                        <Link href={`/discover/${incentive.id}`}>
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            View Details
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Load More — browse mode only */}
        {searchMode === 'browse' && incentives.length > 0 && incentives.length < totalCount && (
          <div className="text-center pt-4">
            <Button variant="outline" className="border-slate-200 dark:border-slate-700">
              Load More Results
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
