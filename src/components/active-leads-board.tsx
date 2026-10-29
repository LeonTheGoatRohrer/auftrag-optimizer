"use client";

import { useEffect, useMemo, useState } from "react";
import { LEAD_STATUSES, Lead, LeadStatus } from "@/types/lead";

export function ActiveLeadsBoard() {
  const [openLeads, setOpenLeads] = useState<Lead[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [notesDraft, setNotesDraft] = useState("");
  const [feedback, setFeedback] = useState("");
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
      return;
    }

    setSelectedId(null);
    setNotesDraft("");
  }, [selectedLead]);

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
      setFeedback(`Status gesetzt: ${status}`);
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
      await loadOpenLeads();
      setFeedback("Notizen gespeichert.");
    } finally {
      setLoading(false);
    }
  }

  function selectNextLead() {
    if (openLeads.length === 0) return;
    if (!selectedLead) {
      setSelectedId(openLeads[0].id);
      return;
    }

    const currentIndex = openLeads.findIndex((lead) => lead.id === selectedLead.id);
    const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % openLeads.length : 0;
    setSelectedId(openLeads[nextIndex].id);
  }

  return (
    <section className="space-y-4 fade-up">
      <header className="panel p-5">
        <p className="text-xs uppercase tracking-[0.22em] text-[#3f5962]">Arbeitsmodus</p>
        <h1 className="mt-2 text-2xl font-semibold">Aktive Auftraege bearbeiten</h1>
        <p className="subline">Alle offenen Leads mit Schnellaktionen fuer Status und Gespraechsnotizen.</p>
      </header>

      <p className="text-sm text-[#3f5962]">{feedback}</p>

      <div className="grid gap-4 md:grid-cols-[360px_1fr] md:items-start">
        <article className="panel p-4 md:h-[72vh] md:min-h-[520px] md:overflow-hidden">
          <h2 className="mb-3 text-lg font-medium">Offene Auftraege ({openLeads.length})</h2>
          <ul className="space-y-2 md:h-[calc(72vh-84px)] md:min-h-[430px] md:overflow-y-auto md:pr-1">
            {openLeads.map((lead) => (
              <li key={lead.id}>
                <button
                  onClick={() => setSelectedId(lead.id)}
                  className={`w-full rounded-lg border p-3 text-left transition-all ${
                    lead.id === selectedLead?.id
                      ? "border-[#0f766e] bg-[#e8f4f1] shadow-sm"
                      : "border-[#d6e1dd] bg-white hover:border-[#9ab8b0]"
                  }`}
                >
                  <p className="font-medium">{lead.companyName}</p>
                  <p className="text-xs text-slate-500">
                    {lead.location || "Kein Standort"} | {lead.industry || "Keine Branche"}
                  </p>
                </button>
              </li>
            ))}
            {openLeads.length === 0 && <li className="text-sm text-[#5c6f77]">Keine offenen Leads vorhanden.</li>}
          </ul>
        </article>

        <article className="panel p-4">
          {!selectedLead ? (
            <p className="text-sm text-[#5c6f77]">Waehle einen Lead aus der Liste.</p>
          ) : (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold">{selectedLead.companyName}</h2>
                <a href={selectedLead.url} target="_blank" rel="noreferrer" className="text-sm text-[#0f766e] underline">
                  Website oeffnen
                </a>
                <p className="text-sm">Telefon: {selectedLead.phone || "-"}</p>
                <p className="text-sm">Standort: {selectedLead.location || "-"}</p>
                <p className="text-sm">Branche: {selectedLead.industry || "-"}</p>
                <p className="mt-2 rounded-md bg-[#eef4f1] p-2 text-sm">{selectedLead.problemDescription}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={selectNextLead}
                  disabled={loading || openLeads.length <= 1}
                  className="rounded-md border border-[#d6e1dd] bg-[#eef4f1] px-3 py-1 text-sm font-medium hover:border-[#0f766e] disabled:opacity-60"
                >
                  Naechster Auftrag
                </button>
                {LEAD_STATUSES.map((status) => (
                  <button
                    key={status}
                    onClick={() => updateStatus(status)}
                    disabled={loading}
                    className="rounded-md border border-[#d6e1dd] bg-white px-3 py-1 text-sm hover:border-[#0f766e] disabled:opacity-60"
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
                  className="h-32 w-full rounded-lg border border-[#d6e1dd] bg-white p-3 text-sm"
                />
                <button
                  onClick={saveNotes}
                  disabled={loading}
                  className="btn-primary mt-2 disabled:opacity-60"
                >
                  Notizen speichern
                </button>
              </div>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
