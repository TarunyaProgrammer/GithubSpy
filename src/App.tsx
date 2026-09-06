import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { SearchSection } from './components/SearchSection';
import { MetricsBar } from './components/MetricsBar';
import { CompactCharts } from './components/charts/CompactCharts';
import { ContributorList } from './components/ContributorList';
import { PullRequestsList } from './components/PullRequestsList';
import { UserModal } from './components/UserModal';
import { TokenModal } from './components/TokenModal';
import { Footer } from './components/Footer';
import {
  fetchRepoStats,
  fetchUserStats,
  onRateLimitUpdate,
  checkCurrentRateLimit,
  parseGitHubUrl,
} from './services/github';
import { hasPersonalToken } from './services/token';
import { addRecentRepo } from './services/history';
import type { RepoStats, UserStats, TimeFilter, RateLimitInfo } from './types';
import { AlertCircle, RefreshCw, KeyRound, Loader2, Zap } from 'lucide-react';

export function App() {
  const [stats, setStats] = useState<RepoStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('1m');
  const [currentQuery, setCurrentQuery] = useState('');

  const [selectedUserStats, setSelectedUserStats] = useState<UserStats | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);

  const [rateLimit, setRateLimit] = useState<RateLimitInfo | null>(null);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [tokenActive, setTokenActive] = useState(hasPersonalToken());

  // Ensure clean root classes (no dark mode class)
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('githubspy_theme');
  }, []);

  // Subscribe to live GitHub response rate-limit updates & fetch initial quota on mount
  useEffect(() => {
    checkCurrentRateLimit().then((info) => {
      if (info) setRateLimit(info);
    });

    const unsubscribe = onRateLimitUpdate((info) => {
      setRateLimit(info);
    });
    return unsubscribe;
  }, []);

  const handleSearch = useCallback(
    async (repoQuery: string, filter: TimeFilter, forceRefresh = false) => {
      if (!repoQuery.trim()) return;

      const parsed = parseGitHubUrl(repoQuery);
      const cleanName = parsed ? `${parsed.owner}/${parsed.repo}` : repoQuery.trim();
      setCurrentQuery(cleanName);
      setTimeFilter(filter);

      if (forceRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);
      setLoadingProgress(forceRefresh ? 'Getting the latest activity from GitHub…' : 'Connecting to GitHub…');

      try {
        const result = await fetchRepoStats(
          repoQuery,
          filter,
          (msg) => {
            setLoadingProgress(msg);
          },
          forceRefresh
        );
        setStats(result);
        addRecentRepo(result.fullName);
        setLoadingProgress('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'We could not check this project. Try the link again.');
        if (!forceRefresh) setStats(null);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
        setLoadingProgress('');
      }
    },
    []
  );

  const handleSelectUser = useCallback(
    async (username: string) => {
      setLoadingUser(true);
      try {
        const userDetails = await fetchUserStats(username, stats, timeFilter);
        setSelectedUserStats(userDetails);
      } catch (err) {
        setError(err instanceof Error ? err.message : `We could not load ${username}'s contribution history. Try again.`);
      } finally {
        setLoadingUser(false);
      }
    },
    [stats, timeFilter]
  );

  const handleTokenChanged = () => {
    setTokenActive(hasPersonalToken());
    checkCurrentRateLimit().then((updated) => {
      if (updated) setRateLimit(updated);
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5F0] text-[#161514] font-sans dotted-canvas overflow-x-hidden">
      {/* Top Navigation */}
      <Header
        rateLimit={rateLimit}
        hasPersonalToken={tokenActive}
        onOpenTokenModal={() => setIsTokenModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pb-8 sm:pb-12">
        {/* Direct-to-Action Search Hero */}
        <SearchSection
          onSearch={handleSearch}
          loading={loading}
          loadingProgress={loadingProgress}
          initialQuery={currentQuery}
          timeFilter={timeFilter}
          onTimeFilterChange={setTimeFilter}
        />

        {/* Zero-Quota Warning Banner */}
        {rateLimit && rateLimit.remaining === 0 && !tokenActive && !error && (
          <div className="my-4 p-3.5 sm:p-4 rounded-2xl bg-[#EAA036]/15 border border-[#EAA036]/40 text-[#161514] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs animate-fade-in shadow-xs">
            <div className="flex items-start sm:items-center gap-2.5">
              <Zap className="w-4 h-4 text-[#9E6212] flex-shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <p className="font-semibold text-[#9E6212]">
                  You’ve reached GitHub’s public search limit
                </p>
                <p className="text-[11px] text-[#524E48] mt-0.5">
                  GitHub allows 60 public requests per hour from this internet connection.
                  {rateLimit.resetDate && (
                    <span> You can try again after {rateLimit.resetDate.toLocaleTimeString()}.</span>
                  )}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsTokenModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-[#EAA036] hover:bg-[#DF9126] text-[#161514] font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-all flex-shrink-0 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Add a GitHub token</span>
            </button>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="my-4 sm:my-6 p-3.5 sm:p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start justify-between gap-3 text-xs sm:text-sm animate-fade-in shadow-xs" role="alert">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">{error}</p>
                {error.toLowerCase().includes('limit') && (
                  <button
                    type="button"
                    onClick={() => setIsTokenModalOpen(true)}
                    className="mt-2 text-xs font-semibold underline hover:text-rose-950 flex items-center gap-1 font-mono"
                  >
                    <KeyRound className="w-3.5 h-3.5" /> Add a GitHub token to continue checking projects
                  </button>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              aria-label="Dismiss error notification"
              className="text-rose-400 hover:text-rose-600 text-xs font-mono flex-shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* User Fetch Loading Overlay */}
        {loadingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#161514]/30 backdrop-blur-xs p-4" aria-live="assertive">
            <div className="p-4 rounded-2xl bg-white border border-[#E5E0D8] shadow-2xl flex items-center gap-3 text-xs font-mono text-[#161514]">
              <Loader2 className="w-4 h-4 animate-spin text-[#EAA036] flex-shrink-0" />
              <span>Loading contributor activity…</span>
            </div>
          </div>
        )}

        {/* Results Dashboard */}
        {stats && (
          <div className="space-y-3 sm:space-y-4 animate-fade-in">
            {/* Core Metrics Overview with Formula Tooltips & Live Cache Sync */}
            <MetricsBar
              metrics={stats.metrics}
              fullName={stats.fullName}
              isCached={stats.isCached}
              cachedAt={stats.cachedAt}
              onRefresh={() => handleSearch(stats.fullName, timeFilter, true)}
              isRefreshing={isRefreshing}
            />

            {/* Space-Efficient Visual Analytics: Donut PR Resolution & Reviewer vs Community */}
            <CompactCharts metrics={stats.metrics} />

            {/* Contributor Grid & Role Filters (All-Time Contributors) */}
            <ContributorList
              contributors={stats.contributors}
              onSelectUser={handleSelectUser}
            />

            {/* Pull Requests List */}
            <PullRequestsList
              pullRequests={stats.recentPRs}
              onSelectUser={handleSelectUser}
            />
          </div>
        )}

        {/* Empty State */}
        {!stats && !loading && !error && (
          <div className="mt-12 sm:mt-16 py-10 sm:py-14 px-4 text-center rounded-3xl border border-[#E5E0D8] bg-white shadow-xs">
            <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 rounded-2xl bg-[#EFECE6] flex items-center justify-center text-[#787571]">
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h2 className="text-base sm:text-lg font-display font-bold text-[#161514]">
              Start by checking a GitHub project
            </h2>
            <p className="mt-1.5 text-xs text-[#787571] max-w-sm mx-auto font-sans leading-relaxed">
              Paste a public GitHub project link above. We’ll show how contributions move through the project and who is active there.
            </p>
          </div>
        )}
      </main>

      {/* Contributor Deep Dive Modal */}
      <UserModal
        userStats={selectedUserStats}
        onClose={() => setSelectedUserStats(null)}
      />

      {/* Token Modal */}
      <TokenModal
        isOpen={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
        onTokenChanged={handleTokenChanged}
        rateLimit={rateLimit}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
