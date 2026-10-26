import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { SearchSection } from './components/SearchSection';
import { MetricsBar } from './components/MetricsBar';
import { CompactCharts } from './components/charts/CompactCharts';
import { ContributorList } from './components/ContributorList';
import { PullRequestsList } from './components/PullRequestsList';
import { OrganizationOverview } from './components/OrganizationOverview';
import { OrganizationComparison } from './components/OrganizationComparison';
import { DeepAnalyticsPanel } from './components/DeepAnalyticsPanel';
import { DeepAnalyticsReport } from './components/DeepAnalyticsReport';
import { UserModal } from './components/UserModal';
import { TokenModal } from './components/TokenModal';
import { Footer } from './components/Footer';
import {
  fetchRepoStats,
  fetchUserStats,
  fetchOrganizationOverview,
  onRateLimitUpdate,
  checkCurrentRateLimit,
  parseGitHubUrl,
} from './services/github';
import { hasPersonalToken } from './services/token';
import { addRecentRepo } from './services/history';
import type { DateRange, OrganizationStats, RepoStats, UserStats, TimeFilter, RateLimitInfo } from './types';
import { AlertCircle, RefreshCw, KeyRound, Loader2, Zap } from 'lucide-react';

export function App() {
  const [stats, setStats] = useState<RepoStats | null>(null);
  const [organization, setOrganization] = useState<OrganizationStats | null>(null);
  const [comparisonStats, setComparisonStats] = useState<RepoStats[] | null>(null);
  const [view, setView] = useState<'home' | 'organization' | 'repository' | 'deep-report' | 'comparison'>('home');
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('1m');
  const [dateRange, setDateRange] = useState<DateRange>({ from: '', to: '' });
  const [currentQuery, setCurrentQuery] = useState('');

  const [selectedUserStats, setSelectedUserStats] = useState<UserStats | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);

  const [rateLimit, setRateLimit] = useState<RateLimitInfo | null>(null);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [tokenActive, setTokenActive] = useState(hasPersonalToken());
  const openDeepAfterLoad = useRef(false);

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
    async (repoQuery: string, filter: TimeFilter, nextDateRange?: DateRange, forceRefresh = false) => {
      if (!repoQuery.trim()) return;

      const parsed = parseGitHubUrl(repoQuery);
      const cleanName = parsed ? `${parsed.owner}/${parsed.repo}` : repoQuery.trim();
      setCurrentQuery(cleanName);
      setTimeFilter(filter);
      if (nextDateRange) setDateRange(nextDateRange);

      if (forceRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);
      setLoadingProgress(forceRefresh ? 'Getting the latest activity from GitHub…' : 'Connecting to GitHub…');

      try {
        if (!parsed) {
          setLoadingProgress('Loading the organization repository map…');
          const ownerResult = await fetchOrganizationOverview(repoQuery, forceRefresh);
          setOrganization(ownerResult);
          setStats(null);
          setComparisonStats(null);
          setView('organization');
          window.history.replaceState({}, '', `#org/${ownerResult.login}`);
          return;
        }
        const result = await fetchRepoStats(
          repoQuery,
          filter,
          (msg) => {
            setLoadingProgress(msg);
          },
          forceRefresh,
          nextDateRange
        );
        setStats(result);
        setOrganization(null);
        setComparisonStats(null);
        const shouldOpenDeep = openDeepAfterLoad.current;
        openDeepAfterLoad.current = false;
        setView(shouldOpenDeep ? 'deep-report' : 'repository');
        window.history.replaceState({}, '', `#${shouldOpenDeep ? 'deep' : 'repo'}/${result.fullName}`);
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

  const handleOpenRepository = useCallback((fullName: string) => {
    handleSearch(fullName, timeFilter, dateRange);
  }, [handleSearch, timeFilter, dateRange]);

  const handleOpenDeepReport = useCallback(() => {
    if (!stats) return;
    openDeepAfterLoad.current = false;
    setView('deep-report');
    window.history.pushState({}, '', `#deep/${stats.fullName}`);
  }, [stats]);

  const handleCompareRepositories = useCallback(async (fullNames: string[]) => {
    if (fullNames.length < 2) return;
    setLoading(true);
    setError(null);
    setLoadingProgress(`Comparing ${fullNames.length} repositories…`);
    try {
      const results: RepoStats[] = [];
      for (let index = 0; index < fullNames.length; index += 1) {
        setLoadingProgress(`Comparing repository ${index + 1} of ${fullNames.length}…`);
        results.push(await fetchRepoStats(fullNames[index], timeFilter, (message) => setLoadingProgress(message), false, dateRange));
      }
      setComparisonStats(results);
      setOrganization(null);
      setStats(null);
      setView('comparison');
      window.history.replaceState({}, '', `#compare/${results.map((result) => result.fullName).join(',')}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Repository comparison could not be completed.');
    } finally {
      setLoading(false);
      setLoadingProgress('');
    }
  }, [dateRange, timeFilter]);

  useEffect(() => {
    const loadFromHash = () => {
      const hash = window.location.hash.replace(/^#/, '');
      if (hash.startsWith('org/')) {
        const owner = decodeURIComponent(hash.slice(4));
        if (owner) handleSearch(owner, '1m', { from: '', to: '' });
      } else if (hash.startsWith('repo/')) {
        const repo = decodeURIComponent(hash.slice(5));
        if (repo) handleSearch(repo, '1m', { from: '', to: '' });
      } else if (hash.startsWith('deep/')) {
        const repo = decodeURIComponent(hash.slice(5));
        if (repo) {
          openDeepAfterLoad.current = true;
          handleSearch(repo, '1m', { from: '', to: '' });
        }
      }
    };

    loadFromHash();
    window.addEventListener('hashchange', loadFromHash);
    return () => window.removeEventListener('hashchange', loadFromHash);
  }, [handleSearch]);

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
        view={view}
        onNavigateHome={() => {
          setView('home');
          setStats(null);
          setOrganization(null);
          setComparisonStats(null);
          setCurrentQuery('');
          window.history.replaceState({}, '', window.location.pathname);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pb-8 sm:pb-12">
        {view !== 'deep-report' && (
          <SearchSection
            onSearch={handleSearch}
            loading={loading}
            loadingProgress={loadingProgress}
            initialQuery={currentQuery}
            timeFilter={timeFilter}
            onTimeFilterChange={setTimeFilter}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
        )}

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

        {stats && view === 'deep-report' && (
          <DeepAnalyticsReport
            stats={stats}
            timeFilter={timeFilter}
            dateRange={dateRange}
            hasPersonalToken={tokenActive}
            onOpenTokenModal={() => setIsTokenModalOpen(true)}
            onBack={() => {
              setView('repository');
              window.history.replaceState({}, '', `#repo/${stats.fullName}`);
            }}
          />
        )}

        {comparisonStats && view === 'comparison' && (
          <OrganizationComparison
            stats={comparisonStats}
            timeFilter={timeFilter}
            dateRange={dateRange}
            onBack={() => {
              setView('organization');
              setComparisonStats(null);
            }}
            onOpenRepository={handleOpenRepository}
          />
        )}

        {/* Organization workspace */}
        {organization && view === 'organization' && (
          <OrganizationOverview stats={organization} onOpenRepository={handleOpenRepository} onCompare={handleCompareRepositories} />
        )}

        {/* Repository workspace */}
        {stats && view === 'repository' && (
          <div className="space-y-3 sm:space-y-4 animate-fade-in">
            {/* Core Metrics Overview with Formula Tooltips & Live Cache Sync */}
            <MetricsBar
              metrics={stats.metrics}
              fullName={stats.fullName}
              isCached={stats.isCached}
              cachedAt={stats.cachedAt}
              onRefresh={() => handleSearch(stats.fullName, timeFilter, dateRange, true)}
              isRefreshing={isRefreshing}
            />

            {/* Space-Efficient Visual Analytics: Donut PR Resolution & Reviewer vs Community */}
            <CompactCharts metrics={stats.metrics} />

            <DeepAnalyticsPanel
              hasPersonalToken={tokenActive}
              onOpenReport={handleOpenDeepReport}
              onOpenTokenModal={() => setIsTokenModalOpen(true)}
            />

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
        {!stats && !organization && !loading && !error && (
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
