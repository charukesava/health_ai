const express = require("express");
const router = express.Router();

// In-memory storage for appointments (replace with database in production)
let appointmentsDB = [];
let appointmentIdCounter = 1;

/**
 * POST /api/appointments
 * Create a new appointment
 */
router.post("/", (req, res) => {
  try {
    const { userId, hospitalName, department, date, time, patientName, notes } =
      req.body;

    if (!userId || !hospitalName || !date || !time) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newAppointment = {
      id: appointmentIdCounter++,
      userId,
      hospitalName,
      department,
      date,
      time,
      patientName,
      notes,
      status: "Pending",
      createdAt: new Date().toISOString(),
    };

    appointmentsDB.push(newAppointment);
    res.status(201).json(newAppointment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create appointment" });
  }
});

/**
 * GET /api/appointments/user/:uid
 * Get all appointments for a specific user
 */
router.get("/user/:uid", (req, res) => {
  try {
    const { uid } = req.params;
    const userAppointments = appointmentsDB.filter((a) => a.userId === uid);
    res.json(userAppointments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch user appointments" });
  }
});

/**
 * GET /api/appointments/hospital/:hospitalName
 * Get all appointments for a specific hospital
 */
router.get("/hospital/:hospitalName", (req, res) => {
  try {
    const { hospitalName } = req.params;
    const decodedName = decodeURIComponent(hospitalName);
    const hospitalAppointments = appointmentsDB.filter(
      (a) => a.hospitalName.toLowerCase() === decodedName.toLowerCase(),
    );
    res.json(hospitalAppointments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch hospital appointments" });
  }
});

/**
 * PUT /api/appointments/:id/status
 * Update appointment status (for hospital/admin)
 */
router.put("/:id/status", (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Pending", "Approved", "Rejected", "Completed"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const appointment = appointmentsDB.find((a) => a.id === parseInt(id));

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    appointment.status = status;
    res.json(appointment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update appointment status" });
  }
});

/**
 * GET /api/appointments/:id
 * Get a specific appointment
 */
router.get("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const appointment = appointmentsDB.find((a) => a.id === parseInt(id));

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.json(appointment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch appointment" });
  }
});

/**
 * DELETE /api/appointments/:id
 * Cancel/Delete an appointment
 */
router.delete("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const index = appointmentsDB.findIndex((a) => a.id === parseInt(id));

    if (index === -1) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    const deletedAppointment = appointmentsDB.splice(index, 1);
    res.json({
      message: "Appointment cancelled",
      appointment: deletedAppointment[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to cancel appointment" });
  }
});

module.exports = router;
