import React, { useState, useEffect } from 'react';
import { X, KeyRound, CheckCircle2, AlertCircle, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import {
  hasPersonalToken,
  savePersonalToken,
  removePersonalToken,
  testTokenValidity,
  sanitizeToken,
} from '../services/token';

interface TokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTokenChanged: () => void;
}

export const TokenModal: React.FC<TokenModalProps> = ({ isOpen, onClose, onTokenChanged }) => {
  const [tokenInput, setTokenInput] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSaved, setIsSaved] = useState(hasPersonalToken());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      setFeedback(null);
      setIsSaved(hasPersonalToken());
      setTokenInput('');
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = sanitizeToken(tokenInput);
    if (!clean) {
      setFeedback({ type: 'error', message: 'Please enter a non-empty token string.' });
      return;
    }

    setIsTesting(true);
    setFeedback(null);

    const check = await testTokenValidity(clean);
    setIsTesting(false);

    if (check.valid) {
      savePersonalToken(clean);
      setIsSaved(true);
      setTokenInput('');
      setFeedback({
        type: 'success',
        message: `Token verified! Authenticated as @${check.username}. 5,000 requests/hour limit unlocked.`,
      });
      onTokenChanged();
    } else {
      setFeedback({
        type: 'error',
        message: check.error || 'Token test failed. Please verify your token.',
      });
    }
  };

  const handleRemove = () => {
    removePersonalToken();
    setIsSaved(false);
    setTokenInput('');
    setFeedback({ type: 'success', message: 'Personal token removed. Operating in standard mode.' });
    onTokenChanged();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="token-modal-title"
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-obsidian-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-champagne-500/15 text-champagne-500">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 id="token-modal-title" className="text-lg font-display font-bold text-zinc-900 dark:text-white">
                GitHub API Rate Limit & Token
              </h3>
              <p className="text-xs text-zinc-500 font-sans">
                Elevate hourly quota from 60 to 5,000 requests.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close token modal"
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current status pill */}
        <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500">Status:</span>
            {isSaved ? (
              <span className="text-brand-600 dark:text-brand-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 5,000 req/hr (Personal PAT active)
              </span>
            ) : (
              <span className="text-zinc-700 dark:text-zinc-300">
                Standard quota mode
              </span>
            )}
          </div>
          {isSaved && (
            <button
              type="button"
              onClick={handleRemove}
              className="text-red-500 hover:text-red-600 flex items-center gap-1 hover:underline"
            >
              <Trash2 className="w-3.5 h-3.5" /> Remove
            </button>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label htmlFor="pat-input" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Personal Access Token (classic or fine-grained)
            </label>
            <input
              id="pat-input"
              type="password"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="ghp_... or github_pat_..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-400 text-xs font-mono focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              disabled={isTesting}
            />
          </div>

          {/* Feedback alert */}
          {feedback && (
            <div
              className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <a
              href="https://github.com/settings/tokens/new?description=GithubSpy&scopes=public_repo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 font-mono"
            >
              <span>Generate token on GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              type="submit"
              disabled={isTesting || !tokenInput.trim()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-600 text-white text-xs font-semibold shadow-md shadow-brand-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {isTesting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isTesting ? 'Verifying...' : 'Save & Verify'}</span>
            </button>
          </div>
        </form>

        {/* Security Note */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500 space-y-1">
          <p>
            🔒 <strong>100% Client-Side:</strong> Stored locally on your device in browser localStorage and dispatched only to GitHub's official API (<code className="font-mono">api.github.com</code>).
          </p>
        </div>
      </div>
    </div>
  );
};
