---
name: agent-hub-update
description: >
  Re-scan a project's sources and sync an existing agent-hub export: update stale
  knowledge files under `.agents/context`, export newly appeared docs/rules, flag
  knowledge whose sources were deleted, and keep `agent.<slug>.md` files consistent —
  all viewable with `npx @nnquangit/agent-hub`. Use this whenever the user says the
  docs/rules changed and the agent-hub knowledge base needs refreshing, asks to
  update/sync/refresh `.agents`, or complains that exported knowledge is out of date.
  For a first-time export (no `.agents/context` yet), use the agent-hub-export skill
  instead.
---

# Update an existing agent-hub export

An agent-hub export (created by the `agent-hub-export` skill) is a copy of the
project's docs/rules, so it drifts as sources change. Your job: bring the export back
in sync **without destroying anything a human added by hand**.

## 1. Build the source map

Default dirs are `.agents/context` (knowledge) and `.agents/agents` (agents) unless
the user says otherwise. Read every `.md` under the context dir and look for the
provenance line the export skill writes right under the H1:

```markdown
> Source: `docs/api.md`, `README.md` — exported copy; do NOT also load the source
> files, this file supersedes them for agent context.
```

- Line present → **managed file**: the backticked paths (relative to project root)
  are its sources. You may rewrite its body.
- Line absent → **hand-written file** (notes, decisions, checklists someone typed in
  the UI or an editor): never modify or delete it.

## 2. Sync each managed file

For each managed file, re-read its sources and compare meaning, not bytes:

- **Source changed** → rewrite the file's body from the current source content,
  keeping its path, filename, H1, and the Source line (update the source list if it
  changed). Preserve the file's language and scope placement.
- **Source deleted/renamed** → do not delete the knowledge file. Try to find the
  renamed source (same content elsewhere) and update the Source line; if truly gone,
  add a visible warning line right under the Source line —
  `> ⚠ Stale: source file no longer exists (checked YYYY-MM-DD).` — and report it.
  The user decides whether to remove it (deleting would silently break agent
  assignments).
- **Unchanged** → leave the file byte-identical. Don't churn timestamps or rewrap
  text; noisy diffs bury the real updates.

## 3. Export what's new

Inventory the project's knowledge sources the same way the export skill does
(README*, docs/**, CLAUDE.md, .cursorrules, .cursor/rules/**, ADRs, contributor
guides...). Any source not covered by an existing Source line is new — export it as
a new file following the export conventions:

- Two-level tree only: `<Scope>/<Topic>/<FILE>.md` (deeper is invisible to agent-hub).
  Fit new files into the **existing** scope map; only invent a new scope/topic when
  nothing fits.
- SCREAMING-CASE filename, H1, then the provenance line (exact shape shown above).
- One concern per file; split mixed sources.

If the `agent-hub-export` skill is available, its SKILL.md is the authority on these
conventions — consult it when unsure.

## 4. Keep agents honest

Read every `agent.<slug>.md` in the agents dir. Knowledge links have the shape
`- [<path-relative-to-context>](<prefix>/<same-path>)` and live before the
`## System prompt` section:

- Never rewrite an agent's knowledge list, role, or system prompt on your own — those
  are the user's choices.
- If a label no longer resolves (managed file was renamed per user request, etc.),
  fix that label in place; report anything you can't resolve.
- List the newly exported files in your summary and suggest which agent each fits,
  but let the user assign them (that's what the agent-hub UI is for).

## 5. Verify and report

Run the bundled checker:

```bash
node <skill-dir>/scripts/verify.js .agents/context .agents/agents
```

Fix errors it finds. Then summarize in four buckets — **updated**, **added**,
**stale (needs user decision)**, **untouched (hand-written)** — with file counts and
paths, and remind the user to review in the UI: `npx @nnquangit/agent-hub`.
