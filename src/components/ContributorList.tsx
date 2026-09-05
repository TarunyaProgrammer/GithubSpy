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
    <div className="w-full my-4 sm:my-6 bg-white rounded-3xl border border-[#E5E0D8] p-4 sm:p-6 shadow-xs">
      {/* Controls Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-[#E5E0D8]">
        <div>
          <h3 className="text-base sm:text-lg md:text-xl font-display font-bold text-[#161514] flex items-center gap-2 flex-wrap">
            <span>Contributors & Applicants</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#EFECE6] text-[#65615B]">
              {filteredContributors.length} of {contributors.length}
            </span>
          </h3>
          <p className="text-xs text-[#787571] mt-0.5 font-sans">
            Select any contributor to inspect their complete pull request record and turnaround history.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Quick Search */}
          <div className="relative flex-1 sm:w-44 lg:w-48">
            <Search className="w-3.5 h-3.5 text-[#8F8B83] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search user..."
              aria-label="Filter contributors by username"
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[#F7F5F0] border border-[#E5E0D8] text-[#161514] placeholder-[#8F8B83] focus:outline-none focus:border-[#EAA036] font-mono"
            />
          </div>

          <div className="flex items-center gap-2 justify-between sm:justify-start">
            {/* Role Filter Tabs */}
            <div className="overflow-x-auto no-scrollbar py-0.5 max-w-full">
              <div className="flex items-center gap-0.5 p-1 rounded-xl bg-[#EFECE6] border border-[#E5E0D8] text-xs w-max" role="tablist" aria-label="Role Filter">
                <button
                  role="tab"
                  aria-selected={roleFilter === 'all'}
                  onClick={() => setRoleFilter('all')}
                  className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    roleFilter === 'all'
                      ? 'bg-white text-[#161514] shadow-xs font-semibold'
                      : 'text-[#65615B] hover:text-[#161514]'
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
                      ? 'bg-white text-[#161514] shadow-xs font-semibold'
                      : 'text-[#65615B] hover:text-[#161514]'
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
                      ? 'bg-white text-[#9E6212] shadow-xs font-semibold'
                      : 'text-[#65615B] hover:text-[#161514]'
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
              className="px-2.5 sm:px-3 py-1.5 text-xs rounded-xl bg-white border border-[#E5E0D8] text-[#161514] focus:outline-none focus:border-[#EAA036] flex-shrink-0"
            >
              <option value="total">Sort: PRs</option>
              <option value="merged">Sort: Merged</option>
              <option value="open">Sort: Open</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contributor Grid */}
      {filteredContributors.length === 0 ? (
        <div className="py-12 text-center text-[#787571] text-xs">
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
              className="group p-3.5 sm:p-4 rounded-2xl border border-[#E5E0D8] hover:border-[#EAA036] bg-[#F7F5F0] hover:bg-white transition-all cursor-pointer shadow-2xs hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EAA036]"
            >
              <div className="flex items-start gap-3">
                {/* User Avatar */}
                <div className="relative flex-shrink-0">
                  <img
                    src={c.avatarUrl}
                    alt=""
                    loading="lazy"
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover ring-1 ring-[#E5E0D8]"
                  />
                  {c.isMaintainer && (
                    <div
                      className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#EAA036] text-[#161514] flex items-center justify-center ring-2 ring-white"
                      title="Verified Maintainer"
                    >
                      <Shield className="w-2.5 h-2.5 fill-[#161514]" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-xs sm:text-sm text-[#161514] truncate font-mono group-hover:text-[#9E6212] transition-colors">
                      {c.username}
                    </span>
                    <a
                      href={`https://github.com/${c.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Open @${c.username} on GitHub`}
                      className="text-[#8F8B83] hover:text-[#161514] p-0.5 rounded focus:outline-none flex-shrink-0 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Role Badge */}
                  <div className="mt-0.5">
                    {c.isMaintainer ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#9E6212] bg-[#EAA036]/15 px-2 py-0.5 rounded-md border border-[#EAA036]/30">
                        <Shield className="w-2.5 h-2.5" />
                        Maintainer
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#524E48] bg-white px-2 py-0.5 rounded-md border border-[#E5E0D8]">
                        <Users className="w-2.5 h-2.5" />
                        Applicant
                      </span>
                    )}
                  </div>

                  {/* PR Count Pills */}
                  <div className="mt-2 grid grid-cols-3 gap-1 text-[10px] sm:text-[11px] font-mono">
                    <div className="px-1 py-0.5 rounded-md bg-white border border-[#E5E0D8] text-[#161514] text-center truncate">
                      <span className="font-bold">{c.totalPRs}</span> tot
                    </div>
                    <div className="px-1 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-center truncate">
                      <span className="font-bold">{c.mergedPRs}</span> mrg
                    </div>
                    <div className="px-1 py-0.5 rounded-md bg-[#EAA036]/10 border border-[#EAA036]/25 text-[#9E6212] text-center truncate">
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
