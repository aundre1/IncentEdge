'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2, ArrowRight, Building2, Landmark, MapPin, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  name: string;
  short_name: string;
  category: 'federal' | 'state' | 'local' | 'utility';
  program_type: string;
  summary: string;
  state: string | null;
  amount_max?: number;
  amount_percentage?: number;
  amount_type?: string;
}

const categoryIcons = {
  federal: Landmark,
  state: Building2,
  local: MapPin,
  utility: Zap,
};

const categoryColors = {
  federal: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30',
  state: 'text-teal-600 bg-teal-50 dark:text-teal-400 dark:bg-teal-900/30',
  local: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/30',
  utility: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/30',
};

const categoryLabels = {
  federal: 'Federal',
  state: 'State',
  local: 'Local',
  utility: 'Utility',
};

interface IncentiveSearchAutocompleteProps {
  variant?: 'hero' | 'header' | 'inline';
  placeholder?: string;
  className?: string;
  onSelect?: (result: SearchResult) => void;
  maxResults?: number;
}

export function IncentiveSearchAutocomplete({
  variant = 'inline',
  placeholder = 'Search incentives — try "NYSERDA", "45L", or "solar"...',
  className,
  onSelect,
  maxResults = 8,
}: IncentiveSearchAutocompleteProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const debounceRef = React.useRef<NodeJS.Timeout | null>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search with debounce
  React.useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim() || query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/programs/search?q=${encodeURIComponent(query.trim())}&limit=${maxResults}`
        );
        const data = await res.json();
        setResults(data.results || []);
        setIsOpen(true);
        setSelectedIndex(-1);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, maxResults]);

  const handleSelect = (result: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    if (onSelect) {
      onSelect(result);
    } else {
      router.push(`/discover/${result.id}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        } else if (query.trim()) {
          router.push(`/discover?search=${encodeURIComponent(query.trim())}`);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const formatAmount = (result: SearchResult) => {
    if (result.amount_percentage) return `${result.amount_percentage}%`;
    if (result.amount_max) {
      if (result.amount_max >= 1000000) return `$${(result.amount_max / 1000000).toFixed(1)}M`;
      if (result.amount_max >= 1000) return `$${(result.amount_max / 1000).toFixed(0)}K`;
      return `$${result.amount_max.toLocaleString()}`;
    }
    return null;
  };

  const variantClasses = {
    hero: 'h-14 text-base rounded-xl border-2 border-deep-200 dark:border-teal-500/20 bg-white dark:bg-deep-900 shadow-lg',
    header: 'h-10 text-sm rounded-lg border border-deep-200 dark:border-teal-500/20 bg-white/90 dark:bg-deep-800',
    inline: 'h-11 text-sm rounded-lg border border-deep-200 dark:border-teal-500/20 bg-white dark:bg-deep-900',
  };

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {/* Input */}
      <div className={cn('relative flex items-center', variantClasses[variant])}>
        <Search className={cn(
          'absolute left-3 text-sage-400',
          variant === 'hero' ? 'h-5 w-5' : 'h-4 w-4'
        )} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className={cn(
            'w-full h-full bg-transparent outline-none placeholder:text-sage-400 text-deep-900 dark:text-deep-100',
            variant === 'hero' ? 'pl-11 pr-10' : 'pl-9 pr-8'
          )}
        />
        {loading && (
          <Loader2 className={cn(
            'absolute right-3 animate-spin text-teal-500',
            variant === 'hero' ? 'h-5 w-5' : 'h-4 w-4'
          )} />
        )}
        {!loading && query && (
          <button
            onClick={() => { setQuery(''); setResults([]); setIsOpen(false); }}
            className="absolute right-3 text-sage-400 hover:text-deep-600 dark:hover:text-deep-200"
          >
            <X className={variant === 'hero' ? 'h-5 w-5' : 'h-4 w-4'} />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-deep-200 dark:border-teal-500/20 bg-white dark:bg-deep-900 shadow-xl overflow-hidden">
          <div className="px-3 py-2 text-[11px] font-mono uppercase tracking-wider text-sage-500 border-b border-deep-100 dark:border-teal-500/10">
            {results.length} result{results.length !== 1 ? 's' : ''} — one at a time
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {results.map((result, index) => {
              const Icon = categoryIcons[result.category] || Landmark;
              const colorClass = categoryColors[result.category] || categoryColors.federal;
              const amount = formatAmount(result);

              return (
                <button
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors',
                    selectedIndex === index
                      ? 'bg-teal-50 dark:bg-teal-900/20'
                      : 'hover:bg-deep-50 dark:hover:bg-deep-800'
                  )}
                >
                  <div className={cn('mt-0.5 rounded-md p-1.5', colorClass)}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-deep-900 dark:text-deep-100 truncate text-sm">
                        {result.short_name || result.name}
                      </span>
                      <span className={cn(
                        'shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide',
                        colorClass
                      )}>
                        {categoryLabels[result.category]}
                      </span>
                      {result.state && (
                        <span className="shrink-0 text-[10px] font-mono text-sage-500">
                          {result.state}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-sage-500 dark:text-sage-400 line-clamp-1 mt-0.5">
                      {result.summary}
                    </p>
                  </div>
                  {amount && (
                    <div className="shrink-0 text-right">
                      <span className="text-sm font-mono font-semibold text-teal-600 dark:text-teal-400">
                        {amount}
                      </span>
                      {result.amount_type && (
                        <div className="text-[10px] text-sage-500">
                          {result.amount_type === 'per_unit' ? '/unit' :
                           result.amount_type === 'per_sqft' ? '/sqft' :
                           result.amount_type === 'percentage' ? 'credit' : ''}
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          {query.trim() && (
            <button
              onClick={() => {
                router.push(`/discover?search=${encodeURIComponent(query.trim())}`);
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-teal-600 dark:text-teal-400 border-t border-deep-100 dark:border-teal-500/10 hover:bg-teal-50 dark:hover:bg-teal-900/10 transition-colors"
            >
              View all results for &ldquo;{query}&rdquo;
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {/* No results */}
      {isOpen && query.length >= 2 && !loading && results.length === 0 && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-deep-200 dark:border-teal-500/20 bg-white dark:bg-deep-900 shadow-xl p-6 text-center">
          <Search className="mx-auto h-8 w-8 text-sage-300 mb-2" />
          <p className="text-sm text-deep-600 dark:text-deep-300">
            No incentives found for &ldquo;{query}&rdquo;
          </p>
          <p className="text-xs text-sage-500 mt-1">
            Try &ldquo;NYSERDA&rdquo;, &ldquo;45L&rdquo;, &ldquo;solar&rdquo;, or a state abbreviation
          </p>
        </div>
      )}
    </div>
  );
}
