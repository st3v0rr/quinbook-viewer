import { useEffect, useMemo, useState } from "react";
import WeekView from "./components/WeekView";
import NextSlotFinder from "./components/NextSlotFinder";

function toDateStr(date) {
  return date.toISOString().slice(0, 10);
}

function mondayOf(date = new Date()) {
  const utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = utc.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  utc.setUTCDate(utc.getUTCDate() + diff);
  return utc;
}

function fmtDate(dateStr) {
  return dateStr.slice(8, 10) + "." + dateStr.slice(5, 7) + "." + dateStr.slice(0, 4);
}

function addDays(dateStr, days) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function App() {
  const [weekStart, setWeekStart] = useState(toDateStr(mondayOf()));
  const [weekData, setWeekData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rooms, setRooms] = useState([]);
  const [room, setRoom] = useState("prestige");

  useEffect(() => {
    fetch("/api/slots/rooms")
      .then((r) => r.json())
      .then(setRooms)
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadWeek() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`/api/slots/week/${weekStart}?room=${room}`);
        if (!res.ok) throw new Error(`Request failed with ${res.status}`);
        const data = await res.json();
        if (!cancelled) setWeekData(data);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unbekannter Fehler");
          setWeekData({});
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadWeek();
    return () => { cancelled = true; };
  }, [weekStart, room]);

  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);
  const currentRoom = rooms.find((r) => r.key === room);

  return (
    <main className="app stack">
      <section className="card stack">
        <div className="controls">
          <h1>Quinbook Slot Viewer</h1>
          {rooms.length > 0 && (
            <select value={room} onChange={(e) => { setRoom(e.target.value); setWeekData({}); }}>
              {rooms.map((r) => (
                <option key={r.key} value={r.key}>{r.label}</option>
              ))}
            </select>
          )}
        </div>

        <div className="controls">
          <button onClick={() => setWeekStart(addDays(weekStart, -7))}>Vorherige Woche</button>
          <strong>{fmtDate(weekStart)} - {fmtDate(weekEnd)}</strong>
          <button onClick={() => setWeekStart(addDays(weekStart, 7))}>Naechste Woche</button>
          <button onClick={() => setWeekStart(toDateStr(mondayOf()))}>Aktuelle Woche</button>
        </div>

        {loading ? <div className="meta">Lade Slots...</div> : null}
        {error ? <div className="error">{error}</div> : null}

        <WeekView weekStart={weekStart} data={weekData} bookingUrl={currentRoom?.bookingUrl} />
      </section>

      <NextSlotFinder
        fromDate={weekStart}
        room={room}
        bookingUrl={currentRoom?.bookingUrl}
        onFound={(date) => setWeekStart(toDateStr(mondayOf(new Date(date + "T00:00:00Z"))))}
      />
    </main>
  );
}
