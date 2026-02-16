const router = require("express").Router();

router.post("/", (req, res) => {
  console.log("EMERGENCY ALERT:", req.body);
  res.json({ status: "Alert sent (mock)" });
});

module.exports = router;
