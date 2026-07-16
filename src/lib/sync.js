import fs from "fs";
import path from "path";
import { CONTEXT_DIR, listAgents } from "./store";

const ROOT = process.cwd();
const MARKER_PREFIX = "<!-- agent-hub:generated";
const MAP_START = "<!-- agent-hub:mapping:start -->";
const MAP_END = "<!-- agent-hub:mapping:end -->";

const toPosix = (p) => p.split(path.sep).join("/");

// Knowledge paths as the generated prompt should reference them:
// project-root-relative, absolute when the context dir lives outside the root.
function knowledgePath(k) {
  const abs = path.join(CONTEXT_DIR, k);
  const rel = path.relative(ROOT, abs);
  return rel.startsWith("..") ? abs : toPosix(rel);
}

function agentFileRel(slug) {
  return toPosix(
    path.relative(ROOT, path.join(process.env.AGENT_HUB_AGENTS_DIR || path.join(ROOT, ".agents", "agents"), `agent.${slug}.md`))
  );
}

/** Shared prompt body for generated per-agent files (Claude Code, OpenCode...) */
function agentPrompt(a, readTool) {
  const files = a.knowledge.map((k) => `- \`${knowledgePath(k)}\``).join("\n");
  return `You are **${a.name}** — role \`${a.role || a.slug}\`.

${
  a.knowledge.length
    ? `Read every knowledge file below with ${readTool} BEFORE doing anything else (paths relative to the project root):

${files}

Start your first reply with one line listing the knowledge files you loaded. If a file is missing, say so instead of guessing.`
    : "(no knowledge files assigned yet — assign them in Agent Hub)"
}
${a.systemPrompt ? `\n## System prompt\n\n${a.systemPrompt}\n` : ""}`;
}

function marker(slug) {
  return `${MARKER_PREFIX} from ${agentFileRel(slug)} — edit in Agent Hub, not here -->`;
}

// Write generated per-agent files into a target dir with marker safety:
// only files carrying our marker are ever overwritten or removed.
function syncGeneratedDir(dir, render, ext = ".md") {
  fs.mkdirSync(dir, { recursive: true });
  const agents = listAgents();
  const wanted = new Map();
  const result = { written: [], skipped: [], removed: [] };

  for (const a of agents) {
    // most agent runtimes want conservative file names
    const fname = a.slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "agent";
    const file = path.join(dir, fname + ext);
    wanted.set(fname + ext, true);
    const content = render(a, fname);
    if (fs.existsSync(file)) {
      const cur = fs.readFileSync(file, "utf8");
      if (!cur.includes(MARKER_PREFIX)) {
        result.skipped.push(path.relative(ROOT, file));
        continue;
      }
      if (cur === content) continue;
    }
    fs.writeFileSync(file, content, "utf8");
    result.written.push(path.relative(ROOT, file));
  }

  // remove orphans we generated for agents that no longer exist
  for (const f of fs.readdirSync(dir)) {
    if (wanted.has(f) || !f.endsWith(ext)) continue;
    const p = path.join(dir, f);
    try {
      if (fs.statSync(p).isFile() && fs.readFileSync(p, "utf8").includes(MARKER_PREFIX)) {
        fs.unlinkSync(p);
        result.removed.push(path.relative(ROOT, p));
      }
    } catch {}
  }
  return result;
}

/* ---------- targets ---------- */

function syncAgentsMd() {
  const agents = listAgents().sort((a, b) => a.slug.localeCompare(b.slug));
  if (!agents.length) throw new Error("No agents to sync");
  const doc = `# AI Agent Instructions

Role instruction files:

${agents.map((a) => `- \`${a.slug}\` → \`${agentFileRel(a.slug)}\``).join("\n")}

## Loading Rules

Before starting any task:

1. Determine which role(s) are required for the task.
2. Locate the corresponding agent instruction file by matching the **role** value.
3. Read the matched agent instruction file completely before planning or writing code.
4. The agent instruction file contains additional knowledge files that must also be read before performing the task.
5. If the task spans multiple roles, load every matching agent instruction file.
6. Do not load instruction files for unrelated roles.
7. If instructions conflict, the most specific role instruction takes precedence.
`;
  const block = `${MAP_START}\n${doc}${MAP_END}\n`;
  const target = path.join(ROOT, "AGENTS.md");

  // append-only: the mapping lives in a marker block, nothing outside it is touched
  let out;
  if (!fs.existsSync(target)) out = block;
  else {
    const cur = fs.readFileSync(target, "utf8");
    out =
      cur.includes(MAP_START) && cur.includes(MAP_END)
        ? cur.replace(new RegExp(`${MAP_START}[\\s\\S]*?${MAP_END}\\n?`), block)
        : `${cur.replace(/\s*$/, "")}\n\n${block}`;
  }
  fs.writeFileSync(target, out, "utf8");
  return { written: ["AGENTS.md"], skipped: [], removed: [], count: agents.length };
}

function syncClaudeCode() {
  const dir = path.join(ROOT, ".claude", "agents");
  const res = syncGeneratedDir(dir, (a, fname) => {
    const desc = `${a.role || a.name} — agent-hub agent; loads its assigned project knowledge before working.`;
    return `---
name: ${fname}
description: ${JSON.stringify(desc)}
---
${marker(a.slug)}

${agentPrompt(a, "the Read tool")}`;
  });
  return { ...res, count: listAgents().length, out: ".claude/agents" };
}

function syncOpenCode() {
  const dir = path.join(ROOT, ".opencode", "agent");
  const res = syncGeneratedDir(dir, (a, fname) => {
    const desc = `${a.role || a.name} — agent-hub agent; loads its assigned project knowledge before working.`;
    return `---
description: ${JSON.stringify(desc)}
mode: subagent
---
${marker(a.slug)}

${agentPrompt(a, "your file-reading tool")}`;
  });
  return { ...res, count: listAgents().length, out: ".opencode/agent" };
}

export const SYNC_TARGETS = [
  {
    id: "agents-md",
    label: "AGENTS.md",
    desc: "Role → agent file map with loading rules (append-only block)",
    run: syncAgentsMd,
  },
  {
    id: "claude-code",
    label: "Claude Code",
    desc: "Subagents in .claude/agents/ — invoke with @agent-<name>",
    run: syncClaudeCode,
  },
  {
    id: "opencode",
    label: "OpenCode",
    desc: "Agents in .opencode/agent/ (subagent mode)",
    run: syncOpenCode,
  },
];

export function runSync(id) {
  const t = SYNC_TARGETS.find((t) => t.id === id);
  if (!t) throw new Error(`Unknown sync target: ${id}`);
  return { target: t.id, label: t.label, ...t.run() };
}
