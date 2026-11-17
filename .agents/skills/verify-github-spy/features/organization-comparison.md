# Organization overview and comparison

## Sub-features

- Open an organization or user repository overview by entering its name instead of `owner/repo`.
- Filter the repository list and select repositories for comparison.
- Compare repository activity using the selected date window.

## How to get to it (user POV)

Enter a GitHub organization or user login in the home search field. From the organization overview, select at least two repositories and start the comparison. Open a repository from the comparison table to return to its overview.

## Driving it with browser UI automation

Search for a public organization with repositories, verify its overview and repository list load, select two repositories using their visible selection controls, and start comparison. Verify both repository names and comparison metrics appear. Open one repository and verify the repository overview appears.

## Gotchas

- Organization and repository data is fetched from live GitHub endpoints. Large organizations may have more than one page of repositories; the current implementation requests a maximum of 100 in the initial list.
- Comparison fetches each selected repository sequentially, so elapsed time grows with the number selected. Select only two for a bounded check.
- The comparison route uses the current selected date window and may issue more live requests for each repository.
- No seeded organization or deterministic repository list exists.
