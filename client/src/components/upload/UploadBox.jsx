import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileAudio, AlertTriangle, FileUp, X } from "lucide-react";

export default function UploadBox({ onFileSelected, isUploading }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const allowedExtensions = [".mp3", ".wav", ".m4a", ".mp4"];
  const maxSizeBytes = 25 * 1024 * 1024; // 25MB

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const validateFile = (file) => {
    setError("");
    if (!file) return false;

    const fileExt = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!allowedExtensions.includes(fileExt)) {
      setError(`Invalid format. Supported formats: ${allowedExtensions.join(", ")}`);
      return false;
    }

    if (file.size > maxSizeBytes) {
      setError("File size exceeds 25MB OpenAI Whisper limit.");
      return false;
    }

    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (isUploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleFileChange = (e) => {
    e.preventDefault();
    if (isUploading) return;

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerUpload = () => {
    if (selectedFile) {
      onFileSelected(selectedFile);
      setSelectedFile(null); // Clear after submitting
    }
  };

  const onBoxClick = () => {
    if (isUploading || selectedFile) return;
    fileInputRef.current.click();
  };

  const formatSize = (bytes) => {
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <div className="w-full space-y-4">
      <motion.div
        layout
        onClick={onBoxClick}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        animate={{
          borderColor: isDragActive ? "#a855f7" : "#1e293b",
          backgroundColor: isDragActive ? "rgba(88, 28, 135, 0.1)" : "rgba(15, 23, 42, 0.3)",
          boxShadow: isDragActive ? "0 0 15px rgba(168, 85, 247, 0.15)" : "none",
        }}
        transition={{ duration: 0.2 }}
        className={`relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed cursor-pointer ${
          isUploading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".mp3,.wav,.m4a,.mp4"
          onChange={handleFileChange}
          disabled={isUploading}
        />

        <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-full mb-4">
          <Upload className="h-7 w-7 text-purple-400" />
        </div>

        <h3 className="text-base font-bold text-slate-100 mb-1">
          Drag & drop audio files here
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          or click to browse local files
        </p>

        <div className="flex flex-wrap justify-center gap-1.5 text-[10px] text-slate-500 bg-slate-950/50 px-3 py-1.5 rounded-full border border-slate-900">
          <span className="flex items-center gap-1">
            <FileAudio className="h-3 w-3 text-purple-400" />
            MP3, WAV, M4A, MP4
          </span>
          <span>•</span>
          <span>Max 25MB</span>
        </div>
      </motion.div>

      {/* Selected File Card */}
      <AnimatePresence>
        {selectedFile && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 bg-slate-950/60 text-purple-400 border border-slate-855 rounded-xl shrink-0">
                <FileAudio className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-semibold text-slate-200 truncate pr-4">
                  {selectedFile.name}
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {formatSize(selectedFile.size)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRemove}
                className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
                title="Remove File"
              >
                <X className="h-4 w-4" />
              </button>
              <button
                onClick={triggerUpload}
                disabled={isUploading}
                className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-md shadow-purple-950/20"
              >
                <FileUp className="h-3.5 w-3.5" />
                <span>Transcribe</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="flex items-center gap-2 p-3.5 bg-red-950/30 border border-red-900/50 rounded-xl text-red-400 text-xs">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
