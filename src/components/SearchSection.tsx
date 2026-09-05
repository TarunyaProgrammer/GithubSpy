import React, { useState, useEffect } from 'react';
import { Search, Loader2, ArrowRight, Sparkles, X, History, Trash2, Check } from 'lucide-react';
import { parseGitHubUrl } from '../services/github';
import { getRecentRepos, addRecentRepo, clearLocalStorageAndHistory } from '../services/history';
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
  const [recentRepos, setRecentRepos] = useState<string[]>([]);
  const [clearingStorage, setClearingStorage] = useState(false);

  useEffect(() => {
    setRecentRepos(getRecentRepos());
  }, []);

  useEffect(() => {
    if (initialQuery) {
      const parsed = parseGitHubUrl(initialQuery);
      const clean = parsed ? `${parsed.owner}/${parsed.repo}` : initialQuery;
      setInputVal(clean);
      setRecentRepos(getRecentRepos());
    }
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputVal.trim();
    if (!trimmed) return;

    // Automatically sanitize and clean the input display
    const parsed = parseGitHubUrl(trimmed);
    const cleanFullName = parsed ? `${parsed.owner}/${parsed.repo}` : trimmed;
    setInputVal(cleanFullName);
    const updated = addRecentRepo(cleanFullName);
    setRecentRepos(updated);
    onSearch(cleanFullName, timeFilter);
  };

  const handlePresetClick = (val: string) => {
    setInputVal(val);
    const updated = addRecentRepo(val);
    setRecentRepos(updated);
    onSearch(val, timeFilter);
  };

  const handleRecentClick = (val: string) => {
    setInputVal(val);
    const updated = addRecentRepo(val);
    setRecentRepos(updated);
    onSearch(val, timeFilter);
  };

  const handleClearStorage = () => {
    clearLocalStorageAndHistory();
    setRecentRepos([]);
    setClearingStorage(true);
    setTimeout(() => {
      setClearingStorage(false);
    }, 2200);
  };

  return (
    <section className="w-full pt-6 sm:pt-8 pb-3 sm:pb-4" aria-label="Repository search and filters">
      <div className="max-w-3xl mx-auto text-center space-y-3 sm:space-y-4">
        {/* Dual-Tone Architectural Headline */}
        <div className="px-2">
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-display font-bold tracking-tight leading-tight">
            <span className="text-[#161514]">Repository PR & Contributor</span>{' '}
            <span className="text-[#787571] font-medium block xs:inline">Intelligence Terminal</span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm md:text-base text-[#524E48] font-sans max-w-xl mx-auto">
            Audit merge turnaround velocity, identify genuine maintainers, and size up applicant competition.
          </p>
        </div>

        {/* Search Bar Form - Solid White Architectural Card */}
        <form onSubmit={handleSubmit} className="mt-4 sm:mt-6 px-1" role="search">
          <label htmlFor="repo-search-input" className="sr-only">
            GitHub Repository URL or owner/repo format
          </label>
          <div className="flex flex-col sm:flex-row items-stretch gap-2 p-1.5 rounded-2xl bg-white border border-[#E5E0D8] shadow-xs focus-within:border-[#EAA036] focus-within:ring-2 focus-within:ring-[#EAA036]/20 transition-all">
            <div className="flex-1 flex items-center px-3 gap-2 min-h-[44px]">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#8F8B83] flex-shrink-0" />
              <input
                id="repo-search-input"
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Enter repo (e.g. facebook/react)"
                className="w-full bg-transparent py-2 text-xs xs:text-sm sm:text-base text-[#161514] placeholder-[#8F8B83] focus:outline-none font-mono"
                disabled={loading}
                autoComplete="off"
                spellCheck="false"
              />
              {inputVal && !loading && (
                <button
                  type="button"
                  onClick={() => setInputVal('')}
                  aria-label="Clear search input"
                  className="p-1 text-[#8F8B83] hover:text-[#161514] flex-shrink-0 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !inputVal.trim()}
              className="flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 rounded-xl bg-[#EAA036] hover:bg-[#DF9126] active:bg-[#C87E18] text-[#161514] text-xs sm:text-sm font-semibold shadow-xs transition-all disabled:opacity-45 disabled:cursor-not-allowed active:scale-[0.98] min-h-[44px] sm:min-h-0"
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

        {/* Time Filter Pills & Presets Row - Bulletproof responsive layout */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-2 px-1">
          {/* Time Filter Pills - Cleanly centered on mobile/tablet, left-aligned on desktop */}
          <div className="w-full md:w-auto flex justify-center md:justify-start">
            <div
              className="flex items-center gap-1 p-1 rounded-xl bg-[#EFECE6] border border-[#E5E0D8] overflow-x-auto no-scrollbar max-w-full"
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
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all whitespace-nowrap ${
                    timeFilter === f.value
                      ? 'bg-white text-[#161514] shadow-xs font-semibold'
                      : 'text-[#65615B] hover:text-[#161514] font-medium'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Presets - Cleanly grouped so they wrap uniformly without lonely orphan buttons */}
          <div className="flex items-center justify-center md:justify-end gap-1.5 flex-wrap text-xs" aria-label="Popular repository presets">
            <span className="text-[#787571] flex items-center gap-1 text-[11px] sm:text-xs font-medium flex-shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-[#EAA036] flex-shrink-0" /> Presets:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              {PRESET_REPOS.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => handlePresetClick(preset.value)}
                  disabled={loading}
                  className="px-2.5 py-1 rounded-lg bg-white border border-[#E5E0D8] text-[#423E38] hover:border-[#EAA036] hover:text-[#9E6212] transition-all font-mono text-[11px] sm:text-xs shadow-2xs active:scale-95"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Repositories Strip (Max 5) & Intuitive Storage Purge Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 px-1 text-xs border-t border-[#E5E0D8]/60 mt-1">
          <div className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start">
            <span className="text-[#787571] flex items-center gap-1 text-[11px] font-medium flex-shrink-0">
              <History className="w-3.5 h-3.5 text-[#EAA036] flex-shrink-0" /> Recent:
            </span>
            {recentRepos.length > 0 ? (
              recentRepos.map((repo) => (
                <button
                  key={repo}
                  type="button"
                  onClick={() => handleRecentClick(repo)}
                  disabled={loading}
                  className="px-2.5 py-0.5 rounded-lg bg-white border border-[#E5E0D8] text-[#161514] hover:border-[#EAA036] hover:text-[#9E6212] font-mono text-[11px] transition-all shadow-2xs active:scale-95 cursor-pointer"
                  title={`Inspect ${repo}`}
                >
                  {repo}
                </button>
              ))
            ) : (
              <span className="text-[11px] font-mono text-[#8F8B83] italic">
                Past repositories appear here (last 5 kept in local storage)
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleClearStorage}
            disabled={clearingStorage}
            className={`flex items-center gap-1.5 text-[11px] font-mono px-2 py-1 rounded-lg transition-all flex-shrink-0 cursor-pointer border ${
              clearingStorage
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'text-[#787571] hover:text-rose-700 hover:bg-rose-50 border-transparent hover:border-rose-200'
            }`}
            title="Clear stored recent URLs and cached responses from browser storage whenever the site feels heavy"
          >
            {clearingStorage ? (
              <>
                <Check className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                <span className="text-emerald-700 font-sans font-medium">Storage Cleared</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3 h-3 flex-shrink-0" />
                <span>Clear storage</span>
              </>
            )}
          </button>
        </div>

        {/* Loading status text */}
        {loading && loadingProgress && (
          <div
            className="pt-2 flex items-center justify-center gap-2 text-xs font-mono text-[#9E6212] animate-pulse"
            aria-live="polite"
          >
            <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0 text-[#EAA036]" />
            <span className="truncate max-w-xs sm:max-w-md">{loadingProgress}</span>
          </div>
        )}
      </div>
    </section>
  );
};
