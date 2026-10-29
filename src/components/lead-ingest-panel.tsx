"use client";

import { useState } from "react";

const SAMPLE_INPUT =
  "1 Elektro Essert https://elektro-essert.de/ (+49) 7251 / 367 999 1 Ubstadt-Weiher (DE) Elektriker Seite zeigt Demo-Inhalte.";

export function LeadIngestPanel() {
  const [rawText, setRawText] = useState(SAMPLE_INPUT);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  async function ingestText() {
    setLoading(true);
    setFeedback("");

    try {
      const response = await fetch("/api/leads/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText }),
      });

      const data = (await response.json()) as {
        created?: number;
        duplicates?: number;
        skipped?: string[];
        message?: string;
      };

      if (!response.ok) {
        setFeedback(data.message ?? "Import fehlgeschlagen.");
        return;
      }

      const duplicates = data.duplicates ? `, Duplikate: ${data.duplicates}` : "";
      const skipped = data.skipped?.length ? `, uebersprungen: ${data.skipped.length}` : "";
      setFeedback(`Import abgeschlossen. Neu: ${data.created ?? 0}${duplicates}${skipped}`);
    } catch {
      setFeedback("Import fehlgeschlagen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel fade-up p-5">
      <p className="text-xs uppercase tracking-[0.22em] text-[#3f5962]">Import Hub</p>
      <h1 className="mt-2 text-2xl font-semibold">Auftrag einschreiben</h1>
      <p className="subline">Fuege unstrukturierte Research-Daten ein und speichere neue Auftraege.</p>

      <textarea
        value={rawText}
        onChange={(event) => setRawText(event.target.value)}
        className="mt-4 h-48 w-full rounded-xl border border-[#d6e1dd] bg-white p-3 text-sm"
        placeholder="Unstrukturierte Leads hier einfuegen"
      />

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          onClick={ingestText}
          disabled={loading}
          className="btn-primary disabled:opacity-60"
        >
          Parser ausfuehren & speichern
        </button>
        <span className="text-sm text-[#3f5962]">{feedback}</span>
      </div>
    </section>
  );
}
