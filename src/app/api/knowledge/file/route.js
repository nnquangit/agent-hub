import { NextResponse } from "next/server";
import {
  deleteKnowledgeFile,
  readKnowledgeFile,
  writeKnowledgeFile,
} from "@/lib/store";

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

export async function POST(req) {
  try {
    const { path, content } = await req.json();
    return NextResponse.json(writeKnowledgeFile(path, content));
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function DELETE(req) {
  try {
    const p = new URL(req.url).searchParams.get("path");
    return NextResponse.json(deleteKnowledgeFile(p));
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
