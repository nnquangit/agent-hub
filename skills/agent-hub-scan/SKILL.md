---
name: agent-hub-scan
description: >
  Export and organize a project's scattered knowledge — READMEs, docs/, coding rules,
  CLAUDE.md, cursor rules, contributor guides, architecture notes, skills/checklists —
  into the agent-hub format: a two-level `.agents/context/<Scope>/<Topic>/*.md` knowledge
  tree plus `agent.<slug>.md` agent files, viewable with `npx @nnquangit/agent-hub`.
  Use this whenever the user mentions agent-hub, wants to export/organize project docs or
  rules for AI agents, asks to build a knowledge base under .agents/, or wants to create
  agent definition files that reference project knowledge — even if they don't name the
  tool explicitly.
---

# Export project knowledge to agent-hub

agent-hub (`npx @nnquangit/agent-hub`) is a local UI that scans a knowledge directory of
markdown files and lets the user assign them to agents. Each agent is a plain markdown
file an AI coding agent can load directly. Your job: gather the project's scattered
knowledge, reorganize it into agent-hub's structure, and create sensible starter agents.

## 1. Inventory the sources

Scan the project for existing knowledge before writing anything:

- `README*`, `CONTRIBUTING*`, `ARCHITECTURE*`, `CHANGELOG` (recent decisions)
- `docs/**`, `doc/**`, `wiki/**`, ADRs (`adr/`, `docs/decisions/`)
- Agent/editor rules: `CLAUDE.md`, `AGENTS.md`, `.cursorrules`, `.cursor/rules/**`,
  `.github/copilot-instructions.md`, `.claude/skills/**`
- Package manifests and configs worth documenting (scripts, workspaces, CI)

If documentation is sparse, derive knowledge from the codebase itself (structure,
stack, commands) — a thin but accurate knowledge base beats an empty one. Never invent
facts: everything you write must be traceable to a source file or the code.

## 2. Design the scope map (exactly two levels)

The context tree is **`<Scope>/<Topic>/<FILE>.md`** — agent-hub scans exactly two
levels; files nested deeper are invisible, so never create a third directory level.
Files placed directly inside a scope show up under a virtual "General" topic; prefer
creating an explicit `General/` topic instead so the tree stays uniform.

Pick 3–6 scopes that fit the content. This layout works for most projects:

| Scope | What goes in it | Example topics |
|---|---|---|
| `Apps` | Per-app/module/service docs | `api`, `web`, `worker`, `General` (project-wide) |
| `Rules` | Coding/design/process rules | `Coder`, `Designer`, `General` |
| `Memory` | Notes, decisions, ADRs | `General` |
| `Skills` | How-to checklists, workflows | `Code`, `Deploy`, `Review` |

Rename or add scopes when the content demands it (e.g. `Infra`, `Data`) — the table is
a default, not a straitjacket. Keep one concern per file and split mixed documents
(a README that covers setup + architecture + contribution rules becomes several files
in different topics). Reorganize and trim, but preserve the meaning and language of the
source content. Use SCREAMING-CASE filenames (`OVERVIEW.md`, `CODE-STYLE.md`) for
consistency.

Default output dirs are `.agents/context` and `.agents/agents` under the project root,
unless the user names others. If they already contain files, extend them — never delete
or restructure existing knowledge without being asked. Leave the original source files
untouched; you are exporting copies, not moving them.

**Provenance line.** Every exported file starts with this line right under the H1
(one line, exact shape — the companion `agent-hub-update` skill parses it to sync
exports when sources change):

```markdown
# API Reference

> Source: `docs/api.md`, `README.md` — exported copy; do NOT also load the source
> files, this file supersedes them for agent context.

...content...
```

List every source file the content came from, as backticked paths relative to the
project root. The "do NOT also load" clause matters: agents reading the knowledge
tree would otherwise open the originals too and carry duplicate context. Files you
author from scratch (e.g. an empty `NOTES.md`) get no Source line — its absence marks
a file as hand-written, which tells `agent-hub-update` to leave it alone.

## 3. Write the agent files

Each agent is `agent.<role>.md` inside the agents dir. The format is strict because
agent-hub parses it:

```markdown
---
name: Coder
role: coder
updated: 2026-07-13
---

# Agent: Coder

**Role:** coder

## Knowledge — load these files before starting

- [Apps/api/OVERVIEW.md](../context/Apps/api/OVERVIEW.md)
- [Rules/Coder/CODE-STYLE.md](../context/Rules/Coder/CODE-STYLE.md)

## System prompt

You are this project's senior coder.
- Read every assigned knowledge file before writing code.
```

Rules that matter:

- **`role` is the routing key AND names the file** — they must always match:
  `role: coder` ↔ `agent.coder.md`, `role: backend.dev` ↔ `agent.backend.dev.md`.
  AGENTS.md routing (the "Sync agents → AGENTS.md" button in the agent-hub UI) matches tasks by this role value,
  so a role that differs from the filename silently breaks routing. `name` is just
  the display label ("Coder", "Backend Dev").
- When THIS skill invents role keys, default to lowercase dot-separated
  (`backend.dev`, `qa`); if the user names roles, use their naming verbatim.
- **Link label = the path relative to the context dir, verbatim.** agent-hub reads
  knowledge from labels, so a wrong label silently breaks the assignment.
- **Link href = `<prefix>/<label>`** where prefix is the relative path from the agents
  dir to the context dir (`../context` for the defaults, `.` if they're the same dir).
  This keeps links clickable in any editor.
- `## System prompt` must be the **last** section — everything after that heading is
  free text and is not scanned for knowledge links.
- Only reference files that exist. `updated:` is today's date (YYYY-MM-DD).

Create 1–3 agents matching how the project is actually worked on (e.g. a coder agent
with rules + app docs, a reviewer agent with checklists). Each agent gets the knowledge
it needs — not everything.

## 4. Verify, then hand off

Run the bundled checker — it validates the two-level structure and every agent link:

```bash
node <skill-dir>/scripts/verify.js .agents/context .agents/agents
```

Fix anything it reports (deep files, broken labels, wrong prefixes, malformed
frontmatter). Then tell the user to browse the result:

```bash
npx @nnquangit/agent-hub
```

(add `--contextDir`/`--agentDir` if non-default dirs were used). Summarize what you
created: the scope map, file count per topic, and which sources fed each scope.
