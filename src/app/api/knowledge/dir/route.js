import { NextResponse } from "next/server";
import { createKnowledgeDir, deleteKnowledgeDir } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { path } = await req.json();
    return NextResponse.json(createKnowledgeDir(path));
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function DELETE(req) {
  try {
    const p = new URL(req.url).searchParams.get("path");
    return NextResponse.json(deleteKnowledgeDir(p));
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
