import { NextRequest, NextResponse } from "next/server";
import { getLeadsByStatus } from "@/lib/db";
import { LEAD_STATUSES, LeadStatus } from "@/types/lead";

function asStatus(value: string | null): LeadStatus {
  if (!value) return "Offen";
  const match = LEAD_STATUSES.find((status) => status.toLowerCase() === value.toLowerCase());
  return match ?? "Offen";
}

export async function GET(request: NextRequest) {
  const status = asStatus(request.nextUrl.searchParams.get("status"));
  const leads = await getLeadsByStatus(status);
  return NextResponse.json({ leads });
}
