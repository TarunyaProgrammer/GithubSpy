import React, { useMemo, useState } from 'react';
import { ExternalLink, GitFork, GitPullRequest, Search, Star, ArrowUpRight, Database, GitCompareArrows } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { OrganizationStats, RepositorySummary } from '../types';

interface OrganizationOverviewProps {
  stats: OrganizationStats;
  onOpenRepository: (fullName: string) => void;
  onCompare: (fullNames: string[]) => void;
}

type SortBy = 'relevance' | 'newest' | 'stars' | 'issues';

export const OrganizationOverview: React.FC<OrganizationOverviewProps> = ({ stats, onOpenRepository, onCompare }) => {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('relevance');
  const [selected, setSelected] = useState<string[]>([]);

  const repositories = useMemo(() => {
    return [...stats.repositories]
      .filter((repo) => `${repo.fullName} ${repo.description || ''}`.toLowerCase().includes(search.toLowerCase().trim()))
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        if (sortBy === 'stars') return b.stars - a.stars;
        if (sortBy === 'issues') return b.openIssues - a.openIssues;
        return (b.stars + b.forks) - (a.stars + a.forks);
      });
  }, [search, sortBy, stats.repositories]);

  const toggleSelected = (fullName: string) => {
    setSelected((current) => current.includes(fullName) ? current.filter((item) => item !== fullName) : current.length < 5 ? [...current, fullName] : current);
  };

  return (
    <section className="space-y-4 sm:space-y-6 animate-fade-in" aria-labelledby="organization-title">
      <div className="flex flex-col gap-4 rounded-3xl border border-[#E5E0D8] bg-white p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <img src={stats.avatarUrl} alt="" className="h-12 w-12 rounded-2xl border border-[#E5E0D8]" />
            <div>
              <p className="text-xs font-medium text-[#787571]">{stats.type} workspace</p>
              <h1 id="organization-title" className="mt-0.5 text-2xl sm:text-3xl font-display font-bold tracking-tight text-[#161514]">{stats.name}</h1>
              <p className="mt-1 font-mono text-xs text-[#787571]">@{stats.login} · {stats.repoCount.toLocaleString()} public repositories</p>
            </div>
          </div>
          <a href={`https://github.com/${stats.login}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 self-start rounded-xl border border-[#E5E0D8] px-3 py-2 text-xs font-semibold text-[#423E38] hover:border-[#EAA036] hover:text-[#9E6212]">
            Open on GitHub <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-[#E5E0D8] border-t border-[#E5E0D8] pt-4">
          <Summary label="Repositories shown" value={stats.repositories.length} />
          <Summary label="Stars across owner" value={stats.totalStars} />
          <Summary label="Open issues" value={stats.totalOpenIssues} />
          <Summary label="Data strategy" value="Cached" />
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-[#E5E0D8] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-display font-bold text-[#161514]">Most relevant repositories</h2>
          <p className="mt-0.5 text-xs text-[#787571]">Top 20 by stars and forks. PR analytics only runs when you open a repository.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <label className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8F8B83]" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Filter repositories" aria-label="Filter repositories" className="w-full rounded-xl border border-[#E5E0D8] bg-[#F7F5F0] py-2 pl-8 pr-3 text-xs text-[#161514] placeholder-[#8F8B83] focus:border-[#EAA036] focus:outline-none sm:w-48" />
          </label>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortBy)} aria-label="Sort repositories" className="rounded-xl border border-[#E5E0D8] bg-white px-3 py-2 text-xs text-[#161514] focus:border-[#EAA036] focus:outline-none">
            <option value="relevance">Most relevant</option>
            <option value="newest">Updated newest</option>
            <option value="stars">Most stars</option>
            <option value="issues">Most open issues</option>
          </select>
          <button type="button" onClick={() => onCompare(selected)} disabled={selected.length < 2} className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#161514] px-3 py-2 text-xs font-semibold text-[#F7F5F0] hover:bg-[#2A2724] disabled:cursor-not-allowed disabled:opacity-40"><GitCompareArrows className="h-3.5 w-3.5" /> Compare {selected.length || ''} repositories</button>
        </div>
      </div>

      <div className="rounded-xl border border-[#EAA036]/30 bg-[#FFF9EF] px-3 py-2 text-[11px] text-[#65615B]">Select 2–5 repositories to compare their contribution opportunity for the same timeline. This is an explicit multi-repository scan and may use more GitHub requests.</div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {repositories.map((repo) => <RepositoryCard key={repo.fullName} repo={repo} selected={selected.includes(repo.fullName)} onToggle={() => toggleSelected(repo.fullName)} onOpen={() => onOpenRepository(repo.fullName)} />)}
      </div>

      {!repositories.length && <div className="rounded-2xl border border-dashed border-[#D5D0C7] bg-white p-10 text-center text-sm text-[#787571]">No repositories match that filter.</div>}
    </section>
  );
};

function Summary({ label, value }: { label: string; value: number | string }) {
  return <div className="px-3 first:pl-0 last:pr-0"><p className="text-[10px] font-medium uppercase tracking-wide text-[#787571]">{label}</p><p className="mt-1 text-lg font-display font-bold text-[#161514]">{typeof value === 'number' ? value.toLocaleString() : value}</p></div>;
}

function RepositoryCard({ repo, selected, onToggle, onOpen }: { repo: RepositorySummary; selected: boolean; onToggle: () => void; onOpen: () => void }) {
  return (
    <article className="group rounded-2xl border border-[#E5E0D8] bg-white p-4 shadow-xs transition-all hover:border-[#EAA036] hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <label className="flex items-start gap-2 pt-0.5" title="Select for organization comparison">
          <input type="checkbox" checked={selected} onChange={onToggle} onClick={(event) => event.stopPropagation()} className="mt-0.5 accent-[#EAA036]" aria-label={`Select ${repo.fullName} for comparison`} />
        </label>
        <button type="button" onClick={onOpen} className="min-w-0 text-left">
          <h3 className="truncate font-mono text-sm font-semibold text-[#161514] group-hover:text-[#9E6212]">{repo.fullName}</h3>
          <p className="mt-1 line-clamp-2 min-h-10 text-xs leading-relaxed text-[#65615B]">{repo.description || 'No repository description provided.'}</p>
        </button>
        <button type="button" onClick={onOpen} aria-label={`Analyze ${repo.fullName}`} className="rounded-xl bg-[#EAA036]/15 p-2 text-[#9E6212] hover:bg-[#EAA036]/25"><ArrowUpRight className="h-4 w-4" /></button>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#E5E0D8] pt-3 text-[11px] text-[#787571]">
        <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 text-[#9E6212]" /> {repo.stars.toLocaleString()}</span>
        <span className="inline-flex items-center gap-1"><GitFork className="h-3.5 w-3.5" /> {repo.forks.toLocaleString()}</span>
        <span className="inline-flex items-center gap-1"><GitPullRequest className="h-3.5 w-3.5" /> {repo.openIssues.toLocaleString()} open issues</span>
        <span className="ml-auto">Updated {format(parseISO(repo.updatedAt), 'MMM d, yyyy')}</span>
      </div>
      <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-[#8F8B83]">
        <span>{repo.language || 'Language not detected'}{repo.isFork ? ' · fork' : ''}</span>
        <span className="inline-flex items-center gap-1"><Database className="h-3 w-3" /> cached overview</span>
      </div>
    </article>
  );
}
