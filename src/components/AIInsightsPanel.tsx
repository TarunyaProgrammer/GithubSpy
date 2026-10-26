import React, { useState } from 'react';
import { BrainCircuit, ExternalLink, Loader2, ShieldAlert, Sparkles } from 'lucide-react';
import type { AIRepositoryAnalysis } from '../types';
import { generateRepositoryAIAnalysis, type AIConfig, type AIProvider } from '../services/ai';

interface AIInsightsPanelProps {
  evidence: unknown;
}

const DEFAULT_MODELS: Record<AIProvider, string> = {
  gemini: 'gemini-2.5-flash',
  openrouter: 'google/gemini-2.5-flash',
};

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ evidence }) => {
  const [provider, setProvider] = useState<AIProvider>('gemini');
  const [model, setModel] = useState(DEFAULT_MODELS.gemini);
  const [apiKey, setApiKey] = useState('');
  const [analysis, setAnalysis] = useState<AIRepositoryAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      setAnalysis(await generateRepositoryAIAnalysis(evidence, { provider, model, apiKey }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The AI provider could not analyze this report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-3xl border border-[#EAA036]/35 bg-[#FFF9EF] p-4 sm:p-6" aria-labelledby="ai-insights-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-[#EAA036] p-2 text-[#161514]"><BrainCircuit className="h-4 w-4" /></div>
          <div>
            <h2 id="ai-insights-title" className="text-base font-display font-bold text-[#161514] sm:text-lg">AI topic analysis</h2>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-[#65615B]">Optional interpretation of the selected PR window. The model receives titles, labels, shortened bodies, authors, states, and timestamps from this report only.</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#EAA036]/35 bg-white px-2.5 py-1 text-[10px] font-semibold text-[#9E6212]"><Sparkles className="h-3 w-3" /> Bring your own key</span>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-[150px_1fr_1fr_auto]">
        <label className="text-[11px] font-medium text-[#65615B]">Provider
          <select value={provider} onChange={(event) => { const next = event.target.value as AIProvider; setProvider(next); setModel(DEFAULT_MODELS[next]); }} className="mt-1 w-full rounded-xl border border-[#E5E0D8] bg-white px-3 py-2 text-xs text-[#161514] focus:border-[#EAA036] focus:outline-none">
            <option value="gemini">Google Gemini</option>
            <option value="openrouter">OpenRouter</option>
          </select>
        </label>
        <label className="text-[11px] font-medium text-[#65615B]">Model
          <input value={model} onChange={(event) => setModel(event.target.value)} className="mt-1 w-full rounded-xl border border-[#E5E0D8] bg-white px-3 py-2 text-xs text-[#161514] focus:border-[#EAA036] focus:outline-none" />
        </label>
        <label className="text-[11px] font-medium text-[#65615B]">API key <span className="font-normal text-[#8F8B83]">(session only)</span>
          <input type="password" value={apiKey} onChange={(event) => setApiKey(event.target.value)} placeholder="Paste a provider key" autoComplete="off" className="mt-1 w-full rounded-xl border border-[#E5E0D8] bg-white px-3 py-2 text-xs text-[#161514] placeholder-[#8F8B83] focus:border-[#EAA036] focus:outline-none" />
        </label>
        <button type="button" onClick={runAnalysis} disabled={loading || !apiKey.trim() || !model.trim()} className="inline-flex min-h-[38px] items-center justify-center gap-2 self-end rounded-xl bg-[#161514] px-3 py-2 text-xs font-semibold text-[#F7F5F0] hover:bg-[#2A2724] disabled:cursor-not-allowed disabled:opacity-45">{loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BrainCircuit className="h-3.5 w-3.5" />} {loading ? 'Analyzing…' : 'Analyze topics'}</button>
      </div>

      <div className="mt-3 flex items-start gap-2 text-[10px] leading-relaxed text-[#787571]"><ShieldAlert className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#9E6212]" /><span>This browser sends the evidence packet directly to the selected provider. The key is held in component memory and is not saved by GithubSpy. For a public deployment, move these calls behind a server-side proxy and enforce quotas.</span></div>

      {error && <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-900" role="alert">{error}</p>}
      {analysis && <AIResult analysis={analysis} />}
    </section>
  );
};

function AIResult({ analysis }: { analysis: AIRepositoryAnalysis }) {
  return <div className="mt-5 space-y-4 border-t border-[#EAA036]/25 pt-4">
    <div><p className="text-sm font-semibold text-[#161514]">Model readout</p><p className="mt-1 text-xs leading-relaxed text-[#524E48]">{analysis.summary || 'No summary returned.'}</p></div>
    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
      {analysis.focusAreas.map((area) => <article key={`${area.topic}-${area.evidencePRNumbers.join('-')}`} className="rounded-2xl border border-[#E5E0D8] bg-white p-3"><div className="flex items-center justify-between gap-2"><h3 className="text-xs font-semibold text-[#161514]">{area.topic}</h3><span className="text-[10px] font-mono text-[#9E6212]">{area.confidence} confidence</span></div><p className="mt-1 text-[11px] leading-relaxed text-[#65615B]">{area.summary}</p><p className="mt-2 text-[10px] font-mono text-[#787571]">{area.mergedPRCount} merged · evidence PRs: {area.evidencePRNumbers.join(', ') || 'none'}</p></article>)}
    </div>
    {!!analysis.maintainerPatterns.length && <div><p className="text-xs font-semibold text-[#161514]">Maintainer patterns</p><ul className="mt-1 list-disc space-y-1 pl-4 text-[11px] text-[#65615B]">{analysis.maintainerPatterns.map((item) => <li key={item}>{item}</li>)}</ul></div>}
    {!!analysis.caveats.length && <div className="text-[10px] leading-relaxed text-[#787571]">Caveats: {analysis.caveats.join(' ')}</div>}
    <a className="inline-flex items-center gap-1 text-[10px] font-mono text-[#9E6212]" href="https://ai.google.dev/gemini-api/docs/structured-output" target="_blank" rel="noopener noreferrer">Structured output guidance <ExternalLink className="h-3 w-3" /></a>
  </div>;
}
