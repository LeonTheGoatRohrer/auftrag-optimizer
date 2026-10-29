import type { Metadata } from "next";
import Link from "next/link";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });
const ibmPlexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Lead-Tracker",
  description: "Interne Kaltakquise-Verwaltung",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} font-[var(--font-space)]`}>
        <nav className="border-b border-[#d6e1dd] bg-white/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="rounded-full border border-[#d6e1dd] bg-white px-3 py-1 text-xs font-medium text-[#3f5962]">
              Lead-Tracker Pro
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link href="/" className="rounded-full border border-transparent px-3 py-1 text-sm font-medium text-ink hover:border-[#d6e1dd] hover:bg-white">
              Hallo & Uebersicht
            </Link>
            <Link
              href="/aktive-auftraege"
              className="rounded-full border border-transparent px-3 py-1 text-sm font-medium text-ink hover:border-[#d6e1dd] hover:bg-white"
            >
              Aktiv bearbeiten
            </Link>
            <Link
              href="/auftrag-einschreiben"
              className="rounded-full border border-transparent px-3 py-1 text-sm font-medium text-ink hover:border-[#d6e1dd] hover:bg-white"
            >
              Auftrag einschreiben
            </Link>
            <Link
              href="/statistik"
              className="rounded-full border border-transparent px-3 py-1 text-sm font-medium text-ink hover:border-[#d6e1dd] hover:bg-white"
            >
              Statistik
            </Link>
            <Link
              href="/archiv"
              className="rounded-full border border-transparent px-3 py-1 text-sm font-medium text-ink hover:border-[#d6e1dd] hover:bg-white"
            >
              Archiv
            </Link>
            <Link
              href="/alle-eintraege"
              className="rounded-full border border-transparent px-3 py-1 text-sm font-medium text-ink hover:border-[#d6e1dd] hover:bg-white"
            >
              Alle Eintraege
            </Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
