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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#161514]/40 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="token-modal-title"
    >
      <div
        className="w-full max-w-lg bg-white rounded-3xl border border-[#E5E0D8] shadow-2xl overflow-hidden p-4 sm:p-6 space-y-3.5 sm:space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 rounded-2xl bg-[#EAA036]/15 text-[#9E6212] flex-shrink-0">
              <KeyRound className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 id="token-modal-title" className="text-base sm:text-lg font-display font-bold text-[#161514]">
                GitHub API Rate Limit & Token
              </h3>
              <p className="text-xs text-[#787571] font-sans">
                Elevate hourly quota from 60 to 5,000 requests.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close token modal"
            className="p-1.5 rounded-xl text-[#787571] hover:text-[#161514] hover:bg-[#EFECE6] transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current status pill */}
        <div className="p-3 sm:p-3.5 rounded-2xl bg-[#F7F5F0] border border-[#E5E0D8] flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1.5 sm:gap-2 truncate mr-2">
            <span className="text-[#787571]">Status:</span>
            {isSaved ? (
              <span className="text-emerald-700 font-semibold flex items-center gap-1 truncate">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600" />
                <span className="truncate">5,000 req/hr Active</span>
              </span>
            ) : (
              <span className="text-[#524E48] truncate">
                Standard quota mode
              </span>
            )}
          </div>
          {isSaved && (
            <button
              type="button"
              onClick={handleRemove}
              className="text-rose-600 hover:text-rose-700 flex items-center gap-1 hover:underline flex-shrink-0 font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" /> Remove
            </button>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label htmlFor="pat-input" className="block text-xs font-medium text-[#423E38] mb-1">
              Personal Access Token (classic or fine-grained)
            </label>
            <input
              id="pat-input"
              type="password"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="ghp_... or github_pat_..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F5F0] border border-[#E5E0D8] text-[#161514] placeholder-[#8F8B83] text-xs font-mono focus:outline-none focus:border-[#EAA036] focus:ring-1 focus:ring-[#EAA036]"
              disabled={isTesting}
            />
          </div>

          {/* Feedback alert */}
          {feedback && (
            <div
              className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-rose-600" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
            <a
              href="https://github.com/settings/tokens/new?description=GithubSpy&scopes=public_repo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#9E6212] hover:underline flex items-center gap-1 font-mono justify-center sm:justify-start py-1"
            >
              <span>Generate token on GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              type="submit"
              disabled={isTesting || !tokenInput.trim()}
              className="px-4 py-2 rounded-xl bg-[#EAA036] hover:bg-[#DF9126] active:bg-[#C87E18] text-[#161514] text-xs font-semibold shadow-xs transition-all disabled:opacity-45 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              {isTesting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isTesting ? 'Verifying...' : 'Save & Verify'}</span>
            </button>
          </div>
        </form>

        {/* Security Note */}
        <div className="pt-2 border-t border-[#E5E0D8] text-[11px] text-[#787571] space-y-1">
          <p>
            🔒 <strong>100% Client-Side:</strong> Stored locally in your browser's localStorage and dispatched directly only to GitHub's official API (<code className="font-mono">api.github.com</code>).
          </p>
        </div>
      </div>
    </div>
  );
};
