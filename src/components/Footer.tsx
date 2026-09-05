import React, { useState } from 'react';
import { Github, Linkedin, Bug, ArrowRight, Check, ExternalLink, Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 5000);
      setEmail('');
    }
  };

  return (
    <footer className="w-full mt-auto bg-[#F6F5F2] border-t border-[#DDD8CE] text-[#161514] font-sans antialiased selection:bg-[#EAA036]/20">
      
      {/* ========================================================= */}
      {/* 1. TOP SECTION: BRAND STATEMENT                          */}
      {/* ========================================================= */}
      <div className="border-b border-[#DDD8CE]">
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#DDD8CE]">
          
          {/* Tagline / Big Bold Statement */}
          <div className="lg:col-span-4 p-6 sm:p-8 flex flex-col justify-between">
            <h2 className="text-xl sm:text-2xl md:text-[25px] font-black uppercase tracking-tight text-[#161514] leading-[1.15]">
              An open source radar that illuminates your contribution path
            </h2>
            <div className="mt-4 pt-4 border-t border-[#DDD8CE]/60 flex items-center gap-2 text-[11px] font-mono text-[#787571]">
              <span className="inline-block w-2 h-2 rounded-full bg-[#EAA036] animate-pulse" />
              <span>Maintainer intelligence & PR turnaround telemetry</span>
            </div>
          </div>

          {/* Platform Column */}
          <div className="lg:col-span-2 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#787571] block mb-4">
                Platform
              </span>
              <ul className="space-y-2.5 text-xs font-medium">
                <li>
                  <a href="#" className="text-[#C87E18] font-bold hover:underline transition-colors">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#repo-search-input" className="text-[#423E38] hover:text-[#161514] transition-colors">
                    Inspect Repository
                  </a>
                </li>
                <li>
                  <a href="#repo-search-input" className="text-[#423E38] hover:text-[#161514] transition-colors">
                    Review Pace Engine
                  </a>
                </li>
                <li>
                  <a href="#repo-search-input" className="text-[#423E38] hover:text-[#161514] transition-colors">
                    Applicant Index (AFI)
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Explore Column */}
          <div className="lg:col-span-2 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#787571] block mb-4">
                Explore
              </span>
              <ul className="space-y-2.5 text-xs font-medium">
                <li>
                  <a href="https://github.com/zulip/zulip" target="_blank" rel="noopener noreferrer" className="text-[#423E38] hover:text-[#161514] transition-colors flex items-center justify-between group">
                    <span>Zulip</span>
                    <ArrowRight className="w-3 h-3 text-[#787571] group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </li>
                <li>
                  <a href="https://github.com/facebook/react" target="_blank" rel="noopener noreferrer" className="text-[#423E38] hover:text-[#161514] transition-colors flex items-center justify-between group">
                    <span>React</span>
                    <ArrowRight className="w-3 h-3 text-[#787571] group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </li>
                <li>
                  <a href="https://github.com/django/django" target="_blank" rel="noopener noreferrer" className="text-[#423E38] hover:text-[#161514] transition-colors flex items-center justify-between group">
                    <span>Django</span>
                    <ArrowRight className="w-3 h-3 text-[#787571] group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </li>
                <li>
                  <a href="https://github.com/sympy/sympy" target="_blank" rel="noopener noreferrer" className="text-[#423E38] hover:text-[#161514] transition-colors flex items-center justify-between group">
                    <span>SymPy</span>
                    <ArrowRight className="w-3 h-3 text-[#787571] group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Resources Column */}
          <div className="lg:col-span-2 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#787571] block mb-4">
                Resources
              </span>
              <ul className="space-y-2.5 text-xs font-medium">
                <li>
                  <a href="https://github.com/TarunyaProgrammer/GithubSpy#readme" target="_blank" rel="noopener noreferrer" className="text-[#423E38] hover:text-[#161514] transition-colors">
                    Insights
                  </a>
                </li>
                <li>
                  <a href="https://github.com/TarunyaProgrammer/GithubSpy#architecture" target="_blank" rel="noopener noreferrer" className="text-[#423E38] hover:text-[#161514] transition-colors">
                    Architecture
                  </a>
                </li>
                <li>
                  <a href="https://github.com/TarunyaProgrammer/GithubSpy#rate-limits" target="_blank" rel="noopener noreferrer" className="text-[#423E38] hover:text-[#161514] transition-colors">
                    GraphQL Engine
                  </a>
                </li>
                <li>
                  <a href="https://github.com/TarunyaProgrammer/GithubSpy/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className="text-[#423E38] hover:text-[#161514] transition-colors">
                    SPSL-1.0 License
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Isometric 3D Wireframe Logo Block (Visible on Desktop Right, Centered on Mobile) */}
          <div className="hidden lg:flex lg:col-span-2 p-6 sm:p-8 items-center justify-center bg-[#F1EFEA]/60">
            <svg
              viewBox="0 0 140 140"
              className="w-24 h-24 sm:w-28 sm:h-28 drop-shadow-xs transition-transform hover:scale-105"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="GithubSpy Isometric Wireframe Insignia"
            >
              {/* Isometric 3D Wireframe Monolith */}
              <polygon points="36,24 64,10 64,28 36,42" stroke="#161514" strokeWidth="3" fill="#FFFFFF" strokeLinejoin="round" />
              <polygon points="76,16 104,2 104,20 76,34" stroke="#161514" strokeWidth="3" fill="#FFFFFF" strokeLinejoin="round" />
              <polygon points="46,38 94,14 94,24 46,48" stroke="#161514" strokeWidth="2.5" fill="#EAA036" fillOpacity="0.25" strokeLinejoin="round" />
              <polygon points="36,42 64,28 64,88 36,102" stroke="#161514" strokeWidth="3" fill="#F7F5F0" strokeLinejoin="round" />
              <polygon points="48,48 64,40 64,78 48,86" stroke="#161514" strokeWidth="2.5" fill="#EFECE6" strokeLinejoin="round" />
              <polygon points="64,54 84,44 84,62 64,72" stroke="#161514" strokeWidth="3" fill="#FFFFFF" strokeLinejoin="round" />
              <polygon points="76,34 104,20 104,80 76,94" stroke="#161514" strokeWidth="3" fill="#FFFFFF" strokeLinejoin="round" />
              <polygon points="64,88 104,68 104,96 64,116" stroke="#161514" strokeWidth="3" fill="#E8E4DC" strokeLinejoin="round" />
              <polygon points="36,102 64,116 104,96 76,82" stroke="#161514" strokeWidth="2.5" fill="#DCD6CA" strokeLinejoin="round" />
              <circle cx="74" cy="58" r="3.5" fill="#C87E18" />
            </svg>
          </div>

        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. MIDDLE ROW: SUBSCRIBE + REPO + CONNECT + COMMUNITY     */}
      {/* ========================================================= */}
      <div className="border-b border-[#DDD8CE]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 divide-y sm:divide-y-0 sm:divide-x divide-[#DDD8CE]">

          {/* Subscribe Box */}
          <div className="sm:col-span-2 lg:col-span-4 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#787571] block mb-2">
                Subscribe
              </span>
              <p className="text-xs text-[#524E48] leading-relaxed mb-4">
                Want to see more cool tools like this? Sign up for occasional open-source intelligence and updates.
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="relative mt-2">
              <div className="flex items-stretch border border-[#DDD8CE] bg-white rounded-none focus-within:border-[#161514] transition-colors">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={subscribed ? "Thank you for subscribing!" : "Enter your email"}
                  disabled={subscribed}
                  required
                  className="w-full px-3 py-2.5 text-xs text-[#161514] placeholder-[#8F8B83] bg-transparent focus:outline-none font-mono"
                />
                <button
                  type="submit"
                  disabled={subscribed}
                  aria-label="Submit newsletter subscription"
                  className="px-4 flex items-center justify-center border-l border-[#DDD8CE] bg-[#F7F5F0] hover:bg-[#EFECE6] text-[#161514] transition-colors cursor-pointer disabled:bg-emerald-50"
                >
                  {subscribed ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5 text-[#161514]" />
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Repository Coordinates */}
          <div className="sm:col-span-1 lg:col-span-2 p-6 sm:p-8 flex flex-col justify-between border-t sm:border-t-0 border-[#DDD8CE]">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#787571] block mb-2">
                Repository
              </span>
              <p className="text-xs font-mono font-semibold text-[#161514] leading-relaxed">
                TarunyaProgrammer / GithubSpy
              </p>
              <p className="mt-1 text-[11px] font-mono text-[#787571]">
                Global Open Source
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-[#DDD8CE]/60">
              <a
                href="https://github.com/TarunyaProgrammer/GithubSpy"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#161514] hover:text-[#C87E18] transition-colors group"
              >
                <span>View on GitHub</span>
                <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>

          {/* Connect & Bug Reporting (Requested by User) */}
          <div className="sm:col-span-1 lg:col-span-3 p-6 sm:p-8 flex flex-col justify-between border-t sm:border-t-0 border-[#DDD8CE]">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#787571] block mb-2">
                Connect With Author
              </span>
              <p className="text-xs font-semibold text-[#161514]">
                Tarunya Kesharwani
              </p>
              <p className="mt-0.5 text-[11px] text-[#787571]">
                Open-source engineer & researcher
              </p>

              <div className="mt-3 space-y-1.5">
                <a
                  href="https://www.linkedin.com/in/tarunyakesharwani"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-[#423E38] hover:text-[#0A66C2] transition-colors font-medium"
                >
                  <Linkedin className="w-3.5 h-3.5 text-[#0A66C2] flex-shrink-0" />
                  <span className="truncate">linkedin.com/in/tarunyakesharwani</span>
                </a>
                <a
                  href="https://github.com/TarunyaProgrammer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-[#423E38] hover:text-[#161514] transition-colors font-medium"
                >
                  <Github className="w-3.5 h-3.5 text-[#161514] flex-shrink-0" />
                  <span className="truncate">github.com/TarunyaProgrammer</span>
                </a>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[#DDD8CE]/60">
              <a
                href="https://github.com/TarunyaProgrammer/GithubSpy/issues/new"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C87E18] hover:text-[#9E6212] transition-colors"
              >
                <Bug className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Found a bug? Open an issue</span>
              </a>
            </div>
          </div>

          {/* Social & Community Links */}
          <div className="sm:col-span-2 lg:col-span-3 p-6 sm:p-8 flex flex-col justify-between border-t lg:border-t-0 border-[#DDD8CE]">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#787571] block mb-3">
                Social & Community
              </span>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs font-medium">
                <a
                  href="https://github.com/TarunyaProgrammer/GithubSpy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#423E38] hover:text-[#161514] transition-colors"
                >
                  GitHub
                </a>
                <a
                  href="https://www.linkedin.com/in/tarunyakesharwani"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#423E38] hover:text-[#0A66C2] transition-colors"
                >
                  LinkedIn
                </a>
                <a
                  href="https://github.com/TarunyaProgrammer/GithubSpy/stargazers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#423E38] hover:text-[#161514] transition-colors"
                >
                  Star Project
                </a>
                <a
                  href="https://github.com/TarunyaProgrammer/GithubSpy/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#423E38] hover:text-[#161514] transition-colors"
                >
                  Bug Reports
                </a>
                <a
                  href="https://github.com/TarunyaProgrammer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#423E38] hover:text-[#161514] transition-colors"
                >
                  Author Work
                </a>
                <a
                  href="https://github.com/TarunyaProgrammer/GithubSpy/blob/main/LICENSE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#423E38] hover:text-[#161514] transition-colors"
                >
                  License
                </a>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[#DDD8CE]/60 flex items-center gap-2 text-[11px] font-mono text-[#787571]">
              <Shield className="w-3 h-3 text-[#EAA036]" />
              <span>SPSL Protected • Zero Tracking</span>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile-Only Centered Isometric Insignia */}
      <div className="flex lg:hidden p-8 items-center justify-center bg-[#F1EFEA]/60 border-b border-[#DDD8CE]">
        <svg
          viewBox="0 0 140 140"
          className="w-24 h-24 drop-shadow-xs"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="GithubSpy Isometric Wireframe Insignia"
        >
          <polygon points="36,24 64,10 64,28 36,42" stroke="#161514" strokeWidth="3" fill="#FFFFFF" strokeLinejoin="round" />
          <polygon points="76,16 104,2 104,20 76,34" stroke="#161514" strokeWidth="3" fill="#FFFFFF" strokeLinejoin="round" />
          <polygon points="46,38 94,14 94,24 46,48" stroke="#161514" strokeWidth="2.5" fill="#EAA036" fillOpacity="0.25" strokeLinejoin="round" />
          <polygon points="36,42 64,28 64,88 36,102" stroke="#161514" strokeWidth="3" fill="#F7F5F0" strokeLinejoin="round" />
          <polygon points="48,48 64,40 64,78 48,86" stroke="#161514" strokeWidth="2.5" fill="#EFECE6" strokeLinejoin="round" />
          <polygon points="64,54 84,44 84,62 64,72" stroke="#161514" strokeWidth="3" fill="#FFFFFF" strokeLinejoin="round" />
          <polygon points="76,34 104,20 104,80 76,94" stroke="#161514" strokeWidth="3" fill="#FFFFFF" strokeLinejoin="round" />
          <polygon points="64,88 104,68 104,96 64,116" stroke="#161514" strokeWidth="3" fill="#E8E4DC" strokeLinejoin="round" />
          <polygon points="36,102 64,116 104,96 76,82" stroke="#161514" strokeWidth="2.5" fill="#DCD6CA" strokeLinejoin="round" />
          <circle cx="74" cy="58" r="3.5" fill="#C87E18" />
        </svg>
      </div>

      {/* ========================================================= */}
      {/* 3. BLUEPRINT DRAFTING BANNER: GIANT GITHUBSPY OUTLINE     */}
      {/* ========================================================= */}
      <div className="relative w-full bg-[#F3F0EA] border-b border-[#DDD8CE] px-4 sm:px-8 py-8 sm:py-12 select-none overflow-hidden">
        
        {/* 4 Corner Blueprint Crosses '+' */}
        <span className="absolute top-2 left-2.5 font-mono text-xs text-[#9E9B95] font-light leading-none">+</span>
        <span className="absolute top-2 right-2.5 font-mono text-xs text-[#9E9B95] font-light leading-none">+</span>
        <span className="absolute bottom-2 left-2.5 font-mono text-xs text-[#9E9B95] font-light leading-none">+</span>
        <span className="absolute bottom-2 right-2.5 font-mono text-xs text-[#9E9B95] font-light leading-none">+</span>

        {/* Top Measurement Ruler Ticks */}
        <div className="w-full flex justify-between items-center text-[8px] font-mono text-[#A8A49C] tracking-[0.3em] overflow-hidden opacity-75 mb-3">
          <span>|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|</span>
        </div>

        {/* Giant Architectural Blueprint Typography */}
        <div className="w-full flex items-center justify-center py-2 sm:py-4">
          <svg
            viewBox="0 0 1000 160"
            className="w-full max-w-5xl h-auto"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Horizontal Construction / Alignment Guides */}
            <line x1="20" y1="28" x2="980" y2="28" stroke="#D1CBC1" strokeWidth="0.75" strokeDasharray="4 4" />
            <line x1="20" y1="84" x2="980" y2="84" stroke="#C5BFB5" strokeWidth="0.75" strokeDasharray="3 3" />
            <line x1="20" y1="138" x2="980" y2="138" stroke="#D1CBC1" strokeWidth="0.75" strokeDasharray="4 4" />

            {/* Architectural Outline Text */}
            <text
              x="500"
              y="126"
              textAnchor="middle"
              className="font-mono select-none"
              style={{
                fontSize: '118px',
                fontWeight: 900,
                letterSpacing: '0.08em',
                fill: '#F3F0EA',
                stroke: '#161514',
                strokeWidth: '2.8px',
                strokeLinejoin: 'round',
              }}
            >
              GITHUBSPY
            </text>

            {/* Centerline Crosshairs on letters for technical aesthetic */}
            <line x1="160" y1="20" x2="160" y2="145" stroke="#C5BFB5" strokeWidth="0.6" strokeDasharray="2 4" />
            <line x1="330" y1="20" x2="330" y2="145" stroke="#C5BFB5" strokeWidth="0.6" strokeDasharray="2 4" />
            <line x1="500" y1="20" x2="500" y2="145" stroke="#C5BFB5" strokeWidth="0.6" strokeDasharray="2 4" />
            <line x1="670" y1="20" x2="670" y2="145" stroke="#C5BFB5" strokeWidth="0.6" strokeDasharray="2 4" />
            <line x1="840" y1="20" x2="840" y2="145" stroke="#C5BFB5" strokeWidth="0.6" strokeDasharray="2 4" />
          </svg>
        </div>

        {/* Bottom Measurement Ruler Ticks */}
        <div className="w-full flex justify-between items-center text-[8px] font-mono text-[#A8A49C] tracking-[0.3em] overflow-hidden opacity-75 mt-3">
          <span>|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. BOTTOM BAR: COPYRIGHT & POLICIES (EXACT GRID DIVISION)  */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#DDD8CE] text-[11px] font-mono">
        
        {/* Copyright & Conception Credits */}
        <div className="lg:col-span-8 px-6 py-3.5 text-[#787571] flex items-center flex-wrap gap-x-2">
          <span>©{new Date().getFullYear()} GITHUBSPY. ALL RIGHTS RESERVED.</span>
          <span className="hidden sm:inline">|</span>
          <span>CONCEPT & CODE ARCHITECTED BY</span>
          <a
            href="https://github.com/TarunyaProgrammer"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-[#161514] hover:text-[#C87E18] underline transition-colors"
          >
            TARUNYAPROGRAMMER
          </a>
        </div>

        {/* Legal & Policy Triple-Cells */}
        <div className="lg:col-span-4 grid grid-cols-3 divide-x divide-[#DDD8CE] text-center">
          <a
            href="https://github.com/TarunyaProgrammer/GithubSpy#privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="py-3.5 px-2 text-[#423E38] hover:text-[#161514] hover:bg-[#EFECE6] transition-colors"
          >
            Privacy Policy
          </a>
          <a
            href="https://github.com/TarunyaProgrammer/GithubSpy#terms"
            target="_blank"
            rel="noopener noreferrer"
            className="py-3.5 px-2 text-[#423E38] hover:text-[#161514] hover:bg-[#EFECE6] transition-colors"
          >
            Terms & Conditions
          </a>
          <a
            href="https://github.com/TarunyaProgrammer/GithubSpy/blob/main/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
            className="py-3.5 px-2 text-[#423E38] hover:text-[#161514] hover:bg-[#EFECE6] transition-colors font-semibold"
          >
            SPSL License
          </a>
        </div>

      </div>
    </footer>
  );
};
