# Quinbook Slot Viewer

Zeigt die Buchungsslots für **Vecna's Game** (finest-escape.de, Nürnberg) als Wochenkalender an und findet den nächsten freien Slot – optional mit Zeitfenster-Filter.

## Features

- Wochenansicht (Mo–So) mit freien und belegten Slots
- Navigation zwischen Wochen
- Suche nach dem nächsten freien Slot ab einem Startdatum, mit optionalem Von/Bis-Zeitfilter

## Voraussetzungen

- Node.js 20+
- npm

## Installation

```bash
# Root-Abhängigkeiten (Express)
npm install

# Client-Abhängigkeiten (React/Vite)
cd client && npm install
```

## Entwicklung

```bash
# Backend starten (Port 3000)
node server/index.js

# In einem zweiten Terminal: Vite Dev Server (Port 5173, proxied zu :3000)
cd client && npm run dev
```

## Produktion

```bash
# React-App bauen (Output: /public)
cd client && npm run build

# Server starten – liefert Frontend und API
node server/index.js
```

## Docker

```bash
docker compose up --build
```

Der Container läuft auf Port `3000`.

## API

| Route | Beschreibung |
|---|---|
| `GET /api/slots/week/:date` | Slots für 7 Tage ab `date` (YYYY-MM-DD) |
| `GET /api/slots/next?from=&timeFrom=&timeTo=` | Nächster freier Slot ab `from`, optional gefiltert nach Uhrzeit (HH:MM) |
