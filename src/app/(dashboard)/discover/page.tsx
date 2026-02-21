'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Landmark,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  ExternalLink,
  Bookmark,
  ChevronDown,
  X,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

const STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const CATEGORIES = [
  'Tax Credit',
  'Rebate',
  'Grant',
  'Loan',
  'Property Tax',
  'Other'
];

const PROGRAM_LEVELS = [
  { value: 'federal', label: 'Federal', color: 'bg-blue-700' },
  { value: 'state', label: 'State', color: 'bg-blue-600' },
  { value: 'local', label: 'Local', color: 'bg-blue-500' },
  { value: 'utility', label: 'Utility', color: 'bg-blue-400' },
];

function formatCurrency(value: number) {
  if (!value) return 'Varies';
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${value}`;
}

function getCategoryColor(category: string) {
  switch (category?.toLowerCase()) {
    case 'tax credit': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    case 'grant': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    case 'rebate': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
    case 'loan': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    case 'property tax': return 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20';
    default: return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
  }
}

export default function DiscoverPage() {
  const [incentives, setIncentives] = useState<Incentive[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [totalCount, setTotalCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch incentives from the database
  async function searchIncentives() {
    setLoading(true);
    const supabase = createClient();

    // Try incentive_awards table first (the actual data)
    let query = supabase
      .from('incentive_awards')
      .select('*', { count: 'exact' });

    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,agency.ilike.%${searchQuery}%`);
    }
    if (selectedState) {
      query = query.eq('state', selectedState);
    }
    if (selectedCategory) {
      query = query.eq('category', selectedCategory);
    }

    query = query.limit(50);

    const { data, error, count } = await query;

    if (!error && data) {
      setIncentives(data);
      setTotalCount(count || 0);
    } else {
      console.error('Error fetching incentives:', error);
      setIncentives([]);
    }

    setLoading(false);
  }

  // Initial load
  useEffect(() => {
    searchIncentives();
  }, []);

  // Search on filter change
  useEffect(() => {
    const timer = setTimeout(() => {
      searchIncentives();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedState, selectedCategory]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedState('');
    setSelectedCategory('');
  };

  const hasFilters = searchQuery || selectedState || selectedCategory;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Discover Incentives
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Search across {totalCount.toLocaleString()}+ incentive programs
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by program name, agency, keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
            />
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
                {[selectedState, selectedCategory].filter(Boolean).length + (searchQuery ? 1 : 0)}
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
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {loading ? 'Searching...' : `${incentives.length} results${totalCount > 50 ? ` of ${totalCount.toLocaleString()}` : ''}`}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : incentives.length === 0 ? (
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
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={clearFilters}
                >
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
                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-500/50 transition-colors"
              >
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <Landmark className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                            {incentive.title}
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {incentive.agency}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <Badge className={getCategoryColor(incentive.category)}>
                          {incentive.category || 'Other'}
                        </Badge>
                        {incentive.state && (
                          <Badge variant="outline" className="border-slate-200 dark:border-slate-700">
                            <MapPin className="mr-1 h-3 w-3" />
                            {incentive.state}
                          </Badge>
                        )}
                        {incentive.program_type && (
                          <Badge variant="outline" className="border-slate-200 dark:border-slate-700">
                            {incentive.program_type}
                          </Badge>
                        )}
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
                        <Button variant="outline" size="sm" className="border-slate-200 dark:border-slate-700">
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

        {/* Load More */}
        {incentives.length > 0 && incentives.length < totalCount && (
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
