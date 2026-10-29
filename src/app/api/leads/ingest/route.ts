import { NextRequest, NextResponse } from "next/server";
import { insertLeads } from "@/lib/db";
import { parseLeads } from "@/lib/parser";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { rawText?: string };
  const rawText = body.rawText?.trim() ?? "";

  if (!rawText) {
    return NextResponse.json({ message: "Bitte Text fuer den Import eingeben." }, { status: 400 });
  }

  const parsed = parseLeads(rawText);
  const insertResult = await insertLeads(parsed.valid);

  return NextResponse.json({
    created: insertResult.createdLeads.length,
    duplicates: insertResult.duplicateCount,
    skipped: parsed.invalid,
    leads: insertResult.createdLeads,
  });
}
