import fs from "fs";
import path from "path";
import { agentToMd } from "./agent-md";

const ROOT = process.cwd();
// The CLI (bin/agent-hub.js) sets these two envs; dev falls back to .agents/* under cwd
export const CONTEXT_DIR = process.env.AGENT_HUB_CONTEXT_DIR
  ? path.resolve(process.env.AGENT_HUB_CONTEXT_DIR)
  : path.join(ROOT, ".agents", "context");
export const AGENTS_DIR = process.env.AGENT_HUB_AGENTS_DIR
  ? path.resolve(process.env.AGENT_HUB_AGENTS_DIR)
  : path.join(ROOT, ".agents", "agents");

const toPosix = (p) => p.split(path.sep).join("/");
/** Relative link prefix from AGENTS_DIR to CONTEXT_DIR, used inside agent md files */
export const LINK_PREFIX = toPosix(path.relative(AGENTS_DIR, CONTEXT_DIR)) || ".";

// The slug is whatever the user typed as the name — no forced separator or casing.
// Only strip characters that are unsafe in filenames or could escape the agents dir.
export function slugify(name) {
  return (
    String(name)
      .trim()
      .replace(/[/\\:*?"<>|\n\r]+/g, "")
      .replace(/\s+/g, " ")
      .replace(/\.{2,}/g, ".")
      .replace(/^\.+|\.+$/g, "")
      .trim() || "agent"
  );
}

// slugs come from file names, possibly hand-written — only block path traversal
function assertSafeSlug(slug) {
  if (!slug || /[/\\]|\.\./.test(slug)) throw new Error("Invalid slug");
  return slug;
}

const isAgentFileName = (f) => /^agent\..+\.md$/.test(f);

function listMdFiles(dir, { excludeAgentFiles }) {
  return fs
    .readdirSync(dir)
    .filter(
      (f) =>
        f.toLowerCase().endsWith(".md") &&
        !(excludeAgentFiles && isAgentFileName(f))
    )
    .sort();
}

/**
 * Scan CONTEXT_DIR two levels deep: scope/knowledge/file.md
 * → [{ scope, groups: [{ folder, key, files: [{ name, path }] }] }]
 *
 * Backward compatible with the flat layout:
 * - .md files directly inside a level-1 folder → scope = folder name, virtual "General" group
 * - .md files at the context root → scope "context"
 * Skips AGENTS_DIR and agent.*.md files when the two directories overlap.
 */
export function scanKnowledge() {
  if (!fs.existsSync(CONTEXT_DIR)) return [];
  // the agents dir may live inside the context dir → don't scan agents as knowledge
  const skipDir = (abs) => path.resolve(abs) === path.resolve(AGENTS_DIR);
  const excludeAgentFiles = true;

  const scopes = [];
  const entries = fs
    .readdirSync(CONTEXT_DIR, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name));

  // .md files at the context root
  const rootFiles = entries.filter(
    (e) =>
      e.isFile() &&
      e.name.toLowerCase().endsWith(".md") &&
      !isAgentFileName(e.name)
  );
  if (rootFiles.length) {
    scopes.push({
      scope: "context",
      groups: [
        {
          folder: "General",
          key: "~root",
          files: rootFiles.map((f) => ({ name: f.name, path: f.name })),
        },
      ],
    });
  }

  for (const scopeDir of entries.filter((e) => e.isDirectory())) {
    const scopeAbs = path.join(CONTEXT_DIR, scopeDir.name);
    if (skipDir(scopeAbs)) continue;
    const groups = [];

    const subEntries = fs
      .readdirSync(scopeAbs, { withFileTypes: true })
      .sort((a, b) => a.name.localeCompare(b.name));

    // files directly inside a scope (old flat layout) → virtual "General" group
    const directFiles = subEntries
      .filter(
        (e) =>
          !e.isDirectory() &&
          e.name.toLowerCase().endsWith(".md") &&
          !(excludeAgentFiles && isAgentFileName(e.name))
      )
      .map((f) => ({ name: f.name, path: `${scopeDir.name}/${f.name}` }));
    if (directFiles.length)
      groups.push({
        folder: "General",
        key: scopeDir.name,
        files: directFiles,
      });

    // level 2: scope/knowledge/*.md — empty topic dirs are listed too, so
    // folders created from the UI are visible before they have files
    for (const sub of subEntries.filter((e) => e.isDirectory())) {
      const subAbs = path.join(scopeAbs, sub.name);
      if (skipDir(subAbs)) continue;
      const files = listMdFiles(subAbs, { excludeAgentFiles }).map((f) => ({
        name: f,
        path: `${scopeDir.name}/${sub.name}/${f}`,
      }));
      groups.push({
        folder: sub.name,
        key: `${scopeDir.name}/${sub.name}`,
        files,
      });
    }

    scopes.push({ scope: scopeDir.name, groups });
  }
  return scopes;
}

// path segments for user-created folders/files — block traversal & fs-unsafe chars
function assertSafeSegment(seg) {
  if (!seg || seg.includes("..") || /[\\/:*?"<>|\n\r]/.test(seg) || /^\.+$/.test(seg))
    throw new Error(`Invalid name: "${seg}"`);
  return seg;
}

/** Create a Scope or Scope/Topic folder inside the context dir */
export function createKnowledgeDir(relPath) {
  const segs = String(relPath || "")
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!segs.length) throw new Error("Missing folder path");
  if (segs.length > 2) throw new Error("Max depth is Scope/Topic (2 levels)");
  segs.forEach(assertSafeSegment);
  const dir = path.join(CONTEXT_DIR, ...segs);
  if (!path.resolve(dir).startsWith(path.resolve(CONTEXT_DIR) + path.sep))
    throw new Error("Invalid path");
  fs.mkdirSync(dir, { recursive: true });
  return { path: segs.join("/") };
}

/** Delete a Scope or Scope/Topic folder (recursively) inside the context dir */
export function deleteKnowledgeDir(relPath) {
  const segs = String(relPath || "")
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!segs.length) throw new Error("Missing folder path");
  if (segs.length > 2) throw new Error("Max depth is Scope/Topic (2 levels)");
  segs.forEach(assertSafeSegment);
  const dir = path.join(CONTEXT_DIR, ...segs);
  const resolved = path.resolve(dir);
  if (!resolved.startsWith(path.resolve(CONTEXT_DIR) + path.sep))
    throw new Error("Invalid path");
  // the agents dir may live inside the context dir — never delete it along the way
  const agentsResolved = path.resolve(AGENTS_DIR);
  if (agentsResolved === resolved || agentsResolved.startsWith(resolved + path.sep))
    throw new Error("Cannot delete: this folder contains the agents directory");
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory())
    throw new Error("Folder not found");
  fs.rmSync(dir, { recursive: true });
  return { path: segs.join("/") };
}

