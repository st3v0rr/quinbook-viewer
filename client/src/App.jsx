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

  useEffect(() => {
    let cancelled = false;

    async function loadWeek() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`/api/slots/week/${weekStart}`);
        if (!res.ok) {
          throw new Error(`Request failed with ${res.status}`);
        }

        const data = await res.json();
        if (!cancelled) {
          setWeekData(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unbekannter Fehler");
          setWeekData({});
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadWeek();

    return () => {
      cancelled = true;
    };
  }, [weekStart]);

  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);

  return (
    <main className="app stack">
      <section className="card stack">
        <h1>Quinbook Slot Viewer</h1>
        <p className="meta">Wochenansicht (Mo-So) und naechster freier Slot.</p>

        <div className="controls">
          <button onClick={() => setWeekStart(addDays(weekStart, -7))}>Vorherige Woche</button>
          <strong>
            {weekStart} - {weekEnd}
          </strong>
          <button onClick={() => setWeekStart(addDays(weekStart, 7))}>Naechste Woche</button>
          <button onClick={() => setWeekStart(toDateStr(mondayOf()))}>Aktuelle Woche</button>
        </div>

        {loading ? <div className="meta">Lade Slots...</div> : null}
        {error ? <div className="error">{error}</div> : null}

        <WeekView weekStart={weekStart} data={weekData} />
      </section>

      <NextSlotFinder fromDate={weekStart} />
    </main>
  );
}
