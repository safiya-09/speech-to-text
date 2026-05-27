const express = require("express");
const upload = require("../middleware/upload");
const {
  uploadAndTranscribe,
  getAllTranscriptions,
  getTranscriptionById,
  deleteTranscription,
} = require("../controllers/transcriptionController");

const router = express.Router();

// POST /api/transcriptions/upload
router.post("/upload", upload.single("audio"), uploadAndTranscribe);

// GET /api/transcriptions
router.get("/", getAllTranscriptions);

// GET /api/transcriptions/:id
router.get("/:id", getTranscriptionById);

// DELETE /api/transcriptions/:id
router.delete("/:id", deleteTranscription);

module.exports = router;
