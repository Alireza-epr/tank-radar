# @tank-radar/backend

Express API for Tank Radar.

## Setup

```sh
cp .env.example .env
npm run backend:dev   # from the repo root
```

The server listens on `PORT` from `.env` (defaults to `1370` if unset).
Config loading is handled by [`@dotenvx/dotenvx`](https://dotenvx.com/) in
[`src/core/config.ts`](src/core/config.ts).

## Scripts

Run from the repo root as `npm run backend:<script>`, or from this
directory directly:

- `dev` — run the server with `ts-node`.
- `build` — compile TypeScript to `dist/`.
- `start` — run the compiled server (`npm run build` first).
- `lint` / `format` / `typecheck` / `test`.
