# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Quinbook Slot Viewer is a tool for viewing booking slot availability for an escape room ("Vecna's Game" at finest-escape.de in Nuremberg). It proxies the Quinbook booking API to display a week calendar view and find the next available slot.

## Architecture

The project has two separate packages:

- **`/server`** — Node.js/Express backend (CommonJS, `package.json` at root)
- **`/client`** — React/Vite frontend (ESM, `package.json` in `client/`)
- **`/public`** — Vite build output (served statically by Express in production)

**Request flow:** Browser → Express (`/api/slots/*`) → `QuinbookClient` → `https://api.quinbook.com/v2/`

In development, Vite dev server proxies `/api` to `localhost:3000`. In production, Express serves the built React app from `/public` and handles API routes.

### Key files

- `server/quinbookClient.js` — Singleton that authenticates with Quinbook (`POST /v2/shop/init`) and fetches slots. Caches the JWT with a 5-minute expiry buffer.
- `server/routes/slots.js` — Two routes: `GET /api/slots/week/:date` (parallel fetches for 7 days) and `GET /api/slots/next` (sequential search up to 60 days ahead with optional time-range filter).
- `client/src/App.jsx` — Root component; owns week-navigation state and fetches week data.
- `client/src/components/SlotGrid.jsx` — Renders the slot grid; normalizes the Quinbook API response (which can return either an array or `{ slots: [] }`).

### Quinbook API quirks

Slot objects use inconsistent field names across API versions — the code defensively checks `slot.time || slot.start || slot.from` for the time and `slot.occupied` / `slot.available` for status.

## Development

### Run backend (production-like, serves built frontend)

```bash
# From repo root
node server/index.js
```

### Run frontend dev server (with API proxy)

```bash
# Start backend first
node server/index.js &

# Then in client/
cd client && npm run dev
```

### Build frontend

```bash
cd client && npm run build
# Output goes to /public (relative to repo root)
```

### Docker

```bash
docker compose up --build
```

The Dockerfile is a two-stage build: stage 1 builds the React app, stage 2 runs the Express server with the built assets copied in.
