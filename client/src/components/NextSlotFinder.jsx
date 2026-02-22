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

  const timeInvalid = timeFrom && timeTo && timeFrom > timeTo;

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
      if (!res.ok) throw new Error(`Request failed with ${res.status}`);

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

  function reset() {
    setTimeFrom("");
    setTimeTo("");
    setDays([]);
    setResult(null);
    setError("");
  }

  const canReset = !loading && (timeFrom || timeTo || days.length > 0);

  return (
    <details className="next-finder" open>
      <summary>
        <span className="finder-icon">🔍</span>
        <span className="finder-title">Nächsten freien Slot finden</span>
        <span className="finder-chevron">▾</span>
      </summary>

      <div className="finder-body">
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

        <div className="action-row">
          <button
            className="btn btn-primary"
            onClick={findNext}
            disabled={loading || timeInvalid}
          >
            {loading ? "Suche läuft…" : "Suchen"}
          </button>
          <button className="btn" onClick={reset} disabled={!canReset}>
            Zurücksetzen
          </button>
          {timeInvalid && (
            <span className="validation-msg">„Von" darf nicht nach „Bis" liegen.</span>
          )}
        </div>

        {error && <div className="error-msg">{error}</div>}

        {result && (
          result.date && result.slot ? (
            <div className="result-box success">
              <span>🔓</span>
              <span>
                Nächster freier Slot:{" "}
                <span className="result-date">
                  {fmtDate(result.date)} · {slotTime(result.slot)}
                </span>
              </span>
              <a
                className="result-book"
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                → Jetzt buchen
              </a>
            </div>
          ) : (
            <div className="result-box empty">
              🔒 Kein passender freier Slot gefunden.
            </div>
          )
        )}
      </div>
    </details>
  );
}
