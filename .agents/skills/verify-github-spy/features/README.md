# GitHub Spy feature map

These are the primary browser journeys discovered from the routes and controls in `src/App.tsx` and `src/components/`. Each feature page states what a user should see when the journey succeeds and where live GitHub data or credentials can block it.

| Feature | Entry point | Verification page |
| --- | --- | --- |
| Repository overview and time window | Home search and time-period controls | [repository-search.md](repository-search.md) |
| Contributor history | Contributor row in a repository view | [contributor-history.md](contributor-history.md) |
| Organization overview and comparison | Enter an organization name, then compare repositories | [organization-comparison.md](organization-comparison.md) |
| Deep analytics report | Deep analytics panel in a repository view | [deep-analytics.md](deep-analytics.md) |

All repository and contributor data is fetched live from GitHub. There is no seed data, so a missing precondition such as rate-limit quota or network access must be reported as a verification gap, not worked around by weakening the user journey.
