CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_name TEXT NOT NULL,
  url TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  industry TEXT,
  problem_description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Offen' CHECK (
    status IN (
      'Nicht gesetzt',
      'Offen',
      'Angenommen',
      'Kein Interesse!',
      'Nicht abgehoben',
      'Nummer nicht verfuegbar',
      'Wiedervorlage'
    )
  ),
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
