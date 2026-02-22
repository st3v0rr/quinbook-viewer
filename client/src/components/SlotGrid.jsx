function fmtDate(dateStr) {
  return dateStr.slice(8, 10) + "." + dateStr.slice(5, 7) + "." + dateStr.slice(0, 4);
}

function normalizeSlots(raw) {
  if (Array.isArray(raw)) return raw;
  return [];
}

function slotTime(slot) {
  const s = slot.start || slot.time || slot.from || "";
  // ISO datetime "2026-03-12T15:00:00" → "15:00"
  return s.includes("T") ? s.slice(11, 16) : (s.slice(0, 5) || "--:--");
}

function slotStatus(slot) {
  if (slot.available === true || slot.display === "available") return "free";
  if (slot.available === false || slot.display === "occupied") return "occupied";
  return "unknown";
}

export default function SlotGrid({ days, bookingUrl }) {
  return (
    <div className="week-grid">
      {days.map((day) => {
        const slots = normalizeSlots(day.slots);
        return (
          <section key={day.date} className="day-col">
            <div className="day-head">
              <div>{day.label}</div>
              <div className="meta">{fmtDate(day.date)}</div>
            </div>

            <div className="slot-list">
              {slots.length === 0 ? (
                <div className="meta">Keine Slots</div>
              ) : (
                slots.map((slot, idx) => {
                  const status = slotStatus(slot);
                  const inner = (
                    <>
                      <strong>{slotTime(slot)}</strong>
                      <span> {status === "free" ? "frei" : status === "occupied" ? "belegt" : "?"}</span>
                    </>
                  );
                  return status === "free" ? (
                    <a
                      key={`${day.date}-${idx}`}
                      className="slot free"
                      href={bookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {inner}
                    </a>
                  ) : (
                    <div key={`${day.date}-${idx}`} className={`slot ${status}`}>
                      {inner}
                    </div>
                  );
                })
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
