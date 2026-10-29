import { LeadStatus } from "@/types/lead";

export type ParsedLead = {
  companyName: string;
  url: string;
  phone: string;
  location: string;
  industry: string;
  problemDescription: string;
  status: LeadStatus;
  notes: string;
};

const DEFAULT_STATUS: LeadStatus = "Offen";

const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+)/i;
const PHONE_REGEX = /(\+?\d[\d\s\/()\-]{6,}\d)/;
const LOCATION_REGEX = /([A-Za-zA-Z\u00c4\u00d6\u00dc\u00e4\u00f6\u00fc\u00df\-\s]+\([A-Z]{2}\))/;

function normalizeSpaces(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}

function splitRecords(raw: string): string[] {
  const byLines = raw
    .split(/\r?\n/)
    .map((line) => normalizeSpaces(line))
    .filter(Boolean);

  if (byLines.length > 1) return byLines;

  const single = normalizeSpaces(raw);
  if (!single) return [];

  const chunks = single.split(/(?=\s\d+\s+[A-Za-zA-Z\u00c4\u00d6\u00dc\u00e4\u00f6\u00fc\u00df])/).map((v) => normalizeSpaces(v));
  return chunks.filter(Boolean);
}

export function parseLeadLine(line: string): ParsedLead | null {
  const normalized = normalizeSpaces(line).replace(/^\d+\s+/, "");
  if (!normalized) return null;

  const urlMatch = normalized.match(URL_REGEX);
  if (!urlMatch) return null;

  const url = urlMatch[1].startsWith("http") ? urlMatch[1] : `https://${urlMatch[1]}`;
  const companyName = normalizeSpaces(normalized.slice(0, urlMatch.index));
  if (!companyName) return null;

  const afterUrl = normalizeSpaces(normalized.slice((urlMatch.index ?? 0) + urlMatch[1].length));
  const phoneMatch = afterUrl.match(PHONE_REGEX);

  let phone = "";
  let tail = afterUrl;
  if (phoneMatch) {
    phone = normalizeSpaces(phoneMatch[1]);
    tail = normalizeSpaces(afterUrl.slice((phoneMatch.index ?? 0) + phoneMatch[1].length));
  }

  const locationMatch = tail.match(LOCATION_REGEX);
  let location = "";
  let afterLocation = tail;
  if (locationMatch) {
    location = normalizeSpaces(locationMatch[1]);
    afterLocation = normalizeSpaces(tail.slice((locationMatch.index ?? 0) + locationMatch[1].length));
  }

  const industryMatch = afterLocation.match(/^([A-Za-zA-Z\u00c4\u00d6\u00dc\u00e4\u00f6\u00fc\u00df\-]{3,}(?:\s+[A-Za-zA-Z\u00c4\u00d6\u00dc\u00e4\u00f6\u00fc\u00df\-]{3,}){0,2})/);
  const industry = industryMatch ? normalizeSpaces(industryMatch[1]) : "Unbekannt";
  const problemDescription = industryMatch
    ? normalizeSpaces(afterLocation.slice(industryMatch[1].length))
    : afterLocation;

  return {
    companyName,
    url,
    phone,
    location,
    industry,
    problemDescription,
    status: DEFAULT_STATUS,
    notes: "",
  };
}

export function parseLeads(rawText: string): { valid: ParsedLead[]; invalid: string[] } {
  const rows = splitRecords(rawText);
  const valid: ParsedLead[] = [];
  const invalid: string[] = [];

  for (const row of rows) {
    const parsed = parseLeadLine(row);
    if (parsed) {
      valid.push(parsed);
    } else {
      invalid.push(row);
    }
  }

  return { valid, invalid };
}
