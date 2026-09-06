import React, { useState, useEffect } from 'react';
import { X, KeyRound, CheckCircle2, AlertCircle, Trash2, ExternalLink, Loader2, Lock } from 'lucide-react';
import {
  hasPersonalToken,
  savePersonalToken,
  removePersonalToken,
  testTokenValidity,
  sanitizeToken,
  getMaskedToken,
} from '../services/token';

import type { RateLimitInfo } from '../types';

interface TokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTokenChanged: () => void;
  rateLimit?: RateLimitInfo | null;
}

export const TokenModal: React.FC<TokenModalProps> = ({
  isOpen,
  onClose,
  onTokenChanged,
  rateLimit,
}) => {
  const [tokenInput, setTokenInput] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSaved, setIsSaved] = useState(hasPersonalToken());
  const [isEditing, setIsEditing] = useState(false);

  const maskedToken = getMaskedToken();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      setFeedback(null);
      setIsSaved(hasPersonalToken());
      setIsEditing(false);
      setTokenInput('');
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const remaining = rateLimit?.remaining ?? null;
  const limit = rateLimit?.limit ?? (isSaved ? 5000 : 60);
  const resetTimeStr = rateLimit?.resetDate ? rateLimit.resetDate.toLocaleTimeString() : null;

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
      setIsEditing(false);
      setTokenInput('');
      setFeedback({
        type: 'success',
        message: `Connected as @${check.username}. You can now make up to 5,000 GitHub requests per hour.`,
      });
      onTokenChanged();
    } else {
      setFeedback({
        type: 'error',
        message: check.error || 'We could not verify that token. Check it and try again.',
      });
    }
  };

  const handleRemove = () => {
    removePersonalToken();
    setIsSaved(false);
    setIsEditing(false);
    setTokenInput('');
    setFeedback({ type: 'success', message: 'GitHub token removed. You are back to the public request limit.' });
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
                {isSaved ? 'GitHub Access Token' : 'Add a GitHub access token'}
              </h3>
              <p className="text-xs text-[#787571] font-sans">
                {isSaved
                  ? 'Your personal access token is active and stored in your browser.'
                  : 'Optional: this raises your GitHub request limit from 60 to 5,000 checks per hour.'}
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

        {/* Live Authoritative Quota Breakdown */}
        <div className="p-3 sm:p-3.5 rounded-2xl bg-[#F7F5F0] border border-[#E5E0D8] space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between">
            <span className="text-[#787571]">Current access:</span>
            {isSaved ? (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                5,000 checks per hour
              </span>
            ) : (
              <span className="text-[#524E48] font-medium">
                Public access (60 checks per hour)
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#787571]">Checks remaining:</span>
            <span className="font-bold text-[#161514]">
              {remaining !== null ? `${remaining.toLocaleString()} remaining` : 'Checking…'}
            </span>
          </div>

          {resetTimeStr && (
            <div className="flex items-center justify-between text-[11px] text-[#787571]">
              <span>Limit resets at:</span>
              <span>{resetTimeStr}</span>
            </div>
          )}
        </div>

        {/* Active Stored Token Status Card */}
        {isSaved && !isEditing ? (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="text-xs font-semibold text-emerald-900">
                  Token active in local storage
                </span>
              </div>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-white border border-emerald-200 text-emerald-800 shadow-2xs">
                {maskedToken || '••••••••'}
              </span>
            </div>
            <p className="text-[11px] text-emerald-800/90 leading-relaxed">
              Your token is saved in this browser’s local storage and used for all searches. You do not need to re-enter it.
            </p>
            <div className="flex items-center justify-between pt-1 border-t border-emerald-200/60 text-xs">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="text-[#9E6212] hover:text-[#7D4D0E] font-semibold hover:underline cursor-pointer"
              >
                Replace token
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="text-rose-600 hover:text-rose-700 flex items-center gap-1 hover:underline font-medium cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove token
              </button>
            </div>
          </div>
        ) : (
          /* Input Form */
          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="pat-input" className="block text-xs font-medium text-[#423E38]">
                  {isSaved ? 'Enter new GitHub personal access token' : 'GitHub personal access token'}
                </label>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setTokenInput('');
                      setFeedback(null);
                    }}
                    className="text-xs text-[#787571] hover:text-[#161514] hover:underline cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
              <input
                id="pat-input"
                type="password"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="ghp_... or github_pat_..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F5F0] border border-[#E5E0D8] text-[#161514] placeholder-[#8F8B83] text-xs font-mono focus:outline-none focus:border-[#EAA036] focus:ring-1 focus:ring-[#EAA036]"
                disabled={isTesting}
                autoFocus={isEditing}
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
                <span>Create a token on GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                type="submit"
                disabled={isTesting || !tokenInput.trim()}
                className="px-4 py-2 rounded-xl bg-[#EAA036] hover:bg-[#DF9126] active:bg-[#C87E18] text-[#161514] text-xs font-semibold shadow-xs transition-all disabled:opacity-45 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isTesting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isTesting ? 'Checking…' : isSaved ? 'Save and replace token' : 'Save and check token'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Security Note */}
        <div className="pt-2 border-t border-[#E5E0D8] text-[11px] text-[#787571] space-y-1">
          <p className="flex items-start gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#EAA036] flex-shrink-0 mt-0.5" />
            <span>
              <strong>Stored only in this browser:</strong> Your token is saved locally and is sent directly to GitHub when you check a project. It is never sent to a GitHub Spy server.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
