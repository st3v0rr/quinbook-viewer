import SlotGrid from "./SlotGrid";

const DAY_LABELS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const today = new Date().toISOString().slice(0, 10);

function addDays(dateStr, days) {
  const date = new Date(`${dateStr}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export default function WeekView({ weekStart, data, bookingUrl, loading }) {
  const days = DAY_LABELS.map((label, idx) => {
    const date = addDays(weekStart, idx);
    return {
      label,
      date,
      slots: data?.[date] ?? [],
      isToday: date === today,
    };
  });

  return <SlotGrid days={days} bookingUrl={bookingUrl} loading={loading} />;
}
