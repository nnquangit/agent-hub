#!/usr/bin/env node
/**
 * CLI: npx @agent-hub/cli --contextDir=.agents/context --agentDir=.agents/agents [-p 4321]
 * Relative paths are resolved against the current working directory.
 */
const path = require("path");
const fs = require("fs");
const http = require("http");

const HELP = `agent-hub — UI for managing agents + markdown knowledge

Usage:
  npx @agent-hub/cli [options]

Options:
  --contextDir <dir>   Knowledge md directory      (default: .agents/context)
  --agentDir <dir>     Agent md output directory   (default: .agents/agents)
  -p, --port <port>    Server port                 (default: 4321, or env PORT)
  --host <host>        Hostname                    (default: localhost)
  -h, --help           Show this help

contextDir layout (2 levels): scope/knowledge/file.md
  e.g. Apps/admin/guide.md, Memory/General/notes.md
  (files directly inside a scope show up under a "General" group)

Examples:
  npx @agent-hub/cli
  npx @agent-hub/cli --contextDir=docs/knowledge --agentDir=docs/agents -p 3999
`;

function fail(msg) {
  console.error(`agent-hub: ${msg}\n`);
  console.error(HELP);
  process.exit(1);
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

if (!fs.existsSync(contextDir))
  console.warn(
    `⚠ Context directory "${contextDir}" does not exist — the knowledge column will be empty.`
  );

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
