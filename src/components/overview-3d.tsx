"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Overview3DProps = {
  stats: {
    total: number;
    open: number;
    accepted: number;
    callback: number;
  };
};

type Pointer = { x: number; y: number };

const INITIAL_POINTER: Pointer = { x: 0, y: 0 };

function getRotate(pointer: Pointer) {
  return {
    rotateX: `${pointer.y * -8}deg`,
    rotateY: `${pointer.x * 10}deg`,
  };
}

export function Overview3D({ stats }: Overview3DProps) {
  const [pointer, setPointer] = useState<Pointer>(INITIAL_POINTER);

  const transformStyle = useMemo(() => {
    const r = getRotate(pointer);
    return {
      transform: `perspective(1400px) rotateX(${r.rotateX}) rotateY(${r.rotateY})`,
    };
  }, [pointer]);

  function onMove(event: React.MouseEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    setPointer({
      x: (x - 0.5) * 2,
      y: (y - 0.5) * 2,
    });
  }

  function onLeave() {
    setPointer(INITIAL_POINTER);
  }

  return (
    <section className="space-y-6" onMouseMove={onMove} onMouseLeave={onLeave}>
      <div className="three-d-stage fade-up">
        <div className="three-d-layers" style={transformStyle}>
          <div className="three-d-backdrop" />
          <div className="three-d-grid" />
          <div className="three-d-glow" />

          <article className="three-d-hero panel">
            <p className="text-xs uppercase tracking-[0.22em] text-[#3f5962]">Control Center</p>
            <h1 className="headline mt-2">Hallo Leon</h1>
            <p className="subline">Willkommen im Lead-Tracker. Hier ist deine aktuelle Uebersicht.</p>
          </article>

          <article className="three-d-stat panel">
            <p className="text-xs uppercase tracking-[0.16em] text-[#5c6f77]">Gesamt</p>
            <p className="mt-1 text-4xl font-bold">{stats.total}</p>
          </article>

          <article className="three-d-stat panel">
            <p className="text-xs uppercase tracking-[0.16em] text-[#5c6f77]">Offen</p>
            <p className="mt-1 text-4xl font-bold">{stats.open}</p>
          </article>

          <article className="three-d-stat panel">
            <p className="text-xs uppercase tracking-[0.16em] text-[#5c6f77]">Angenommen</p>
            <p className="mt-1 text-4xl font-bold">{stats.accepted}</p>
          </article>

          <article className="three-d-stat panel">
            <p className="text-xs uppercase tracking-[0.16em] text-[#5c6f77]">Wiedervorlage</p>
            <p className="mt-1 text-4xl font-bold">{stats.callback}</p>
          </article>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 fade-up-delayed">
        <QuickCard
          title="Aktive Auftraege bearbeiten"
          text="Bearbeite offene Leads, aktualisiere Status und schreibe Live-Notizen."
          href="/aktive-auftraege"
          cta="Zur Arbeitsansicht"
        />
        <QuickCard
          title="Auftraege einschreiben"
          text="Fuege neue Deepresearch-Daten in die Textbox ein und importiere sie per Parser."
          href="/auftrag-einschreiben"
          cta="Zur Eingabeseite"
        />
      </section>
    </section>
  );
}

function QuickCard({
  title,
  text,
  href,
  cta,
}: {
  title: string;
  text: string;
  href: string;
  cta: string;
}) {
  return (
    <article className="panel p-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="subline">{text}</p>
      <Link href={href} className="btn-primary mt-4">
        {cta}
      </Link>
    </article>
  );
}
