module.exports = function analyze(text) {
  text = (text || "").toLowerCase();

  if (text.includes("chest pain")) {
    return {
      condition: "Possible serious condition",
      firstAid: "Seek immediate medical attention",
      consult: "Go to hospital immediately",
    };
  }

  if (text.includes("fever") && text.includes("cough")) {
    return {
      condition: "Possible infection",
      firstAid: "Rest and stay hydrated",
      consult: "Consult doctor if fever lasts more than 2 days",
    };
  }

  return {
    condition: "General health concern",
    firstAid: "Rest and observe",
    consult: "Consult doctor if symptoms persist",
  };
};
