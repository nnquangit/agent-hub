# Rule — Git workflow

## Branch
- `main` = production, always deployable
- Feature branch: `feat/<scope>-<description>`, fix: `fix/<scope>-<description>`
- Rebase onto main before opening a PR, no merge commits in feature branches

## Commit
- Format: `type(scope): message` — e.g. `feat(api): add order sync webhook`
- type: feat, fix, refactor, test, chore, docs
- scope: api, site, admin, landing, background, shared, ui

## PR
- Small PRs (<400 lines of diff), 1 PR = 1 purpose
- PR description: problem → solution → how to test
- Green CI + 1 approval required to merge, squash merge
