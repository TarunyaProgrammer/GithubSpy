import React from 'react';
import { ArrowUpRight, BarChart3, KeyRound, ShieldCheck } from 'lucide-react';

interface DeepAnalyticsPanelProps {
  hasPersonalToken: boolean;
  onOpenReport: () => void;
  onOpenTokenModal: () => void;
}

export const DeepAnalyticsPanel: React.FC<DeepAnalyticsPanelProps> = ({ hasPersonalToken, onOpenReport, onOpenTokenModal }) => (
  <section className="my-4 rounded-3xl border border-[#E5E0D8] bg-[#161514] p-4 text-[#F7F5F0] sm:my-6 sm:p-6" aria-labelledby="deep-analytics-title">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-[#EAA036] p-2 text-[#161514]"><BarChart3 className="h-4 w-4" /></div>
        <div><h2 id="deep-analytics-title" className="text-base font-display font-bold sm:text-lg">Deep analytics report</h2><p className="mt-1 max-w-2xl text-xs leading-relaxed text-[#D5D0C7]">Open a dedicated report for the selected timeline. It separates deterministic metrics from optional AI topic interpretation.</p></div>
      </div>
      <button type="button" onClick={onOpenReport} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#EAA036] px-3 py-2 text-xs font-semibold text-[#161514] hover:bg-[#DF9126]"><ArrowUpRight className="h-3.5 w-3.5" /> Open full report</button>
    </div>
    <div className="mt-4 flex flex-col gap-2 border-t border-white/15 pt-4 text-[11px] text-[#AFA9A0] sm:flex-row sm:items-center sm:justify-between"><span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-[#EAA036]" /> Report metrics are calculated from the active filter window.</span>{hasPersonalToken ? <span className="text-[#D5D0C7]">PAT connected: eligible for future review-event scans.</span> : <button type="button" onClick={onOpenTokenModal} className="inline-flex items-center gap-1.5 font-semibold text-[#EAA036] hover:underline"><KeyRound className="h-3.5 w-3.5" /> Add PAT for review-event scans</button>}</div>
  </section>
);
