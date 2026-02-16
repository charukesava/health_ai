const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const filePath = path.join(__dirname, "../data/feedback.json");

router.post("/", (req, res) => {
  const { rating, comment } = req.body;

  if (!rating) {
    return res.status(400).json({ error: "Rating is required" });
  }

  let feedbackData = [];

  try {
    if (fs.existsSync(filePath)) {
      feedbackData = JSON.parse(fs.readFileSync(filePath, "utf8"));
    }
  } catch (err) {
    console.error("Error reading feedback file:", err);
    return res.status(500).json({ error: "Failed to read feedback data" });
  }

  feedbackData.push({
    rating,
    comment: comment || "",
    date: new Date().toISOString(),
  });

  try {
    fs.writeFileSync(filePath, JSON.stringify(feedbackData, null, 2));
  } catch (err) {
    console.error("Error writing feedback file:", err);
    return res.status(500).json({ error: "Failed to save feedback" });
  }

  return res.json({ success: true });
});

router.get("/", (req, res) => {
  try {
    if (!fs.existsSync(filePath)) {
      return res.json([]);
    }
    const feedbackData = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return res.json(feedbackData);
  } catch (err) {
    console.error("Error reading feedback file:", err);
    return res.status(500).json({ error: "Failed to load feedback" });
  }
});

module.exports = router;
