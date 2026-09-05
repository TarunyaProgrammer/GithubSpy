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
  { label: 'Last 2 weeks', value: '2w' },
  { label: 'Last month', value: '1m' },
  { label: 'Last 3 months', value: '3m' },
  { label: 'Last 6 months', value: '6m' },
  { label: 'All available', value: 'all' },
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
        <div className="px-2">
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-display font-bold tracking-tight leading-tight">
            <span className="text-[#161514]">Find a project where you can</span>{' '}
            <span className="text-[#787571] font-medium block xs:inline">make a contribution.</span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm md:text-base text-[#524E48] font-sans max-w-xl mx-auto">
            Paste a GitHub project link to see how active it is, how quickly contributions are reviewed, and who is already involved.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-left px-1" aria-label="What this check shows">
          {[
            ['1', 'Recent activity', 'See whether people are currently opening pull requests.'],
            ['2', 'Review pace', 'Learn how long merged contributions usually take.'],
            ['3', 'Community', 'See maintainers and other active contributors.'],
          ].map(([number, title, description]) => (
            <div key={number} className="flex gap-2.5 rounded-xl bg-white/75 p-3 border border-[#E5E0D8]">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#EAA036]/15 text-[11px] font-bold text-[#9E6212] flex-shrink-0">{number}</span>
              <div>
                <p className="text-xs font-semibold text-[#161514]">{title}</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-[#787571]">{description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search Bar Form - Solid White Architectural Card */}
        <form onSubmit={handleSubmit} className="mt-4 sm:mt-6 px-1" role="search">
          <label htmlFor="repo-search-input" className="sr-only">
            GitHub project link or owner/repository name
          </label>
          <div className="flex flex-col sm:flex-row items-stretch gap-2 p-1.5 rounded-2xl bg-white border border-[#E5E0D8] shadow-xs focus-within:border-[#EAA036] focus-within:ring-2 focus-within:ring-[#EAA036]/20 transition-all">
            <div className="flex-1 flex items-center px-3 gap-2 min-h-[44px]">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#8F8B83] flex-shrink-0" />
              <input
                id="repo-search-input"
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Paste a GitHub link or enter owner/project"
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
                  <span>Checking project...</span>
                </>
              ) : (
                <>
                  <span>Check this project</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Popular repository presets - Single continuous line */}
        <div className="flex items-center justify-start sm:justify-center gap-2 pt-2.5 px-1 text-xs overflow-x-auto no-scrollbar" aria-label="Popular repository presets">
          <span className="text-[#787571] flex items-center gap-1 text-[11px] sm:text-xs font-medium whitespace-nowrap flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-[#EAA036] flex-shrink-0" /> Try an example:
          </span>
          <div className="flex items-center gap-1.5 flex-nowrap flex-shrink-0">
            {PRESET_REPOS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => handlePresetClick(preset.value)}
                disabled={loading}
                className="px-2.5 py-1 rounded-lg bg-white border border-[#E5E0D8] text-[#423E38] hover:border-[#EAA036] hover:text-[#9E6212] transition-all font-mono text-[11px] sm:text-xs shadow-2xs active:scale-95 whitespace-nowrap"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Time period filter - Clean single-line bar */}
        <div className="flex items-center justify-start sm:justify-center pt-2 px-1">
          <div className="flex w-full sm:w-auto flex-col sm:flex-row items-center justify-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-medium text-[#787571] whitespace-nowrap flex-shrink-0">Show activity from</span>
            <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-[#E5E0D8] bg-[#EFECE6] p-1 no-scrollbar flex-shrink-0" role="group" aria-label="Choose time period">
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
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 px-1 text-xs border-t border-[#E5E0D8]/60 mt-1">
          <div className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start">
            <span className="text-[#787571] flex items-center gap-1 text-[11px] font-medium flex-shrink-0">
              <History className="w-3.5 h-3.5 text-[#EAA036] flex-shrink-0" /> Recently checked:
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
                Projects you check will appear here on this device.
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
            title="Remove recently checked projects and saved results from this browser"
          >
            {clearingStorage ? (
              <>
                <Check className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                <span className="text-emerald-700 font-sans font-medium">Saved data removed</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3 h-3 flex-shrink-0" />
                <span>Clear saved data</span>
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
            <span className="truncate max-w-xs sm:max-w-md">{loadingProgress.replace('Interrogating', 'Checking').replace('Executing single-request GraphQL accelerator', 'Loading project data').replace('Accessing official contributor roster', 'Finding active contributors')}</span>
          </div>
        )}
      </div>
    </section>
  );
};
