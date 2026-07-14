# Agent Hub

[![npm version](https://img.shields.io/npm/v/%40nnquangit%2Fagent-hub)](https://www.npmjs.com/package/@nnquangit/agent-hub)
[![npm downloads](https://img.shields.io/npm/dm/%40nnquangit%2Fagent-hub)](https://www.npmjs.com/package/@nnquangit/agent-hub)
[![license](https://img.shields.io/npm/l/%40nnquangit%2Fagent-hub)](https://github.com/nnquangit/agent-hub/blob/main/LICENSE)

A UI for managing **agents + markdown knowledge**. It scans a directory of `.md` files (knowledge), lets you create agents, write system prompts, and tick-assign knowledge to each agent — every agent is written straight to disk as an `agent.[slug].md` file. No database.

![Main screen](https://raw.githubusercontent.com/nnquangit/agent-hub/main/docs/main.png)

Select an agent in the left column and the wires show which knowledge it "reads". Ticking / unticking a file in the right column auto-saves the agent file (400ms debounce).

## Quick start

```bash
npx @nnquangit/agent-hub
```

By default it uses `.agents/context` (knowledge) and `.agents/agents` (agents) in the current directory. **If the context folder is empty or missing, example knowledge files and a sample agent are created on first run** so you can explore right away. To customize:

```bash
npx @nnquangit/agent-hub --contextDir=docs/knowledge --agentDir=docs/agents -p 3999
```

| Option               | Default                | Description                                         |
| -------------------- | ---------------------- | --------------------------------------------------- |
| `--contextDir <dir>` | `.agents/context`      | Directory containing knowledge md files             |
| `--agentDir <dir>`   | `.agents/agents`       | Directory where `agent.[slug].md` files are written |
| `-p, --port <port>`  | `4321` (or env `PORT`) | Server port                                         |
| `--host <host>`      | `localhost`            | Hostname                                            |
| `-h, --help`         |                        | Show help                                           |

## Features

### Create / edit agents in a drawer, with a live md preview

The form includes a free-text **System prompt** and a preview pane showing exactly what `agent.[slug].md` will contain — updated on every keystroke.

![Agent form](https://raw.githubusercontent.com/nnquangit/agent-hub/main/docs/agent-form.png)

### Read knowledge files right inside the app

Click any file row in column 3 to open a drawer with the md content.

![File view](https://raw.githubusercontent.com/nnquangit/agent-hub/main/docs/file-view.png)

### Search topics and files

Columns 2 and 3 each have their own search box, filtering by topic name / file path.

![Search](https://raw.githubusercontent.com/nnquangit/agent-hub/main/docs/search.png)

## Knowledge directory layout

`contextDir` is organized in two levels — **scope / knowledge / file.md**:

```
.agents/context/
├── Apps/
│   ├── General/     PROJECT.md, STACK.md, DB.md
│   ├── api/         AUTH.md, ENDPOINTS.md, ...
│   ├── backend/     JOBS.md, QUEUES.md, ...
│   └── site/        PAGES.md, UI.md, ...
├── Rules/
│   ├── Coder/       CODE-STYLE.md, TESTING.md, ...
│   └── Designer/    DESIGN-SYSTEM.md, ...
├── Memory/
│   └── General/     NOTES.md, DECISIONS.md
└── Skills/
    ├── Code/        CODE-REVIEW.md
    └── Finance/     BUDGET.md, REPORTING.md
```

`.md` files sitting directly inside a scope (flat, single-level layout) still work — they show up under a virtual **General** group.

## Agent file format

Each agent is a self-describing md file, ready for an AI agent (Claude Code, Cursor...) to load directly:

```markdown
---
name: Coder
role: Senior coder
updated: 2026-07-13
---

# Agent: Coder

**Role:** Senior coder

## Knowledge — load these files before starting

- [Apps/api/ENDPOINTS.md](../context/Apps/api/ENDPOINTS.md)
- [Rules/Coder/CODE-STYLE.md](../context/Rules/Coder/CODE-STYLE.md)

## System prompt

You are MyApp's senior coder.

- Read every assigned knowledge file before writing code
```

Knowledge links are computed **relative from agentDir to contextDir**, so they are clickable in any editor.

## Claude Code skills

This repo is also a Claude Code plugin marketplace shipping three skills ([skills/](skills)).

### Install from GitHub

Inside Claude Code, add this repo as a marketplace and install the plugin:

```
/plugin marketplace add nnquangit/agent-hub
/plugin install agent-hub-skills@agent-hub
```

Or install manually without the plugin system:

```bash
git clone https://github.com/nnquangit/agent-hub.git
cp -R agent-hub/skills/* ~/.claude/skills/
```

Restart the Claude Code session and the skills are available in every project.

### agent-hub-mapping ⭐

The important one: it wires your agents into the project's `AGENTS.md` so any coding
agent routes tasks to the right instruction file. In any project with `.agents/agents/`,
ask Claude:

> Update AGENTS.md mapping

It scans `agent.<role>.md` files and appends this block to `AGENTS.md` (append-only —
your existing content is never touched, re-runs only regenerate the block):

```markdown
<!-- agent-hub:mapping:start -->

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
<!-- agent-hub:mapping:end -->
```

Role keys are the agents' `role` values verbatim (`role: admin.dev` ↔
`agent.admin.dev.md` → key `admin.dev`). After that, a prompt like _"(role db) add a
migration for orders"_ makes the agent load `agent.db.md` — and through it, all the
knowledge files assigned to that agent in the agent-hub UI.

### agent-hub-export

Bootstraps the knowledge base: exports a project's scattered docs, rules and notes
(README, docs/, CLAUDE.md, cursor rules...) into `.agents/context` + starter agents.
Each exported file carries a `> Source:` provenance line so agents don't also load the
originals. Ask: _"organize this project's docs into agent-hub format"_.

### agent-hub-update

Keeps the export in sync: re-scans sources, updates stale files, adds new ones, flags
knowledge whose sources disappeared — never touches hand-written notes or your agents'
assignments. Ask: _"docs changed, sync the agent-hub knowledge base"_.

## Development

```bash
npm install
npm run dev     # http://localhost:4321, uses the repo's .agents/*
npm run build   # production build into build/
npm pack        # pack a tarball to test npx locally
```

Stack: Next.js 15 (App Router, JS), shadcn/ui + Tailwind v4, no database — the filesystem is the single source of truth.
