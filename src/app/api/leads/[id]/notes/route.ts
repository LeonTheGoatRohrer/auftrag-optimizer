import { NextRequest, NextResponse } from "next/server";
import { updateLeadNotes } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const leadId = Number(id);
  if (Number.isNaN(leadId)) {
    return NextResponse.json({ message: "Ungueltige ID" }, { status: 400 });
  }

  const body = (await request.json()) as { notes?: string };
  const notes = body.notes?.trim() ?? "";

  const updated = await updateLeadNotes(leadId, notes);
  if (!updated) {
    return NextResponse.json({ message: "Lead nicht gefunden" }, { status: 404 });
  }

  return NextResponse.json({ lead: updated });
}
