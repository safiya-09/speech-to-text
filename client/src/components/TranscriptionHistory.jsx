import React, { useState, useEffect } from "react";
import { getTranscriptions, deleteTranscription } from "../services/api";
import { Play, Trash2, Search, FileAudio, ExternalLink, Calendar, ShieldAlert } from "lucide-react";

export default function TranscriptionHistory({ onSelect, triggerReload, activeId }) {
  const [transcriptions, setTranscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState("");

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await getTranscriptions();
      if (res.success) {
        setTranscriptions(res.data);
      }
    } catch (err) {
      setError("Failed to load transcription history");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [triggerReload]);

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Avoid triggering onSelect
    if (!window.confirm("Are you sure you want to delete this transcription? This will delete the database record and local audio file.")) {
      return;
    }

    try {
      const res = await deleteTranscription(id);
      if (res.success) {
        setTranscriptions((prev) => prev.filter((item) => item._id !== id));
        if (activeId === id) {
          onSelect(null);
        }
      }
    } catch (err) {
      alert(err.message || "Failed to delete transcription");
    }
  };

  // Filters
  const filteredItems = transcriptions.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || 
                          item.originalFileName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.transcriptionStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.round(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return (
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-950/40 border border-emerald-900/60 text-emerald-400">
            Completed
          </span>
        );
      case "processing":
        return (
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-950/40 border border-amber-900/60 text-amber-400 animate-pulse">
            Processing
          </span>
        );
      case "failed":
        return (
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-950/40 border border-red-900/60 text-red-400">
            Failed
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-800 border border-slate-700 text-slate-400">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="w-full bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Transcription History</h2>
          <p className="text-xs text-slate-400 mt-1">Review and manage your speech-to-text documents</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search history..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-48 pl-9 pr-4 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-300 text-sm focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-950/30 border border-red-900/50 rounded-xl text-red-400 text-sm mb-4">
          <ShieldAlert className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-slate-400">Loading transcription archive...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-slate-800/80 rounded-xl bg-slate-950/20">
          <FileAudio className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300">No transcriptions found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            {search || statusFilter !== "all"
              ? "Try adjusting your search criteria or status filter."
              : "Upload a file or record audio in the Dashboard tab to begin!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 max-h-[480px] overflow-y-auto pr-1 scrollbar-thin">
          {filteredItems.map((item) => (
            <div
              key={item._id}
              onClick={() => onSelect(item)}
              className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                activeId === item._id
                  ? "bg-purple-950/15 border-purple-500/80 shadow-[0_0_10px_rgba(168,85,247,0.05)]"
                  : "bg-slate-950/30 border-slate-800/60 hover:bg-slate-950/50 hover:border-slate-700/60"
              }`}
            >
              <div className="flex items-center gap-3 w-full sm:w-auto min-w-0">
                <div className={`p-2.5 rounded-lg shrink-0 ${
                  activeId === item._id ? "bg-purple-900/30 text-purple-400" : "bg-slate-900/50 text-slate-400"
                }`}>
                  <FileAudio className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-slate-200 truncate pr-4">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="h-3 w-3" />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span>{(item.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                    <span>•</span>
                    <span>{formatDuration(item.duration)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-3 sm:mt-0 pt-2.5 sm:pt-0 border-t border-slate-950 sm:border-0 shrink-0">
                {getStatusBadge(item.transcriptionStatus)}

                <div className="flex gap-1">
                  <button
                    onClick={() => onSelect(item)}
                    className="p-2 text-slate-400 hover:text-purple-400 hover:bg-purple-950/20 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <ExternalLink className="h-4.5 w-4.5" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, item._id)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-colors"
                    title="Delete Record"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
