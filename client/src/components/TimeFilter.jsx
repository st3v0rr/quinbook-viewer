const INTERVALS = Array.from({ length: 48 }, (_, i) => {
  const h = String(Math.floor(i / 2)).padStart(2, "0");
  const m = i % 2 === 0 ? "00" : "30";
  return `${h}:${m}`;
});

export default function TimeFilter({ timeFrom, timeTo, onChange }) {
  return (
    <div className="filters">
      <label className="field">
        <span className="meta">Von</span>
        <select
          value={timeFrom}
          onChange={(e) => onChange({ timeFrom: e.target.value, timeTo })}
        >
          <option value="">Keine Grenze</option>
          {INTERVALS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span className="meta">Bis</span>
        <select
          value={timeTo}
          onChange={(e) => onChange({ timeFrom, timeTo: e.target.value })}
        >
          <option value="">Keine Grenze</option>
          {INTERVALS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
