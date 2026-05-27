import React, { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Download, Search, FileText, Globe, Calendar, Layers, X, Clock } from "lucide-react";
import AudioPlayer from "./AudioPlayer";

export default function TranscriptionCard({ data, isLoading, onClose }) {
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 1. Loading Skeleton State
  if (isLoading) {
    return (
      <div className="w-full bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-xl animate-pulse">
        <div className="h-4 bg-slate-800 rounded-lg w-1/4 mb-4" />
        <div className="h-6 bg-slate-800 rounded-lg w-1/2 mb-6" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-2 h-16 bg-slate-800 rounded-xl" />
          <div className="space-y-2">
            <div className="h-3 bg-slate-800 rounded w-full" />
            <div className="h-3 bg-slate-800 rounded w-5/6" />
            <div className="h-3 bg-slate-800 rounded w-4/5" />
          </div>
        </div>

        <div className="flex gap-3 mb-4">
          <div className="h-10 bg-slate-800 rounded-xl w-36" />
          <div className="h-10 bg-slate-800 rounded-xl w-24" />
        </div>

        <div className="space-y-2 mt-4">
          <div className="h-4 bg-slate-800 rounded w-full" />
          <div className="h-4 bg-slate-800 rounded w-full" />
          <div className="h-4 bg-slate-800 rounded w-2/3" />
        </div>
      </div>
    );
  }

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
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleCopy = () => {
    if (!transcriptionText) return;
    navigator.clipboard.writeText(transcriptionText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (format) => {
    if (!transcriptionText) return;
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

  const renderHighlightedText = (text, query) => {
    if (!text) return <span className="text-slate-500 italic">No transcription content found.</span>;
    if (!query) return text;

    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-purple-500/35 text-purple-200 border-b border-purple-400 rounded-sm px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="w-full bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md"
    >
      {/* Top Details */}
      <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">
            Transcription Completed
          </span>
          <h2 className="text-lg font-bold text-slate-100 mt-1">{title}</h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Close result"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        )}
      </div>

      {/* Grid: Audio and Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Custom Audio Player */}
        <div className="md:col-span-2 flex flex-col justify-center">
          <AudioPlayer src={audioUrl} />
        </div>

        {/* Statistics list */}
        <div className="space-y-2 text-[11px] text-slate-400 p-4 bg-slate-950/20 border border-slate-900 rounded-xl flex flex-col justify-center">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-500">
              <FileText className="h-3.5 w-3.5" /> Source File:
            </span>
            <span className="font-semibold text-slate-300 truncate max-w-[110px]" title={originalFileName}>
              {originalFileName}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-500">
              <Clock className="h-3.5 w-3.5" /> Size / Length:
            </span>
            <span className="font-semibold text-slate-300">
              {formattedSize} ({formatDuration(duration)})
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-500">
              <Globe className="h-3.5 w-3.5" /> Language:
            </span>
            <span className="font-semibold text-slate-300 uppercase">{language}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-500">
              <Calendar className="h-3.5 w-3.5" /> Completed:
            </span>
            <span className="font-semibold text-slate-300">{formattedDate.split(" at")[0]}</span>
          </div>
        </div>
      </div>

      {/* Search and Action items */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mb-4">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search words..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Copy/Download triggers */}
        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-705 text-slate-300 hover:text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Text</span>
              </>
            )}
          </button>

          <div className="relative group">
            <button className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-950/20 cursor-pointer">
              <Download className="h-3.5 w-3.5" />
              <span>Download</span>
            </button>
            <div className="absolute right-0 bottom-full mb-1 w-28 bg-slate-950 border border-slate-800 rounded-lg shadow-xl hidden group-hover:block hover:block z-10">
              <button
                onClick={() => handleDownload("txt")}
                className="w-full text-left px-3 py-2 hover:bg-slate-900 text-slate-300 text-[10px] hover:text-white rounded-t-lg transition-colors cursor-pointer"
              >
                Plain Text (.txt)
              </button>
              <button
                onClick={() => handleDownload("json")}
                className="w-full text-left px-3 py-2 hover:bg-slate-900 text-slate-300 text-[10px] hover:text-white rounded-b-lg border-t border-slate-900 transition-colors cursor-pointer"
              >
                Raw JSON (.json)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Actual Text block */}
      <div className="relative w-full max-h-56 overflow-y-auto bg-slate-950/50 border border-slate-800 rounded-xl p-4 leading-relaxed text-xs text-slate-300 scrollbar-thin">
        {renderHighlightedText(transcriptionText, searchQuery)}
      </div>
    </motion.div>
  );
}
