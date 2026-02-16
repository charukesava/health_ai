require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = express();

const analyzeRoutes = require("./routes/analyze");
const imageAnalyzeRoutes = require("./routes/imageAnalyze");
const doctorsRoutes = require("./routes/doctors");
const emergencyRoutes = require("./routes/emergency");
const feedbackRoutes = require("./routes/feedback");
const hospitalUpdatesRoutes = require("./routes/HospitalUpdates");
const aiChat = require("./routes/aiChat");

app.use(cors());
app.use(express.json());
app.use("/api/ai", aiChat);

/* -------- ROUTES -------- */

app.use("/api/analyze", analyzeRoutes);
app.use("/api/image-analyze", imageAnalyzeRoutes);
app.use("/api/doctors", doctorsRoutes);
app.use("/api/emergency", emergencyRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/hospital-updates", hospitalUpdatesRoutes);

/* -------- SERVER -------- */

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
