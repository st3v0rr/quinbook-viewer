const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// API routes
const slotsRouter = require("./routes/slots");
app.use("/api/slots", slotsRouter);

// Serve React build
app.use(express.static(path.join(__dirname, "../public")));

// SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(PORT, () => {
  console.log(`Quinbook Slot Viewer running on http://localhost:${PORT}`);
});
