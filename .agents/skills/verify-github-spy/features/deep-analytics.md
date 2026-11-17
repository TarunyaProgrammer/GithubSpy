# Deep analytics report

## Sub-features

- Open the deep analytics report from a repository overview.
- Load file-change focus and review-event analytics on demand.
- Inspect charts, rankings, and supporting pull-request evidence.

## How to get to it (user POV)

Load a repository overview and open its deep analytics panel. Select the option to open the detailed report. The report loads file analytics and review analytics after the user opens it.

## Driving it with browser UI automation

Open the report from the repository view, wait for each loading state to settle, and verify the report shows its selected-window note, evidence PRs, and completed analytics sections or a visible error. Return to the repository overview and verify it remains accessible.

## Gotchas

- Deep analytics is not part of the initial overview and makes additional per-PR GitHub requests for changed files, reviews, and comments.
- The file scan is bounded to the newest 40 PRs and review scan to the newest 30. Partial results disclose both the failed request count and scan limit.
- Repositories with many PRs can take longer and approach rate limits. Do not repeatedly refresh the report; failed whole-section requests require an explicit retry.
- Results depend on the repository's available PR metadata and API permissions. Preserve partial/error states as evidence.
- No fixture repository or deterministic review history is supplied.
