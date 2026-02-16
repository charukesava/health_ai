const express = require("express");
const router = express.Router();

router.post("/", (req, res) => {
  const { symptoms } = req.body;

  if (!symptoms) {
    return res.status(400).json({
      error: "Symptoms are required",
    });
  }

  const text = symptoms.toLowerCase();

  let response = {
    possibleCondition: "General illness",
    advice: "Rest and monitor your symptoms",
    consultDoctor: "If symptoms persist for more than 2 days",
    disclaimer: "This is not a medical diagnosis. Please consult a doctor.",
  };

  if (text.includes("fever")) {
    response.possibleCondition = "Fever or viral infection";
    response.advice = "Drink fluids, rest, and take paracetamol if needed";
  }

  if (text.includes("cough")) {
    response.possibleCondition = "Respiratory infection";
    response.advice = "Warm fluids, avoid cold air, monitor breathing";
  }

  if (text.includes("chest pain")) {
    response.possibleCondition = "Possible cardiac or respiratory issue";
    response.consultDoctor = "Seek medical attention immediately";
  }

  return res.json(response);
});

module.exports = router;
