const mongoose = require("mongoose");

const TranscriptionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a title"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    audioUrl: {
      type: String,
      required: [true, "Audio URL or local path is required"],
    },
    originalFileName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number, // in bytes
      required: true,
    },
    duration: {
      type: Number, // in seconds
      default: 0,
    },
    transcriptionText: {
      type: String,
      default: "",
    },
    language: {
      type: String,
      default: "en",
    },
    transcriptionStatus: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Make it optional for anonymous/public uploads
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
TranscriptionSchema.index({ uploadedBy: 1 });
TranscriptionSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Transcription", TranscriptionSchema);
