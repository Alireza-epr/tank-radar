# Tank Radar API Documentation

## Base URL

**Local:**
http://localhost:{PORT}/v1/api/

`PORT` defaults to `1370` (see `apps/backend/.env.example`).

---

## Authentication

None. All endpoints are public. Cross-origin access is restricted at the CORS
layer to the origin configured via `CORS_ORIGIN` (defaults to the Vite dev
server, `http://localhost:5173`).

---

## Response Envelope

Every JSON response shares the same shape; individual endpoints populate a
subset of these fields:

```json
{
  "success": true,
  "entries": [],
  "length": 0,
  "error": []
}
```

- `success` - always present.
- `entries` - a list, even for single-resource responses (`/sync`, `/sync/meta` wrap
  their one result in a 1-element array).
- `length` - number of items in `entries`, when applicable.
- `error` - present only on error responses; a two-element array of
  `[errorCode, humanMessage]` for `/stations` validation errors, or a single
  human-readable message for `/sync` failures.

Response bodies are returned with keys sorted alphabetically.

---

## Table of Contents

- [Health Check](#health-check)
- [Trigger Sync](#trigger-sync)
- [Sync Meta](#sync-meta)
- [List Stations](#list-stations)

---

## Health Check

**GET** `/health`

**Description:**
`Liveness check endpoint used to verify that the API service is running and reachable.`

**Authentication:**
`None (public)`

---

### 1. Request - URL Parameters

None.

---

### 2. Request - Body

None.

---

### 3. Response

| Field   | Description    | Format  |
| ------- | -------------- | ------- |
| success | Request status | boolean |

---

#### Example: Success Response (200 OK)

```json
{
  "success": true
}
```

---

### 4. Errors

- `No response / timeout` – Service is down, unreachable, or not responding at all

---

### 5. Notes

- Does not check database or upstream (Stadt Köln) connectivity - a healthy
  response only means the Express process is up
- Used by the CI smoke test and can back a monitoring / load-balancer check

---

## Trigger Sync

**POST** `/sync`

**Description:**
`Fetches the current station list from the Stadt Köln ArcGIS FeatureServer, upserts changed/new stations, and soft-deactivates stations no longer present in the source. Runs synchronously and returns once the sync finishes.`

**Authentication:**
`None (public)`

---

### 1. Request - URL Parameters

None.

---

### 2. Request - Body

```json
{}
```

---

### 3. Response

| Field   | Description                              | Format  |
| ------- | ---------------------------------------- | ------- |
| success | Request status                           | boolean |
| length  | Always `1`                               | number  |
| entries | Single-element array with the run result | array   |

**Entry fields:**

| Field              | Description                                                    | Format |
| ------------------ | -------------------------------------------------------------- | ------ |
| id                 | `sync_runs` row id for this run                                | number |
| status             | `success` or `failed`                                          | string |
| recordsFetched     | Rows returned by the source API                                | number |
| recordsUpserted    | Rows inserted or updated                                       | number |
| recordsDeactivated | Previously-active rows not present in this fetch, soft-deleted | number |
| error              | Failure reason (only present when `status` is `failed`)        | string |

---

#### Example: Success Response (200 OK)

```json
{
  "success": true,
  "length": 1,
  "entries": [
    {
      "id": 14,
      "status": "success",
      "recordsFetched": 122,
      "recordsUpserted": 3,
      "recordsDeactivated": 0
    }
  ]
}
```

#### Example: Failure Response (503 Service Unavailable)

```json
{
  "success": false,
  "error": ["Failed to fetch stations from source API"],
  "entries": [
    {
      "id": 15,
      "status": "failed",
      "recordsFetched": 0,
      "recordsUpserted": 0,
      "recordsDeactivated": 0,
      "error": "Failed to fetch stations from source API"
    }
  ]
}
```

---

### 4. Errors

- `503 Service Unavailable` – The upstream source API could not be reached or
  returned a non-OK response, or the sync crashed while upserting. The failed
  run is still recorded in `sync_runs` and reflected in `entries`.

---

### 5. Notes

- Also runs automatically on the schedule set by `SYNC_CRON_SCHEDULE`
  (`node-cron` expression, defaults to every 12 hours)
- A sync never deletes rows outright - stations missing from the latest fetch
  are marked `is_active = 0` (soft-delete), keeping history and tolerating a
  transient upstream failure
- Each run - success or failure - is recorded as one row in `sync_runs`
- Not paginated; not filterable

---

## Sync Meta

**GET** `/sync/meta`

**Description:**
`Returns the most recent sync run (of any status) and the most recent successful sync run, so a client can show data freshness.`

**Authentication:**
`None (public)`

---

### 1. Request - URL Parameters

None.

---

### 2. Request - Body

None.

---

### 3. Response

| Field   | Description                                     | Format  |
| ------- | ----------------------------------------------- | ------- |
| success | Request status                                  | boolean |
| length  | Always `1`                                      | number  |
| entries | Single-element array: `{ latest, lastSuccess }` | array   |

`latest` and `lastSuccess` are each either a full sync run object (see
[Trigger Sync](#trigger-sync) response fields, plus `startedAt` / `finishedAt`
ISO timestamps) or `null` when no run of that kind has happened yet.

---

#### Example: Success Response (200 OK)

```json
{
  "success": true,
  "length": 1,
  "entries": [
    {
      "latest": {
        "id": 15,
        "startedAt": "2026-08-13T06:00:00.000Z",
        "finishedAt": "2026-08-13T06:00:04.000Z",
        "status": "failed",
        "recordsFetched": 0,
        "recordsUpserted": 0,
        "recordsDeactivated": 0,
        "error": "Failed to fetch stations from source API"
      },
      "lastSuccess": {
        "id": 14,
        "startedAt": "2026-08-12T18:00:00.000Z",
        "finishedAt": "2026-08-12T18:00:03.000Z",
        "status": "success",
        "recordsFetched": 122,
        "recordsUpserted": 3,
        "recordsDeactivated": 0,
        "error": null
      }
    }
  ]
}
```

#### Example: Success Response (200 OK) - No sync has ever run

```json
{
  "success": true,
  "length": 1,
  "entries": [
    {
      "latest": null,
      "lastSuccess": null
    }
  ]
}
```

---

### 4. Errors

None expected under normal operation.

---

### 5. Notes

- Intended for a "last updated" indicator in the frontend
- `latest` and `lastSuccess` are the same object when the most recent run succeeded

---

## List Stations

**GET** `/stations`

**Description:**
`Returns active gas stations, optionally filtered by search term and/or a radius around a center point, and sorted.`

**Authentication:**
`None (public)`

---

### 1. Request - URL Parameters

| Parameter | Description                                                   | Required | Format                     | Param Type |
| --------- | ------------------------------------------------------------- | -------- | -------------------------- | ---------- |
| lat       | Latitude of the search center point (-90 to 90)               | False    | number                     | query      |
| lon       | Longitude of the search center point (-180 to 180)            | False    | number                     | query      |
| radius    | Max distance from the center point, in km                     | False    | Enum: `2`, `5`, `10`       | query      |
| search    | Case-insensitive, umlaut-folding partial match on street name | False    | string                     | query      |
| sortBy    | Field to sort by                                              | False    | Enum: `street`, `distance` | query      |
| sortDir   | Sort direction                                                | False    | Enum: `asc`, `desc`        | query      |

---

### 2. Request - Body

None. All filtering happens via query parameters.

---

### 3. Validation Rules

Rules are checked in this order; the first violated rule determines the `400` message:

1. `lat` and `lon` must be provided together - either both or neither.
2. `lat` must be a finite number between `-90` and `90`.
3. `lon` must be a finite number between `-180` and `180`.
4. `radius` requires `lat`/`lon` to also be provided, and must be one of `2`, `5`, `10`.
5. `search`, if provided, must be a string; an empty or whitespace-only value is
   treated as if `search` were omitted.
6. `sortBy` must be `street` or `distance`; `sortBy=distance` requires `lat`/`lon`
   to also be provided.
7. `sortDir` requires `sortBy` to also be provided, and must be `asc` or `desc`.
   Defaults to `asc` when `sortBy` is given and `sortDir` is omitted.

---

### 4. Response

| Field   | Description                | Format  |
| ------- | -------------------------- | ------- |
| success | Request status             | boolean |
| entries | List of station records    | array   |
| length  | Number of entries returned | number  |

**Station entry fields:**

| Field      | Description                                                                              | Format |
| ---------- | ---------------------------------------------------------------------------------------- | ------ |
| objectid   | Stable identifier from the Stadt Köln source dataset                                     | number |
| street     | Street and house number, parsed from the source address                                  | string |
| rawAddress | Full source address, e.g. `"Bonner Str. 98 (50677 Neustadt/Süd)"`                        | string |
| lat        | Latitude                                                                                 | number |
| lon        | Longitude                                                                                | number |
| distance   | Great-circle distance in km from `lat`/`lon`; present only when a center point was given | number |

---

#### Example: Success Response (200 OK) - With a center point

```json
{
  "success": true,
  "length": 1,
  "entries": [
    {
      "objectid": 98,
      "street": "Bonner Str. 98",
      "rawAddress": "Bonner Str. 98 (50677 Neustadt/Süd)",
      "lat": 50.9,
      "lon": 6.9,
      "distance": 1.42
    }
  ]
}
```

#### Example: Success Response (200 OK) - No matches

```json
{
  "success": true,
  "length": 0,
  "entries": []
}
```

---

### 5. Errors

- `400 Bad Request` – A query parameter fails validation (see
  [Validation Rules](#3-validation-rules)); `error` is
  `[errorCode, humanMessage]`, e.g. `["VALIDATION_ERROR", "'radius' must be one of: 2, 5, 10"]`

---

### 6. Notes

- Only stations with `is_active = 1` are ever returned (soft-deleted stations
  from a sync are excluded)
- `search` matches on `street` only, not the full `rawAddress`
- `street` sorting treats German umlauts as their base letter (`ä`→`a`, `ö`→`o`,
  `ü`→`u`, `ß`→`ss`) so results order the way a German speaker expects
- Distance is computed in SQL via a haversine function registered on the
  SQLite connection - not a bounding-box approximation
- Not paginated; a single request returns the full filtered/sorted result set

---

_End of Documentation_
