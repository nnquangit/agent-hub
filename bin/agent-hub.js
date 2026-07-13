#!/usr/bin/env node
/**
 * CLI: npx @nnquangit/agent-hub --contextDir=.agents/context --agentDir=.agents/agents [-p 4321]
 * Relative paths are resolved against the current working directory.
 */
const path = require("path");
const fs = require("fs");
const http = require("http");

const HELP = `agent-hub — UI for managing agents + markdown knowledge

Usage:
  npx @nnquangit/agent-hub [options]

Options:
  --contextDir <dir>   Knowledge md directory      (default: .agents/context)
  --agentDir <dir>     Agent md output directory   (default: .agents/agents)
  -p, --port <port>    Server port                 (default: 4321, or env PORT)
  --host <host>        Hostname                    (default: localhost)
  -h, --help           Show this help

contextDir layout (2 levels): scope/knowledge/file.md
  e.g. Apps/admin/guide.md, Memory/General/notes.md
  (files directly inside a scope show up under a "General" group)
  If the context dir is empty or missing, example files are created on first run.

Examples:
  npx @nnquangit/agent-hub
  npx @nnquangit/agent-hub --contextDir=docs/knowledge --agentDir=docs/agents -p 3999
`;

function fail(msg) {
  console.error(`agent-hub: ${msg}\n`);
  console.error(HELP);
  process.exit(1);
}

/* ---------- example scaffold (empty context dir) ---------- */

const EXAMPLE_KNOWLEDGE = {
  "Apps/api/OVERVIEW.md": `# API Overview

Example knowledge file — replace with your own docs.

- Base URL: \`https://api.example.com/v1\`
- Auth: Bearer token in the \`Authorization\` header
- Errors follow \`{ "error": { "code", "message" } }\`
`,
  "Apps/site/OVERVIEW.md": `# Site Overview

Example knowledge file — replace with your own docs.

- Framework: Next.js App Router
- Pages: \`/\`, \`/products\`, \`/checkout\`
- State: server components first, client state only where needed
`,
  "Rules/Coder/CODE-STYLE.md": `# Code Style

Example rules — replace with your own.

- Prefer small, pure functions
- No dead code: delete it, don't comment it out
- Commit format: \`type(scope): message\`
`,
  "Memory/General/NOTES.md": `# Notes

> Short-term notes between work sessions. Clean up periodically.

- Add your notes here
`,
};

function hasAnyMd(dir, depth = 0) {
  if (depth > 2 || !fs.existsSync(dir)) return false;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isFile() && e.name.toLowerCase().endsWith(".md")) return true;
    if (e.isDirectory() && hasAnyMd(path.join(dir, e.name), depth + 1))
      return true;
  }
  return false;
}

// Empty/missing context dir → create example knowledge + a sample agent
function scaffoldExamples(contextDir, agentDir) {
  if (hasAnyMd(contextDir)) return [];
  const created = [];
  for (const [rel, content] of Object.entries(EXAMPLE_KNOWLEDGE)) {
    const file = path.join(contextDir, rel);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content, "utf8");
    created.push(path.relative(process.cwd(), file));
  }
  const hasAgent =
    fs.existsSync(agentDir) &&
    fs.readdirSync(agentDir).some((f) => /^agent\..+\.md$/.test(f));
  if (!hasAgent) {
    const prefix =
      path.relative(agentDir, contextDir).split(path.sep).join("/") || ".";
    const date = new Date().toISOString().slice(0, 10);
    const agentMd = `---
name: Example
role: Sample agent
updated: ${date}
---

# Agent: Example

**Role:** Sample agent

## Knowledge — load these files before starting

- [Apps/api/OVERVIEW.md](${prefix}/Apps/api/OVERVIEW.md)
- [Rules/Coder/CODE-STYLE.md](${prefix}/Rules/Coder/CODE-STYLE.md)

## System prompt

You are a sample agent. Tick knowledge files in Agent Hub to assign them, and edit this prompt to describe how the agent should work.
`;
    const file = path.join(agentDir, "agent.example.md");
    fs.mkdirSync(agentDir, { recursive: true });
    fs.writeFileSync(file, agentMd, "utf8");
    created.push(path.relative(process.cwd(), file));
  }
  return created;
}

function parseArgs(argv) {
  const canonical = {
    contextdir: "contextDir",
    "context-dir": "contextDir",
    agentdir: "agentDir",
    "agent-dir": "agentDir",
    agentsdir: "agentDir",
    "agents-dir": "agentDir",
    port: "port",
    p: "port",
    host: "host",
    hostname: "host",
    help: "help",
    h: "help",
  };
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const raw = argv[i];
    const m = raw.match(/^--?([^=]+)(?:=(.*))?$/);
    const key = m && canonical[m[1].toLowerCase()];
    if (!key) fail(`Unknown argument "${raw}"`);
    if (key === "help") {
      args.help = true;
      continue;
    }
    let val = m[2];
    // accept "--key=value", "--key value" and "--key= value"
    if (val === undefined || val === "") {
      val = argv[i + 1];
      if (val === undefined || val.startsWith("-"))
        fail(`Missing value for "${raw}"`);
      i++;
    }
    args[key] = val;
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
if (args.help) {
  console.log(HELP);
  process.exit(0);
}

const cwd = process.cwd();
const contextDir = path.resolve(cwd, args.contextDir || ".agents/context");
const agentDir = path.resolve(cwd, args.agentDir || ".agents/agents");
const rawPort = args.port || process.env.PORT || "4321";
const port = Number(rawPort);
if (!Number.isInteger(port) || port <= 0 || port > 65535)
  fail(`Invalid port: "${rawPort}"`);
const host = args.host || "localhost";

const scaffolded = scaffoldExamples(contextDir, agentDir);
if (scaffolded.length) {
  console.log(
    `\n  Empty knowledge folder — created ${scaffolded.length} example files:`
  );
  for (const f of scaffolded) console.log(`   + ${f}`);
}

const appDir = path.join(__dirname, "..");
if (!fs.existsSync(path.join(appDir, "build")))
  fail('Production build missing — run "npm run build" in the agent-hub repo first.');

process.env.AGENT_HUB_CONTEXT_DIR = contextDir;
process.env.AGENT_HUB_AGENTS_DIR = agentDir;
process.env.NODE_ENV = "production";

const next = require("next");
const app = next({ dev: false, dir: appDir });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server = http.createServer(handle);
    server.on("error", (e) => {
      if (e.code === "EADDRINUSE")
        console.error(
          `agent-hub: port ${port} is already in use — pick another with -p <port>`
        );
      else console.error(`agent-hub: ${e.message}`);
      process.exit(1);
    });
    server.listen(port, host, () => {
      console.log(`\n  Agent Hub  →  http://${host}:${port}\n`);
      console.log(`  context : ${contextDir}`);
      console.log(`  agents  : ${agentDir}\n`);
    });
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
