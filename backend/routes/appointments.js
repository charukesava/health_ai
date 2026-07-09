const express = require("express");
const router = express.Router();
const { verifyToken, verifyAdmin } = require("../middleware/auth");
const { auditLog, logDataAccess } = require("../middleware/auditLog");
const { encryptFields, decryptFields } = require("../utils/encryption");
const rateLimit = require("express-rate-limit");
const { ADMIN_EMAILS_SET } = require("../config/adminConfig");

// ─── Validation Regexes ───────────────────────────────────────────────────
const VALIDATION = {
  // Date: YYYY-MM-DD
  date: /^\d{4}-\d{2}-\d{2}$/,
  // Time: HH:MM (24-hour format)
  time: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
  // Email: basic validation
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  // Phone: 10-15 digits, may include +, -, (), spaces
  phone: /^[\d\s\-+()]{10,15}$/,
  // Patient Name: alphanumeric, spaces, hyphens, periods (no special chars)
  name: /^[a-zA-Z\s\-']{2,100}$/,
  // Hospital Name: alphanumeric, spaces, hyphens, ampersands
  hospitalName: /^[a-zA-Z0-9\s\-&']{2,150}$/,
  // Department: letters, spaces, hyphens, slashes
  department: /^[a-zA-Z\s\-/]{2,100}$/,
};

const MAX_LENGTHS = {
  userId: 200,
  userEmail: 200,
  hospitalName: 200,
  department: 100,
  patientName: 100,
  phone: 20,
  notes: 1000,
};

// Helper: Validate input against regex
const validateField = (value, regex, fieldName) => {
  if (typeof value !== "string" || !regex.test(value.trim())) {
    throw new Error(`Invalid ${fieldName} format`);
  }
};

// Helper: Sanitize string input
const sanitize = (value, maxLength = 200) => {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
};

// Max 10 appointment creations per IP per hour
const appointmentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many appointment requests. Please try again later." },
});

// ─── O(1) Map-based in-memory stores ───────────────────────────
// Map<id, appointment>  — O(1) find, delete, update
const appointmentsMap = new Map();
let appointmentIdCounter = 1;

// Map<id, notification>  — O(1) find/update
const notificationsMap = new Map();
let notificationIdCounter = 1;

// Indexes for O(1) filtered queries
// Map<userId, Set<notificationId>>
const notifsByUser = new Map();
// Unread admin notification IDs
const adminUnreadIds = new Set();

/**
 * POST /api/appointments
 * Create a new appointment with comprehensive input validation.
 * Returns: 201 with appointment object, or 400 with validation error
 */
