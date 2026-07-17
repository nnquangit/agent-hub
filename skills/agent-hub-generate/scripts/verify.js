#!/usr/bin/env node
/**
 * Verify an agent-hub export.
 * Usage: node verify.js <contextDir> <agentDir>
 * Exits 1 on errors; deep files and empty dirs are warnings.
 */
const fs = require("fs");
const path = require("path");

const [, , ctxArg, agArg] = process.argv;
if (!ctxArg || !agArg) {
  console.error("Usage: node verify.js <contextDir> <agentDir>");
  process.exit(1);
}
const CTX = path.resolve(ctxArg);
const AG = path.resolve(agArg);
const errors = [];
const warnings = [];

// --- context tree: md files must sit at depth 1 (scope/file.md) or 2 (scope/topic/file.md)
let mdCount = 0;
function walk(dir, depth) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (depth >= 2)
        warnings.push(`dir deeper than 2 levels (invisible to agent-hub): ${p}`);
      else walk(p, depth + 1);
    } else if (e.name.toLowerCase().endsWith(".md")) {
      mdCount++;
      if (depth === 0)
        warnings.push(`md at context root (shows under scope "context"): ${p}`);
      if (depth === 1)
        warnings.push(`md directly in scope (shows under virtual "General"): ${p}`);
      if (!/^> Source: /m.test(fs.readFileSync(p, "utf8")))
        warnings.push(`no "> Source:" provenance line (fine if hand-written): ${p}`);
    }
  }
}
if (!fs.existsSync(CTX)) errors.push(`context dir missing: ${CTX}`);
else walk(CTX, 0);
if (mdCount === 0 && fs.existsSync(CTX)) errors.push("context dir has no md files");

// --- agent files
const prefix =
  path.relative(AG, CTX).split(path.sep).join("/") || ".";
const agentFiles = fs.existsSync(AG)
  ? fs.readdirSync(AG).filter((f) => /^agent\..+\.md$/.test(f))
  : [];
if (!agentFiles.length) warnings.push(`no agent.*.md files in ${AG}`);

for (const f of agentFiles) {
  const file = path.join(AG, f);
  const src = fs.readFileSync(file, "utf8");
  const fm = src.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) {
    errors.push(`${f}: missing frontmatter`);
    continue;
  }
  if (!/^name:\s*.+$/m.test(fm[1])) errors.push(`${f}: frontmatter missing "name:"`);
  if (!/^role:\s*.*$/m.test(fm[1])) warnings.push(`${f}: frontmatter missing "role:"`);

  const [head] = src.split(/\r?\n## System prompt\r?\n/);
  const links = [...head.matchAll(/^\s*[-*] \[(.+?)\]\((.+?)\)\s*$/gm)];
  if (!links.length) warnings.push(`${f}: no knowledge links`);
  for (const [, label, href] of links) {
    if (!fs.existsSync(path.join(CTX, label)))
      errors.push(`${f}: label "${label}" does not resolve in context dir`);
    const expected = prefix === "." ? `./${label}` : `${prefix}/${label}`;
    if (href !== expected && href !== `${prefix}/${label}`)
      errors.push(`${f}: href "${href}" should be "${prefix}/${label}"`);
    const parts = label.split("/");
    if (parts.length > 3)
      errors.push(`${f}: label "${label}" deeper than 2 levels — invisible in agent-hub`);
  }
}

for (const w of warnings) console.log(`⚠ ${w}`);
for (const e of errors) console.log(`✗ ${e}`);
console.log(
  `\n${mdCount} knowledge md, ${agentFiles.length} agents, ${errors.length} errors, ${warnings.length} warnings`
);
process.exit(errors.length ? 1 : 0);
