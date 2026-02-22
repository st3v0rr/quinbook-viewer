const INTERVALS = Array.from({ length: 13 }, (_, i) => {
  return String(10 + i).padStart(2, "0") + ":00";
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
      <div className="filter-field">
        <span className="filter-label">Wochentage</span>
        <div className="weekday-filter">
          {WEEKDAYS.map(({ label, value }) => (
            <label key={value} className={`weekday-btn${days.includes(value) ? " active" : ""}`}>
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

      <div className="time-range">
        <label className="filter-field">
          <span className="filter-label">Von</span>
          <select
            value={timeFrom}
            onChange={(e) => onChange({ timeFrom: e.target.value, timeTo, days })}
          >
            <option value="">—</option>
            {INTERVALS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>

        <label className="filter-field">
          <span className="filter-label">Bis</span>
          <select
            value={timeTo}
            onChange={(e) => onChange({ timeFrom, timeTo: e.target.value, days })}
          >
            <option value="">—</option>
            {INTERVALS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
