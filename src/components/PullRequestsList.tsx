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
    <div className="w-full my-4 sm:my-6 bg-white rounded-3xl border border-[#E5E0D8] overflow-hidden shadow-xs">
      {/* Accordion Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="w-full px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between hover:bg-[#F7F5F0] transition-colors text-left focus:outline-none focus-visible:bg-[#F7F5F0]"
      >
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="p-1.5 sm:p-2 rounded-xl bg-[#EAA036]/15 text-[#9E6212] flex-shrink-0">
            <GitPullRequest className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg md:text-xl font-display font-bold text-[#161514] truncate">
              Recent Pull Requests ({pullRequests.length})
            </h3>
            <p className="text-[11px] sm:text-xs text-[#787571] font-sans truncate">
              Browse individual submissions, merge turnaround, and applicant links.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 text-[#787571] flex-shrink-0 ml-2">
          <span className="text-xs font-mono hidden sm:inline">
            {isOpen ? 'Collapse' : 'Expand list'}
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="border-t border-[#E5E0D8] p-3.5 sm:p-6 space-y-3 sm:space-y-4">
          {/* Quick Filter */}
          <div className="relative max-w-sm w-full">
            <Search className="w-3.5 h-3.5 text-[#8F8B83] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter by title, author, or #PR..."
              aria-label="Filter pull requests"
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[#F7F5F0] border border-[#E5E0D8] text-[#161514] placeholder-[#8F8B83] focus:outline-none focus:border-[#EAA036] font-mono"
            />
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto -mx-3.5 sm:mx-0 px-3.5 sm:px-0">
            <table className="w-full text-left text-xs min-w-[500px] sm:min-w-full">
              <thead className="bg-[#F7F5F0] text-[#787571] font-mono uppercase text-[10px]">
                <tr>
                  <th scope="col" className="px-3 py-2 rounded-l-lg whitespace-nowrap">Status</th>
                  <th scope="col" className="px-3 py-2">Pull Request</th>
                  <th scope="col" className="px-3 py-2 whitespace-nowrap">Author</th>
                  <th scope="col" className="px-3 py-2 rounded-r-lg whitespace-nowrap">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E0D8]">
                {filteredPRs.slice(0, 150).map((pr) => {
                  const isMerged = Boolean(pr.merged_at);
                  const isOpenState = pr.state === 'open';

                  return (
                    <tr
                      key={`${pr.repository_name}-${pr.number}`}
                      className="hover:bg-[#F7F5F0]/80 transition-colors"
                    >
                      {/* State Badge */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        {isMerged ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <GitMerge className="w-3 h-3" />
                            Merged
                          </span>
                        ) : isOpenState ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EAA036]/15 text-[#9E6212] border border-[#EAA036]/30">
                            <GitPullRequest className="w-3 h-3" />
                            Open
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EFECE6] text-[#65615B] border border-[#E5E0D8]">
                            <GitPullRequestClosed className="w-3 h-3" />
                            Closed
                          </span>
                        )}
                      </td>

                      {/* Title & Link */}
                      <td className="px-3 py-3 max-w-xs sm:max-w-md">
                        <a
                          href={pr.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-[#161514] hover:text-[#9E6212] hover:underline flex items-start gap-1"
                        >
                          <span className="line-clamp-2 sm:line-clamp-1">{pr.title}</span>
                          <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0 text-[#8F8B83]" />
                        </a>
                        <span className="text-[10px] sm:text-[11px] text-[#787571] font-mono">
                          #{pr.number}
                        </span>
                      </td>

                      {/* Author */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onSelectUser(pr.user.login)}
                          className="flex items-center gap-1.5 hover:text-[#9E6212] transition-colors font-mono focus:outline-none focus-visible:underline text-xs"
                        >
                          <img
                            src={pr.user.avatar_url}
                            alt=""
                            className="w-4 h-4 rounded-full flex-shrink-0"
                          />
                          <span className="truncate max-w-[100px] sm:max-w-none">{pr.user.login}</span>
                        </button>
                      </td>

                      {/* Date */}
                      <td className="px-3 py-3 whitespace-nowrap text-[#787571] font-mono text-[10px] sm:text-[11px]">
                        {format(parseISO(pr.created_at), 'MMM d, yyyy')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredPRs.length > 150 && (
              <p className="text-center text-xs text-[#787571] py-3 font-mono">
                Showing first 150 of {filteredPRs.length} pull requests.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
