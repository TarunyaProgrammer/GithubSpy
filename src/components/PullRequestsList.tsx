import React, { useState } from 'react';
import { GitPullRequest, GitMerge, GitPullRequestClosed, ExternalLink, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { PullRequest } from '../types';

interface PullRequestsListProps {
  pullRequests: PullRequest[];
  onSelectUser: (username: string) => void;
}

export const PullRequestsList: React.FC<PullRequestsListProps> = ({ pullRequests, onSelectUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');

  const filteredPRs = pullRequests.filter((pr) => {
    if (!filterQuery.trim()) return true;
    const query = filterQuery.toLowerCase().trim();
    return (
      pr.title.toLowerCase().includes(query) ||
      pr.user.login.toLowerCase().includes(query) ||
      String(pr.number).includes(query)
    );
  });

  return (
    <div className="w-full my-6 bg-white dark:bg-obsidian-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden shadow-xs">
      {/* Accordion Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors text-left focus:outline-none focus-visible:bg-zinc-50 dark:focus-visible:bg-zinc-800/60"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <GitPullRequest className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-display font-bold text-zinc-900 dark:text-white">
              Recent Pull Requests ({pullRequests.length})
            </h3>
            <p className="text-xs text-zinc-500 font-sans">
              Browse individual submissions, merge outcomes, and author links.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-zinc-400">
          <span className="text-xs font-mono hidden sm:inline">
            {isOpen ? 'Collapse' : 'Expand list'}
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="border-t border-zinc-200/80 dark:border-zinc-800 p-5 space-y-4">
          {/* Quick Filter */}
          <div className="relative max-w-sm">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter by title, author, or #PR..."
              aria-label="Filter pull requests"
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-brand-500 font-mono"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 font-mono uppercase text-[10px]">
                <tr>
                  <th scope="col" className="px-3 py-2 rounded-l-lg">Status</th>
                  <th scope="col" className="px-3 py-2">Pull Request</th>
                  <th scope="col" className="px-3 py-2">Author</th>
                  <th scope="col" className="px-3 py-2 rounded-r-lg">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredPRs.slice(0, 150).map((pr) => {
                  const isMerged = Boolean(pr.merged_at);
                  const isOpenState = pr.state === 'open';

                  return (
                    <tr
                      key={`${pr.repository_name}-${pr.number}`}
                      className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      {/* State Badge */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        {isMerged ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-500/15 text-violet-700 dark:text-violet-300 border border-violet-500/25">
                            <GitMerge className="w-3 h-3" />
                            Merged
                          </span>
                        ) : isOpenState ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25">
                            <GitPullRequest className="w-3 h-3" />
                            Open
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-500/15 text-zinc-700 dark:text-zinc-300 border border-zinc-500/25">
                            <GitPullRequestClosed className="w-3 h-3" />
                            Closed
                          </span>
                        )}
                      </td>

                      {/* Title & Link */}
                      <td className="px-3 py-3 max-w-md">
                        <a
                          href={pr.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-zinc-900 dark:text-white hover:text-brand-500 hover:underline flex items-start gap-1"
                        >
                          <span className="line-clamp-1">{pr.title}</span>
                          <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0 text-zinc-400" />
                        </a>
                        <span className="text-[11px] text-zinc-400 font-mono">
                          #{pr.number}
                        </span>
                      </td>

                      {/* Author */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onSelectUser(pr.user.login)}
                          className="flex items-center gap-1.5 hover:text-brand-500 transition-colors font-mono focus:outline-none focus-visible:underline"
                        >
                          <img
                            src={pr.user.avatar_url}
                            alt=""
                            className="w-4 h-4 rounded-full"
                          />
                          <span>{pr.user.login}</span>
                        </button>
                      </td>

                      {/* Date */}
                      <td className="px-3 py-3 whitespace-nowrap text-zinc-500 font-mono text-[11px]">
                        {format(parseISO(pr.created_at), 'MMM d, yyyy')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredPRs.length > 150 && (
              <p className="text-center text-xs text-zinc-400 py-3 font-mono">
                Showing first 150 of {filteredPRs.length} pull requests.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
