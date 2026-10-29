import { getAllLeads } from "@/lib/db";
import { AllLeadsRawBoard } from "@/components/all-leads-raw-board";

export default async function AlleEintraegePage() {
  const leads = await getAllLeads();

  return (
    <main className="space-y-6">
      <header className="panel fade-up p-5">
        <p className="text-xs uppercase tracking-[0.22em] text-[#3f5962]">Datenansicht</p>
        <h1 className="mt-2 text-2xl font-semibold">Alle Eintraege (nackt)</h1>
        <p className="subline">Jeder Datensatz mit allen Feldern in kompakter Rohansicht.</p>
      </header>

      <AllLeadsRawBoard initialLeads={leads} />
    </main>
  );
}
