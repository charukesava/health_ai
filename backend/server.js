require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const app = express();

app.set("trust proxy", 1);

// ─── Environment validation ──────────────────────────────────────────────────
const { validateAllSecurity } = require("./config/envValidator");
validateAllSecurity();

// ─── Security middleware ─────────────────────────────────────────────────────
const {
  securityHeaders,
  sanitizeInputs,
  validateContentType,
} = require("./middleware/security");
const { auditMiddleware } = require("./middleware/auditLog");

// ─── Rate limiting configuration ──────────────────────────────────────────────
const {
  generalLimiter,
  authLimiter,
  sensitiveOpsLimiter,
  appointmentLimiter,
  aiChatLimiter,
  feedbackLimiter,
  emergencyLimiter,
} = require("./config/rateLimits");

// ─── Enhanced Helmet security headers ─────────────────────────────────────────
// CSP (Content Security Policy) to prevent XSS and injection attacks
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"], // Restrict to same-origin and inline
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        fontSrc: ["'self'"],
        connectSrc: ["'self'", "https://generativelanguage.googleapis.com"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
      },
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: { policy: "no-referrer" },
    permissionsPolicy: {
      camera: [],
      microphone: [],
      geolocation: ["self"],
    },
  }),
);

// ─── Request validation middleware ───────────────────────────────────────────
app.use(validateContentType);
app.use(securityHeaders);
app.use(auditMiddleware);

const analyzeRoutes = require("./routes/analyze");
const imageAnalyzeRoutes = require("./routes/imageAnalyze");
const appointmentsRoutes = require("./routes/appointments");
const doctorsRoutes = require("./routes/doctors");
const emergencyRoutes = require("./routes/emergency");
const feedbackRoutes = require("./routes/feedback");
const hospitalUpdatesRoutes = require("./routes/hospitalUpdates");
const hospitalsRoutes = require("./routes/hospitals");
const aiChat = require("./routes/aiChat");

// ─── CORS configuration with origin validation ──────────────────────────────
const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
];

const ALLOWED_ORIGINS = [
  ...new Set([
    ...DEFAULT_ALLOWED_ORIGINS,
    ...(process.env.ALLOWED_ORIGINS || "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  ]),
];

// Log allowed origins in development only
if (process.env.NODE_ENV !== "production") {
  console.log("📍 Allowed CORS origins:", ALLOWED_ORIGINS);
}

app.use(
  cors({
    origin: (origin, cb) => {
      // allow server-to-server (no origin) and whitelisted origins
      if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);

      // Log rejected origins for security audit
      console.warn(`[CORS BLOCKED] Rejected origin: ${origin}`);
      cb(new Error(`CORS: origin '${origin}' not allowed`));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Allow cookies
    maxAge: 3600, // Cache preflight for 1 hour
  }),
);

// ─── Request size limit to prevent DoS attacks ──────────────────────────────
app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ limit: "50kb", extended: true }));

// ─── Input sanitization to prevent XSS ──────────────────────────────────────
app.use(sanitizeInputs);

// ─── Apply rate limiting to routes ───────────────────────────────────────────
app.use("/api/ai", aiChatLimiter, aiChat);

/* -------- ROUTES -------- */

app.use("/api/analyze", generalLimiter, analyzeRoutes);
app.use("/api/image-analyze", generalLimiter, imageAnalyzeRoutes);
app.use("/api/appointments", appointmentLimiter, appointmentsRoutes);
app.use("/api/doctors", generalLimiter, doctorsRoutes);
app.use("/api/emergency", emergencyLimiter, emergencyRoutes);
app.use("/api/feedback", feedbackLimiter, feedbackRoutes);
app.use("/api/hospital-updates", sensitiveOpsLimiter, hospitalUpdatesRoutes);
app.use("/api/hospitals", generalLimiter, hospitalsRoutes);

/* -------- 404 handler -------- */
app.use((req, res) => {
  res
    .status(404)
    .json({ error: `Route ${req.method} ${req.originalUrl} not found` });
});

/* -------- Global error handler -------- */
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("[Server Error]", err.stack || err.message);

  // Don't expose sensitive error details to client in production
  const isDevelopment = process.env.NODE_ENV !== "production";
  const errorMessage = isDevelopment
    ? err.message || "Internal server error"
    : "An error occurred. Please try again later.";

  const status = err.status || 500;

  res.status(status).json({
    error: errorMessage,
    ...(isDevelopment && { details: err.stack }), // Include stack only in dev
  });
});

/* -------- SERVER -------- */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
