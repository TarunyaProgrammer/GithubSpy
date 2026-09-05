import React from 'react';
import { Star, Github, Heart } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full mt-auto border-t border-[#E5E0D8] py-10 text-xs text-[#787571] bg-white/70 backdrop-blur-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand & Mission */}
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" showText={false} />
            <div>
              <span className="font-display font-bold text-[#161514] text-sm">
                GithubSpy
              </span>
              <p className="text-[11px] text-[#787571] font-sans">
                A simple way to explore open-source projects before you contribute.
              </p>
            </div>
          </div>

          {/* Social / Repo Links */}
          <div className="flex items-center gap-2.5 flex-wrap justify-center font-mono text-xs">
            {/* Star button - Honey Amber */}
            <a
              href="https://github.com/TarunyaProgrammer/GithubSpy"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EAA036] hover:bg-[#DF9126] text-[#161514] font-semibold shadow-2xs transition-all group"
            >
              <Star className="w-3.5 h-3.5 fill-[#161514] text-[#161514] group-hover:scale-110 transition-transform" />
              <span>Star the Project</span>
            </a>

            {/* GitHub Repo */}
            <a
              href="https://github.com/TarunyaProgrammer/GithubSpy"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#EFECE6] text-[#161514] border border-[#E5E0D8] transition-colors shadow-2xs"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub Repo</span>
            </a>

            {/* Author profile */}
            <a
              href="https://github.com/TarunyaProgrammer"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#EFECE6] text-[#161514] border border-[#E5E0D8] transition-colors shadow-2xs"
            >
              <span>@TarunyaProgrammer</span>
            </a>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#F7F5F0] border border-[#E5E0D8] text-xs font-sans text-[#423E38] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-6 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#EAA036]/15 text-[#9E6212] border border-[#EAA036]/30">
                Free to use
              </span>
              <span className="text-[11px] font-mono text-[#787571] hidden xs:inline">
                Built for new contributors
              </span>
            </div>
            <p className="text-xs text-[#524E48] leading-relaxed">
              GitHub Spy helps people take their first step into open source with a clearer view of project activity and contribution patterns.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 text-[11px] font-mono text-[#787571]">
            <span className="px-2.5 py-1 rounded-xl bg-white border border-[#E5E0D8] text-[#161514] font-medium shadow-2xs">
              For open source
            </span>
          </div>
        </div>

        {/* Legal & Attribution Bar */}
        <div className="pt-6 border-t border-[#E5E0D8] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#787571] font-sans">
          <p>
            © {new Date().getFullYear()}{' '}
            <a
              href="https://github.com/TarunyaProgrammer"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#161514] hover:text-[#9E6212] hover:underline transition-colors"
            >
              TarunyaProgrammer
            </a>
            . Protected under Strict Protective Source License (SPSL).
          </p>

          <p className="flex items-center gap-1">
            <span>Built by</span>
            <a
              href="https://github.com/TarunyaProgrammer"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#9E6212] hover:underline"
            >
              @TarunyaProgrammer
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};
