# Auftrag Optimizer — Local Lead Tracker

A local application for organizing potential customer enquiries and sales outreach work.

## Implemented features

- Lead ingestion and parsing; duplicate detection in a local SQLite database.
- Overview, active assignments, archive, full-entry and statistics pages.
- Status updates and per-lead notes through Next.js routes.

## Technology and setup

Next.js 16, React 19, TypeScript, Tailwind CSS, SQLite and sqlite3.

```powershell
npm ci
npm run dev -- --hostname 127.0.0.1
```

Open http://127.0.0.1:3000. `npm run build` creates the production build; `npm start -- --hostname 127.0.0.1` starts it locally. Node.js must be compatible with the installed Next.js version, and sqlite3 needs a working native binding.

## Configuration and current limitations

The application creates its own local `data/lead-tracker.db`. The original database, actual company leads, phone numbers and private notes are excluded. Start with your own permitted input. This is a local internal-tool prototype; authentication and an Internet-facing multi-user service are not established features. No deployment was activated.

## Contribution and license

Leon Rohrer’s local business-tool project. Existing package metadata includes an ISC license declaration; it is preserved without extending or replacing it. Framework and dependency notices remain applicable. See `PUBLICATION_CHECKS.md` for actual validation results.
