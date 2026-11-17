# Repository overview and time window

## Sub-features

- Search using `owner/repo` or a GitHub URL.
- Choose 2 weeks, 1 month, 3 months, 6 months, all available, or custom dates.
- Inspect pull-request metrics, charts, contributors, and recent pull requests.
- Revisit a recent repository or refresh its saved result.

## How to get to it (user POV)

Open the home page, enter a public GitHub repository, and choose **Check this project**. After the overview appears, choose another period in **Choose time period** and wait for that request to finish.

## Driving it with browser UI automation

Use the accessible search label `GitHub project link or owner/repository name`, submit `Check this project`, then use the buttons inside `Choose time period`. Verify the overview identifies the requested repository, shows a completed result, and changes the selected range and data when the period changes. The selected range exposes `aria-pressed`. Capture the progress message and final visible state for each request; try selecting a second range while the first is still loading to verify that only the latest selection wins.

## Gotchas

- GitHub calls are live and consume the browser/IP's quota; an optional token changes the quota and GraphQL path.
- The authenticated path fetches PR pages sequentially and stops when it finds a PR older than the lower date boundary. It caps scans at 20 pages for bounded ranges and all-time.
- The REST path scans sequential pages and caps bounded periods at 20 pages with a token or 10 without one. All-time scans cap at 10 pages with a token or 5 without one. A full page at the cap is marked as partial in the UI.
- PR pages and contributors are cached across time windows for ten and fifteen minutes respectively. Cache entries are scoped by token and capped in local storage.
- A newer search or range change cancels the previous request; the latest request owns the loading and result state. The last successful result remains visible if a later request fails.
- GitHub requests time out after 15 seconds. If GitHub returns a rate-limit, network, authorization, or not-found error, preserve the visible error as a failed precondition.
- No fixture data is available.
