import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { SearchSection } from './components/SearchSection';
import { TacticalBriefing } from './components/TacticalBriefing';
import { MetricsBar } from './components/MetricsBar';
import { RatioBars } from './components/charts/RatioBars';
import { ActivityTimelineChart } from './components/charts/ActivityTimelineChart';
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
} from './services/github';
import { hasPersonalToken } from './services/token';
import type { RepoStats, UserStats, TimeFilter, RateLimitInfo } from './types';
import { AlertCircle, RefreshCw, KeyRound, Loader2 } from 'lucide-react';

export function App() {
  const [stats, setStats] = useState<RepoStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('1m');
  const [currentQuery, setCurrentQuery] = useState('');

  const [selectedUserStats, setSelectedUserStats] = useState<UserStats | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);

  const [rateLimit, setRateLimit] = useState<RateLimitInfo | null>(null);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [tokenActive, setTokenActive] = useState(hasPersonalToken());

  // Dark mode initialized from localStorage or OS preference
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('githubspy_theme');
    if (saved !== null) {
      return saved === 'dark';
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('githubspy_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('githubspy_theme', 'light');
    }
  }, [darkMode]);

  // Subscribe to live GitHub response rate-limit updates
  useEffect(() => {
    const unsubscribe = onRateLimitUpdate((info) => {
      setRateLimit(info);
    });
    checkCurrentRateLimit().then((initial) => {
      if (initial) setRateLimit(initial);
    });
    return unsubscribe;
  }, []);

  const handleSearch = useCallback(
    async (repoQuery: string, filter: TimeFilter) => {
      if (!repoQuery.trim()) return;

      setCurrentQuery(repoQuery);
      setTimeFilter(filter);
      setLoading(true);
      setError(null);
      setLoadingProgress('Connecting to GitHub API...');

      try {
        const result = await fetchRepoStats(repoQuery, filter, (msg) => {
          setLoadingProgress(msg);
        });
        setStats(result);
        setLoadingProgress('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to analyze repository');
        setStats(null);
      } finally {
        setLoading(false);
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
        setError(err instanceof Error ? err.message : `Failed to load user ${username}`);
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
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-[#090a0f] text-zinc-900 dark:text-zinc-100 transition-colors duration-200 overflow-x-hidden">
      {/* Top Navigation */}
      <Header
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
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

        {/* Error Banner */}
        {error && (
          <div className="my-4 sm:my-6 p-3.5 sm:p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-300 flex items-start justify-between gap-3 text-xs sm:text-sm animate-fade-in" role="alert">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">{error}</p>
                {error.includes('rate limit') && (
                  <button
                    type="button"
                    onClick={() => setIsTokenModalOpen(true)}
                    className="mt-2 text-xs font-semibold underline hover:text-red-950 dark:hover:text-red-200 flex items-center gap-1 font-mono"
                  >
                    <KeyRound className="w-3.5 h-3.5" /> Add Personal Access Token to unlock 5,000 req/hr
                  </button>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              aria-label="Dismiss error notification"
              className="text-red-400 hover:text-red-600 text-xs font-mono flex-shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* User Fetch Loading Overlay */}
        {loadingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4" aria-live="assertive">
            <div className="p-4 rounded-2xl bg-white dark:bg-obsidian-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl flex items-center gap-3 text-xs font-mono">
              <Loader2 className="w-4 h-4 animate-spin text-brand-500 flex-shrink-0" />
              <span>Fetching contributor dossier...</span>
            </div>
          </div>
        )}

        {/* Results Dashboard */}
        {stats && (
          <div className="space-y-3 sm:space-y-4 animate-fade-in">
            {/* Tactical Intelligence Dossier */}
            <TacticalBriefing
              intelligence={stats.metrics.intelligence}
              fullName={stats.fullName}
            />

            {/* Core Metrics Overview */}
            <MetricsBar metrics={stats.metrics} fullName={stats.fullName} />

            {/* Visual Analytics Row: PR Status & Community Dynamics Ratio Bars */}
            <RatioBars metrics={stats.metrics} />

            {/* Visual Timeline Activity Graph */}
            <ActivityTimelineChart
              pullRequests={stats.recentPRs}
              timeFilter={timeFilter}
            />

            {/* Contributor Grid & Role Filters */}
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
          <div className="mt-12 sm:mt-16 py-10 sm:py-14 px-4 text-center rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-obsidian-900/40">
            <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 flex items-center justify-center text-zinc-400">
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h3 className="text-base sm:text-lg font-serif font-bold text-zinc-900 dark:text-white">
              Radar ready
            </h3>
            <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto font-sans leading-relaxed">
              Type any repository URL above or click a preset to access the applicant feasibility index and competitive intelligence.
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
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
