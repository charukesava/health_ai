// backend/routes/hospitalUpdates.js
const express = require("express");
const router = express.Router();

// In-memory storage for hospital updates (reset when server restarts)
let updates = [
  {
    id: 1,
    hospitalName: "AIIMS, New Delhi",
    location: "New Delhi",
    title: "New OPD Timings",
    description: "OPD timings updated from 8:00 AM to 2:00 PM on weekdays.",
    date: new Date().toISOString().slice(0, 10),
  },
];

// GET: list all updates
router.get("/", (req, res) => {
  res.json(updates);
});

// POST: create new update (used by AdminUpdates.js)
router.post("/", (req, res) => {
  const { hospitalName, location, title, description, email } = req.body || {};

  if (!hospitalName || !location || !title || !description) {
    return res
      .status(400)
      .json({
        error: "hospitalName, location, title, description are required",
      });
  }

  const newUpdate = {
    id: updates.length ? updates[updates.length - 1].id + 1 : 1,
    hospitalName,
    location,
    title,
    description,
    date: new Date().toISOString().slice(0, 10),
    postedBy: email || null,
  };

  updates.push(newUpdate);
  res.status(201).json(newUpdate);
});

module.exports = router;
