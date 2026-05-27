import React, { useState, useRef } from "react";
import { Upload, FileAudio, AlertTriangle } from "lucide-react";

export default function UploadZone({ onFileSelected, isUploading }) {
  const [isDragActive, setIsDragActive] = useState(false);
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
      setError(`Invalid file format. Supported formats: ${allowedExtensions.join(", ")}`);
      return false;
    }

    if (file.size > maxSizeBytes) {
      setError("File exceeds the maximum size limit of 25MB.");
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
        onFileSelected(file);
      }
    }
  };

  const handleFileChange = (e) => {
    e.preventDefault();
    if (isUploading) return;

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        onFileSelected(file);
      }
    }
  };

  const onButtonClick = () => {
    if (isUploading) return;
    fileInputRef.current.click();
  };

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
        className={`relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer ${
          isDragActive
            ? "border-purple-500 bg-purple-950/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
            : "border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60"
        } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".mp3,.wav,.m4a,.mp4"
          onChange={handleFileChange}
          disabled={isUploading}
        />

        <div className="p-4 bg-slate-950/50 rounded-full border border-slate-800 mb-4 transition-transform duration-300 hover:scale-110">
          <Upload className="h-8 w-8 text-purple-400 animate-pulse" />
        </div>

        <h3 className="text-lg font-semibold text-slate-100 mb-1">
          Drag & drop your audio file here
        </h3>
        <p className="text-sm text-slate-400 text-center mb-4">
          or click to browse from device
        </p>

        <div className="flex flex-wrap justify-center gap-2 mb-2 text-xs text-slate-500 bg-slate-950/30 px-3 py-1.5 rounded-full border border-slate-900">
          <span className="flex items-center gap-1">
            <FileAudio className="h-3 w-3 text-purple-400" />
            MP3, WAV, M4A, MP4
          </span>
          <span>•</span>
          <span>Max 25MB</span>
        </div>
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 p-3 bg-red-950/30 border border-red-900/50 rounded-xl text-red-400 text-sm animate-fade-in">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
