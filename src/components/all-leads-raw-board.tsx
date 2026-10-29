"use client";

import { useMemo, useState } from "react";
import { LEAD_STATUSES, Lead, LeadStatus } from "@/types/lead";

type Props = {
  initialLeads: Lead[];
};

export function AllLeadsRawBoard({ initialLeads }: Props) {
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "Alle">("Alle");

  const filteredLeads = useMemo(
    () => {
      if (statusFilter === "Alle") {
        return initialLeads;
      }

      if (statusFilter === "Nicht gesetzt") {
        return initialLeads.filter(
          (lead) => lead.status === "Nicht gesetzt" || lead.status === "Offen",
        );
      }

      return initialLeads.filter((lead) => lead.status === statusFilter);
    },
    [initialLeads, statusFilter],
  );

  return (
    <>
      <section className="panel p-4">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-[#3f5962]">Gesamt: {initialLeads.length}</p>
          <p className="text-sm text-[#3f5962]">Gefiltert: {filteredLeads.length}</p>
          <label className="text-sm font-medium text-[#3f5962]" htmlFor="status-filter">
            Suche nach Status:
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as LeadStatus | "Alle")}
            className="rounded-md border border-[#d6e1dd] bg-white px-2 py-1 text-sm"
          >
            <option value="Alle">Alle</option>
            {LEAD_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="panel p-4">
        <div className="space-y-3">
          {filteredLeads.map((lead) => (
            <article key={lead.id} className="rounded-lg border border-[#d6e1dd] bg-white p-3">
              <p className="font-mono text-xs text-slate-600">ID: {lead.id}</p>

              <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                <Field label="Firma" value={lead.companyName} />
                <Field label="URL" value={lead.url} />
                <Field label="Telefon" value={lead.phone || "-"} />
                <Field label="Standort" value={lead.location || "-"} />
                <Field label="Branche" value={lead.industry || "-"} />
                <Field label="Status" value={lead.status} />
              </div>

              <div className="mt-2 space-y-2">
                <FieldBlock label="Problem" value={lead.problemDescription || "-"} />
                <FieldBlock label="Notizen" value={lead.notes || "-"} />
              </div>

              <div className="mt-2 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
                <Field label="Erstellt" value={new Date(lead.createdAt).toLocaleString("de-DE")} />
                <Field label="Aktualisiert" value={new Date(lead.updatedAt).toLocaleString("de-DE")} />
              </div>
            </article>
          ))}

          {filteredLeads.length === 0 && (
            <p className="text-sm text-[#5c6f77]">Keine Eintraege fuer den ausgewaehlten Status.</p>
          )}
        </div>
      </section>
    </>
  );
}

function Field({ label, value }: { label: string; value: string | number }) {
  return (
    <p>
      <span className="font-medium text-[#3f5962]">{label}: </span>
      <span>{value}</span>
    </p>
  );
}

function FieldBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-[#eef4f1] p-2">
      <p className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-[#3f5962]">{label}</p>
      <p className="whitespace-pre-wrap text-sm">{value}</p>
    </div>
  );
}
