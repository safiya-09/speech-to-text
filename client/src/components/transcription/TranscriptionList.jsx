import React, { useState, useEffect } from "react";
import { getTranscriptions, deleteTranscription } from "../../services/transcriptionService";
import { Play, Trash2, Search, FileAudio, ExternalLink, Calendar, Loader } from "lucide-react";
import EmptyState from "../ui/EmptyState";

export default function TranscriptionList({ onSelect, triggerReload, activeId, addToast }) {
  const [transcriptions, setTranscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState("");

  const fetchList = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getTranscriptions();
      if (res.success) {
        setTranscriptions(res.data);
      }
    } catch (err) {
      setError(err.message || "Failed to load transcriptions history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [triggerReload]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Delete this transcription document? This will remove the database log and clean local storage files.")) {
      return;
    }

    try {
      const res = await deleteTranscription(id);
      if (res.success) {
        setTranscriptions((prev) => prev.filter((item) => item._id !== id));
        addToast("Transcription deleted successfully", "success");
        if (activeId === id) {
          onSelect(null);
        }
      }
    } catch (err) {
      addToast(err.message || "Failed to delete transcription", "error");
    }
  };

  const filteredItems = transcriptions.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.originalFileName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.transcriptionStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.round(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-base font-bold text-slate-100">Recent Transcriptions</h2>
          <p className="text-xs text-slate-400 mt-0.5">Manage and review your speech-to-text outputs</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search uploads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-44 pl-8.5 pr-4 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Status selector */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 text-xs focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-14">
          <Loader className="h-6 w-6 text-purple-500 animate-spin mb-3" />
          <p className="text-xs text-slate-500">Retrieving archive...</p>
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-400 text-xs font-semibold">
          {error}
        </div>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          iconName="FileAudio"
          title={search || statusFilter !== "all" ? "No matches found" : "Archive is empty"}
          description={
            search || statusFilter !== "all"
              ? "No uploaded audios match your search filters. Adjust filters to search again."
              : "No speech files have been processed in this workspace. Upload an audio document above!"
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-2.5 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
          {filteredItems.map((item) => {
            const isSelected = activeId === item._id;

            return (
              <div
                key={item._id}
                onClick={() => onSelect(item)}
                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-purple-950/15 border-purple-500/60"
                    : "bg-slate-955/25 border-slate-800/60 hover:bg-slate-955/40 hover:border-slate-700/60"
                }`}
              >
                <div className="flex items-center gap-3 w-full sm:w-auto min-w-0">
                  <div className={`p-2 rounded-lg shrink-0 ${
                    isSelected ? "bg-purple-900/30 text-purple-400" : "bg-slate-900/50 text-slate-400"
                  }`}>
                    <FileAudio className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-200 truncate pr-4">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1">
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

                <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto mt-2.5 sm:mt-0 pt-2.5 sm:pt-0 border-t border-slate-950 sm:border-0 shrink-0">
                  <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${
                    item.transcriptionStatus === "completed"
                      ? "bg-emerald-950/40 border-emerald-900/60 text-emerald-400"
                      : item.transcriptionStatus === "processing"
                      ? "bg-amber-950/40 border-amber-900/60 text-amber-400 animate-pulse"
                      : "bg-red-950/40 border-red-900/60 text-red-400"
                  }`}>
                    {item.transcriptionStatus}
                  </span>

                  <div className="flex gap-0.5">
                    <button
                      onClick={() => onSelect(item)}
                      className="p-1.5 text-slate-400 hover:text-purple-400 hover:bg-purple-950/20 rounded-lg transition-colors cursor-pointer"
                      title="Inspect Details"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, item._id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
                      title="Delete Entry"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
