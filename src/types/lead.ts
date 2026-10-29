export const LEAD_STATUSES = [
  "Nicht gesetzt",
  "Offen",
  "Angenommen",
  "Kein Interesse!",
  "Nicht abgehoben",
  "Nummer nicht verfuegbar",
  "Wiedervorlage",
  "Website professionell",
] as const;

export const ARCHIVE_STATUSES: LeadStatus[] = [
  "Angenommen",
  "Kein Interesse!",
  "Nicht abgehoben",
  "Nummer nicht verfuegbar",
  "Wiedervorlage",
  "Website professionell",
];

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export type Lead = {
  id: number;
  companyName: string;
  url: string;
  phone: string;
  location: string;
  industry: string;
  problemDescription: string;
  status: LeadStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type IngestResult = {
  created: number;
  skipped: string[];
  leads: Lead[];
};
