import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import UploadBox from "../components/upload/UploadBox";
import UploadProgress from "../components/upload/UploadProgress";
import AudioRecorder from "../components/recorder/AudioRecorder";
import TranscriptionCard from "../components/transcription/TranscriptionCard";
import TranscriptionList from "../components/transcription/TranscriptionList";
import { uploadAudio, getTranscriptions } from "../services/transcriptionService";
import useToast from "../hooks/useToast";
import { FileAudio, Clock, BarChart3, HelpCircle } from "lucide-react";

export default function Workspace() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [activeResult, setActiveResult] = useState(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Statistics
  const [totalFiles, setTotalFiles] = useState(0);
  const [totalMins, setTotalMins] = useState(0);
  const { addToast } = useToast();

  const loadStats = async () => {
    try {
      const res = await getTranscriptions();
      if (res.success) {
        setTotalFiles(res.data.length);
        const secs = res.data.reduce((acc, curr) => acc + (curr.duration || 0), 0);
        setTotalMins(Math.ceil(secs / 60));
      }
    } catch (err) {
      console.warn("Failed to load statistics:", err.message);
    }
  };

  useEffect(() => {
    loadStats();
  }, [reloadTrigger]);

  const handleAudioUpload = async (file) => {
    setIsUploading(true);
    setUploadProgress(0);
    setStatusMessage("Uploading audio file to server...");
    setActiveResult(null);

    const formData = new FormData();
    formData.append("audio", file);
    formData.append("title", file.name.substring(0, file.name.lastIndexOf(".")));
    const estimatedDuration = Math.round(file.size / 15000);
    formData.append("duration", estimatedDuration);

    try {
      addToast("File upload started", "info");
      const res = await uploadAudio(formData, (percent) => {
        setUploadProgress(percent);
        if (percent === 100) {
          setStatusMessage("Whisper API transcribing audio (~5-15s)...");
        }
      });

      if (res.success) {
        setActiveResult(res.data);
        setReloadTrigger((prev) => prev + 1);
        addToast("Transcription completed successfully!", "success");
      }
    } catch (err) {
      console.error(err);
      addToast(err.message || "Transcription failed. Check console.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Metrics Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <motion.div
          whileHover={{ y: -2 }}
          className="flex items-center gap-4 p-5 bg-slate-900/35 border border-slate-850 rounded-2xl"
        >
          <div className="p-3 bg-purple-950/30 text-purple-400 rounded-xl">
            <FileAudio className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Total Audios
            </span>
            <span className="text-lg font-bold text-slate-200 mt-0.5">{totalFiles}</span>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="flex items-center gap-4 p-5 bg-slate-900/35 border border-slate-850 rounded-2xl"
        >
          <div className="p-3 bg-indigo-950/30 text-indigo-400 rounded-xl">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Transcribed Time
            </span>
            <span className="text-lg font-bold text-slate-200 mt-0.5">{totalMins} min</span>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="flex items-center gap-4 p-5 bg-slate-900/35 border border-slate-850 rounded-2xl"
        >
          <div className="p-3 bg-blue-950/30 text-blue-400 rounded-xl">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              SaaS Engine Status
            </span>
            <span className="text-xs font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              Whisper Connected
            </span>
          </div>
        </motion.div>
      </div>

      {/* Upload Box & Audio Recorder Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Upload Audio File
          </h3>
          <UploadBox
  onFileSelected={handleAudioUpload}
  isUploading={isUploading}
/>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Record Audio Directly
          </h3>
          <AudioRecorder
  onRecordingComplete={handleAudioUpload}
  isUploading={isUploading}
/>
        </div>
      </div>

      {/* Loader states */}
      <AnimatePresence>
        {isUploading && (
          <UploadProgress progress={uploadProgress} status={statusMessage} />
        )}
      </AnimatePresence>

      {/* Completed transcription view */}
      <AnimatePresence>
        {activeResult && !isUploading && (
          <TranscriptionCard data={activeResult} onClose={() => setActiveResult(null)} />
        )}
      </AnimatePresence>

      {/* Historical documents list */}
      <TranscriptionList
        onSelect={(item) => {
          setActiveResult(item);
          window.scrollTo({ top: 300, behavior: "smooth" });
        }}
        triggerReload={reloadTrigger}
        activeId={activeResult?._id}
        addToast={addToast}
      />
    </div>
  );
}
