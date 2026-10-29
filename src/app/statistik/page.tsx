import { LEAD_STATUSES } from "@/types/lead";
import { getLeadStats } from "@/lib/db";

export default async function StatistikPage() {
  const stats = await getLeadStats();
  const conversion = stats.total > 0 ? Math.round((stats.accepted / stats.total) * 100) : 0;

  return (
    <main className="space-y-6">
      <header className="panel fade-up p-5">
        <p className="text-xs uppercase tracking-[0.22em] text-[#3f5962]">Insights</p>
        <h1 className="mt-2 text-2xl font-semibold">Statistik</h1>
        <p className="subline">Leistungswerte und Verteilung deiner Lead-Status.</p>
      </header>

      <section className="fade-up-delayed grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Gesamtauftraege" value={stats.total} />
        <StatCard label="Offene Auftraege" value={stats.open} />
        <StatCard label="Angenommen" value={stats.accepted} />
        <StatCard label="Conversion" value={`${conversion}%`} />
      </section>

      <section className="panel p-4">
        <h2 className="mb-3 text-lg font-medium">Statusverteilung</h2>
        <ul className="space-y-2">
          {LEAD_STATUSES.map((status, index) => (
            <li
              key={status}
              className="flex items-center justify-between rounded-md bg-[#eef4f1] px-3 py-2 text-sm"
              style={{ animation: `fadeUp 420ms ease-out ${index * 60}ms both` }}
            >
              <span>{status}</span>
              <span className="font-semibold">{stats.statusCounts[status]}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <article className="panel p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-[#5c6f77]">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </article>
  );
}