/** Delete a knowledge md file (path relative to the context dir) */
export function deleteKnowledgeFile(relPath) {
  const segs = String(relPath || "")
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!segs.length) throw new Error("Missing file path");
  if (segs.length > 3) throw new Error("Invalid path");
  segs.forEach(assertSafeSegment);
  if (!segs[segs.length - 1].toLowerCase().endsWith(".md"))
    throw new Error("Only md files can be deleted");
  const file = path.join(CONTEXT_DIR, ...segs);
  if (!path.resolve(file).startsWith(path.resolve(CONTEXT_DIR) + path.sep))
    throw new Error("Invalid path");
  if (!fs.existsSync(file)) throw new Error("File not found");
  fs.unlinkSync(file);
  return { path: segs.join("/") };
}

/** Create or overwrite a knowledge md file (path relative to the context dir) */
export function writeKnowledgeFile(relPath, content) {
  const segs = String(relPath || "")
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!segs.length) throw new Error("Missing file path");
  if (segs.length > 3)
    throw new Error("Max depth is Scope/Topic/FILE.md (files deeper are invisible)");
  segs.forEach(assertSafeSegment);
  if (!segs[segs.length - 1].toLowerCase().endsWith(".md"))
    segs[segs.length - 1] += ".md";
  if (isAgentFileName(segs[segs.length - 1]))
    throw new Error('"agent.*.md" names are reserved for agents');
  const file = path.join(CONTEXT_DIR, ...segs);
  if (!path.resolve(file).startsWith(path.resolve(CONTEXT_DIR) + path.sep))
    throw new Error("Invalid path");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, String(content ?? ""), "utf8");
  return { path: segs.join("/") };
}

