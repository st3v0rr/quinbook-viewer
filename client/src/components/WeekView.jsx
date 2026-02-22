import SlotGrid from "./SlotGrid";

const DAY_LABELS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

function addDays(dateStr, days) {
  const date = new Date(`${dateStr}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export default function WeekView({ weekStart, data }) {
  const days = DAY_LABELS.map((label, idx) => {
    const date = addDays(weekStart, idx);
    return {
      label,
      date,
      slots: data?.[date] ?? [],
    };
  });

  return <SlotGrid days={days} />;
}
