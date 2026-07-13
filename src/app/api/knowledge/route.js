import { NextResponse } from "next/server";
import { scanKnowledge } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(scanKnowledge());
}