/** Every valid knowledge path (flat) */
export function allKnowledgePaths() {
  return scanKnowledge().flatMap((s) =>
    s.groups.flatMap((g) => g.files.map((f) => f.path))
  );
}

export function readKnowledgeFile(relPath) {
  const file = path.resolve(CONTEXT_DIR, String(relPath || ""));
  if (!file.startsWith(CONTEXT_DIR + path.sep))
    throw new Error("Invalid path");
  if (!file.toLowerCase().endsWith(".md") || !fs.existsSync(file))
    throw new Error("File not found");
  // block symlinks pointing outside the context dir
  const real = fs.realpathSync(file);
  const realBase = fs.realpathSync(CONTEXT_DIR);
  if (!real.startsWith(realBase + path.sep))
    throw new Error("Invalid path");
  return fs.readFileSync(real, "utf8");
}

function parseAgentFile(file) {
  const src = fs.readFileSync(file, "utf8");
  const fm = src.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const get = (k) => {
    if (!fm) return "";
    const m = fm[1].match(new RegExp(`^${k}:\\s*(.+)$`, "m"));
    return m ? m[1].trim() : "";
  };
  // System prompt is the last section — everything after it is free text,
  // so knowledge links are not scanned there
  const [head, ...sysParts] = src.split(/\r?\n## System prompt\r?\n/);
  const systemPrompt = sysParts.join("\n## System prompt\n").trim();
  // Read knowledge paths from link labels (the label is always the path
  // relative to the context dir, independent of the href prefix);
  // tolerate indent / * bullets / trailing spaces (hand-edited files)
  const knowledge = [...head.matchAll(/^\s*[-*] \[(.+?)\]\(.+?\)\s*$/gm)].map(
    (m) => m[1]
  );
  const name = get("name") || path.basename(file, ".md").replace(/^agent\./, "");
  return {
    slug: path.basename(file, ".md").replace(/^agent\./, ""),
    file: path.relative(ROOT, file),
    name,
    role: get("role"),
    model: get("model"),
    knowledge,
    systemPrompt,
  };
}

export function listAgents() {
  if (!fs.existsSync(AGENTS_DIR)) return [];
  return fs
    .readdirSync(AGENTS_DIR)
    .filter(isAgentFileName)
    .sort()
    .map((f) => parseAgentFile(path.join(AGENTS_DIR, f)));
}

export function saveAgent({ name, role, model, knowledge, systemPrompt, oldSlug }) {
  // name/role/model live on single frontmatter lines — strip newlines to keep the format intact
  name = String(name || "").replace(/\s+/g, " ").trim();
  role = String(role || "").replace(/\s+/g, " ").trim();
  model = String(model || "").replace(/\s+/g, " ").trim();
  systemPrompt = String(systemPrompt || "").trim();
  if (!name) throw new Error("Agent name required");

  const validPaths = allKnowledgePaths();
  knowledge = Array.isArray(knowledge) ? knowledge : [];
  // empty/moved context dir → keep knowledge instead of silently wiping it
  if (validPaths.length) {
    const valid = new Set(validPaths);
    knowledge = knowledge.filter((k) => valid.has(k));
  }

  fs.mkdirSync(AGENTS_DIR, { recursive: true });
  // the role is the routing key and names the file: role "coder" → agent.coder.md
  // (falls back to the display name when role is empty)
  const slug = slugify(role || name);
  if (oldSlug && oldSlug !== slug) {
    // oldSlug is the verbatim slug from the file name (possibly hand-written)
    const old = path.join(AGENTS_DIR, `agent.${assertSafeSlug(oldSlug)}.md`);
    if (fs.existsSync(old)) fs.unlinkSync(old);
  }
  const file = path.join(AGENTS_DIR, `agent.${slug}.md`);
  fs.writeFileSync(
    file,
    agentToMd({ name, role, model, knowledge, systemPrompt }, LINK_PREFIX),
    "utf8"
  );
  return parseAgentFile(file);
}

export function deleteAgent(slug) {
  // use the verbatim slug from the file name — no re-slugify,
  // so hand-named agent files can be deleted too
  const file = path.join(AGENTS_DIR, `agent.${assertSafeSlug(slug)}.md`);
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
    return true;
  }
  return false;
}
