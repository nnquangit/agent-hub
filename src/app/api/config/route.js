import { NextResponse } from "next/server";
import path from "path";
import { CONTEXT_DIR, AGENTS_DIR, LINK_PREFIX } from "@/lib/store";

export const dynamic = "force-dynamic";

// Show paths relative to cwd for brevity; outside cwd, show them absolute
function display(dir) {
  const rel = path.relative(process.cwd(), dir);
  return !rel || rel.startsWith("..") ? dir : rel;
}

export async function GET() {
  return NextResponse.json({
    contextDir: display(CONTEXT_DIR),
    agentsDir: display(AGENTS_DIR),
    linkPrefix: LINK_PREFIX,
  });
}
