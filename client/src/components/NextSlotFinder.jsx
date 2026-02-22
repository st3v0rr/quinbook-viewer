import { useState } from "react";
import TimeFilter from "./TimeFilter";

function slotTime(slot) {
  return slot?.time || slot?.start || slot?.from || "--:--";
}

export default function NextSlotFinder({ fromDate }) {
  const [timeFrom, setTimeFrom] = useState("");
  const [timeTo, setTimeTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  async function findNext() {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({ from: fromDate });
      if (timeFrom) params.set("timeFrom", timeFrom);
      if (timeTo) params.set("timeTo", timeTo);

      const res = await fetch(`/api/slots/next?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Request failed with ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
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
        onChange={({ timeFrom: from, timeTo: to }) => {
          setTimeFrom(from);
          setTimeTo(to);
        }}
      />
      <div className="controls">
        <button onClick={findNext} disabled={loading || (timeFrom && timeTo && timeFrom > timeTo)}>
          {loading ? "Suche..." : "Suchen"}
        </button>
        {timeFrom && timeTo && timeFrom > timeTo ? (
          <span className="error">Von darf nicht spaeter als Bis sein.</span>
        ) : null}
      </div>

      {error ? <div className="error">{error}</div> : null}

      {result ? (
        result.date && result.slot ? (
          <div className="success">
            Naechster Slot: {result.date} um {slotTime(result.slot)}
          </div>
        ) : (
          <div className="meta">Kein passender freier Slot gefunden.</div>
        )
      ) : null}
    </section>
  );
}
