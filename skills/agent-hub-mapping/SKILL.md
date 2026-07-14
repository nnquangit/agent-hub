---
name: agent-hub-mapping
description: >
  Generate or refresh an AGENTS.md routing file that maps role identifiers to
  agent-hub agent instruction files (`.agents/agents/agent.<slug>.md`) plus loading
  rules, so any AI agent working in the repo knows exactly which instruction file to
  load for a task. Use whenever the user asks to map agent-hub roles/agents into
  AGENTS.md, generate or update an AGENTS.md routing table, wire agents into the
  project's agent instructions, or after agents were created/renamed/deleted in
  agent-hub and the mapping is stale.
---

# Map agent-hub agents into AGENTS.md

agent-hub stores each agent as `.agents/agents/agent.<slug>.md` (knowledge links +
system prompt). `AGENTS.md` at the project root is the file coding agents read
first — this skill keeps a role → instruction-file map there so an agent picks up
the right role file (and through it, the right knowledge) for every task.

## 1. Generate the mapping

Run the bundled script — it scans the agents dir and prints the exact document:

```bash
node <skill-dir>/scripts/generate.js .agents/agents            # print to stdout
node <skill-dir>/scripts/generate.js .agents/agents --write AGENTS.md
```

Rules the script applies (keep these if you ever have to hand-edit):

- One entry per `agent.<slug>.md`, sorted by role key.
- **Role key = the slug verbatim** — the slug is whatever the user named the agent
  (`agent.admin.dev.md` → `admin.dev`, `agent.db.md` → `db`, `agent.qa-lead.md` →
  `qa-lead`). No separator conversion: the user's naming is the routing key.
- Paths are project-root-relative.

## 2. Output format (exact)

```markdown
# AI Agent Instructions

Role instruction files:

- `admin.dev` → `.agents/agents/agent.admin.dev.md`
- `api.dev` → `.agents/agents/agent.api.dev.md`
- `db` → `.agents/agents/agent.db.md`
- `reviewer` → `.agents/agents/agent.reviewer.md`
- `web.dev` → `.agents/agents/agent.web.dev.md`

## Loading Rules

Before starting any task:

1. Determine which role(s) are required for the task.
2. Locate the corresponding agent instruction file by matching the **role** value.
3. Read the matched agent instruction file completely before planning or writing code.
4. The agent instruction file contains additional knowledge files that must also be read before performing the task.
5. If the task spans multiple roles, load every matching agent instruction file.
6. Do not load instruction files for unrelated roles.
7. If instructions conflict, the most specific role instruction takes precedence.
```

## 3. Merge behavior (`--write`) — append-only

The mapping always lives inside a `<!-- agent-hub:mapping:start -->` …
`<!-- agent-hub:mapping:end -->` block; the script never generates or rewrites
anything outside it:

- Target missing → creates the file containing just the block.
- Target already has the block → only the block is regenerated; everything else
  stays byte-identical.
- Target exists without the block (hand-written AGENTS.md) → the block is appended
  at the end. User content is never touched.

## 4. Verify and report

After writing, confirm every mapped file exists (the script exits non-zero and
lists missing files otherwise). Summarize the table for the user: role key → file,
plus how many agents were mapped and where AGENTS.md was written. Default dirs are
`.agents/agents` and root `AGENTS.md` — respect custom paths when the user runs
agent-hub with `--agentDir`. Re-run this skill after agents change in the agent-hub
UI; the output is deterministic so re-runs are diff-clean.
