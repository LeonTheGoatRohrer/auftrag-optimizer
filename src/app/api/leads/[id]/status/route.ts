import { NextRequest, NextResponse } from "next/server";
import { updateLeadStatus } from "@/lib/db";
import { LEAD_STATUSES, LeadStatus } from "@/types/lead";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const leadId = Number(id);
  if (Number.isNaN(leadId)) {
    return NextResponse.json({ message: "Ungueltige ID" }, { status: 400 });
  }

  const body = (await request.json()) as { status?: string };
  const status = LEAD_STATUSES.find((value) => value === body.status) as LeadStatus | undefined;

  if (!status) {
    return NextResponse.json({ message: "Ungueltiger Status" }, { status: 400 });
  }

  const updated = await updateLeadStatus(leadId, status);
  if (!updated) {
    return NextResponse.json({ message: "Lead nicht gefunden" }, { status: 404 });
  }

  return NextResponse.json({ lead: updated });
}
