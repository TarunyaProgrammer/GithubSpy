<div align="center">

<img src="public/logo.svg" alt="GitHub Spy logo" width="96" height="96" />

# GitHub Spy

### Explore open-source projects before you contribute

GitHub Spy helps new contributors understand a public GitHub project at a glance: recent pull requests, how often they are merged, how long reviews usually take, and who is active in the project.

</div>

## Why it exists

Choosing an open-source project can be hard when you are new. A project may look interesting, but it is not always clear whether people are actively contributing or how the review process works.

Paste a public GitHub link into GitHub Spy to get a plain-language overview before you choose where to spend your time. The app provides signals, not guarantees—reading the project’s contribution guide and recent discussions is still important.

## What you can learn

- How many pull requests were opened during a time period you choose.
- What happened to those contributions: merged, still open, or closed.
- How long merged pull requests usually took to review.
- Which people appear to be maintainers and which community contributors are active.
- The details of recent pull requests, so you can see the kind of work being discussed.

## How it works

1. Paste a GitHub project URL or enter `owner/project`.
2. Pick the time period that is useful to you.
3. Read the project overview, then browse active people and recent pull requests.
4. Open a pull request on GitHub when you want the full conversation and project context.

GitHub Spy reads public GitHub data directly in your browser. Results are saved briefly on your device so repeated checks are faster.

## Optional GitHub token

GitHub’s public API allows a limited number of requests per hour from a shared internet connection. You can add a free GitHub personal access token to use your own higher limit. The token is stored only in your browser and is sent directly to GitHub when the app requests project data.

## Run locally

```bash
git clone https://github.com/TarunyaProgrammer/GithubSpy.git
cd GithubSpy
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To create a production build:

```bash
npm run build
```

## License

This software is licensed under the [Strict Protective Source License](LICENSE).

Copyright (c) 2026 [TarunyaProgrammer](https://github.com/TarunyaProgrammer).
