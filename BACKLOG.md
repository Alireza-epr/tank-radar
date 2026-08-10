# Backlog - Tank Radar

Source data: Stadt Köln open data portal, dataset "Tankstellen Köln"
(https://offenedaten-koeln.de/dataset/tankstellen-koeln), served live from an
ArcGIS FeatureServer/MapServer query endpoint as JSON (122 features at time of writing).
Each feature: `attributes.objectid`, `attributes.adresse`, `geometry.x` (lon), `geometry.y` (lat).

---

## Epic 1 - Data ingestion & freshness

-  **1.1** Project skeleton: Express app, config via `.env`, SQLite database file.
-  **1.2** DB schema: `stations` table (objectid PK, street/address, lat, lon, raw address,
  `first_seen_at`, `last_seen_at`, `is_active`) + `sync_runs` table (id, started_at, finished_at,
  status, records_fetched, records_upserted, records_deactivated, error).
-  **1.3** Importer: fetch the ArcGIS JSON endpoint, parse `features[]`, upsert into `stations`
  by `objectid` (insert new, update changed address/coords, touch `last_seen_at`).
-  **1.4** Freshness strategy: mark stations missing from the latest fetch as `is_active = 0`
  instead of deleting (keeps history, avoids hard deletes on a transient fetch failure).
-  **1.5** Scheduled re-sync via `node-cron` (interval configurable through `.env`,
  e.g. daily) + a manual `POST /api/sync` endpoint to trigger an on-demand refresh.
-  **1.6** Sync logging/error handling: record every run in `sync_runs`, don't let a failed
  fetch corrupt existing data (transaction per sync).

## Epic 2 - Backend API

-  **2.1** `GET /api/stations` - full active list, JSON.
-  **2.2** Radius filter: query params `lat`, `lng`, `radius` (enum `2`, `5`, `10` km),
  Haversine-based distance filter/sort, implemented as a SQL function so filtering happens
  in the database.
-  **2.3** Street-name search: `?search=` - case-insensitive partial match on the street part
  of the address.
-  **2.4** Sorting: `?sortBy=street|distance&sortDir=asc|desc`.
-  **2.5** Input validation (bad radius/lat/lng → 400 with a clear message) + consistent
  JSON error shape.
-  **2.6** `GET /api/meta` (last sync time/status) so the frontend can show data freshness.

## Epic 3 - Vue.js frontend

-  **3.1** Scaffold Vue 3 + Vite app, API client (`fetch`/`axios` wrapper), base layout.
-  **3.2** Station table/list component (address, distance if applicable).
-  **3.3** Position picker: manual lat/lng inputs + "use my location" (browser geolocation)
  + radius `<select>` (2 / 5 / 10 km).
-  **3.4** Search box wired to `?search=`, debounced.
-  **3.5** Sort control (asc/desc) wired to `?sortDir=`.
-  **3.6** Loading / empty / error states; "last updated" indicator from `/api/meta`.
-  **3.7** Basic responsive styling (no design system needed, just clean and usable).

## Epic 4 - Docs & delivery

-  **4.1** Top-level `README.md`: architecture, setup, run instructions for backend + frontend.
-  **4.2** `.env.example` for both apps.
-  **4.3** Effort estimate document (for Katharina/Michael).
-  **4.4** Feedback on the exercise itself.
-  **4.5** *(Kür)* Collaboration & code-quality tooling recommendation.
-  **4.6** *(Kür)* CRUD-extension concept.
-  **4.7** *(Kür)* Hosting/deployment concept.
-  **4.8** Final pass: run both apps end-to-end, sanity-check before packaging for submission.

---

## Explicit scope decisions

- **SQL database:** SQLite (via `better-sqlite3`) - zero setup, file-based, fits a take-home;
  documented in the hosting write-up as swappable for Postgres/PostGIS in production.
- **"Freely chosen position":** manual lat/lng fields + a "use my current location" button,
  rather than embedding a map library - keeps the optional scope (map UI) out of the required
  deliverable while still satisfying "frei wählbare Position".
- **Freshness:** scheduled cron re-sync + soft-deactivation of stations no longer in the source,
  not a one-off import script.
