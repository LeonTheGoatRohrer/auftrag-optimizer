"use client";

import { useEffect, useMemo, useState } from "react";
import { Lead, ARCHIVE_STATUSES, LEAD_STATUSES, LeadStatus } from "@/types/lead";

const STATUS_LABELS: Record<LeadStatus, { label: string; color: string }> = {
  "Nicht gesetzt": { label: "Nicht gesetzt", color: "bg-slate-200 text-slate-800" },
  Offen: { label: "Offen", color: "bg-slate-100 text-slate-700" },
  Angenommen: { label: "Angenommen", color: "bg-emerald-100 text-emerald-800" },
  "Kein Interesse!": { label: "Kein Interesse!", color: "bg-zinc-200 text-zinc-900" },
  "Nicht abgehoben": { label: "Nicht abgehoben", color: "bg-amber-100 text-amber-800" },
  "Nummer nicht verfuegbar": { label: "Nr. nicht verfuegbar", color: "bg-red-100 text-red-800" },
  Wiedervorlage: { label: "Wiedervorlage", color: "bg-blue-100 text-blue-800" },
  "Website professionell": { label: "Website professionell", color: "bg-violet-100 text-violet-800" },
};

export function ArchiveBoard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState<LeadStatus | "Alle">("Alle");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [notesDraft, setNotesDraft] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedLead = useMemo(
    () => leads.find((lead) => lead.id === selectedId) ?? leads[0] ?? null,
    [leads, selectedId],
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

  async function loadArchivedLeads(preferredId?: number) {
    const response = await fetch("/api/leads/archiv", { cache: "no-store" });
    const data = (await response.json()) as { leads: Lead[] };
    setLeads(data.leads);

    if (!data.leads.length) {
      setSelectedId(null);
      return;
    }

    const nextSelected =
      (preferredId ? data.leads.find((lead) => lead.id === preferredId) : null) ?? data.leads[0];
    setSelectedId(nextSelected.id);
  }

  useEffect(() => {
    loadArchivedLeads().catch(() => setFeedback("Konnte Archiv nicht laden."));
  }, []);

  const filtered = filter === "Alle" ? leads : leads.filter((l) => l.status === filter);

  async function updateStatus(status: LeadStatus) {
    if (!selectedLead) return;
    setLoading(true);

    try {
      await fetch(`/api/leads/${selectedLead.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      await loadArchivedLeads(selectedLead.id);
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
      await loadArchivedLeads(selectedLead.id);
      setFeedback("Notizen gespeichert.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-4 fade-up">
      <header className="panel p-5">
        <p className="text-xs uppercase tracking-[0.22em] text-[#3f5962]">Rueckblick</p>
        <h1 className="mt-2 text-2xl font-semibold">Bearbeitete Auftraege</h1>
        <p className="subline">Alle Auftraege, die einen Status ausser &quot;Offen&quot; erhalten haben.</p>
      </header>

      <div className="flex flex-wrap gap-2">
        <FilterBtn label="Alle" active={filter === "Alle"} onClick={() => setFilter("Alle")} />
        {ARCHIVE_STATUSES.map((s) => (
          <FilterBtn
            key={s}
            label={STATUS_LABELS[s].label}
            active={filter === s}
            onClick={() => setFilter(s)}
          />
        ))}
      </div>

      <p className="text-sm text-[#3f5962]">{feedback}</p>

      <div className="grid gap-4 md:grid-cols-[360px_1fr] md:items-start">
        <article className="panel p-4 md:h-[72vh] md:overflow-hidden">
          <h2 className="mb-3 text-lg font-medium">
            {filter === "Alle" ? "Alle" : STATUS_LABELS[filter].label} ({filtered.length})
          </h2>
          <ul className="space-y-2 md:h-[calc(72vh-84px)] md:overflow-y-auto md:pr-1">
            {filtered.map((lead) => (
              <li key={lead.id}>
                <button
                  onClick={() => setSelectedId(lead.id)}
                  className={`w-full rounded-lg border p-3 text-left transition-all ${
                    lead.id === selectedLead?.id
                      ? "border-[#0f766e] bg-[#e8f4f1] shadow-sm"
                      : "border-[#d6e1dd] bg-white hover:border-[#9ab8b0]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium">{lead.companyName}</p>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_LABELS[lead.status].color}`}
                    >
                      {STATUS_LABELS[lead.status].label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {lead.location || "Kein Standort"} | {lead.industry || "Keine Branche"}
                  </p>
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="text-sm text-[#5c6f77]">Keine Eintraege in dieser Kategorie.</li>
            )}
          </ul>
        </article>

        <article className="panel p-4">
          {!selectedLead ? (
            <p className="text-sm text-[#5c6f77]">Waehle einen Eintrag aus der Liste.</p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold">{selectedLead.companyName}</h2>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_LABELS[selectedLead.status].color}`}
                >
                  {STATUS_LABELS[selectedLead.status].label}
                </span>
              </div>
              <a href={selectedLead.url} target="_blank" rel="noreferrer" className="text-sm text-[#0f766e] underline">
                Website oeffnen
              </a>
              <p className="text-sm">Telefon: {selectedLead.phone || "-"}</p>
              <p className="text-sm">Standort: {selectedLead.location || "-"}</p>
              <p className="text-sm">Branche: {selectedLead.industry || "-"}</p>
              <p className="rounded-md bg-[#eef4f1] p-2 text-sm">{selectedLead.problemDescription}</p>

              <div className="flex flex-wrap gap-2">
                {LEAD_STATUSES.map((status) => (
                  <button
                    key={status}
                    onClick={() => updateStatus(status)}
                    disabled={loading}
                    className="rounded-md border border-[#d6e1dd] bg-white px-3 py-1 text-sm hover:border-[#0f766e] disabled:opacity-60"
                  >
                    {STATUS_LABELS[status].label}
                  </button>
                ))}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Notizen</label>
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

              <p className="text-xs text-slate-400">
                Zuletzt geaendert: {new Date(selectedLead.updatedAt).toLocaleString("de-DE")}
              </p>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}

function FilterBtn({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-sm font-medium transition-all ${
        active
          ? "border-[#0f766e] bg-[#0f766e] text-white"
          : "border-[#d6e1dd] bg-white text-ink hover:border-[#9ab8b0]"
      }`}
    >
      {label}
    </button>
  );
}
