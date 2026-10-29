"use client";

import { useEffect, useMemo, useState } from "react";
import { LEAD_STATUSES, Lead, LeadStatus } from "@/types/lead";

const SAMPLE_INPUT = "1 Elektro Essert https://elektro-essert.de/ (+49) 7251 / 367 999 1 Ubstadt-Weiher (DE) Elektriker Seite zeigt Demo-Inhalte.";

export function LeadTracker() {
  const [rawText, setRawText] = useState(SAMPLE_INPUT);
  const [openLeads, setOpenLeads] = useState<Lead[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [notesDraft, setNotesDraft] = useState("");
  const [feedback, setFeedback] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function loadOpenLeads() {
    const response = await fetch("/api/leads?status=Offen", { cache: "no-store" });
    const data = (await response.json()) as { leads: Lead[] };
    setOpenLeads(data.leads);
  }

  useEffect(() => {
    loadOpenLeads().catch(() => setFeedback("Konnte offene Leads nicht laden."));
  }, []);

  const selectedLead = useMemo(
    () => openLeads.find((lead) => lead.id === selectedId) ?? openLeads[0] ?? null,
    [openLeads, selectedId],
  );

  useEffect(() => {
    if (selectedLead) {
      setSelectedId(selectedLead.id);
      setNotesDraft(selectedLead.notes ?? "");
    } else {
      setSelectedId(null);
      setNotesDraft("");
    }
  }, [selectedLead]);

  async function ingestText() {
    setLoading(true);
    setFeedback("");
    try {
      const response = await fetch("/api/leads/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText }),
      });

      const data = (await response.json()) as { created?: number; skipped?: string[]; message?: string };
      if (!response.ok) {
        setFeedback(data.message ?? "Import fehlgeschlagen.");
        return;
      }

      const skipped = data.skipped?.length ? `, uebersprungen: ${data.skipped.length}` : "";
      setFeedback(`Import abgeschlossen. Neu: ${data.created ?? 0}${skipped}`);
      await loadOpenLeads();
    } catch {
      setFeedback("Import fehlgeschlagen.");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(status: LeadStatus) {
    if (!selectedLead) return;
    setLoading(true);
    try {
      await fetch(`/api/leads/${selectedLead.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      await loadOpenLeads();
    } finally {
      setLoading(false);
    }
  }

  async function saveNotes() {
    if (!selectedLead) return;
    setLoading(true);
    try {
      await fetch(`/api/leads/${selectedLead.id}/notes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notesDraft }),
      });
      setFeedback("Notizen gespeichert.");
      await loadOpenLeads();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">Lead-Tracker</h1>
        <p className="text-sm text-slate-600">Interne Kaltakquise-Verwaltung mit Deepresearch-Import</p>
      </header>

      <section className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <h2 className="mb-2 text-lg font-medium">Deepresearch-Input</h2>
        <textarea
          value={rawText}
          onChange={(event) => setRawText(event.target.value)}
          className="h-36 w-full rounded-lg border border-slate-300 p-3 text-sm"
          placeholder="Unstrukturierte Leads hier einfuegen"
        />
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={ingestText}
            disabled={loading}
            className="rounded-md bg-action px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            Parser ausfuehren & speichern
          </button>
          <span className="text-sm text-slate-600">{feedback}</span>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-[360px_1fr]">
        <article className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-3 text-lg font-medium">Offene Auftraege ({openLeads.length})</h2>
          <ul className="space-y-2">
            {openLeads.map((lead) => (
              <li key={lead.id}>
                <button
                  onClick={() => setSelectedId(lead.id)}
                  className={`w-full rounded-lg border p-3 text-left ${
                    lead.id === selectedLead?.id ? "border-action bg-emerald-50" : "border-slate-200"
                  }`}
                >
                  <p className="font-medium">{lead.companyName}</p>
                  <p className="text-xs text-slate-500">{lead.location || "Kein Standort"} | {lead.industry || "Keine Branche"}</p>
                </button>
              </li>
            ))}
            {openLeads.length === 0 && <li className="text-sm text-slate-500">Keine offenen Leads vorhanden.</li>}
          </ul>
        </article>

        <article className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          {!selectedLead ? (
            <p className="text-sm text-slate-500">Waehle einen Lead aus der Liste.</p>
          ) : (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold">{selectedLead.companyName}</h2>
                <a
                  href={selectedLead.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-action underline"
                >
                  Website oeffnen
                </a>
                <p className="text-sm">Telefon: {selectedLead.phone || "-"}</p>
                <p className="text-sm">Standort: {selectedLead.location || "-"}</p>
                <p className="text-sm">Branche: {selectedLead.industry || "-"}</p>
                <p className="mt-2 rounded-md bg-slate-100 p-2 text-sm">{selectedLead.problemDescription}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {LEAD_STATUSES.map((status) => (
                  <button
                    key={status}
                    onClick={() => updateStatus(status)}
                    className="rounded-md border border-slate-300 px-3 py-1 text-sm hover:border-action"
                  >
                    {status}
                  </button>
                ))}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Live-Gespraechsnotizen</label>
                <textarea
                  value={notesDraft}
                  onChange={(event) => setNotesDraft(event.target.value)}
                  className="h-32 w-full rounded-lg border border-slate-300 p-3 text-sm"
                />
                <button
                  onClick={saveNotes}
                  disabled={loading}
                  className="mt-2 rounded-md bg-ink px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  Notizen speichern
                </button>
              </div>
            </div>
          )}
        </article>
      </section>
    </main>
  );
}
