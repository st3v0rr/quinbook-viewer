const INTERVALS = Array.from({ length: 48 }, (_, i) => {
  const h = String(Math.floor(i / 2)).padStart(2, "0");
  const m = i % 2 === 0 ? "00" : "30";
  return `${h}:${m}`;
});

// Mo=1 Di=2 Mi=3 Do=4 Fr=5 Sa=6 So=0  (JS getUTCDay())
const WEEKDAYS = [
  { label: "Mo", value: 1 },
  { label: "Di", value: 2 },
  { label: "Mi", value: 3 },
  { label: "Do", value: 4 },
  { label: "Fr", value: 5 },
  { label: "Sa", value: 6 },
  { label: "So", value: 0 },
];

export default function TimeFilter({ timeFrom, timeTo, days, onChange }) {
  function toggleDay(value) {
    const next = days.includes(value) ? days.filter((d) => d !== value) : [...days, value];
    onChange({ timeFrom, timeTo, days: next });
  }

  return (
    <div className="filters">
      <div className="field">
        <span className="meta">Wochentage</span>
        <div className="weekday-filter">
          {WEEKDAYS.map(({ label, value }) => (
            <label key={value} className={`weekday-btn ${days.includes(value) ? "active" : ""}`}>
              <input
                type="checkbox"
                checked={days.includes(value)}
                onChange={() => toggleDay(value)}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <label className="field">
        <span className="meta">Von</span>
        <select
          value={timeFrom}
          onChange={(e) => onChange({ timeFrom: e.target.value, timeTo, days })}
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
          onChange={(e) => onChange({ timeFrom, timeTo: e.target.value, days })}
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
