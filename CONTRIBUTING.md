# Contributing to GithubSpy

Thank you for your interest in contributing to **GithubSpy**! We welcome contributions that improve developer intelligence, streamline performance, enhance accessibility, and polish the user experience.

---

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please treat all contributors with respect, professionalism, and kindness.

---

## How to Contribute

### 1. Reporting Bugs
- Search existing [GitHub Issues](https://github.com/TarunyaProgrammer/GithubSpy/issues) to verify the bug hasn't already been reported.
- If not reported, open a new issue detailing:
  - Clear descriptive title
  - Steps to reproduce
  - Expected vs actual behavior
  - Browser version and OS

### 2. Suggesting Features
- Open a feature request issue describing the rationale, use case, and proposed interface improvements.

### 3. Submitting Pull Requests (PRs)
1. **Fork the repository** on GitHub.
2. **Clone your fork**:
   ```bash
   git clone https://github.com/<your-username>/GithubSpy.git
   cd GithubSpy
   ```
3. **Create a topic branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Install dependencies & run locally**:
   ```bash
   npm install
   npm run dev
   ```
5. **Verify code quality**:
   Ensure your changes compile without TypeScript or lint errors:
   ```bash
   npm run build
   ```
6. **Commit with clean, descriptive messages**:
   ```bash
   git commit -m "feat: add support for org velocity benchmarks"
   ```
7. **Push to your fork and submit a PR** against the `main` branch of [TarunyaProgrammer/GithubSpy](https://github.com/TarunyaProgrammer/GithubSpy).

---

## Development Guidelines

- **Minimalist & High Performance**: Avoid adding bulky third-party libraries when clean, zero-dependency solutions (like lightweight SVGs or custom hooks) are viable.
- **Strict Accessibility (WCAG 2.2 AA)**: All interactive elements must support keyboard navigation (`focus-visible`), appropriate ARIA attributes, and high contrast ratios ($\ge 4.5:1$).
- **Privacy First**: All tokens and search data must remain strictly client-side. No telemetry or server-side token transmission.

---

## Author & Maintainer

Maintained with dedication by **[TarunyaProgrammer](https://github.com/TarunyaProgrammer)**.
