import { NextResponse } from "next/server";
import { getArchivedLeads } from "@/lib/db";

export async function GET() {
  const leads = await getArchivedLeads();
  return NextResponse.json({ leads });
}
