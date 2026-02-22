function fmtDate(dateStr) {
  return dateStr.slice(8, 10) + "." + dateStr.slice(5, 7) + "." + dateStr.slice(0, 4);
}

function normalizeSlots(raw) {
  if (Array.isArray(raw)) return raw;
  return [];
}

function slotTime(slot) {
  const s = slot.start || slot.time || slot.from || "";
  return s.includes("T") ? s.slice(11, 16) : (s.slice(0, 5) || "--:--");
}

function slotStatus(slot) {
  if (slot.available === true || slot.display === "available") return "free";
  if (slot.available === false || slot.display === "occupied") return "occupied";
  return "unknown";
}

function slotIcon(status) {
  if (status === "free") return "🔓";
  if (status === "occupied") return "🔒";
  return "·";
}

function slotStatusLabel(status) {
  if (status === "free") return "frei";
  if (status === "occupied") return "belegt";
  return "?";
}

const SKELETON_ROWS = [null, null, null];

export default function SlotGrid({ days, bookingUrl, loading }) {
  return (
    <div className="week-grid">
      {days.map((day) => {
        const slots = normalizeSlots(day.slots);
        const showSkeleton = loading && slots.length === 0;

        return (
          <section key={day.date} className={`day-col${day.isToday ? " today" : ""}`}>
            <div className="day-head">
              <div className="day-label">{day.label}</div>
              <div className="day-date">{fmtDate(day.date)}</div>
            </div>

            <div className="slot-list">
              {showSkeleton ? (
                SKELETON_ROWS.map((_, idx) => (
                  <div key={idx} className="slot skeleton">
                    <span className="slot-icon">·</span>
                    <time>00:00</time>
                  </div>
                ))
              ) : slots.length === 0 ? (
                <div className="no-slots">Keine Slots</div>
              ) : (
                slots.map((slot, idx) => {
                  const status = slotStatus(slot);
                  const inner = (
                    <>
                      <span className="slot-icon">{slotIcon(status)}</span>
                      <time>{slotTime(slot)}</time>
                      <span className="slot-label">{slotStatusLabel(status)}</span>
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
