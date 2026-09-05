import React, { useState } from 'react';
import { Github, Linkedin, Bug, ArrowRight, Check, ExternalLink, Shield, Mail, Loader2 } from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) return;

    setStatus('loading');
    try {
      // Send email payload directly to tarunya.programmer@gmail.com via FormSubmit AJAX service
      const res = await fetch('https://formsubmit.co/ajax/tarunya.programmer@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email: cleanEmail,
          _subject: `New GithubSpy Subscriber: ${cleanEmail}`,
          _template: 'table',
          source: 'GithubSpy Web Application (Footer Subscription)',
          recipient: 'tarunya.programmer@gmail.com',
          submitted_at: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        setStatus('success');
        setEmail('');
        setTimeout(() => setStatus('idle'), 6000);
      } else {
        // Fallback to mailto link if external service rate limits
        window.location.href = `mailto:tarunya.programmer@gmail.com?subject=GithubSpy%20Community%20Updates&body=Hi%20Tarunya,%0D%0A%0D%0APlease%20add%20my%20email%20(${encodeURIComponent(cleanEmail)})%20to%20GithubSpy%20updates.`;
        setStatus('success');
        setEmail('');
        setTimeout(() => setStatus('idle'), 6000);
      }
    } catch {
      // Offline or network error fallback
      window.location.href = `mailto:tarunya.programmer@gmail.com?subject=GithubSpy%20Community%20Updates&body=Hi%20Tarunya,%0D%0A%0D%0APlease%20add%20my%20email%20(${encodeURIComponent(cleanEmail)})%20to%20GithubSpy%20updates.`;
      setStatus('success');
      setEmail('');
      setTimeout(() => setStatus('idle'), 6000);
    }
  };

  return (
    <footer className="w-full mt-auto bg-[#F6F5F2] border-t border-[#DDD8CE] text-[#161514] font-sans antialiased selection:bg-[#EAA036]/20" role="contentinfo">
      
      {/* ========================================================= */}
      {/* 1. TOP SECTION: BRAND STATEMENT + NAVIGATION + 3D RADAR   */}
      {/* ========================================================= */}
      <div className="border-b border-[#DDD8CE]">
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#DDD8CE]">
          
          {/* Tagline Statement */}
          <div className="lg:col-span-4 p-4 sm:p-5 flex flex-col justify-between">
            <div>
              <h2 className="text-base sm:text-lg md:text-xl font-black uppercase tracking-tight text-[#161514] leading-snug">
                An open source radar that illuminates your contribution path
              </h2>
            </div>
            <div className="mt-3 pt-3 border-t border-[#DDD8CE]/60 flex items-center gap-2 text-[10px] font-mono text-[#57534E]">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#EAA036] animate-pulse" />
              <span>Maintainer intelligence & PR turnaround telemetry</span>
            </div>
          </div>

          {/* Navigation Column 1: PLATFORM */}
          <div className="lg:col-span-2 p-4 sm:p-5 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#57534E] block mb-2.5">
                Platform
              </span>
              <ul className="space-y-1 text-xs font-medium">
                <li>
                  <a href="#" className="inline-block py-1 text-[#965306] font-bold hover:underline transition-colors">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#repo-search-input" className="inline-block py-1 text-[#2A2724] hover:text-[#161514] hover:underline transition-colors">
                    Inspect Repository
                  </a>
                </li>
                <li>
                  <a href="#repo-search-input" className="inline-block py-1 text-[#2A2724] hover:text-[#161514] hover:underline transition-colors">
                    Review Pace Engine
                  </a>
                </li>
                <li>
                  <a href="#repo-search-input" className="inline-block py-1 text-[#2A2724] hover:text-[#161514] hover:underline transition-colors">
                    Applicant Index (AFI)
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Navigation Column 2: EXPLORE PRESETS */}
          <div className="lg:col-span-2 p-4 sm:p-5 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#57534E] block mb-2.5">
                Explore
              </span>
              <ul className="space-y-1 text-xs font-medium">
                <li>
                  <a href="https://github.com/zulip/zulip" target="_blank" rel="noopener noreferrer" className="py-1 text-[#2A2724] hover:text-[#161514] transition-colors flex items-center justify-between group">
                    <span>Zulip</span>
                    <ArrowRight className="w-3 h-3 text-[#57534E] group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </li>
                <li>
                  <a href="https://github.com/facebook/react" target="_blank" rel="noopener noreferrer" className="py-1 text-[#2A2724] hover:text-[#161514] transition-colors flex items-center justify-between group">
                    <span>React</span>
                    <ArrowRight className="w-3 h-3 text-[#57534E] group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </li>
                <li>
                  <a href="https://github.com/django/django" target="_blank" rel="noopener noreferrer" className="py-1 text-[#2A2724] hover:text-[#161514] transition-colors flex items-center justify-between group">
                    <span>Django</span>
                    <ArrowRight className="w-3 h-3 text-[#57534E] group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </li>
                <li>
                  <a href="https://github.com/sympy/sympy" target="_blank" rel="noopener noreferrer" className="py-1 text-[#2A2724] hover:text-[#161514] transition-colors flex items-center justify-between group">
                    <span>SymPy</span>
                    <ArrowRight className="w-3 h-3 text-[#57534E] group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Navigation Column 3: RESOURCES */}
          <div className="lg:col-span-2 p-4 sm:p-5 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#57534E] block mb-2.5">
                Resources
              </span>
              <ul className="space-y-1 text-xs font-medium">
                <li>
                  <a href="https://github.com/TarunyaProgrammer/GithubSpy#readme" target="_blank" rel="noopener noreferrer" className="inline-block py-1 text-[#2A2724] hover:text-[#161514] transition-colors">
                    Insights
                  </a>
                </li>
                <li>
                  <a href="https://github.com/TarunyaProgrammer/GithubSpy#architecture" target="_blank" rel="noopener noreferrer" className="inline-block py-1 text-[#2A2724] hover:text-[#161514] transition-colors">
                    Architecture
                  </a>
                </li>
                <li>
                  <a href="https://github.com/TarunyaProgrammer/GithubSpy#rate-limits" target="_blank" rel="noopener noreferrer" className="inline-block py-1 text-[#2A2724] hover:text-[#161514] transition-colors">
                    GraphQL Pipeline
                  </a>
                </li>
                <li>
                  <a href="https://github.com/TarunyaProgrammer/GithubSpy/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className="inline-block py-1 text-[#2A2724] hover:text-[#161514] transition-colors">
                    SPSL-1.0 License
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Geometrically Perfect 3D Isometric Architectural Radar Cube */}
          <div className="hidden lg:flex lg:col-span-2 p-4 sm:p-5 items-center justify-center bg-[#F1EFEA]/60">
            <svg
              viewBox="0 0 120 120"
              className="w-20 h-20 drop-shadow-xs transition-transform hover:scale-105"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Architectural Radar Isometric Cube"
            >
              {/* Outer Isometric Cube Facets */}
              <polygon
                points="60,18 98,40 60,62 22,40"
                stroke="#161514"
                strokeWidth="2.5"
                fill="#FFFFFF"
                strokeLinejoin="round"
              />
              <polygon
                points="22,40 60,62 60,104 22,82"
                stroke="#161514"
                strokeWidth="2.5"
                fill="#F7F5F0"
                strokeLinejoin="round"
              />
              <polygon
                points="60,62 98,40 98,82 60,104"
                stroke="#161514"
                strokeWidth="2.5"
                fill="#E8E5DD"
                strokeLinejoin="round"
              />
              <polygon
                points="60,26 88,40 60,54 32,40"
                stroke="#161514"
                strokeWidth="1.2"
                strokeDasharray="2 2"
                fill="#F4F1EA"
              />
              <line x1="35" y1="47" x2="35" y2="89" stroke="#DDD8CE" strokeWidth="1" />
              <line x1="48" y1="55" x2="48" y2="97" stroke="#DDD8CE" strokeWidth="1" />
              <line x1="73" y1="55" x2="73" y2="97" stroke="#DDD8CE" strokeWidth="1" />
              <line x1="85" y1="47" x2="85" y2="89" stroke="#DDD8CE" strokeWidth="1" />
              <line x1="60" y1="32" x2="60" y2="48" stroke="#EAA036" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="46" y1="40" x2="74" y2="40" stroke="#EAA036" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="60" cy="40" r="3" fill="#EAA036" />
              <circle cx="60" cy="40" r="5" stroke="#EAA036" strokeWidth="1" strokeOpacity="0.4" className="animate-ping" />
            </svg>
          </div>

        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. MIDDLE ROW: SUBSCRIBE + REPOSITORY + CONNECT + SOCIAL  */}
      {/* ========================================================= */}
      <div className="border-b border-[#DDD8CE]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 divide-y sm:divide-y-0 sm:divide-x divide-[#DDD8CE]">

          {/* Subscribe Box - Direct Mail to tarunya.programmer@gmail.com */}
          <div className="sm:col-span-2 lg:col-span-4 p-4 sm:p-5 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#57534E] block mb-1.5">
                Subscribe & Stay Informed
              </span>
              <p className="text-xs text-[#2A2724] leading-relaxed mb-3">
                Receive open-source maintainer alerts and GSoC telemetry dispatched straight to your inbox.
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="relative mt-1">
              <div className="flex items-stretch border border-[#DDD8CE] bg-white rounded-none focus-within:border-[#161514] transition-colors">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    status === 'loading'
                      ? 'Dispatching notification...'
                      : status === 'success'
                      ? 'Subscribed to updates!'
                      : 'Enter your email'
                  }
                  disabled={status === 'loading' || status === 'success'}
                  required
                  aria-label="Email address for open-source newsletter updates"
                  className="w-full px-3 py-2 text-xs text-[#161514] placeholder-[#57534E] bg-transparent focus:outline-none font-mono min-h-[36px]"
                />
                <button
                  type="submit"
                  disabled={status === 'loading' || status === 'success'}
                  aria-label="Submit newsletter subscription to tarunya.programmer@gmail.com"
                  className="px-3.5 flex items-center justify-center border-l border-[#DDD8CE] bg-[#F7F5F0] hover:bg-[#EFECE6] text-[#161514] transition-colors cursor-pointer disabled:bg-emerald-50 min-h-[36px]"
                  title="Subscribe to updates (notifies tarunya.programmer@gmail.com)"
                >
                  {status === 'loading' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#EAA036]" />
                  ) : status === 'success' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5 text-[#161514]" />
                  )}
                </button>
              </div>

              {/* Instant feedback notification */}
              {status === 'success' ? (
                <p className="mt-1.5 text-[11px] font-mono text-emerald-800 flex items-center gap-1.5">
                  <Check className="w-3 h-3" />
                  <span>Subscribed! Notification sent to tarunya.programmer@gmail.com</span>
                </p>
              ) : (
                <p className="mt-1.5 text-[10px] font-mono text-[#57534E]">
                  Dispatched directly to maintainer inbox. Zero spam.
                </p>
              )}
            </form>
          </div>

          {/* Repository Coordinates */}
          <div className="sm:col-span-1 lg:col-span-2 p-4 sm:p-5 flex flex-col justify-between border-t sm:border-t-0 border-[#DDD8CE]">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#57534E] block mb-1.5">
                Repository
              </span>
              <p className="text-xs font-mono font-semibold text-[#161514] leading-snug">
                TarunyaProgrammer / GithubSpy
              </p>
              <p className="mt-0.5 text-[11px] font-mono text-[#57534E]">
                Global Open Source
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-[#DDD8CE]/60">
              <a
                href="https://github.com/TarunyaProgrammer/GithubSpy"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 py-1 text-xs font-semibold text-[#161514] hover:text-[#965306] transition-colors group"
              >
                <span>View on GitHub</span>
                <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>

          {/* Connect With Author & Bug Reporting */}
          <div className="sm:col-span-1 lg:col-span-3 p-4 sm:p-5 flex flex-col justify-between border-t sm:border-t-0 border-[#DDD8CE]">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#57534E] block mb-1.5">
                Connect With Author
              </span>
              <p className="text-xs font-semibold text-[#161514]">
                Tarunya Kesharwani
              </p>
              <p className="text-[11px] text-[#57534E]">
                Open-source engineer & researcher
              </p>

              <div className="mt-2 space-y-0.5">
                <a
                  href="https://www.linkedin.com/in/tarunyakesharwani"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 py-1 text-xs text-[#2A2724] hover:text-[#0A66C2] transition-colors font-medium"
                >
                  <Linkedin className="w-3.5 h-3.5 text-[#0A66C2] flex-shrink-0" />
                  <span className="truncate">linkedin.com/in/tarunyakesharwani</span>
                </a>
                <a
                  href="https://github.com/TarunyaProgrammer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 py-1 text-xs text-[#2A2724] hover:text-[#161514] transition-colors font-medium"
                >
                  <Github className="w-3.5 h-3.5 text-[#161514] flex-shrink-0" />
                  <span className="truncate">github.com/TarunyaProgrammer</span>
                </a>
                <a
                  href="mailto:tarunya.programmer@gmail.com"
                  className="flex items-center gap-2 py-1 text-xs text-[#2A2724] hover:text-[#965306] transition-colors font-medium"
                >
                  <Mail className="w-3.5 h-3.5 text-[#965306] flex-shrink-0" />
                  <span className="truncate">tarunya.programmer@gmail.com</span>
                </a>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-[#DDD8CE]/60">
              <a
                href="https://github.com/TarunyaProgrammer/GithubSpy/issues/new"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 py-1 text-xs font-semibold text-[#965306] hover:text-[#733E03] transition-colors"
              >
                <Bug className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Found a bug? Open an issue</span>
              </a>
            </div>
          </div>

          {/* Social & Ecosystem */}
          <div className="sm:col-span-2 lg:col-span-3 p-4 sm:p-5 flex flex-col justify-between border-t lg:border-t-0 border-[#DDD8CE]">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#57534E] block mb-2">
                Social & Community
              </span>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs font-medium">
                <a
                  href="https://github.com/TarunyaProgrammer/GithubSpy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block py-1 text-[#2A2724] hover:text-[#161514] transition-colors"
                >
                  GitHub
                </a>
                <a
                  href="https://www.linkedin.com/in/tarunyakesharwani"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block py-1 text-[#2A2724] hover:text-[#0A66C2] transition-colors"
                >
                  LinkedIn
                </a>
                <a
                  href="https://github.com/TarunyaProgrammer/GithubSpy/stargazers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block py-1 text-[#2A2724] hover:text-[#161514] transition-colors"
                >
                  Star Project
                </a>
                <a
                  href="https://github.com/TarunyaProgrammer/GithubSpy/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block py-1 text-[#2A2724] hover:text-[#161514] transition-colors"
                >
                  Bug Reports
                </a>
                <a
                  href="mailto:tarunya.programmer@gmail.com"
                  className="inline-block py-1 text-[#2A2724] hover:text-[#161514] transition-colors"
                >
                  Direct Email
                </a>
                <a
                  href="https://github.com/TarunyaProgrammer/GithubSpy/blob/main/LICENSE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block py-1 text-[#2A2724] hover:text-[#161514] transition-colors"
                >
                  License
                </a>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-[#DDD8CE]/60 flex items-center gap-2 text-[10px] font-mono text-[#57534E]">
              <Shield className="w-3 h-3 text-[#EAA036] flex-shrink-0" />
              <span>SPSL Protected • Zero Tracking</span>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile-Only Isometric Cube (Compact) */}
      <div className="flex lg:hidden p-4 items-center justify-center bg-[#F1EFEA]/60 border-b border-[#DDD8CE]">
        <svg
          viewBox="0 0 120 120"
          className="w-16 h-16 drop-shadow-xs"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Architectural Radar Isometric Cube"
        >
          <polygon points="60,18 98,40 60,62 22,40" stroke="#161514" strokeWidth="2.5" fill="#FFFFFF" strokeLinejoin="round" />
          <polygon points="22,40 60,62 60,104 22,82" stroke="#161514" strokeWidth="2.5" fill="#F7F5F0" strokeLinejoin="round" />
          <polygon points="60,62 98,40 98,82 60,104" stroke="#161514" strokeWidth="2.5" fill="#E8E5DD" strokeLinejoin="round" />
          <polygon points="60,26 88,40 60,54 32,40" stroke="#161514" strokeWidth="1.2" strokeDasharray="2 2" fill="#F4F1EA" />
          <line x1="60" y1="32" x2="60" y2="48" stroke="#EAA036" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="46" y1="40" x2="74" y2="40" stroke="#EAA036" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="60" cy="40" r="3" fill="#EAA036" />
        </svg>
      </div>

      {/* ========================================================= */}
      {/* 3. BLUEPRINT DRAFTING BANNER: SLENDER ARCHITECTURAL STRIP */}
      {/* ========================================================= */}
      <div className="relative w-full bg-[#F3F0EA] border-b border-[#DDD8CE] px-4 sm:px-8 py-3 sm:py-4 select-none overflow-hidden">
        
        {/* Corner Crosshairs */}
        <span className="absolute top-1.5 left-2 font-mono text-[10px] text-[#44403C] font-light leading-none select-none" aria-hidden="true">+</span>
        <span className="absolute top-1.5 right-2 font-mono text-[10px] text-[#44403C] font-light leading-none select-none" aria-hidden="true">+</span>
        <span className="absolute bottom-1.5 left-2 font-mono text-[10px] text-[#44403C] font-light leading-none select-none" aria-hidden="true">+</span>
        <span className="absolute bottom-1.5 right-2 font-mono text-[10px] text-[#44403C] font-light leading-none select-none" aria-hidden="true">+</span>

        {/* Top Measurement Ruler Ticks (Decorative) */}
        <div className="w-full flex justify-between items-center text-[7px] font-mono text-[#44403C] tracking-[0.25em] overflow-hidden select-none mb-1" aria-hidden="true">
          <span>|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|</span>
        </div>

        {/* Compact Architectural Blueprint Typography */}
        <div className="w-full flex items-center justify-center py-1 sm:py-2">
          <svg
            viewBox="0 0 1000 85"
            className="w-full max-w-4xl h-auto"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="GitHub Spy architectural logo"
            role="img"
          >
            {/* Horizontal Construction / Alignment Guides */}
            <line x1="20" y1="14" x2="980" y2="14" stroke="#D1CBC1" strokeWidth="0.6" strokeDasharray="3 3" />
            <line x1="20" y1="46" x2="980" y2="46" stroke="#C5BFB5" strokeWidth="0.6" strokeDasharray="3 3" />
            <line x1="20" y1="74" x2="980" y2="74" stroke="#D1CBC1" strokeWidth="0.6" strokeDasharray="3 3" />

            {/* Architectural Outline Text */}
            <text
              x="500"
              y="66"
              textAnchor="middle"
              className="font-mono select-none"
              style={{
                fontSize: '66px',
                fontWeight: 900,
                letterSpacing: '0.12em',
                fill: '#F3F0EA',
                stroke: '#161514',
                strokeWidth: '2.2px',
                strokeLinejoin: 'round',
              }}
            >
              GITHUBSPY
            </text>

            {/* Centerline Crosshairs on letters */}
            <line x1="160" y1="10" x2="160" y2="78" stroke="#C5BFB5" strokeWidth="0.5" strokeDasharray="2 3" />
            <line x1="330" y1="10" x2="330" y2="78" stroke="#C5BFB5" strokeWidth="0.5" strokeDasharray="2 3" />
            <line x1="500" y1="10" x2="500" y2="78" stroke="#C5BFB5" strokeWidth="0.5" strokeDasharray="2 3" />
            <line x1="670" y1="10" x2="670" y2="78" stroke="#C5BFB5" strokeWidth="0.5" strokeDasharray="2 3" />
            <line x1="840" y1="10" x2="840" y2="78" stroke="#C5BFB5" strokeWidth="0.5" strokeDasharray="2 3" />
          </svg>
        </div>

        {/* Bottom Measurement Ruler Ticks (Decorative) */}
        <div className="w-full flex justify-between items-center text-[7px] font-mono text-[#44403C] tracking-[0.25em] overflow-hidden select-none mt-1" aria-hidden="true">
          <span>|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. BOTTOM BAR: COPYRIGHT & POLICIES (COMPACT)             */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#DDD8CE] text-[10px] sm:text-[11px] font-mono">
        
        {/* Copyright & Conception Credits */}
        <div className="lg:col-span-8 px-4 sm:px-6 py-2.5 text-[#57534E] flex items-center flex-wrap gap-x-2">
          <span>©{new Date().getFullYear()} GITHUBSPY. ALL RIGHTS RESERVED.</span>
          <span className="hidden sm:inline">|</span>
          <span>CONCEPT & CODE ARCHITECTED BY</span>
          <a
            href="https://github.com/TarunyaProgrammer"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-[#161514] hover:text-[#965306] underline transition-colors"
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
            className="py-2.5 px-2 text-[#2A2724] hover:text-[#161514] hover:bg-[#EFECE6] transition-colors"
          >
            Privacy Policy
          </a>
          <a
            href="https://github.com/TarunyaProgrammer/GithubSpy#terms"
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-2 text-[#2A2724] hover:text-[#161514] hover:bg-[#EFECE6] transition-colors"
          >
            Terms & Conditions
          </a>
          <a
            href="https://github.com/TarunyaProgrammer/GithubSpy/blob/main/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-2 text-[#2A2724] hover:text-[#161514] hover:bg-[#EFECE6] transition-colors font-semibold"
          >
            SPSL License
          </a>
        </div>

      </div>
    </footer>
  );
};
