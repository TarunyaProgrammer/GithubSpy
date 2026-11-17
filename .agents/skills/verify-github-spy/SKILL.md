---
name: verify-github-spy
description: Launch GitHub Spy locally, check its readiness, drive real repository and time-range flows, and preserve UI evidence.
---

# Verify GitHub Spy

Use this workflow to check the real browser app in this repository. The app is a Vite React SPA; repository data comes from the live GitHub REST and GraphQL APIs. There is no local backend, fixture database, or seeded repository data.

## Launch

From the repository root:

```sh
npm run dev -- --host 127.0.0.1 --port 3000 --strictPort
```

Keep the process running in its own terminal session. Vite prints `http://127.0.0.1:3000/` when ready. The readiness check below must return HTTP 200 before opening a browser.

No environment variable is required to run the app. `.env.local` may configure Umami analytics; do not print or copy its contents into evidence. A GitHub personal access token is optional and is stored in browser local storage through the app's token dialog. Use a fresh isolated browser profile without a token for ordinary verification. Do not put tokens into URLs, shell history, screenshots, or this skill.

## Doctor

Run this read-only check from the repository root:

```sh
curl -fsS -o /dev/null -w 'HTTP %{http_code}\n' http://127.0.0.1:3000/
lsof -nP -iTCP:3000 -sTCP:LISTEN
```

Proceed only when the first command prints `HTTP 200` and the listener is the Vite process started for this run. The app has no local authentication check. GitHub API access can still fail because of connectivity, token validity, repository visibility, or GitHub rate limits.

## Drive

Use the available browser UI automation surface (in this environment, `mcp__cua_repl`):

1. Open `http://127.0.0.1:3000/` in a new isolated browser tab/profile. Do not reuse the user's existing production tab or its stored GitHub token.
2. Read the accessibility tree before choosing controls. Search by the label `GitHub project link or owner/repository name`; enter a public repository as `owner/repo` and submit `Check this project`.
3. Wait for the loading status to clear. Verify the repository name, metrics, and PR list appear, or capture the visible error and rate-limit status. Do not assume a spinner disappearing proves success.
4. To check the time-window journey, use `Choose time period` and select one period at a time, such as `Last month`, `Last 3 months`, and `Last 6 months`. Wait for each request to settle before selecting the next. Verify that the selected period and displayed result update, and note whether the request reports cached data. For an overlap/race investigation, deliberately click multiple periods during a loading request and record which selection and repository result remain visible.
5. The app reads public GitHub data. These journeys issue live API requests and consume the active browser/IP's GitHub quota. Keep runs small; do not force-refresh repeatedly or run against a production test harness.

Stable UI entry points include the search input's accessible label, the `Check this project` submit button, and the `Choose time period` group. The selected range is styled as active but currently has no `aria-pressed` state, so confirm it visually and by the resulting data rather than relying on an accessibility state attribute.

## Evidence

Save a dated run folder under `artifacts/verification/github-spy/` (for example, `artifacts/verification/github-spy/2026-11-17T120000/`). Capture:

- the repository input and selected time period before submission;
- the completed repository view or the exact visible error;
- for range checks, each selected range and the completed result after it settles;
- the browser's request status/timing for GitHub API calls when the automation environment exposes network logs;
- a short text transcript with repository, range sequence, elapsed time, result counts/cache status, and whether a token was active (never its value).

Use screenshots plus the accessibility snapshot as the proof of visible state. Where the browser harness exposes request logs, preserve them alongside the screenshot to distinguish slow API responses from UI waiting or stale results. Preserve failures and partial results; do not clear browser storage or alter live GitHub data to make a run pass.

## Isolate and cleanup

The app has no local database or write-side backend. Its visible repository flow makes read-only GitHub API requests and stores short-lived result caches and recent repositories in browser local storage. Run in a fresh profile so checks do not alter the user's history or token. Do not use the app's `Clear saved data` control in a shared profile.

At teardown, close only the tab/profile created for this run and stop only the Vite process started for this run. Keep `artifacts/verification/github-spy/` evidence. The dev server binds to loopback and uses port 3000; if that port is occupied, stop and identify the owner rather than terminating an unrelated process.

## Helpers

No project verification helpers are shipped. Use the launch and doctor commands above and the browser automation APIs available in the active agent environment. The repository has no Playwright, Cypress, or Bombadil dependency/configuration at the time this skill was written.

## Feature map

Read [features/README.md](features/README.md) for the main user journeys and their visible proof conditions.
