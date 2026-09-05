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
    PRIME: 'text-[#9E6212] bg-[#EAA036]/15 border-[#EAA036]/40',
    STRONG: 'text-[#161514] bg-[#EFECE6] border-[#D5D0C7]',
    SELECTIVE: 'text-[#8A5A12] bg-[#EAA036]/10 border-[#EAA036]/25',
    CONGESTED: 'text-[#524E48] bg-[#EFECE6] border-[#E5E0D8]',
  };

  const densityBadge = {
    Low: 'text-emerald-800 bg-emerald-50 border-emerald-200',
    Moderate: 'text-[#9E6212] bg-[#EAA036]/15 border-[#EAA036]/30',
    Fierce: 'text-rose-800 bg-rose-50 border-rose-200',
  };

  return (
    <div className="w-full my-3 sm:my-4 p-4 sm:p-6 rounded-3xl bg-white border border-[#E5E0D8] shadow-xs relative overflow-hidden">
      {/* Header Dossier Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-[#E5E0D8]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#EAA036]/15 text-[#9E6212] flex-shrink-0">
            <Compass className="w-4 h-4 animate-spin" style={{ animationDuration: '18s' }} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest font-semibold text-[#9E6212]">
                Applicant Feasibility Dossier
              </span>
              <span className="text-[9px] sm:text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#EFECE6] text-[#787571]">
                PROPRIETARY
              </span>
            </div>
            <h3 className="text-base sm:text-lg md:text-xl font-display font-bold text-[#161514] mt-0.5">
              Feasibility & Contender Intelligence
            </h3>
          </div>
        </div>

        {/* Grade Callout */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-[#787571] font-mono">Rating:</span>
          <span
            className={`px-3 py-1 rounded-xl text-xs font-mono font-bold tracking-wider border flex items-center gap-1.5 ${gradeColors[grade]}`}
          >
            <Target className="w-3.5 h-3.5 flex-shrink-0 text-[#EAA036]" />
            {grade} TARGET
          </span>
        </div>
      </div>

      {/* Key Radar Pillars - Responsive 1 col on mobile, 3 cols on tablet/desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3 sm:my-4">
        {/* Feasibility Gauge */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F7F5F0] border border-[#E5E0D8] space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#65615B] font-medium flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#EAA036] flex-shrink-0" />
              Feasibility Score
            </span>
            <span className="text-xs font-mono font-bold text-[#161514]">
              {feasibilityScore}/100
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-display font-bold text-[#161514]">
              {feasibilityScore}
            </span>
            <span className="text-xs text-[#787571] font-mono">pts</span>
          </div>

          {/* Meter bar */}
          <div className="w-full bg-[#E5E0D8] h-2 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-[#EAA036] transition-all duration-700"
              style={{ width: `${feasibilityScore}%` }}
            />
          </div>
        </div>

        {/* Competition Density */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F7F5F0] border border-[#E5E0D8] space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#65615B] font-medium flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#EAA036] flex-shrink-0" />
              Competition Density
            </span>
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${densityBadge[competitionDensity]}`}
            >
              {competitionDensity}
            </span>
          </div>

          <div className="flex items-baseline gap-2 pt-0.5">
            <span className="text-2xl sm:text-3xl font-display font-bold text-[#161514]">
              {competingApplicants}
            </span>
            <span className="text-xs text-[#787571] font-mono">active contenders</span>
          </div>
          <p className="text-[11px] text-[#787571] leading-normal">
            Other community applicants active in this timeframe.
          </p>
        </div>

        {/* Review Rhythm */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F7F5F0] border border-[#E5E0D8] space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#65615B] font-medium flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-[#787571] flex-shrink-0" />
              Review Responsiveness
            </span>
            <span className="text-xs font-mono font-semibold text-[#161514]">
              {maintainerResponsiveness}
            </span>
          </div>

          <div className="pt-0.5">
            <div className="text-xs sm:text-sm font-semibold text-[#161514] truncate">
              {speedPercentile}
            </div>
            <p className="text-[11px] text-[#787571] mt-1 leading-normal">
              Based on timestamp differential from PR creation to merge.
            </p>
          </div>
        </div>
      </div>

      {/* Actionable Strategic Takeaway */}
      <div className="mt-3 sm:mt-4 p-3.5 sm:p-4 rounded-2xl bg-[#F7F5F0] border border-[#E5E0D8] text-xs font-sans text-[#423E38]">
        <div className="font-mono text-[11px] font-bold text-[#9E6212] uppercase tracking-wider mb-1 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-[#EAA036] flex-shrink-0" />
          <span>Tactical Guidance for {fullName}</span>
        </div>
        <p className="leading-relaxed text-xs sm:text-[13px]">
          {tacticalTakeaway}
        </p>
      </div>
    </div>
  );
};
