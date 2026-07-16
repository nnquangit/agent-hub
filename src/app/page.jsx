"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import {
  FileTextIcon,
  FolderIcon,
  FolderSyncIcon,
  Loader2Icon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { agentToMd } from "@/lib/agent-md";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

// The slug is whatever the user typed as the name — no forced separator or casing.
// Only strip characters that are unsafe in filenames (mirror of store.js slugify).
function slugify(name) {
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

const curve = (p1, p2) =>
  `M ${p1.x} ${p1.y} C ${p1.x + 50} ${p1.y}, ${p2.x - 50} ${p2.y}, ${p2.x} ${p2.y}`;

export default function Home() {
  const [cfg, setCfg] = useState({
    contextDir: ".agents/context",
    agentsDir: ".agents/agents",
    linkPrefix: "../context",
  });
  const [knowledge, setKnowledge] = useState([]);
  const [agents, setAgents] = useState([]);
  const [selected, setSelected] = useState(null); // slug
  const [wires, setWires] = useState({ paths: [], dots: [] });
  const [saving, setSaving] = useState(false);

  // column 2 & 3 search
  const [qDirs, setQDirs] = useState("");
  const [qFiles, setQFiles] = useState("");

  // agent form drawer: null | { mode: "create" } | { mode: "edit", agent }
  const [agentForm, setAgentForm] = useState(null);
  const [fName, setFName] = useState("");
  const [fRole, setFRole] = useState("");
  const [fSys, setFSys] = useState("");

  // md file drawer: null | { name, path }
  const [fileView, setFileView] = useState(null);
  const [fileContent, setFileContent] = useState(null); // null = loading

  // sync popover
  const [syncTargets, setSyncTargets] = useState([]);
  const [syncOpen, setSyncOpen] = useState(false);
  const [syncing, setSyncing] = useState(null); // target id while running

  const mainRef = useRef(null);
  const saveTimer = useRef(null);

  const cur = agents.find((a) => a.slug === selected) || null;
  const checked = new Set(cur ? cur.knowledge : []);

  /* ---------- data ---------- */

  const getJson = (url) =>
    fetch(url).then((r) => {
      if (!r.ok) throw new Error(`Error ${r.status} fetching ${url}`);
      return r.json();
    });

  const loadAll = useCallback(async () => {
    try {
      const [c, k, a, s] = await Promise.all([
        getJson("/api/config"),
        getJson("/api/knowledge"),
        getJson("/api/agents"),
        getJson("/api/sync"),
      ]);
      setCfg(c);
      setKnowledge(k);
      setAgents(a);
      setSyncTargets(s);
    } catch (e) {
      toast.error(e.message || "Failed to load data");
    }
  }, []);

  const doSync = async (t) => {
    setSyncing(t.id);
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: t.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sync failed");
      const parts = [];
      if (data.written?.length) parts.push(`${data.written.length} written`);
      if (data.removed?.length) parts.push(`${data.removed.length} removed`);
      if (data.skipped?.length) parts.push(`${data.skipped.length} skipped (not ours)`);
      toast.success(
        `${t.label}: ${parts.join(", ") || "already up to date"}${
          data.out ? ` → ${data.out}` : ""
        }`
      );
      setSyncOpen(false);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSyncing(null);
    }
  };

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // knowledge = [{ scope, groups: [{ folder, key, files }] }] — flattened for wires
  const allGroups = useMemo(
    () =>
      knowledge.flatMap((s) =>
        s.groups.map((g) => ({ ...g, scope: s.scope }))
      ),
    [knowledge]
  );

  const scopesFiltered = useMemo(() => {
    const q = qDirs.trim().toLowerCase();
    if (!q) return knowledge;
    return knowledge
      .map((s) =>
        s.scope.toLowerCase().includes(q)
          ? s
          : {
              ...s,
              groups: s.groups.filter((g) =>
                g.folder.toLowerCase().includes(q)
              ),
            }
      )
      .filter((s) => s.groups.length);
  }, [knowledge, qDirs]);

  const filesFiltered = useMemo(() => {
    const q = qFiles.trim().toLowerCase();
    if (!q) return knowledge;
    return knowledge
      .map((s) => ({
        ...s,
        groups: s.groups
          .map((g) => ({
            ...g,
            files: g.files.filter((f) => f.path.toLowerCase().includes(q)),
          }))
          .filter((g) => g.files.length),
      }))
      .filter((s) => s.groups.length);
  }, [knowledge, qFiles]);

  const persist = useCallback(async (agent) => {
    setSaving(true);
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: agent.name,
          role: agent.role,
          knowledge: agent.knowledge,
          systemPrompt: agent.systemPrompt,
          oldSlug: agent.oldSlug || agent.slug,
        }),
      });
      const saved = await res.json();
      if (!res.ok) throw new Error(saved.error || "Failed to save file");
      setAgents((list) =>
        list.map((a) => (a.slug === (agent.oldSlug || agent.slug) ? saved : a))
      );
      setSelected((s) => (s === (agent.oldSlug || agent.slug) ? saved.slug : s));
      toast.success(`Saved ${saved.file}`);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }, []);

  const schedulePersist = useCallback(
    (agent) => {
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => persist(agent), 400);
    },
    [persist]
  );

  /* ---------- agent form drawer ---------- */

  const openCreate = () => {
    setFName("");
    setFRole("");
    setFSys("");
    setAgentForm({ mode: "create" });
  };

  const openEdit = (agent, e) => {
    e.stopPropagation();
    setFName(agent.name);
    setFRole(agent.role || "");
    setFSys(agent.systemPrompt || "");
    setAgentForm({ mode: "edit", agent });
  };

  const submitAgent = async (e) => {
    e.preventDefault();
    const name = fName.trim();
    if (!name) {
      toast.error("Agent name is required");
      return;
    }
    const editing = agentForm?.mode === "edit" ? agentForm.agent : null;
    // role is the routing key and names the file (falls back to display name)
    const slug = slugify(fRole.trim() || name);
    if (agents.some((a) => a.slug === slug && a.slug !== editing?.slug)) {
      toast.error(`Agent "${slug}" already exists`);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          role: fRole.trim(),
          knowledge: editing ? editing.knowledge : [],
          systemPrompt: fSys,
          oldSlug: editing?.slug,
        }),
      });
      const saved = await res.json();
      if (!res.ok) throw new Error(saved.error || "Failed to save file");
      if (editing) {
        setAgents((l) => l.map((a) => (a.slug === editing.slug ? saved : a)));
        setSelected((s) => (s === editing.slug ? saved.slug : s));
      } else {
        setAgents((l) => [...l, saved]);
        setSelected(saved.slug);
      }
      toast.success(`Saved ${saved.file}`);
      setAgentForm(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const removeAgent = async (agent, e) => {
    e.stopPropagation();
    if (!confirm(`Delete agent "${agent.name}" (${agent.file})?`)) return;
    await fetch(`/api/agents?slug=${encodeURIComponent(agent.slug)}`, {
      method: "DELETE",
    });
    setAgents((l) => l.filter((a) => a.slug !== agent.slug));
    setSelected((s) => (s === agent.slug ? null : s));
    toast.success(`Deleted agent.${agent.slug}.md`);
  };

  /* ---------- knowledge ---------- */

  const toggleFile = (path) => {
    if (!cur) {
      toast.warning("Select an agent in the left column first");
      return;
    }
    const has = cur.knowledge.includes(path);
    const knowledge = has
      ? cur.knowledge.filter((k) => k !== path)
      : [...cur.knowledge, path];
    const updated = { ...cur, knowledge };
    setAgents((l) => l.map((a) => (a.slug === cur.slug ? updated : a)));
    schedulePersist(updated);
  };

  const toggleGroup = (group) => {
    if (!cur) {
      toast.warning("Select an agent in the left column first");
      return;
    }
    const paths = group.files.map((f) => f.path);
    const allOn = paths.every((p) => cur.knowledge.includes(p));
    const knowledge = allOn
      ? cur.knowledge.filter((k) => !paths.includes(k))
      : [...new Set([...cur.knowledge, ...paths])];
    const updated = { ...cur, knowledge };
    setAgents((l) => l.map((a) => (a.slug === cur.slug ? updated : a)));
    schedulePersist(updated);
  };

  const scrollToGroup = (folder) => {
    const el = mainRef.current?.querySelector(`[data-group="${folder}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /* ---------- file detail drawer ---------- */

  const openFile = async (f) => {
    setFileView(f);
    setFileContent(null);
    try {
      const res = await fetch(
        `/api/knowledge/file?path=${encodeURIComponent(f.path)}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to read file");
      setFileContent(data.content);
    } catch (e) {
      setFileContent(`⚠ ${e.message}`);
    }
  };

  /* ---------- wires ---------- */

  const drawWires = useCallback(() => {
    const main = mainRef.current;
    if (!main) return;
    const agent = agents.find((a) => a.slug === selected);
    if (!agent) {
      setWires({ paths: [], dots: [] });
      return;
    }
    const m = main.getBoundingClientRect();
    const rel = (r, side) => ({
      x: (side === "r" ? r.right : r.left) - m.left,
      y: r.top + r.height / 2 - m.top,
    });
    const sel = new Set(agent.knowledge);
    const paths = [];
    const dots = [];

    const agentEl = main.querySelector(`[data-agent="${selected}"]`);
    if (!agentEl) {
      setWires({ paths: [], dots: [] });
      return;
    }
    const start = rel(agentEl.getBoundingClientRect(), "r");
    let hasWire = false;

    for (const g of allGroups) {
      const files = g.files.filter((f) => sel.has(f.path));
      if (!files.length) continue;
      const dirEl = main.querySelector(`[data-dir="${g.key}"]`);
      if (!dirEl) continue;
      const dr = dirEl.getBoundingClientRect();
      const dIn = rel(dr, "l");
      const dOut = rel(dr, "r");
      paths.push({ d: curve(start, dIn), cls: "wa", key: `a-${g.key}` });
      dots.push({ ...dIn, c: "var(--primary)", key: `di-${g.key}` });
      hasWire = true;
      for (const f of files) {
        const fEl = main.querySelector(`[data-file="${f.path}"]`);
        if (!fEl) continue;
        const fIn = rel(fEl.getBoundingClientRect(), "l");
        paths.push({ d: curve(dOut, fIn), cls: "wb", key: `b-${f.path}` });
        dots.push({ ...fIn, c: "var(--muted-foreground)", key: `df-${f.path}` });
      }
      dots.push({ ...dOut, c: "var(--muted-foreground)", key: `do-${g.key}` });
    }
    if (hasWire) dots.push({ ...start, c: "var(--primary)", key: "start" });
    setWires({ paths, dots });
  }, [agents, selected, allGroups]);

  useLayoutEffect(() => {
    drawWires();
  }, [drawWires, qDirs, qFiles]);

  useEffect(() => {
    const h = () => drawWires();
    window.addEventListener("resize", h);
    document.addEventListener("scroll", h, true);
    return () => {
      window.removeEventListener("resize", h);
      document.removeEventListener("scroll", h, true);
    };
  }, [drawWires]);

  /* ---------- render ---------- */

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b px-5">
        <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
          A
        </div>
        <h1 className="text-base font-semibold">Agent Hub</h1>
        <code className="hidden text-xs text-muted-foreground sm:block">
          {cfg.contextDir} → {cfg.agentsDir}
        </code>
        <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          <span
            className={cn(
              "size-2 rounded-full",
              saving ? "animate-pulse bg-amber-400" : "bg-emerald-500"
            )}
          />
          {saving ? "Saving..." : "Synced"}
        </div>
      </header>

      <main
        ref={mainRef}
        className="relative grid min-h-0 flex-1 grid-cols-[280px_320px_1fr] gap-8 p-4"
      >
        <svg className="pointer-events-none absolute inset-0 z-20 size-full">
          {wires.paths.map((p) => (
            <path
              key={p.key}
              d={p.d}
              fill="none"
              stroke={p.cls === "wa" ? "var(--primary)" : "var(--muted-foreground)"}
              strokeWidth="1.5"
              opacity={p.cls === "wa" ? 0.7 : 0.45}
            />
          ))}
          {wires.dots.map((d) => (
            <circle key={d.key} cx={d.x} cy={d.y} r="3.5" fill={d.c} />
          ))}
        </svg>

        {/* ===== Column 1: Agent manager ===== */}
        <Card className="min-h-0 gap-0 overflow-hidden p-0">
          <div className="flex items-center justify-between border-b px-3 py-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              1 · Agent Manager
            </span>
            <Button size="xs" onClick={openCreate}>
              <PlusIcon data-icon="inline-start" />
              New agent
            </Button>
          </div>
          <ScrollArea className="min-h-0 flex-1">
            <div className="flex flex-col gap-2 p-3">
              {agents.length === 0 && (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  No agents yet.
                  <br />
                  Click “New agent” above.
                </div>
              )}
              {agents.map((a) => (
                <div
                  key={a.slug}
                  data-agent={a.slug}
                  onClick={() =>
                    setSelected((s) => (s === a.slug ? null : a.slug))
                  }
                  className={cn(
                    "group cursor-pointer rounded-lg border bg-card p-3 transition-colors hover:bg-accent/50",
                    selected === a.slug &&
                      "border-primary/60 bg-accent/40 ring-1 ring-primary/60"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">
                        {a.name}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {a.role || "—"}
                      </div>
                    </div>
                    <div className="flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        title="Edit agent"
                        onClick={(e) => openEdit(a, e)}
                      >
                        <PencilIcon />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        title="Delete agent"
                        className="text-destructive hover:text-destructive"
                        onClick={(e) => removeAgent(a, e)}
                      >
                        <Trash2Icon />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <Badge variant="secondary">
                      {a.knowledge.length} knowledge
                    </Badge>
                    <code className="truncate text-[10px] text-muted-foreground">
                      agent.{a.slug}.md
                    </code>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="border-t p-2">
            <Popover open={syncOpen} onOpenChange={setSyncOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={agents.length === 0}
                >
                  <FolderSyncIcon data-icon="inline-start" />
                  Sync agents
                </Button>
              </PopoverTrigger>
              <PopoverContent side="top" align="start" className="w-80 p-1">
                {syncTargets.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => doSync(t)}
                    disabled={!!syncing}
                    className="flex w-full items-start gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-accent disabled:opacity-50"
                  >
                    {syncing === t.id ? (
                      <Loader2Icon className="mt-0.5 size-4 shrink-0 animate-spin text-muted-foreground" />
                    ) : (
                      <FolderSyncIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">
                        {t.label}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {t.desc}
                      </span>
                    </span>
                  </button>
                ))}
              </PopoverContent>
            </Popover>
          </div>
        </Card>

        {/* ===== Column 2: Topics ===== */}
        <Card className="min-h-0 gap-0 overflow-hidden p-0">
          <div className="border-b px-3 py-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              2 · Knowledge · Topics
            </span>
            <div className="relative mt-2">
              <SearchIcon className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-8 pl-8"
                placeholder="Search topics..."
                value={qDirs}
                onChange={(e) => setQDirs(e.target.value)}
              />
            </div>
          </div>
          <ScrollArea className="min-h-0 flex-1">
            <div className="flex flex-col gap-3 p-3">
              {scopesFiltered.map((s) => (
                <div key={s.scope}>
                  <div className="mb-1.5 flex items-center gap-1.5 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {s.scope}
                  </div>
                  <div className="ml-2 flex flex-col gap-1.5 border-l pl-2">
                    {s.groups.map((g) => {
                      const n = g.files.filter((f) =>
                        checked.has(f.path)
                      ).length;
                      return (
                        <div
                          key={g.key}
                          data-dir={g.key}
                          onClick={() => scrollToGroup(g.key)}
                          title="Scroll to file group"
                          className={cn(
                            "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-accent/50",
                            n > 0 && "border-primary/40 bg-accent/30"
                          )}
                        >
                          <FolderIcon className="size-4 shrink-0 text-muted-foreground" />
                          <span className="min-w-0 flex-1 truncate">
                            {g.folder}
                          </span>
                          <Badge variant={n > 0 ? "default" : "secondary"}>
                            {cur ? `${n}/${g.files.length}` : g.files.length}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              {scopesFiltered.length === 0 && (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  {knowledge.length === 0 ? (
                    <>
                      No md files found in
                      <br />
                      <code>{cfg.contextDir}/</code>
                    </>
                  ) : (
                    "No topics match your search"
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* ===== Column 3: Files ===== */}
        <Card className="min-h-0 gap-0 overflow-hidden p-0">
          <div className="border-b px-3 py-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              3 · Knowledge · Files
            </span>
            <div className="relative mt-2">
              <SearchIcon className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-8 pl-8"
                placeholder="Search files..."
                value={qFiles}
                onChange={(e) => setQFiles(e.target.value)}
              />
            </div>
          </div>
          <ScrollArea className="min-h-0 flex-1">
            <div className="p-3">
              {!cur && knowledge.length > 0 && (
                <div className="mb-3 rounded-lg border border-dashed px-3 py-2 text-xs text-muted-foreground">
                  Select an agent in the left column to assign knowledge —
                  ticking a file auto-saves to <code>agent.[slug].md</code>.
                  Click a row to view the file content.
                </div>
              )}
              {filesFiltered.map((s) => (
                <div key={s.scope} className="mb-5">
                  <div className="mb-1.5 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {s.scope}
                  </div>
                  <div className="ml-2 flex flex-col gap-3 border-l pl-3">
                    {s.groups.map((g) => (
                      <div key={g.key} data-group={g.key}>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-sm font-medium">
                            <FolderIcon className="size-4 text-muted-foreground" />
                            {g.folder}
                          </span>
                          {cur && (
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => toggleGroup(g)}
                              title="Select / deselect whole group"
                            >
                              {g.files.every((f) => checked.has(f.path))
                                ? "Clear all"
                                : "Select all"}
                            </Button>
                          )}
                        </div>
                        <div className="ml-2 mt-1 flex flex-col gap-1 border-l pl-3">
                          {g.files.map((f) => (
                            <div
                              key={f.path}
                              data-file={f.path}
                              onClick={() => openFile(f)}
                              title="View file content"
                              className={cn(
                                "flex cursor-pointer items-center gap-2.5 rounded-md border border-transparent px-2 py-1.5 text-sm transition-colors hover:bg-accent/50",
                                checked.has(f.path) &&
                                  "border-primary/40 bg-primary/10"
                              )}
                            >
                              <Checkbox
                                checked={checked.has(f.path)}
                                disabled={!cur}
                                onCheckedChange={() => toggleFile(f.path)}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <FileTextIcon className="size-3.5 shrink-0 text-muted-foreground" />
                              <span className="truncate">{f.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {filesFiltered.length === 0 && knowledge.length > 0 && (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  No files match your search
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>
      </main>

      {/* ===== Drawer: create / edit agent ===== */}
      <Sheet
        open={!!agentForm}
        onOpenChange={(o) => {
          if (!o) setAgentForm(null);
        }}
      >
        <SheetContent side="right" className="data-[side=right]:sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>
              {agentForm?.mode === "edit" ? "Edit agent" : "New agent"}
            </SheetTitle>
            <SheetDescription>
              {agentForm?.mode === "edit"
                ? `Updating agent.${agentForm.agent.slug}.md`
                : `The agent will be saved as agent.[slug].md in ${cfg.agentsDir}/`}
            </SheetDescription>
          </SheetHeader>
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={submitAgent}
          >
            <ScrollArea className="min-h-0 flex-1">
              <div className="grid gap-4 px-4 pb-4">
                <div className="grid gap-2">
                  <Label htmlFor="agent-name">Agent name</Label>
                  <Input
                    id="agent-name"
                    placeholder="e.g. Coder"
                    value={fName}
                    onChange={(e) => setFName(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="agent-role">Role</Label>
                  <Input
                    id="agent-role"
                    placeholder="routing key, e.g. coder, admin.dev — names the file"
                    value={fRole}
                    onChange={(e) => setFRole(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="agent-sys">System prompt</Label>
                  <Textarea
                    id="agent-sys"
                    placeholder="Free text — instructions, rules, prompts... anything goes"
                    className="min-h-28"
                    value={fSys}
                    onChange={(e) => setFSys(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-muted-foreground">
                    Preview{" "}
                    <code className="font-mono">
                      agent.{slugify(fRole || fName || "agent")}.md
                    </code>
                  </Label>
                  <pre className="max-h-72 overflow-y-auto whitespace-pre-wrap rounded-lg border bg-muted/40 p-3 font-mono text-xs leading-relaxed text-muted-foreground">
                    {agentToMd(
                      {
                        name: fName.trim() || "…",
                        role: fRole.trim(),
                        knowledge:
                          agentForm?.mode === "edit"
                            ? agentForm.agent.knowledge
                            : [],
                        systemPrompt: fSys,
                      },
                      cfg.linkPrefix
                    )}
                  </pre>
                </div>
              </div>
            </ScrollArea>
            <SheetFooter>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2Icon className="animate-spin" data-icon="inline-start" />}
                {agentForm?.mode === "edit" ? "Save changes" : "Create agent"}
              </Button>
              <SheetClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </SheetClose>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* ===== Drawer: md file content ===== */}
      <Sheet
        open={!!fileView}
        onOpenChange={(o) => {
          if (!o) setFileView(null);
        }}
      >
        <SheetContent side="right" className="data-[side=right]:sm:max-w-xl">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <FileTextIcon className="size-4" />
              {fileView?.name}
            </SheetTitle>
            <SheetDescription>
              <code>
                {cfg.contextDir}/{fileView?.path}
              </code>
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="min-h-0 flex-1 border-t">
            {fileContent === null ? (
              <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
                <Loader2Icon className="size-4 animate-spin" />
                Loading...
              </div>
            ) : (
              <pre className="whitespace-pre-wrap p-4 font-mono text-xs leading-relaxed">
                {fileContent}
              </pre>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}
