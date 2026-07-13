# Agent Hub

A UI for managing **agents + markdown knowledge**. It scans a directory of `.md` files (knowledge), lets you create agents, write system prompts, and tick-assign knowledge to each agent — every agent is written straight to disk as an `agent.[slug].md` file. No database.

![Main screen](https://raw.githubusercontent.com/nnquangit/agent-hub/main/docs/main.png)

Select an agent in the left column and the wires show which knowledge it "reads". Ticking / unticking a file in the right column auto-saves the agent file (400ms debounce).

## Quick start

```bash
npx @nnquangit/agent-hub
```

By default it uses `.agents/context` (knowledge) and `.agents/agents` (agents) in the current directory. To customize:

```bash
npx @nnquangit/agent-hub --contextDir=docs/knowledge --agentDir=docs/agents -p 3999
```

| Option | Default | Description |
|---|---|---|
| `--contextDir <dir>` | `.agents/context` | Directory containing knowledge md files |
| `--agentDir <dir>` | `.agents/agents` | Directory where `agent.[slug].md` files are written |
| `-p, --port <port>` | `4321` (or env `PORT`) | Server port |
| `--host <host>` | `localhost` | Hostname |
| `-h, --help` | | Show help |

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

## Development

```bash
npm install
npm run dev     # http://localhost:4321, uses the repo's .agents/*
npm run build   # production build into build/
npm pack        # pack a tarball to test npx locally
```

Stack: Next.js 15 (App Router, JS), shadcn/ui + Tailwind v4, no database — the filesystem is the single source of truth.
