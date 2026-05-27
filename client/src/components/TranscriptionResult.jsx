import React, { useState } from "react";
import { Copy, Check, Download, Search, FileText, Globe, Calendar, Layers, X } from "lucide-react";

export default function TranscriptionResult({ data, onClose }) {
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  if (!data) return null;

  const {
    title,
    audioUrl,
    originalFileName,
    fileSize,
    duration,
    transcriptionText,
    language,
    createdAt,
  } = data;

  const formattedDate = new Date(createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const formattedSize = (fileSize / (1024 * 1024)).toFixed(2) + " MB";

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.round(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(transcriptionText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (format) => {
    let content = "";
    let mimeType = "text/plain";
    let extension = "txt";

    if (format === "txt") {
      content = `Title: ${title}\nFile: ${originalFileName}\nDuration: ${formatDuration(duration)}\nDate: ${formattedDate}\n\nTranscription:\n${transcriptionText}`;
    } else if (format === "json") {
      content = JSON.stringify(data, null, 2);
      mimeType = "application/json";
      extension = "json";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.toLowerCase().replace(/[\s_]+/g, "-")}-transcript.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Helper to highlight matching search words
  const renderHighlightedText = (text, query) => {
    if (!query) return text;

    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-purple-500/30 text-purple-200 border-b border-purple-400 rounded-sm px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="w-full bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-800/80 pb-4 mb-5">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">
            Transcription Completed
          </span>
          <h2 className="text-xl font-bold text-slate-100 mt-1">{title}</h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition-all"
            title="Close Result"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Grid: Audio Stream & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Playback Control */}
        <div className="md:col-span-2 flex flex-col justify-center p-4 bg-slate-950/40 border border-slate-800/60 rounded-xl">
          <span className="text-xs font-medium text-slate-400 mb-2">Audio Player</span>
          <audio controls className="w-full accent-purple-500" src={audioUrl}>
            Your browser does not support the audio element.
          </audio>
        </div>

        {/* Metadata Details */}
        <div className="space-y-2 text-xs text-slate-400 p-4 bg-slate-950/20 border border-slate-900 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-slate-500" /> Original File:
            </span>
            <span className="font-semibold text-slate-300 truncate max-w-[120px]" title={originalFileName}>
              {originalFileName}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-slate-500" /> Size / Duration:
            </span>
            <span className="font-semibold text-slate-300">
              {formattedSize} ({formatDuration(duration)})
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-slate-500" /> Language:
            </span>
            <span className="font-semibold text-slate-300 uppercase">{language}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-500" /> Transcribed on:
            </span>
            <span className="font-semibold text-slate-300">{formattedDate.split(" at")[0]}</span>
          </div>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mb-4">
        {/* Search Field */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search transcript..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-slate-300 hover:text-white px-4 py-2 rounded-xl text-sm transition-all"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-400" />
                <span className="text-green-400 font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copy</span>
              </>
            )}
          </button>

          <div className="relative group">
            <button className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-sm transition-all shadow-md shadow-purple-950/30">
              <Download className="h-4 w-4" />
              <span>Download</span>
            </button>
            {/* Hover Download Options Dropdown */}
            <div className="absolute right-0 bottom-full mb-1 w-28 bg-slate-950 border border-slate-800 rounded-lg shadow-xl hidden group-hover:block hover:block z-10">
              <button
                onClick={() => handleDownload("txt")}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-900 text-slate-300 text-xs hover:text-white rounded-t-lg transition-colors"
              >
                Text File (.txt)
              </button>
              <button
                onClick={() => handleDownload("json")}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-900 text-slate-300 text-xs hover:text-white rounded-b-lg border-t border-slate-900 transition-colors"
              >
                JSON File (.json)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Transcript Text Box */}
      <div className="relative w-full max-h-60 overflow-y-auto bg-slate-950/65 border border-slate-800/80 rounded-xl p-4 leading-relaxed text-sm text-slate-300 scrollbar-thin">
        {renderHighlightedText(transcriptionText, searchQuery)}
      </div>
    </div>
  );
}
