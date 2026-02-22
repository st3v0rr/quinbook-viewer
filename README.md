# Quinbook Slot Viewer

Zeigt die Buchungsslots für die Escape Rooms von **finest-escape.de (Nürnberg)** als Wochenkalender an und findet den nächsten freien Slot – mit Zeitfenster- und Wochentagsfilter.

Unterstützte Räume: **Prestige**, **Der Henker**, **Vecna's Game**

## Features

- Wochenansicht (Mo–So) mit freien und belegten Slots
- Raumauswahl per Dropdown
- Navigation zwischen Wochen
- Suche nach dem nächsten freien Slot ab heute, mit optionalem Von/Bis-Zeitfilter und Wochentags-Auswahl

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
| `GET /api/slots/rooms` | Liste der verfügbaren Räume (key, label, bookingUrl) |
| `GET /api/slots/week/:date?room=prestige` | Slots für 7 Tage ab `date` (YYYY-MM-DD) |
| `GET /api/slots/next?room=prestige&from=YYYY-MM-DD&timeFrom=HH:MM&timeTo=HH:MM&days=1,2` | Nächster freier Slot ab `from` (default: heute), optional gefiltert nach Uhrzeit und Wochentagen (kommagetrennte JS-Wochentagnummern, 0=So, 6=Sa); sucht bis zu 180 Tage voraus |
