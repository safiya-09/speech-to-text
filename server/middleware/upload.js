const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique name: timestamp-random-originalName
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// File Filter for Audio/Video formats: mp3, wav, m4a, mp4, webm
const fileFilter = (req, file, cb) => {
  const allowedExtensions = [".mp3", ".wav", ".m4a", ".mp4", ".webm"];
  const ext = path.extname(file.originalname).toLowerCase();

  // Validate file extension
  if (!allowedExtensions.includes(ext)) {
    return cb(
      new Error(`Unsupported file extension ${ext}. Allowed: mp3, wav, m4a, mp4, webm`),
      false
    );
  }

  // Validate mime type (optional support, some systems upload wav/m4a with generic types)
  const allowedMimeTypes = [
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/x-wav",
    "audio/wave",
    "audio/mp4",
    "audio/x-m4a",
    "audio/m4a",
    "video/mp4",
    "audio/webm",
    "video/webm",
    "application/octet-stream", // Fallback for raw streams
  ];

  if (!allowedMimeTypes.includes(file.mimetype) && !file.mimetype.startsWith("audio/")) {
    // We can be slightly lenient with audio mime types since different clients send different headers,
    // but check the extension as the source of truth
    console.warn(`Unexpected MIME type: ${file.mimetype}, relying on extension: ${ext}`);
  }

  cb(null, true);
};

// Size limits: 25MB (Whisper's absolute limit is 25MB)
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB
  },
});

module.exports = upload;
