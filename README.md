# Tank Radar

## Pitch

Tank Radar lets you browse and search Cologne's public gas stations by street
name, radius around a picked point, and distance. Pick a center point on the
map, filter by radius, search by street, sort the results, and share the
exact view via URL.

---
## Methods

This application syncs Cologne's open gas-station dataset into a local
SQLite database, then serves it through a small filtering/sorting API.

For each sync:
- The Stadt Köln ArcGIS FeatureServer/MapServer JSON endpoint is fetched.
- Each feature is validated (`objectid`, address, coordinates); malformed
  records are skipped rather than failing the whole run.
- The street name is parsed out of the raw address (the trailing
  postal-code/district parenthetical is dropped).
- Stations are upserted by `objectid`; any station missing from the fetch is
  soft-deactivated (`is_active = 0`) rather than deleted, preserving history
  and tolerating a transient upstream failure.
- Every run - success or failure - is recorded so freshness can be reported.

For each stations query:
- Only active stations are considered.
- An optional case-insensitive, umlaut-folding search matches the street name.
- An optional radius filter keeps stations within N km of a picked center
  point, computed in SQL via a haversine distance function.
- Results are sorted by German-aware street order or by computed distance,
  ascending or descending.

---
## Features
- Interactive Cologne map (MapLibre GL JS) with custom station markers
- Pick a radius search center point by clicking the map or a station's marker
- Radius filter (2 / 5 / 10 km) around the picked center point
- Street-name search (case-insensitive, umlaut-aware)
- Sort by street name or distance, ascending/descending
- Selecting a station (marker or footer row) highlights it in both places
- Search, center point, radius, and sort persisted in the URL for copy/paste sharing
- Scheduled and on-demand data sync, with soft-deactivation of retired stations
- Sync freshness metadata (last run, last successful run)

---
## Parameters

The following parameters control data selection and filtering:

- **Search center point**: picked by clicking the map or a station's marker;
  shown as a distinct marker once set.
- **Radius**: `2`, `5`, or `10` km around the center point; disabled until a
  center point is picked.
- **Search**: partial, case-insensitive, umlaut-folding match on street name.
- **Sort**: by street name (German collation) or by distance from the center
  point (distance requires a center point); ascending or descending.

All of the above are persisted in the URL so a view can be restored via copy/paste.

---
## Quickstart

```bash
git clone <repo>
cd tank-radar
npm install
npm run packages:build
npm run dev
```

The backend listens on `http://localhost:1370` (`/v1/api/*`) and the frontend
dev server on `http://localhost:5173`. Both read sane defaults if no `.env`
is present; to override them, copy `apps/backend/.env.example` to
`apps/backend/.env` first.

Requires Node 20+ (the repo pins `22.15.0` via `.nvmrc`).

---
## Environment Variables

All backend config lives in `apps/backend/.env` (see `apps/backend/.env.example`).
Every variable has a built-in fallback, so the backend runs with no `.env` at
all - copy the example file only to change one of these:

| Variable | Description | Default when unset |
|----------|--------------|---------------------|
| `PORT` | Port the Express server listens on | `1370` |
| `NODE_ENV` | `development` or `production` | `production` |
| `ENABLE_CONSOLE_LOG` | `1` to log to the console, `0` to stay quiet | `0` |
| `DB_PATH` | Path to the SQLite database file | `./data/db/tank-radar.sqlite` |
| `STATIONS_API_URL` | Stadt Köln ArcGIS FeatureServer/MapServer JSON endpoint synced from | Cologne "Tankstellen Köln" query URL |
| `SYNC_CRON_SCHEDULE` | `node-cron` expression for the scheduled sync | `0 */12 * * *` (every 12 hours) |
| `CORS_ORIGIN` | Origin allowed to call the API | `http://localhost:5173` |

The committed `.env.example` deliberately overrides two of these for local
dev (`NODE_ENV=development`, `ENABLE_CONSOLE_LOG=1`) - the "Default when
unset" column above is what the app falls back to if a variable is left out
entirely, per `apps/backend/src/utils/envUtils.ts`.

The frontend has no environment variables of its own; its API base URL is set
in `apps/frontend/src/config/api.json`.

---
## Scripts

Run from the repo root (each fans out to the relevant workspace):

| Command | Description |
|----------|--------------|
| `npm run dev` | Start backend + frontend dev servers together |
| `npm run packages:build` | Build the shared `packages/*` workspaces (required before first `dev`/`build`) |
| `npm run backend:dev` | Start the backend dev server only |
| `npm run backend:test` | Run backend unit tests (Jest) |
| `npm run backend:lint` | Lint the backend |
| `npm run backend:typecheck` | Type-check the backend |
| `npm run backend:format` | Format the backend with Prettier |
| `npm run frontend:dev` | Start the frontend dev server only |
| `npm run frontend:build` | Build the frontend for production |
| `npm run frontend:test` | Run frontend unit tests (Jest) |
| `npm run frontend:e2e` | Run frontend end-to-end tests (Playwright) |
| `npm run frontend:lint` | Lint the frontend |
| `npm run test` | Run backend + frontend unit tests |
| `npm run lint` | Lint backend + frontend |

