import React, { useState, useEffect } from "react";
import UploadZone from "./UploadZone";
import AudioRecorder from "./AudioRecorder";
import TranscriptionResult from "./TranscriptionResult";
import TranscriptionHistory from "./TranscriptionHistory";
import CommunitiesList from "./CommunitiesList";
import { uploadAudio, getTranscriptions, getCommunities } from "../services/api";
import {
  Mic,
  History,
  Users,
  Compass,
  FileAudio,
  Clock,
  LayoutDashboard,
  ShieldCheck,
  TrendingUp,
  Volume2,
} from "lucide-react";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("upload");
  
  // File Upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState("");
  
  // Result state
  const [activeResult, setActiveResult] = useState(null);
  
  // Trigger history fetch reload
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Stats
  const [stats, setStats] = useState({
    totalAudios: 0,
    totalMinutes: 0,
    activeSpaces: 0,
  });

  const loadStats = async () => {
    try {
      const transRes = await getTranscriptions();
      const commRes = await getCommunities();
      
      if (transRes.success && commRes.success) {
        const total = transRes.data.length;
        const totalSecs = transRes.data.reduce((acc, curr) => acc + (curr.duration || 0), 0);
        const mins = Math.ceil(totalSecs / 60);
        
        setStats({
          totalAudios: total,
          totalMinutes: mins,
          activeSpaces: commRes.data.length,
        });
      }
    } catch (err) {
      console.warn("Failed to load dashboard statistics:", err.message);
    }
  };

  useEffect(() => {
    loadStats();
  }, [reloadTrigger, activeTab]);

  const handleAudioFile = async (file) => {
    setIsUploading(true);
    setUploadProgress(0);
    setProcessingStatus("Uploading file to server...");
    setActiveResult(null);

    const formData = new FormData();
    formData.append("audio", file);
    formData.append("title", file.name.substring(0, file.name.lastIndexOf(".")));
    // Estimate audio duration for model fallback
    const estimatedDuration = Math.round(file.size / 15000);
    formData.append("duration", estimatedDuration);

    try {
      const res = await uploadAudio(formData, (progress) => {
        setUploadProgress(progress);
        if (progress === 100) {
          setProcessingStatus("Transcribing audio via OpenAI Whisper (taking ~5-10s)...");
        }
      });

      if (res.success) {
        setActiveResult(res.data);
        setReloadTrigger((prev) => prev + 1);
        setIsUploading(false);
      }
    } catch (err) {
      alert(err.message || "Failed to transcribe audio file");
      setIsUploading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand Logo */}
          <div className="p-6 flex items-center gap-3 border-b border-slate-800/80">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-purple-900/35">
              <Compass className="h-5 w-5 animate-spin-slow" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-purple-400 to-indigo-300 bg-clip-text text-transparent">
                AuraScribe
              </span>
              <span className="block text-[9px] font-semibold text-slate-500 uppercase tracking-widest">
                STT Platform
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <button
              onClick={() => setActiveTab("upload")}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "upload"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-950/20"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              }`}
            >
              <LayoutDashboard className="h-4.5 w-4.5" />
              <span>Workspace</span>
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "history"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-950/20"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              }`}
            >
              <History className="h-4.5 w-4.5" />
              <span>Transcriptions</span>
            </button>

            <button
              onClick={() => setActiveTab("communities")}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "communities"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-950/20"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              }`}
            >
              <Users className="h-4.5 w-4.5" />
              <span>Communities</span>
            </button>
          </nav>
        </div>

        {/* Footer Credit */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/10">
          <div className="flex items-center gap-2 px-2.5 py-2 rounded-xl bg-slate-950/40 border border-slate-800 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Secured Backend</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/30 flex items-center justify-between px-8 shrink-0">
          <div>
            <h1 className="text-lg font-bold text-slate-100 capitalize">
              {activeTab === "upload" ? "Speech Workspace" : activeTab}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-8.5 w-8.5 rounded-full bg-slate-800 border border-slate-700/80 flex items-center justify-center text-xs font-semibold text-slate-300">
              U
            </div>
            <span className="text-xs font-semibold text-slate-400">User Dashboard</span>
          </div>
        </header>

        {/* Body Container */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-950/90 scrollbar-thin">
          <div className="max-w-6xl mx-auto space-y-8">
            {activeTab === "upload" && (
              <>
                {/* Stats Widget */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="flex items-center gap-4 p-5 bg-slate-900/35 border border-slate-850 rounded-2xl">
                    <div className="p-3 bg-purple-950/30 text-purple-400 rounded-xl">
                      <FileAudio className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Files Transcribed
                      </span>
                      <span className="text-xl font-bold text-slate-200 mt-0.5">
                        {stats.totalAudios}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-5 bg-slate-900/35 border border-slate-850 rounded-2xl">
                    <div className="p-3 bg-indigo-950/30 text-indigo-400 rounded-xl">
                      <Clock className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Total Audio Minutes
                      </span>
                      <span className="text-xl font-bold text-slate-200 mt-0.5">
                        {stats.totalMinutes} min
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-5 bg-slate-900/35 border border-slate-850 rounded-2xl">
                    <div className="p-3 bg-blue-950/30 text-blue-400 rounded-xl">
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Active Rooms
                      </span>
                      <span className="text-xl font-bold text-slate-200 mt-0.5">
                        {stats.activeSpaces}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Upload & Recorder Panel */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Drag & Drop */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">
                      Upload Audio Document
                    </h3>
                    <UploadZone
                      onFileSelected={handleAudioFile}
                      isUploading={isUploading}
                    />
                  </div>

                  {/* Right Column: Audio Recorder */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">
                      Record Live Session
                    </h3>
                    <AudioRecorder
                      onRecordingComplete={handleAudioFile}
                      isUploading={isUploading}
                    />
                  </div>
                </div>

                {/* Loader status */}
                {isUploading && (
                  <div className="w-full bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col gap-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-purple-400 flex items-center gap-2">
                        <Volume2 className="h-4.5 w-4.5 animate-bounce" />
                        {processingStatus}
                      </span>
                      <span className="font-mono text-slate-400">{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Transcription result */}
                {activeResult && (
                  <TranscriptionResult
                    data={activeResult}
                    onClose={() => setActiveResult(null)}
                  />
                )}
              </>
            )}

            {activeTab === "history" && (
              <TranscriptionHistory
                onSelect={(item) => {
                  setActiveResult(item);
                  setActiveTab("upload"); // Switch to upload tab to view the result
                }}
                triggerReload={reloadTrigger}
                activeId={activeResult?._id}
              />
            )}

            {activeTab === "communities" && <CommunitiesList />}
          </div>
        </div>
      </main>
    </div>
  );
}
