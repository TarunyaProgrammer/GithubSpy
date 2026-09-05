# GithubSpy 🛰️

[![License: Strict Protective](https://img.shields.io/badge/License-Strict_Protective-blueviolet.svg)](LICENSE)
[![Author](https://img.shields.io/badge/Author-@TarunyaProgrammer-amber.svg)](https://github.com/TarunyaProgrammer)
[![Platform: Vite + React 18](https://img.shields.io/badge/Platform-Vite_+_React_18-indigo.svg)](https://vitejs.dev/)
[![Accessibility: WCAG 2.2 AA](https://img.shields.io/badge/Accessibility-WCAG_2.2_AA-emerald.svg)](https://www.w3.org/WAI/standards-guidelines/wcag/)

A minimalist, high-end developer intelligence radar designed for open-source contributors and Google Summer of Code (GSoC) contenders.

Uncover hidden merge velocity, active review turnarounds, core maintainers vs competing applicants, and proprietary feasibility ratings in real time.

---

## 🌟 Official Repository & Star

Star the official repository to support ongoing development:
👉 **[github.com/TarunyaProgrammer/GithubSpy](https://github.com/TarunyaProgrammer/GithubSpy)**

---

## ⚡ Key Intelligence Features

- **Direct-to-Action Terminal**: Zero marketing fluff or slow landing pages. Enter any repository link (`owner/repo`) or click a preset to access real-time data immediately.
- **Applicant Feasibility Index (AFI)**: A proprietary composite score (0–100) and grade (`PRIME TARGET`, `STRONG TARGET`, `SELECTIVE`) assessing how merge-friendly the maintainer pool is toward external applicants.
- **Applicant Competition Density**: Explicitly identifies and isolates fellow community contenders so you know your exact competition in that repository.
- **Merge Turnaround Velocity**: Calculates real-time average merge latency from pull request creation to merge.
- **Accurate Maintainer Intelligence**: Fixes the common GitHub `403 Forbidden` permission crash by extracting maintainer status directly from pull request `author_association` (`OWNER`, `MEMBER`, `COLLABORATOR`) and merge actors.
- **Dynamic Rate-Limit Meter**: Dynamically reads `x-ratelimit-remaining`, `x-ratelimit-limit`, and reset countdowns directly from GitHub API response headers.
- **5,000 Requests/Hour Ready**:
  - Optional `.env` configuration (`VITE_GITHUB_TOKEN`) enables 5,000 req/hr out of the box for all users.
  - In-app Personal Access Token modal allows users to store personal tokens safely in client-side `localStorage` with real-time verification testing.
- **Strict WCAG 2.2 AA Accessibility**: Full keyboard navigation, visible focus rings, Escape-key dialog dismissal, and screen-reader accessible SVG charts.

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/TarunyaProgrammer/GithubSpy.git
cd GithubSpy
npm install
```

### 2. (Optional) Configure Built-In Rate Limits
Copy the environment template:
```bash
cp .env.example .env
```
Add an optional GitHub token to `VITE_GITHUB_TOKEN` to grant 5,000 requests/hour by default without requiring users to input a token in the UI.

### 3. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
```
Produces an optimized, tree-shaken static bundle in `dist/` ready to host on Vercel, Netlify, Cloudflare Pages, or GitHub Pages.

---

## 🛡️ License & Legal Notice

This software is licensed under the **Strict Protective Source License (SPSL)**.
Copyright (c) 2026 **[TarunyaProgrammer](https://github.com/TarunyaProgrammer)**. All Rights Reserved.

- **Mandatory Attribution**: All copies and derivative works must visibly retain copyright notices and unaltered links to [TarunyaProgrammer](https://github.com/TarunyaProgrammer).
- **No Unauthorized Redistribution or Re-branding**: Redistributing, white-labeling, or publishing this software under a different name or claiming original authorship is strictly prohibited.
- For complete terms, see the [LICENSE](LICENSE) file.

---

## 🤝 Contributing

We welcome community contributions! Please review our [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before submitting pull requests.

Engineered by **[TarunyaProgrammer](https://github.com/TarunyaProgrammer)**.
