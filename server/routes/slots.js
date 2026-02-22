const express = require("express");
const router = express.Router();
const quinbook = require("../quinbookClient");

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function timeInRange(timeStr, from, to) {
  if (!from && !to) return true;
  const t = timeStr.slice(0, 5); // "HH:MM"
  if (from && t < from) return false;
  if (to && t > to) return false;
  return true;
}

// GET /api/slots/week/:date
router.get("/week/:date", async (req, res) => {
  const { date } = req.params;
  try {
    const dates = Array.from({ length: 7 }, (_, i) => addDays(date, i));
    const results = await Promise.all(
      dates.map((d) => quinbook.getSlots(d).then((slots) => ({ date: d, slots })))
    );
    const data = {};
    for (const { date: d, slots } of results) {
      data[d] = slots;
    }
    res.json(data);
  } catch (err) {
    console.error("week fetch error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/slots/next?from=YYYY-MM-DD&timeFrom=HH:MM&timeTo=HH:MM
router.get("/next", async (req, res) => {
  const from = req.query.from || todayStr();
  const timeFrom = req.query.timeFrom || null;
  const timeTo = req.query.timeTo || null;

  try {
    for (let i = 0; i < 60; i++) {
      const date = addDays(from, i);
      const slots = await quinbook.getSlots(date);
      const slotList = Array.isArray(slots) ? slots : slots?.slots ?? [];

      const freeSlot = slotList.find(
        (s) =>
          !s.occupied &&
          s.available !== false &&
          timeInRange(s.time ?? s.start ?? "", timeFrom, timeTo)
      );

      if (freeSlot) {
        return res.json({ date, slot: freeSlot });
      }
    }

    res.json({ date: null, slot: null });
  } catch (err) {
    console.error("next slot error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
