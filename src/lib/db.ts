import path from "node:path";
import { promises as fs } from "node:fs";
import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import { Lead, LeadStatus } from "@/types/lead";
import { ParsedLead } from "@/lib/parser";

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "lead-tracker.db");

type LeadRow = {
  id: number;
  company_name: string;
  url: string;
  phone: string;
  location: string;
  industry: string;
  problem_description: string;
  status: LeadStatus;
  notes: string;
  created_at: string;
  updated_at: string;
};

type StatusCountRow = {
  status: LeadStatus;
  count: number;
};

type InsertLeadsResult = {
  createdLeads: Lead[];
  duplicateCount: number;
};

let dbPromise: Promise<Database> | null = null;

async function ensureDb(): Promise<Database> {
  if (!dbPromise) {
    dbPromise = (async () => {
      await fs.mkdir(DB_DIR, { recursive: true });
      const db = await open({
        filename: DB_FILE,
        driver: sqlite3.Database,
      });

      await db.exec(`
        CREATE TABLE IF NOT EXISTS leads (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          company_name TEXT NOT NULL,
          url TEXT NOT NULL,
          phone TEXT,
          location TEXT,
          industry TEXT,
          problem_description TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'Offen',
          notes TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);

        DELETE FROM leads
        WHERE id NOT IN (
          SELECT MIN(id)
          FROM leads
          GROUP BY lower(trim(company_name)), lower(trim(url)), trim(COALESCE(phone, ''))
        );

        CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_unique
        ON leads (
          lower(trim(company_name)),
          lower(trim(url)),
          trim(COALESCE(phone, ''))
        );
      `);

      return db;
    })();
  }

  return dbPromise;
}

function mapLead(row: LeadRow): Lead {
  return {
    id: row.id,
    companyName: row.company_name,
    url: row.url,
    phone: row.phone,
    location: row.location,
    industry: row.industry,
    problemDescription: row.problem_description,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function insertLeads(leads: ParsedLead[]): Promise<InsertLeadsResult> {
  if (leads.length === 0) {
    return { createdLeads: [], duplicateCount: 0 };
  }

  const db = await ensureDb();
  const insertedIds: number[] = [];

  await db.exec("BEGIN TRANSACTION");
  try {
    for (const lead of leads) {
      const result = await db.run(
        `INSERT OR IGNORE INTO leads (company_name, url, phone, location, industry, problem_description, status, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          lead.companyName,
          lead.url,
          lead.phone,
          lead.location,
          lead.industry,
          lead.problemDescription,
          lead.status,
          lead.notes,
        ],
      );

      if (result.changes && result.lastID) {
        insertedIds.push(result.lastID);
      }
    }
    await db.exec("COMMIT");
  } catch (error) {
    await db.exec("ROLLBACK");
    throw error;
  }

  if (insertedIds.length === 0) {
    return {
      createdLeads: [],
      duplicateCount: leads.length,
    };
  }

  const placeholders = insertedIds.map(() => "?").join(", ");
  const created = await db.all<LeadRow[]>(`SELECT * FROM leads WHERE id IN (${placeholders})`, insertedIds);

  const createdById = new Map<number, Lead>(created.map((row) => [row.id, mapLead(row)]));
  const orderedCreated = insertedIds
    .map((id) => createdById.get(id))
    .filter((lead): lead is Lead => Boolean(lead));

  return {
    createdLeads: orderedCreated,
    duplicateCount: leads.length - orderedCreated.length,
  };
}

export async function getLeadsByStatus(status: LeadStatus): Promise<Lead[]> {
  const db = await ensureDb();
  if (status === "Offen" || status === "Nicht gesetzt") {
    const rows = await db.all<LeadRow[]>(
      `SELECT * FROM leads WHERE status IN ('Offen', 'Nicht gesetzt') ORDER BY id ASC`,
    );
    return rows.map(mapLead);
  }

  const rows = await db.all<LeadRow[]>(
    `SELECT * FROM leads WHERE status = ? ORDER BY id ASC`,
    [status],
  );
  return rows.map(mapLead);
}

export async function getLeadById(id: number): Promise<Lead | null> {
  const db = await ensureDb();
  const row = await db.get<LeadRow>(`SELECT * FROM leads WHERE id = ?`, [id]);
  return row ? mapLead(row) : null;
}

export async function updateLeadStatus(id: number, status: LeadStatus): Promise<Lead | null> {
  const db = await ensureDb();
  await db.run(
    `UPDATE leads SET status = ?, updated_at = datetime('now') WHERE id = ?`,
    [status, id],
  );
  return getLeadById(id);
}

export async function updateLeadNotes(id: number, notes: string): Promise<Lead | null> {
  const db = await ensureDb();
  await db.run(
    `UPDATE leads SET notes = ?, updated_at = datetime('now') WHERE id = ?`,
    [notes, id],
  );
  return getLeadById(id);
}

export async function getLeadStats(): Promise<{
  total: number;
  open: number;
  accepted: number;
  callback: number;
  statusCounts: Record<LeadStatus, number>;
}> {
  const db = await ensureDb();

  const totalRow = await db.get<{ total: number }>("SELECT COUNT(*) as total FROM leads");
  const byStatus = await db.all<StatusCountRow[]>(
    "SELECT status, COUNT(*) as count FROM leads GROUP BY status",
  );

  const statusCounts: Record<LeadStatus, number> = {
    "Nicht gesetzt": 0,
    Offen: 0,
    Angenommen: 0,
    "Kein Interesse!": 0,
    "Nicht abgehoben": 0,
    "Nummer nicht verfuegbar": 0,
    Wiedervorlage: 0,
    "Website professionell": 0,
  };

  for (const row of byStatus) {
    statusCounts[row.status] = row.count;
  }

  return {
    total: totalRow?.total ?? 0,
    open: statusCounts.Offen + statusCounts["Nicht gesetzt"],
    accepted: statusCounts.Angenommen,
    callback: statusCounts.Wiedervorlage,
    statusCounts,
  };
}

export async function getArchivedLeads(): Promise<Lead[]> {
  const db = await ensureDb();
  const rows = await db.all<LeadRow[]>(
    `SELECT * FROM leads WHERE status NOT IN ('Offen', 'Nicht gesetzt') ORDER BY updated_at DESC`,
  );
  return rows.map(mapLead);
}

export async function getAllLeads(): Promise<Lead[]> {
  const db = await ensureDb();
  const rows = await db.all<LeadRow[]>(
    `SELECT * FROM leads ORDER BY updated_at DESC, id DESC`,
  );
  return rows.map(mapLead);
}