---
## How it Works

The application follows a clear pipeline from the open-data source to the
interactive map:

Stadt Köln ArcGIS FeatureServer (JSON)
→ Validate & upsert into SQLite (`stations`), soft-deactivate missing rows
→ Sync run recorded (`sync_runs`) for freshness reporting
→ `GET /v1/api/stations` (search / radius / sort query)
→ SQL-side haversine distance + German-aware sort
→ Vue 3 + MapLibre map, sidebar filters, footer table
→ Pick a center point on the map → radius & distance search
→ Filters and center point persisted in the URL

---
## API Documentation

The backend API (health check, sync, stations) is documented in
[`docs/api/`](docs/api):

- [`docs/api/query-contract.md`](docs/api/query-contract.md) - endpoint-by-endpoint
  reference (parameters, validation rules, example requests/responses, errors)
- [`docs/api/openapi.yaml`](docs/api/openapi.yaml) - OpenAPI 3.0 spec

---
## Data Sources & Licenses

This project uses open data and open-source libraries:

- **Stadt Köln Open Data Portal**
  Dataset: [Tankstellen Köln](https://offenedaten-koeln.de/dataset/tankstellen-koeln)
  Accessed live via an ArcGIS FeatureServer/MapServer JSON query endpoint
  License: see the dataset page on the portal for current terms

- **MapLibre GL JS**
  Used for interactive map rendering and center-point picking
  License: BSD-3-Clause

Station data is re-fetched from the source on each sync; no long-term
redistribution of the dataset is intended beyond the local sync database.

---
## Limitations

- Radius/sort distance is great-circle (haversine), not road-network routing
  distance - actual travel distance may differ.
- `GET /v1/api/stations` is not paginated; fine at the current scale
  (~122 stations), would need revisiting at a much larger scale.
- Search matches only the parsed street name, not the full raw address
  (district/postal code aren't searchable).
- SQLite (`better-sqlite3`) is a single-file, single-writer database - noted
  in [BACKLOG.md](BACKLOG.md) as swappable for Postgres/PostGIS in production.
- Freshness depends on the sync schedule (`SYNC_CRON_SCHEDULE`) or a manual
  `POST /v1/api/sync`; between syncs, results reflect the last completed fetch.
- A failed sync leaves existing data untouched rather than clearing it - check
  `GET /v1/api/sync/meta` to see whether the latest run actually succeeded.

---
## Folder Structure

```
/apps
  /backend
    /src
      /core          # app, server, config, routes
      /db            # SQLite connection, schema, SQL functions, queries
      /middlewares   # cors, request/response logging
      /modules       # health, sync, stations (routes + controllers)
      /sync          # runSync, scheduleSync
      /types
      /utils
  /frontend
    /src
      /assets
      /components    # map, sidebar, header, footer
      /composables   # bridges Zustand stores into Vue's reactivity
      /config
      /controllers   # API client calls
      /store         # Zustand stores (stations, map, url)
      /types
      /utils
      /e2e           # Playwright tests
/packages
  /enum              # shared route/status/log enums
  /types             # shared TypeScript types
  /utils             # shared helpers (formatting, retrying fetch, ...)
/docs
  /api               # API reference (OpenAPI + query contract)
```

---
## CI/CD

This repository uses **GitHub Actions** (`.github/workflows/pr-checks.yml`).
On every pull request into `master` that touches `apps/frontend`,
`apps/backend`, or `packages`, it:
1. Installs dependencies and builds the shared `packages/*` workspaces
2. Lints and type-checks the backend and frontend
3. Builds the backend and smoke-tests it (`GET /v1/api/health`)
4. Runs backend unit tests (Jest)
5. Runs frontend unit tests (Jest) and end-to-end tests (Playwright),
   uploading the Playwright report as an artifact if a run fails

There is no deploy step configured yet.

---
## Tech Stack

- TypeScript
- Express 5 + better-sqlite3 (backend)
- Vue 3 + Vite + Zustand (frontend)
- MapLibre GL JS
- node-cron (scheduled sync)
- npm workspaces monorepo (`apps/*`, `packages/*`)
- ESLint + Prettier
- Jest + Playwright
- GitHub Actions CI

---
## Privacy Note

- This app does not collect personal user data beyond what's needed to serve
  the current request.
- No analytics or tracking is implemented.
- A picked search center point is sent to the backend only as part of the
  `/v1/api/stations` query (to compute radius/distance) and is not stored
  server-side.

