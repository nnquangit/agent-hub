import { NextResponse } from "next/server";
import { readKnowledgeFile } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const p = new URL(req.url).searchParams.get("path");
  if (!p) return NextResponse.json({ error: "Missing path" }, { status: 400 });
  try {
    return NextResponse.json({ path: p, content: readKnowledgeFile(p) });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 404 });
  }
}
