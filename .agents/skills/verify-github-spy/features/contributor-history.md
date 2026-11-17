# Contributor history

## Sub-features

- Open a contributor's profile modal from the repository contributor list or a pull-request author.
- Inspect contribution history for the selected time period.

## How to get to it (user POV)

Load a repository overview, then select a contributor name or avatar in the contributor list or pull-request list.

## Driving it with browser UI automation

Use the repository result's visible contributor controls. Verify the selected username appears in the modal and the contribution history or a clear empty/error state is shown. Close the modal and verify the repository overview is still available.

## Gotchas

- The active repository data and currently selected time period determine which contributor history is requested.
- The contributor grid renders up to 150 people at once; use username search to narrow larger lists.
- The user history may issue an additional GitHub Search API request when the current-window repository data has no PRs for that user; this can have a stricter quota than core REST requests.
- GitHub accounts can be renamed, deleted, or unavailable. Do not interpret an empty history as proof that the UI failed without checking the visible response.
- There is no seeded user or fixture account.
