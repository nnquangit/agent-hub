#!/usr/bin/env node
/**
 * Generate the AGENTS.md role → agent-file mapping from an agent-hub agents dir.
 * Usage:
 *   node generate.js <agentsDir> [--write <file>] [--root <projectRoot>]
 * Prints the document to stdout unless --write is given.
 * Exits 1 if the agents dir is missing/empty or a mapped file is missing.
 */
const fs = require("fs");
const path = require("path");

const START = "<!-- agent-hub:mapping:start -->";
const END = "<!-- agent-hub:mapping:end -->";

const args = process.argv.slice(2);
const agentsDirArg = args.find((a) => !a.startsWith("--"));
const getOpt = (name) => {
  const i = args.indexOf(name);
  return i > -1 ? args[i + 1] : undefined;
};
if (!agentsDirArg) {
  console.error("Usage: node generate.js <agentsDir> [--write <file>] [--root <projectRoot>]");
  process.exit(1);
}
const root = path.resolve(getOpt("--root") || process.cwd());
const agentsDir = path.resolve(root, agentsDirArg);
const writeTarget = getOpt("--write");

if (!fs.existsSync(agentsDir)) {
  console.error(`agents dir not found: ${agentsDir}`);
  process.exit(1);
}
const files = fs
  .readdirSync(agentsDir)
  .filter((f) => /^agent\..+\.md$/.test(f))
  .sort();
if (!files.length) {
  console.error(`no agent.*.md files in ${agentsDir}`);
  process.exit(1);
}

const toPosix = (p) => p.split(path.sep).join("/");
const entries = files
  .map((f) => {
    const slug = f.replace(/^agent\./, "").replace(/\.md$/, "");
    return {
      // role key = slug verbatim — the user chooses the separator when naming agents
      key: slug,
      rel: toPosix(path.relative(root, path.join(agentsDir, f))),
    };
  })
  .sort((a, b) => a.key.localeCompare(b.key));

const missing = entries.filter((e) => !fs.existsSync(path.join(root, e.rel)));
if (missing.length) {
  console.error(`mapped files missing: ${missing.map((m) => m.rel).join(", ")}`);
  process.exit(1);
}

const doc = `# AI Agent Instructions

Role instruction files:

${entries.map((e) => `- \`${e.key}\` → \`${e.rel}\``).join("\n")}

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

const block = `${START}\n${doc}${END}\n`;

if (!writeTarget) {
  process.stdout.write(doc);
  process.exit(0);
}

// Append-only contract: the mapping lives in a marker-delimited block.
// We never overwrite or restructure anything outside the markers.
const target = path.resolve(root, writeTarget);
let out;
if (!fs.existsSync(target)) {
  out = block;
} else {
  const cur = fs.readFileSync(target, "utf8");
  if (cur.includes(START) && cur.includes(END)) {
    // regenerate only the managed block, keep everything else byte-identical
    out = cur.replace(new RegExp(`${START}[\\s\\S]*?${END}\\n?`), block);
  } else {
    // existing AGENTS.md without our block — append it at the end
    out = `${cur.replace(/\s*$/, "")}\n\n${block}`;
  }
}
fs.writeFileSync(target, out, "utf8");
console.log(`${path.relative(process.cwd(), target) || target}: mapped ${entries.length} agents`);
for (const e of entries) console.log(`  ${e.key} → ${e.rel}`);
