function normalizeSlots(raw) {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.slots)) return raw.slots;
  return [];
}

function slotTime(slot) {
  return slot.time || slot.start || slot.from || "--:--";
}

function slotStatus(slot) {
  if (slot.occupied === true) return "occupied";
  if (slot.occupied === false || slot.available === true) return "free";
  if (slot.available === false) return "occupied";
  return "unknown";
}

export default function SlotGrid({ days }) {
  return (
    <div className="week-grid">
      {days.map((day) => {
        const slots = normalizeSlots(day.slots);
        return (
          <section key={day.date} className="day-col">
            <div className="day-head">
              <div>{day.label}</div>
              <div className="meta">{day.date}</div>
            </div>

            <div className="slot-list">
              {slots.length === 0 ? (
                <div className="meta">Keine Slots</div>
              ) : (
                slots.map((slot, idx) => {
                  const status = slotStatus(slot);
                  return (
                    <div key={`${day.date}-${idx}`} className={`slot ${status}`}>
                      <strong>{slotTime(slot)}</strong>
                      <span> {status === "free" ? "frei" : status === "occupied" ? "belegt" : "?"}</span>
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
