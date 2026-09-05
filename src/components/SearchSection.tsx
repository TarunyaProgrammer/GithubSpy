import React, { useState } from 'react';
import { Search, Loader2, ArrowRight, Sparkles, X } from 'lucide-react';
import type { TimeFilter } from '../types';

interface SearchSectionProps {
  onSearch: (repoUrl: string, filter: TimeFilter) => void;
  loading: boolean;
  loadingProgress?: string;
  initialQuery?: string;
  timeFilter: TimeFilter;
  onTimeFilterChange: (filter: TimeFilter) => void;
}

const PRESET_REPOS = [
  { label: 'Zulip', value: 'zulip/zulip' },
  { label: 'React', value: 'facebook/react' },
  { label: 'Django', value: 'django/django' },
  { label: 'SymPy', value: 'sympy/sympy' },
  { label: 'Flask', value: 'pallets/flask' },
  { label: 'Vite', value: 'vitejs/vite' },
];

const TIME_FILTERS: { label: string; value: TimeFilter }[] = [
  { label: '2 Weeks', value: '2w' },
  { label: '1 Month', value: '1m' },
  { label: '3 Months', value: '3m' },
  { label: '6 Months', value: '6m' },
  { label: 'All Time', value: 'all' },
];

export const SearchSection: React.FC<SearchSectionProps> = ({
  onSearch,
  loading,
  loadingProgress,
  initialQuery = '',
  timeFilter,
  onTimeFilterChange,
}) => {
  const [inputVal, setInputVal] = useState(initialQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    onSearch(inputVal.trim(), timeFilter);
  };

  const handlePresetClick = (val: string) => {
    setInputVal(val);
    onSearch(val, timeFilter);
  };

  return (
    <section className="w-full pt-8 pb-4" aria-label="Repository search and filters">
      <div className="max-w-3xl mx-auto text-center space-y-4">
        {/* Direct Tagline with Outfit luxury display font */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Repository PR & Contributor Intelligence
          </h1>
          <p className="mt-2 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 font-sans">
            Uncover merge turnaround velocity, active maintainers, and GSoC applicant competition.
          </p>
        </div>

        {/* Search Bar Form */}
        <form onSubmit={handleSubmit} className="mt-6" role="search">
          <label htmlFor="repo-search-input" className="sr-only">
            GitHub Repository URL or owner/repo format
          </label>
          <div className="flex flex-col sm:flex-row items-stretch gap-2.5 p-1.5 rounded-2xl bg-white dark:bg-obsidian-900 border border-zinc-200/90 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
            <div className="flex-1 flex items-center px-3.5 gap-2.5">
              <Search className="w-5 h-5 text-zinc-400 flex-shrink-0" />
              <input
                id="repo-search-input"
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Enter repo (e.g. facebook/react or github.com/owner/repo)"
                className="w-full bg-transparent py-2.5 text-sm sm:text-base text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none font-mono"
                disabled={loading}
                autoComplete="off"
                spellCheck="false"
              />
              {inputVal && !loading && (
                <button
                  type="button"
                  onClick={() => setInputVal('')}
                  aria-label="Clear search input"
                  className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !inputVal.trim()}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-600 text-white text-sm font-semibold shadow-md shadow-brand-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-brand-500/35 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <span>Inspect</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Time Filter Pills & Presets Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs">
          {/* Time Filter Pills */}
          <div
            className="flex items-center gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60"
            role="group"
            aria-label="Filter by time period"
          >
            {TIME_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => {
                  onTimeFilterChange(f.value);
                  if (inputVal.trim()) {
                    onSearch(inputVal.trim(), f.value);
                  }
                }}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  timeFilter === f.value
                    ? 'bg-white dark:bg-obsidian-900 text-brand-600 dark:text-brand-400 shadow-xs font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 flex-wrap justify-center" aria-label="Popular repository presets">
            <span className="text-zinc-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-champagne-500" /> Presets:
            </span>
            {PRESET_REPOS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => handlePresetClick(preset.value)}
                disabled={loading}
                className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-brand-600 dark:hover:text-brand-400 transition-colors font-mono"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading status text */}
        {loading && loadingProgress && (
          <div
            className="pt-2 flex items-center justify-center gap-2 text-xs font-mono text-brand-600 dark:text-brand-400 animate-pulse"
            aria-live="polite"
          >
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>{loadingProgress}</span>
          </div>
        )}
      </div>
    </section>
  );
};
