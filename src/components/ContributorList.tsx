import React, { useState, useMemo } from 'react';
import { Search, Shield, Users, ExternalLink } from 'lucide-react';
import type { ContributorStats, RoleFilter } from '../types';

interface ContributorListProps {
  contributors: ContributorStats[];
  onSelectUser: (username: string) => void;
}

type SortBy = 'total' | 'merged' | 'open';

export const ContributorList: React.FC<ContributorListProps> = ({ contributors, onSelectUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('total');

  const filteredContributors = useMemo(() => {
    return contributors
      .filter((c) => {
        if (searchTerm.trim() && !c.username.toLowerCase().includes(searchTerm.toLowerCase().trim())) {
          return false;
        }
        if (roleFilter === 'contributors_only' && c.isMaintainer) {
          return false;
        }
        if (roleFilter === 'maintainers_only' && !c.isMaintainer) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'merged') return b.mergedPRs - a.mergedPRs;
        if (sortBy === 'open') return b.openPRs - a.openPRs;
        return b.totalPRs - a.totalPRs;
      });
  }, [contributors, searchTerm, roleFilter, sortBy]);

  const maintainerCount = useMemo(() => contributors.filter((c) => c.isMaintainer).length, [contributors]);
  const contributorOnlyCount = contributors.length - maintainerCount;

  return (
    <div className="w-full my-4 sm:my-6 bg-white dark:bg-obsidian-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 p-4 sm:p-6 shadow-xs">
      {/* Controls Bar - Multi-viewport responsive */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
        <div>
          <h3 className="text-base sm:text-lg md:text-xl font-serif font-bold text-zinc-900 dark:text-white flex items-center gap-2 flex-wrap">
            <span>Contributors & Applicants</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              {filteredContributors.length} of {contributors.length}
            </span>
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5 font-sans">
            Select any contributor to inspect their full PR history and repository breakdown.
          </p>
        </div>

        {/* Filter controls - Stacks cleanly on mobile, horizontal on tablet/desktop */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Quick Search */}
          <div className="relative flex-1 sm:w-44 lg:w-48">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search user..."
              aria-label="Filter contributors by username"
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-brand-500 font-mono"
            />
          </div>

          <div className="flex items-center gap-2 justify-between sm:justify-start">
            {/* Role Filter Tabs - Horizontally scrollable on mobile */}
            <div className="overflow-x-auto no-scrollbar py-0.5 max-w-full">
              <div className="flex items-center gap-0.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs w-max" role="tablist" aria-label="Role Filter">
                <button
                  role="tab"
                  aria-selected={roleFilter === 'all'}
                  onClick={() => setRoleFilter('all')}
                  className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    roleFilter === 'all'
                      ? 'bg-white dark:bg-obsidian-900 text-zinc-900 dark:text-white shadow-xs font-semibold'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  All ({contributors.length})
                </button>
                <button
                  role="tab"
                  aria-selected={roleFilter === 'contributors_only'}
                  onClick={() => setRoleFilter('contributors_only')}
                  className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    roleFilter === 'contributors_only'
                      ? 'bg-white dark:bg-obsidian-900 text-brand-600 dark:text-brand-400 shadow-xs font-semibold'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                  title="Isolate community applicants"
                >
                  Applicants ({contributorOnlyCount})
                </button>
                <button
                  role="tab"
                  aria-selected={roleFilter === 'maintainers_only'}
                  onClick={() => setRoleFilter('maintainers_only')}
                  className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    roleFilter === 'maintainers_only'
                      ? 'bg-white dark:bg-obsidian-900 text-champagne-600 dark:text-champagne-400 shadow-xs font-semibold'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  Maintainers ({maintainerCount})
                </button>
              </div>
            </div>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              aria-label="Sort contributors"
              className="px-2.5 sm:px-3 py-1.5 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 focus:outline-none flex-shrink-0"
            >
              <option value="total">Sort: PRs</option>
              <option value="merged">Sort: Merged</option>
              <option value="open">Sort: Open</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contributor Grid - 1 col on mobile, 2 col on tablet/half-screen, 3 col on large desktop */}
      {filteredContributors.length === 0 ? (
        <div className="py-12 text-center text-zinc-400 text-xs">
          No contributors match the current filter or search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 pt-4" role="list">
          {filteredContributors.map((c) => (
            <div
              key={c.username}
              role="button"
              tabIndex={0}
              aria-label={`View dossier for ${c.username}, ${c.isMaintainer ? 'Maintainer' : 'Contributor'}, ${c.totalPRs} PRs`}
              onClick={() => onSelectUser(c.username)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectUser(c.username);
                }
              }}
              className="group p-3.5 sm:p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 hover:border-brand-500/40 dark:hover:border-brand-500/40 bg-zinc-50/50 dark:bg-zinc-800/30 hover:bg-white dark:hover:bg-zinc-800/70 transition-all cursor-pointer shadow-xs hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <div className="flex items-start gap-3">
                {/* User Avatar */}
                <div className="relative flex-shrink-0">
                  <img
                    src={c.avatarUrl}
                    alt=""
                    loading="lazy"
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover ring-1 ring-zinc-200 dark:ring-zinc-700"
                  />
                  {c.isMaintainer && (
                    <div
                      className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-champagne-500 text-white flex items-center justify-center ring-2 ring-white dark:ring-obsidian-900"
                      title="Verified Maintainer"
                    >
                      <Shield className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-white truncate font-mono group-hover:text-brand-500 transition-colors">
                      {c.username}
                    </span>
                    <a
                      href={`https://github.com/${c.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Open @${c.username} on GitHub`}
                      className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5 rounded focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-500 flex-shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Role Badge */}
                  <div className="mt-0.5">
                    {c.isMaintainer ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-champagne-700 dark:text-champagne-300 bg-champagne-50 dark:bg-champagne-950/40 px-2 py-0.5 rounded-md border border-champagne-300/60 dark:border-champagne-800/60">
                        <Shield className="w-2.5 h-2.5" />
                        Maintainer
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/40 px-2 py-0.5 rounded-md border border-brand-300/60 dark:border-brand-800/60">
                        <Users className="w-2.5 h-2.5" />
                        Applicant
                      </span>
                    )}
                  </div>

                  {/* PR Count Pills */}
                  <div className="mt-2 grid grid-cols-3 gap-1 text-[10px] sm:text-[11px] font-mono">
                    <div className="px-1 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-700/60 text-zinc-700 dark:text-zinc-300 text-center truncate">
                      <span className="font-bold">{c.totalPRs}</span> tot
                    </div>
                    <div className="px-1 py-0.5 rounded-md bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 text-center truncate">
                      <span className="font-bold">{c.mergedPRs}</span> mrg
                    </div>
                    <div className="px-1 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-center truncate">
                      <span className="font-bold">{c.openPRs}</span> opn
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
