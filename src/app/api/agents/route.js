import { NextResponse } from "next/server";
import { listAgents, saveAgent, deleteAgent } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(listAgents());
}

export async function POST(req) {
  try {
    const body = await req.json();
    const agent = saveAgent(body);
    return NextResponse.json(agent);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function DELETE(req) {
  const slug = new URL(req.url).searchParams.get("slug");
  if (!slug)
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  return NextResponse.json({ ok: deleteAgent(slug) });
}
