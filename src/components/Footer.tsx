import React from 'react';
import { Star, Github, Heart } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full mt-auto border-t border-zinc-200/80 dark:border-zinc-800/80 py-10 text-xs text-zinc-500 transition-colors bg-white/50 dark:bg-obsidian-950/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand & Mission */}
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" showText={false} />
            <div>
              <span className="font-display font-bold text-zinc-800 dark:text-zinc-200 text-sm">
                GithubSpy
              </span>
              <p className="text-[11px] text-zinc-500 font-sans">
                Elite Contributor Intelligence & Applicant Feasibility Radar
              </p>
            </div>
          </div>

          {/* Social / Repo Links */}
          <div className="flex items-center gap-3 flex-wrap justify-center font-mono text-xs">
            {/* Star button */}
            <a
              href="https://github.com/TarunyaProgrammer/GithubSpy"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-champagne-500/10 hover:bg-champagne-500/20 text-champagne-700 dark:text-champagne-300 border border-champagne-500/30 transition-all group"
            >
              <Star className="w-3.5 h-3.5 fill-champagne-500 text-champagne-500 group-hover:scale-110 transition-transform" />
              <span>Star the Project</span>
            </a>

            {/* GitHub Repo */}
            <a
              href="https://github.com/TarunyaProgrammer/GithubSpy"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub Repo</span>
            </a>

            {/* Author profile */}
            <a
              href="https://github.com/TarunyaProgrammer"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 text-brand-700 dark:text-brand-300 border border-brand-500/25 transition-colors"
            >
              <span>@TarunyaProgrammer</span>
            </a>
          </div>
        </div>

        {/* Legal & Attribution Bar */}
        <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-400 font-sans">
          <p>
            © {new Date().getFullYear()}{' '}
            <a
              href="https://github.com/TarunyaProgrammer"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-zinc-600 dark:text-zinc-300 hover:text-brand-500 hover:underline transition-colors"
            >
              TarunyaProgrammer
            </a>
            . Protected under Strict Protective Source License (SPSL).
          </p>

          <p className="flex items-center gap-1">
            <span>Crafted with precision by</span>
            <a
              href="https://github.com/TarunyaProgrammer"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-brand-600 dark:text-brand-400 hover:underline"
            >
              @TarunyaProgrammer
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};
