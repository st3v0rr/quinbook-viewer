# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Quinbook Slot Viewer is a tool for viewing booking slot availability for escape rooms at finest-escape.de (Nürnberg). It proxies the Quinbook booking API to display a week calendar view and find the next available slot. Three rooms are supported: **Prestige**, **Der Henker**, and **Vecna's Game**.

## Architecture

The project has two separate packages:

- **`/server`** — Node.js/Express backend (CommonJS, `package.json` at root)
- **`/client`** — React/Vite frontend (ESM, `package.json` in `client/`)
- **`/public`** — Vite build output (served statically by Express in production)

**Request flow:** Browser → Express (`/api/slots/*`) → `QuinbookClient` → `https://api.quinbook.com/v2/`

In development, Vite dev server proxies `/api` to `localhost:3000`. In production, Express serves the built React app from `/public` and handles API routes.

### Key files

- `server/quinbookClient.js` — Exports `{ client, ROOMS }`. `ROOMS` maps room keys (`prestige`, `henker`, `vecnas`) to their Quinbook config. `QuinbookClient` authenticates per-room via `POST /v2/shop/init` and caches JWTs with a 5-minute expiry buffer.
- `server/routes/slots.js` — Three routes:
  - `GET /api/slots/rooms` — returns available rooms (key, label, bookingUrl)
  - `GET /api/slots/week/:date?room=prestige` — parallel fetches for 7 days
  - `GET /api/slots/next?room=prestige&from=YYYY-MM-DD&timeFrom=HH:MM&timeTo=HH:MM&days=0,6` — sequential search up to 180 days ahead; `days` is comma-separated JS weekday numbers (0=Sun, 6=Sat)
- `client/src/App.jsx` — Root component; owns week-navigation and room-selection state; fetches week data and room list.
- `client/src/components/WeekView.jsx` — Maps 7 days from `weekStart` to `{label, date, slots}` and renders via `SlotGrid`.
- `client/src/components/SlotGrid.jsx` — Renders the slot grid; each column is a day, each row a slot.
- `client/src/components/NextSlotFinder.jsx` — "Find next free slot" UI; delegates filtering to `TimeFilter`.
- `client/src/components/TimeFilter.jsx` — Time-range (HH:MM from/to) and weekday checkbox filter inputs.

### Quinbook API response structure

Slot data comes back as `{ events: [{ slots: [...] }] }`. The `extractSlots` helper does `dayData?.events?.flatMap(e => e.slots ?? [])`. Each slot has a `start` field (ISO datetime or `HH:MM`), and `available: true/false`.

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
