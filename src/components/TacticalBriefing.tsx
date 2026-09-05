import React from 'react';
import { Target, Users, ShieldAlert, Zap, Compass } from 'lucide-react';
import type { ApplicantIntelligence } from '../types';

interface TacticalBriefingProps {
  intelligence: ApplicantIntelligence;
  fullName: string;
}

export const TacticalBriefing: React.FC<TacticalBriefingProps> = ({ intelligence, fullName }) => {
  const {
    feasibilityScore,
    grade,
    competitionDensity,
    competingApplicants,
    tacticalTakeaway,
    speedPercentile,
    maintainerResponsiveness,
  } = intelligence;

  const gradeColors = {
    PRIME: 'text-champagne-400 bg-champagne-500/15 border-champagne-500/30',
    STRONG: 'text-brand-400 bg-brand-500/15 border-brand-500/30',
    SELECTIVE: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
    CONGESTED: 'text-zinc-400 bg-zinc-800 border-zinc-700',
  };

  const densityBadge = {
    Low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    Moderate: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    Fierce: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  };

  return (
    <div className="w-full my-3 sm:my-4 p-4 sm:p-6 rounded-3xl bg-gradient-to-b from-white via-white to-zinc-50 dark:from-obsidian-900 dark:via-obsidian-900 dark:to-obsidian-950 border border-zinc-200/90 dark:border-zinc-800 shadow-xl shadow-zinc-200/40 dark:shadow-2xl relative overflow-hidden">
      {/* Subtle Luxury Ambient Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/5 dark:bg-brand-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-champagne-500/5 dark:bg-champagne-500/5 rounded-full blur-2xl pointer-events-none -ml-20 -mb-20" />

      {/* Header Badge */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-champagne-500/15 text-champagne-500 flex-shrink-0">
            <Compass className="w-4 h-4 animate-spin" style={{ animationDuration: '18s' }} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest font-semibold text-champagne-600 dark:text-champagne-400">
                Classified Applicant Dossier
              </span>
              <span className="text-[9px] sm:text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                PROPRIETARY
              </span>
            </div>
            <h3 className="text-base sm:text-lg md:text-xl font-serif font-bold text-zinc-900 dark:text-white mt-0.5">
              Applicant Feasibility & Competition Analysis
            </h3>
          </div>
        </div>

        {/* Grade Callout */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-zinc-500 font-mono">Rating:</span>
          <span
            className={`px-2.5 sm:px-3 py-1 rounded-xl text-xs font-mono font-bold tracking-wider border flex items-center gap-1.5 ${gradeColors[grade]}`}
          >
            <Target className="w-3.5 h-3.5 flex-shrink-0" />
            {grade} TARGET
          </span>
        </div>
      </div>

      {/* Key Radar Pillars - Responsive 1 col on mobile, 3 cols on tablet/desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3 sm:my-4">
        {/* Feasibility Gauge */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-zinc-50/70 dark:bg-obsidian-850/60 border border-zinc-200/60 dark:border-zinc-800/70 space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
              Feasibility Score
            </span>
            <span className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
              {feasibilityScore}/100
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-serif font-bold text-zinc-900 dark:text-white">
              {feasibilityScore}
            </span>
            <span className="text-xs text-zinc-500 font-mono">index pts</span>
          </div>

          {/* Meter bar */}
          <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 via-indigo-500 to-champagne-400 transition-all duration-700"
              style={{ width: `${feasibilityScore}%` }}
            />
          </div>
        </div>

        {/* Competition Density */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-zinc-50/70 dark:bg-obsidian-850/60 border border-zinc-200/60 dark:border-zinc-800/70 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-champagne-500 flex-shrink-0" />
              Competition Density
            </span>
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${densityBadge[competitionDensity]}`}
            >
              {competitionDensity}
            </span>
          </div>

          <div className="flex items-baseline gap-2 pt-0.5">
            <span className="text-2xl sm:text-3xl font-serif font-bold text-zinc-900 dark:text-white">
              {competingApplicants}
            </span>
            <span className="text-xs text-zinc-500 font-mono">active contenders</span>
          </div>
          <p className="text-[11px] text-zinc-500 leading-normal">
            Other community applicants active in this timeframe.
          </p>
        </div>

        {/* Review Rhythm */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-zinc-50/70 dark:bg-obsidian-850/60 border border-zinc-200/60 dark:border-zinc-800/70 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
              Review Responsiveness
            </span>
            <span className="text-xs font-mono font-semibold text-violet-600 dark:text-violet-400">
              {maintainerResponsiveness}
            </span>
          </div>

          <div className="pt-0.5">
            <div className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white truncate">
              {speedPercentile}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1 leading-normal">
              Based on timestamp differential from PR creation to merge.
            </p>
          </div>
        </div>
      </div>

      {/* Actionable Strategic Takeaway */}
      <div className="mt-3 sm:mt-4 p-3.5 sm:p-4 rounded-2xl bg-brand-50/40 dark:bg-brand-950/20 border border-brand-200/70 dark:border-brand-900/40 text-xs font-sans text-zinc-700 dark:text-zinc-300">
        <div className="font-mono text-[11px] font-bold text-brand-700 dark:text-brand-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
          <span>⚡</span>
          <span>Tactical Guidance for {fullName}</span>
        </div>
        <p className="leading-relaxed text-xs sm:text-[13px]">
          {tacticalTakeaway}
        </p>
      </div>
    </div>
  );
};
