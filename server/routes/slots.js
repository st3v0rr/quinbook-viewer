const express = require("express");
const router = express.Router();
const { client: quinbook, ROOMS } = require("../quinbookClient");

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function slotTimeStr(slot) {
  const s = slot.start ?? "";
  return s.includes("T") ? s.slice(11, 16) : s.slice(0, 5);
}

function timeInRange(timeStr, from, to) {
  if (!from && !to) return true;
  const t = timeStr.slice(0, 5);
  if (from && t < from) return false;
  if (to && t > to) return false;
  return true;
}

function extractSlots(dayData) {
  return (dayData?.events ?? []).flatMap((e) => e.slots ?? []);
}

function resolveRoom(req, res) {
  const roomKey = req.query.room || "prestige";
  if (!ROOMS[roomKey]) {
    res.status(400).json({ error: `Unknown room: ${roomKey}` });
    return null;
  }
  return roomKey;
}

// GET /api/rooms
router.get("/rooms", (req, res) => {
  const rooms = Object.entries(ROOMS).map(([key, r]) => ({
    key,
    label: r.label,
    bookingUrl: r.bookingUrl,
  }));
  res.json(rooms);
});

// GET /api/slots/week/:date?room=prestige
router.get("/week/:date", async (req, res) => {
  const roomKey = resolveRoom(req, res);
  if (!roomKey) return;
  const { date } = req.params;

  try {
    const dates = Array.from({ length: 7 }, (_, i) => addDays(date, i));
    const results = await Promise.all(
      dates.map((d) =>
        quinbook.getSlots(roomKey, d).then((dayData) => {
          const slots = extractSlots(dayData);
          console.log(`[slots] ${roomKey} ${d}: ${slots.length} slots`);
          return { date: d, slots };
        })
      )
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

// GET /api/slots/next?room=prestige&from=YYYY-MM-DD&timeFrom=HH:MM&timeTo=HH:MM&days=1,2
router.get("/next", async (req, res) => {
  const roomKey = resolveRoom(req, res);
  if (!roomKey) return;
  const from = req.query.from || todayStr();
  const timeFrom = req.query.timeFrom || null;
  const timeTo = req.query.timeTo || null;
  const allowedDays = req.query.days ? req.query.days.split(",").map(Number) : null;

  console.log(`[next] room=${roomKey} from=${from} timeFrom=${timeFrom} timeTo=${timeTo} days=${allowedDays ?? "all"}`);

  try {
    for (let i = 0; i < 180; i++) {
      const date = addDays(from, i);

      if (allowedDays) {
        const dow = new Date(date + "T00:00:00Z").getUTCDay();
        if (!allowedDays.includes(dow)) continue;
      }

      const dayData = await quinbook.getSlots(roomKey, date);
      const slots = extractSlots(dayData);

      const freeSlot = slots.find(
        (s) => s.available === true && timeInRange(slotTimeStr(s), timeFrom, timeTo)
      );

      if (slots.length > 0) {
        console.log(`[next] ${date}: ${slots.length} slots, free in range: ${freeSlot ? slotTimeStr(freeSlot) : "none"}`);
      }

      if (freeSlot) {
        console.log(`[next] found: ${date} ${slotTimeStr(freeSlot)}`);
        return res.json({ date, slot: freeSlot });
      }
    }

    console.log(`[next] no slot found within 180 days`);
    res.json({ date: null, slot: null });
  } catch (err) {
    console.error("next slot error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
