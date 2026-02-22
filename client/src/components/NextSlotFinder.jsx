import { useState } from "react";
import TimeFilter from "./TimeFilter";

function fmtDate(dateStr) {
  return dateStr.slice(8, 10) + "." + dateStr.slice(5, 7) + "." + dateStr.slice(0, 4);
}

function slotTime(slot) {
  const s = slot?.start || slot?.time || slot?.from || "";
  return s.includes("T") ? s.slice(11, 16) : (s.slice(0, 5) || "--:--");
}

export default function NextSlotFinder({ fromDate, room, bookingUrl, onFound }) {
  const [timeFrom, setTimeFrom] = useState("");
  const [timeTo, setTimeTo] = useState("");
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  async function findNext() {
    setLoading(true);
    setError("");

    try {
      const today = new Date().toISOString().slice(0, 10);
      const params = new URLSearchParams({ from: today, room });
      if (timeFrom) params.set("timeFrom", timeFrom);
      if (timeTo) params.set("timeTo", timeTo);
      if (days.length > 0) params.set("days", days.join(","));

      const res = await fetch(`/api/slots/next?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Request failed with ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
      if (data.date) onFound(data.date);
    } catch (err) {
      setError(err.message || "Unbekannter Fehler");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card stack">
      <h2>Naechsten freien Slot finden</h2>
      <TimeFilter
        timeFrom={timeFrom}
        timeTo={timeTo}
        days={days}
        onChange={({ timeFrom: from, timeTo: to, days: d }) => {
          setTimeFrom(from);
          setTimeTo(to);
          setDays(d);
        }}
      />
      <div className="controls">
        <button onClick={findNext} disabled={loading || (timeFrom && timeTo && timeFrom > timeTo)}>
          {loading ? "Suche..." : "Suchen"}
        </button>
        <button
          onClick={() => { setTimeFrom(""); setTimeTo(""); setDays([]); setResult(null); setError(""); }}
          disabled={loading || (!timeFrom && !timeTo && days.length === 0)}
        >
          Zurücksetzen
        </button>
        {timeFrom && timeTo && timeFrom > timeTo ? (
          <span className="error">Von darf nicht spaeter als Bis sein.</span>
        ) : null}
      </div>

      {error ? <div className="error">{error}</div> : null}

      {result ? (
        result.date && result.slot ? (
          <div className="success">
            Naechster Slot:{" "}
            <a href={bookingUrl} target="_blank" rel="noopener noreferrer">
              {fmtDate(result.date)} um {slotTime(result.slot)}
            </a>
          </div>
        ) : (
          <div className="meta">Kein passender freier Slot gefunden.</div>
        )
      ) : null}
    </section>
  );
}
