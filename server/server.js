const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");
const transcriptionRoutes = require("./routes/transcriptionRoutes");
const communityRoutes = require("./routes/communityRoutes");

const app = express();

// Connect to Database
connectDB();

// Security and utility middleware
app.use(helmet({
  crossOriginResourcePolicy: false, // Required to allow loading local audio files in client
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev")); // HTTP request logger

// Serve uploaded audio files statically so they can be streamed by client
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/transcriptions", transcriptionRoutes);
app.use("/api/communities", communityRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("Speech-to-Text SaaS Platform API Running Successfully");
});

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error("[Global Error Handler]:", err.stack || err.message);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    // Only return stack trace in development
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});