router.post("/", appointmentLimiter, (req, res) => {
  try {
    const {
      userId,
      userEmail,
      hospitalName,
      department,
      date,
      time,
      patientName,
      notes,
      phone,
    } = req.body;

    // ─── Validate required fields exist ───────────────────
    if (!userId || !hospitalName || !date || !time || !patientName) {
      return res.status(400).json({
        error:
          "Missing required fields: userId, hospitalName, date, time, patientName",
      });
    }

    // ─── Validate types ──────────────────────────────────
    if (typeof userId !== "string" || typeof hospitalName !== "string") {
      return res
        .status(400)
        .json({ error: "userId and hospitalName must be strings" });
    }

    // ─── Validate formats using regex ────────────────────
    try {
      validateField(date, VALIDATION.date, "date (YYYY-MM-DD)");
      validateField(time, VALIDATION.time, "time (HH:MM)");
      validateField(patientName, VALIDATION.name, "patientName");
      validateField(hospitalName, VALIDATION.hospitalName, "hospitalName");

      if (userEmail && userEmail.trim()) {
        validateField(userEmail, VALIDATION.email, "email");
      }

      if (phone && phone.trim()) {
        validateField(phone, VALIDATION.phone, "phone");
      }

      if (department && department.trim()) {
        validateField(department, VALIDATION.department, "department");
      }
    } catch (validationErr) {
      return res.status(400).json({ error: validationErr.message });
    }

    // ─── Sanitize all string fields ──────────────────────
    const newAppointment = {
      id: appointmentIdCounter++,
      userId: sanitize(userId, MAX_LENGTHS.userId),
      userEmail: sanitize(userEmail, MAX_LENGTHS.userEmail),
      hospitalName: sanitize(hospitalName, MAX_LENGTHS.hospitalName),
      department: sanitize(department, MAX_LENGTHS.department),
      date: date,
      time: time,
      patientName: sanitize(patientName, MAX_LENGTHS.patientName),
      notes: sanitize(notes, MAX_LENGTHS.notes),
      phone: sanitize(phone, MAX_LENGTHS.phone),
      status: "Pending",
      adminNotes: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 🔐 ENCRYPT sensitive medical data (HIPAA compliance)
    const fieldsToEncrypt = ["patientName", "phone", "notes"];
    const encryptedAppointment = encryptFields(newAppointment, fieldsToEncrypt);

    appointmentsMap.set(encryptedAppointment.id, encryptedAppointment);

    // 📝 LOG appointment creation for audit trail
    auditLog(`APPOINTMENT_CREATED`, "INFO", {
      appointmentId: encryptedAppointment.id,
      userId: userId,
      hospitalName: hospitalName,
      date: date,
      timestamp: new Date().toISOString(),
    });

    // Create admin notification
    createAdminNotification(
      `New Appointment Request: ${patientName} at ${hospitalName}`,
      `Patient: ${patientName} (${phone}) has requested an appointment on ${date} at ${time} for ${department}`,
      "appointment",
      encryptedAppointment.id,
    );

    // 📤 Decrypt before sending to client (for confirmation display)
    const fieldsToReturn = ["patientName", "phone", "notes"];
    const responseAppointment = decryptFields(
      encryptedAppointment,
      fieldsToReturn,
    );

    res.status(201).json(responseAppointment);
  } catch (err) {
    console.error("[Appointments POST Error]", err.message);
    res.status(500).json({ error: "Failed to create appointment" });
  }
});

/**
 * Helper – create admin notification — O(1) insert
 */
function createAdminNotification(title, message, type, appointmentId) {
  const notification = {
    id: notificationIdCounter++,
    title,
    message,
    type,
    appointmentId,
    isRead: false,
    createdAt: new Date().toISOString(),
    targetAdmins: [...ADMIN_EMAILS_SET],
  };
  notificationsMap.set(notification.id, notification);
  adminUnreadIds.add(notification.id);
  return notification;
}

/**
 * GET /api/appointments/admin/notifications — admin only
 */
router.get("/admin/notifications", verifyToken, verifyAdmin, (req, res) => {
  try {
    const unread = [...adminUnreadIds].map((id) => notificationsMap.get(id));
    res.json(unread);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

/**
 * PUT /api/appointments/admin/notifications/:id/read — admin only
 */
router.put(
  "/admin/notifications/:id/read",
  verifyToken,
  verifyAdmin,
  (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const notification = notificationsMap.get(id);
      if (!notification)
        return res.status(404).json({ error: "Notification not found" });
      notification.isRead = true;
      adminUnreadIds.delete(id); // O(1) removal
      res.json(notification);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  },
);

/**
 * GET /api/appointments — admin only: returns all appointments
 */
router.get("/", verifyToken, verifyAdmin, (req, res) => {
  try {
    // 📝 LOG data access for audit trail
    logDataAccess("appointments", req.uid, req.ip);

    // Map preserves insertion order; sort descending by createdAt
    const all = [...appointmentsMap.values()]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map((apt) => {
        // 🔓 DECRYPT sensitive fields for admin viewing
        const fieldsToDecrypt = ["patientName", "phone", "notes"];
        return decryptFields(apt, fieldsToDecrypt);
      });

    res.json(all);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

/**
 * GET /api/appointments/user/:uid — O(n) scan (acceptable; no per-user index needed for small data)
 */
router.get("/user/:uid", (req, res) => {
  try {
    const { uid } = req.params;

    // 📝 LOG data access for audit trail
    logDataAccess("appointments:user", uid, req.ip);

    const result = [];
    for (const a of appointmentsMap.values()) {
      if (a.userId === uid) {
        // 🔓 DECRYPT sensitive fields for user viewing
        const fieldsToDecrypt = ["patientName", "phone", "notes"];
        result.push(decryptFields(a, fieldsToDecrypt));
      }
    }
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch user appointments" });
  }
});

/**
 * GET /api/appointments/hospital/:hospitalName — O(n) scan
 */
router.get("/hospital/:hospitalName", (req, res) => {
  try {
    // 📝 LOG data access for audit trail
    logDataAccess("appointments:hospital", req.params.hospitalName, req.ip);

    const decodedName = decodeURIComponent(
      req.params.hospitalName,
    ).toLowerCase();
    const result = [];
    for (const a of appointmentsMap.values()) {
      if (a.hospitalName.toLowerCase() === decodedName) {
        // 🔓 DECRYPT sensitive fields
        const fieldsToDecrypt = ["patientName", "phone", "notes"];
        result.push(decryptFields(a, fieldsToDecrypt));
      }
    }
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch hospital appointments" });
  }
});

/**
 * PUT /api/appointments/:id/status — admin only
 */
router.put("/:id/status", verifyToken, verifyAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (!["Pending", "Approved", "Rejected", "Completed"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const appointment = appointmentsMap.get(parseInt(id)); // O(1)
    if (!appointment)
      return res.status(404).json({ error: "Appointment not found" });

    const oldStatus = appointment.status;

    appointment.status = status;
    appointment.adminNotes = adminNotes || appointment.adminNotes;
    appointment.updatedAt = new Date().toISOString();

    auditLog("APPOINTMENT_STATUS_UPDATED", "INFO", {
      appointmentId: id,
      adminId: req.uid,
      oldStatus,
      newStatus: status,
      timestamp: new Date().toISOString(),
    });

    // Create user notification
    const statusMessages = {
      Approved: "Your appointment has been approved!",
      Rejected: "Your appointment request has been rejected.",
      Completed: "Your appointment has been completed.",
      Pending: "Your appointment is being reviewed.",
    };

    createUserNotification(
      appointment.userId,
      `Appointment Status Updated: ${status}`,
      statusMessages[status],
      "appointment",
      appointment.id,
    );

    // 🔓 DECRYPT sensitive fields before sending to client
    const fieldsToDecrypt = ["patientName", "phone", "notes"];
    const responseAppointment = decryptFields(appointment, fieldsToDecrypt);

    res.json(responseAppointment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update appointment status" });
  }
});

/**
 * Helper – create user notification — O(1) insert
 */
function createUserNotification(userId, title, message, type, appointmentId) {
  const notification = {
    id: notificationIdCounter++,
    userId,
    title,
    message,
    type,
    appointmentId,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  notificationsMap.set(notification.id, notification);
  // Maintain per-user index
  if (!notifsByUser.has(userId)) notifsByUser.set(userId, new Set());
  notifsByUser.get(userId).add(notification.id);
  return notification;
}

/**
 * GET /api/appointments/user/:uid/notifications — O(k) where k = user's notif count
 */
router.get("/user/:uid/notifications", (req, res) => {
  try {
    const { uid } = req.params;
    const ids = notifsByUser.get(uid) || new Set();
    const result = [...ids]
      .map((id) => notificationsMap.get(id))
      .filter(Boolean);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

/**
 * GET /api/appointments/:id — O(1)
 */
router.get("/:id", (req, res) => {
  try {
    const appointment = appointmentsMap.get(parseInt(req.params.id));
    if (!appointment)
      return res.status(404).json({ error: "Appointment not found" });
    const fieldsToDecrypt = ["patientName", "phone", "notes"];

    const responseAppointment = decryptFields(appointment, fieldsToDecrypt);

    res.json(responseAppointment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch appointment" });
  }
});

/**
 * DELETE /api/appointments/:id — owner or admin only
 */
router.delete("/:id", verifyToken, (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const appointment = appointmentsMap.get(id);
    if (!appointment)
      return res.status(404).json({ error: "Appointment not found" });
    // Only the owner or an admin can cancel
    if (appointment.userId !== req.uid && !req.isAdmin) {
      return res.status(403).json({
        error: "Forbidden: you can only cancel your own appointments",
      });
    }
    appointmentsMap.delete(id); // O(1)
    res.json({ message: "Appointment cancelled", appointment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to cancel appointment" });
  }
});

module.exports = router;
