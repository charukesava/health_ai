const router = require("express").Router();
const multer = require("multer");

const upload = multer();

router.post("/", upload.single("image"), (req, res) => {
  const category = req.body.category;
  let severity = "Low";

  if (category === "wound") severity = "Medium";
  if (category === "other") severity = "High";

  res.json({
    category,
    severity,
    advice: "Consult a doctor if condition worsens",
    disclaimer: "Mock image analysis. Educational only.",
  });
});

module.exports = router;
