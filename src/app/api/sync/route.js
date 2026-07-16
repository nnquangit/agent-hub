import { NextResponse } from "next/server";
import { SYNC_TARGETS, runSync } from "@/lib/sync";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    SYNC_TARGETS.map(({ id, label, desc }) => ({ id, label, desc }))
  );
}

export async function POST(req) {
  try {
    const { target } = await req.json();
    return NextResponse.json(runSync(target));
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
