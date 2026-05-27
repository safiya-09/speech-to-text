const fs = require("fs");
const path = require("path");
const Transcription = require("../models/Transcription");
const { transcribeAudio } = require("../services/transcriptionService");

// @desc    Upload audio file and transcribe it
// @route   POST /api/transcriptions/upload
// @access  Public
const uploadAndTranscribe = async (req, res, next) => {
  let filePathToDelete = null;
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload an audio file" });
    }

    const { title, language } = req.body;
    const originalName = req.file.originalname;
    const fileSize = req.file.size;
    const filePath = req.file.path;
    const fileName = req.file.filename;
    filePathToDelete = filePath; // Track file for cleanup if DB fails

    // Create a local audio URL for streaming
    const protocol = req.protocol;
    const host = req.get("host");
    const audioUrl = `${protocol}://${host}/uploads/${fileName}`;

    // Create initial pending record in MongoDB
    let transcription;
    try {
      transcription = await Transcription.create({
        title: title || originalName.substring(0, originalName.lastIndexOf(".")) || "Untitled Audio",
        audioUrl: audioUrl,
        originalFileName: originalName,
        fileSize: fileSize,
        duration: req.body.duration ? parseFloat(req.body.duration) : Math.round(fileSize / 15000), // Estimation fallback
        transcriptionStatus: "processing",
        language: language || "en",
      });
    } catch (dbErr) {
      console.error("[Transcription Controller] DB Record Creation failed:", dbErr.message);
      // Clean up local file since record was not stored
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(500).json({
        success: false,
        message: "Failed to store record in database",
      });
    }

    try {
      // Trigger transcription
      const result = await transcribeAudio(filePath, language);

      // Update transcription in database
      transcription.transcriptionText = result.text;
      transcription.transcriptionStatus = "completed";
      if (result.language) {
        transcription.language = result.language;
      }
      await transcription.save();

      res.status(201).json({
        success: true,
        data: transcription,
      });
    } catch (err) {
      // If transcription service fails, update status to failed
      transcription.transcriptionStatus = "failed";
      await transcription.save();
      
      res.status(500).json({
        success: false,
        message: err.message || "Failed to transcribe audio",
        data: transcription,
      });
    }
  } catch (error) {
    console.error("[Transcription Controller Error]:", error);
    // Cleanup file if an early error occurs
    if (filePathToDelete && fs.existsSync(filePathToDelete)) {
      try {
        fs.unlinkSync(filePathToDelete);
      } catch (cleanErr) {
        console.error("Failed to clean up audio file after error:", cleanErr.message);
      }
    }
    res.status(500).json({
      success: false,
      message: error.message || "Failed to process audio transcription",
    });
  }
};

// @desc    Get all transcriptions
// @route   GET /api/transcriptions
// @access  Public
const getAllTranscriptions = async (req, res) => {
  try {
    const transcriptions = await Transcription.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: transcriptions.length,
      data: transcriptions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch transcriptions",
    });
  }
};

// @desc    Get transcription by ID
// @route   GET /api/transcriptions/:id
// @access  Public
const getTranscriptionById = async (req, res) => {
  try {
    const transcription = await Transcription.findById(req.params.id);

    if (!transcription) {
      return res.status(404).json({
        success: false,
        message: "Transcription not found",
      });
    }

    res.status(200).json({
      success: true,
      data: transcription,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch transcription",
    });
  }
};

// @desc    Delete transcription
// @route   DELETE /api/transcriptions/:id
// @access  Public
const deleteTranscription = async (req, res) => {
  try {
    const transcription = await Transcription.findById(req.params.id);

    if (!transcription) {
      return res.status(404).json({
        success: false,
        message: "Transcription not found",
      });
    }

    // Try to remove local file if it exists
    if (transcription.audioUrl) {
      try {
        const fileName = transcription.audioUrl.split("/uploads/")[1];
        if (fileName) {
          const filePath = path.join(__dirname, "../uploads", fileName);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Successfully deleted audio file: ${filePath}`);
          }
        }
      } catch (fileErr) {
        console.error("Failed to delete local audio file:", fileErr.message);
      }
    }

    await transcription.deleteOne();

    res.status(200).json({
      success: true,
      message: "Transcription deleted successfully",
    });
  } catch (error) {
    console.error("[Delete Controller Error]:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete transcription",
    });
  }
};

module.exports = {
  uploadAndTranscribe,
  getAllTranscriptions,
  getTranscriptionById,
  deleteTranscription,
};
