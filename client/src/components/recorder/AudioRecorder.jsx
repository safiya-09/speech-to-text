import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Play, Pause, Trash2, ArrowUpCircle, Radio, Volume2 } from "lucide-react";

export default function AudioRecorder({ onRecordingComplete, isUploading }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [timerText, setTimerText] = useState("00:00");
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const animationFrameRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => {
      stopTimer();
      cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close();
      }
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    setTimerText(`${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`);
  }, [duration]);

  const startTimer = () => {
    stopTimer();
    timerIntervalRef.current = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const startRecording = async () => {
    audioChunksRef.current = [];
    setDuration(0);
    setRecordedBlob(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const options = { mimeType: "audio/webm" };
      let recorder;
      try {
        recorder = new MediaRecorder(stream, options);
      } catch (e) {
        recorder = new MediaRecorder(stream);
      }

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        setRecordedBlob(audioBlob);
        const localUrl = URL.createObjectURL(audioBlob);
        setPreviewUrl(localUrl);

        // Stop all tracks to release mic icon
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start(250);
      setIsRecording(true);
      setIsPaused(false);
      startTimer();
      setupVisualizer(stream);
    } catch (err) {
      console.error("Mic error:", err);
      alert("Microphone access is required. Please verify permissions.");
    }
  };

  const setupVisualizer = (stream) => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;

    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    source.connect(analyser);
    analyserRef.current = analyser;
    dataArrayRef.current = dataArray;

    drawVisualizer();
  };

  const drawVisualizer = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = dataArrayRef.current;
    const width = canvas.width;
    const height = canvas.height;

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyserRef.current.getByteFrequencyData(dataArray);

      ctx.fillStyle = "rgba(15, 23, 42, 1)";
      ctx.fillRect(0, 0, width, height);

      const barWidth = (width / bufferLength) * 1.8;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 1.5;
        const hue = i * 2.5 + 240;
        ctx.fillStyle = `hsla(${hue}, 80%, 60%, 0.8)`;
        ctx.shadowBlur = 4;
        ctx.shadowColor = `hsla(${hue}, 80%, 60%, 0.5)`;

        const y = (height - barHeight) / 2;
        ctx.fillRect(x, y, barWidth - 2, barHeight);
        x += barWidth;
      }
    };
    draw();
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      stopTimer();
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      startTimer();
      drawVisualizer();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      stopTimer();
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const discardRecording = () => {
    setRecordedBlob(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }
    setDuration(0);
    // Clear canvas
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "rgba(15, 23, 42, 1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleSubmit = () => {
    if (recordedBlob) {
      const file = new File([recordedBlob], `voice-recording-${Date.now()}.wav`, {
        type: "audio/wav",
      });
      onRecordingComplete(file, duration);
      discardRecording(); // Reset after callback
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-900/30 rounded-2xl border border-slate-800/80">
      <div className="w-full max-w-md flex flex-col items-center gap-4">
        {/* Waveform Visualization Canvas */}
        <div className="relative w-full h-24 bg-slate-950/70 border border-slate-800/50 rounded-xl overflow-hidden shadow-inner">
          <canvas ref={canvasRef} width={400} height={96} className="w-full h-full block" />
          {!isRecording && !previewUrl && (
            <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm gap-2">
              <Radio className="h-4 w-4" />
              <span>Mic visualizer idle</span>
            </div>
          )}
          {previewUrl && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 text-purple-400 text-xs font-semibold tracking-wider uppercase animate-pulse gap-1.5">
              <Volume2 className="h-4 w-4" />
              <span>Playback preview loaded</span>
            </div>
          )}
          {isRecording && isPaused && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 text-purple-400 text-sm font-semibold tracking-wider uppercase animate-pulse">
              Recording Paused
            </div>
          )}
        </div>

        {/* Status Indicators and Timer */}
        <div className="flex items-center justify-between w-full px-1">
          <div className="flex items-center gap-2">
            {isRecording ? (
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
            ) : (
              <span className="h-2.5 w-2.5 rounded-full bg-slate-600"></span>
            )}
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {isRecording ? (isPaused ? "Paused" : "Recording Live...") : previewUrl ? "Preview" : "Ready"}
            </span>
          </div>

          <div className="text-xl font-mono font-bold text-slate-200 tracking-wider">
            {timerText}
          </div>
        </div>

        {/* Local Playback Preview (Shown *only* when not recording and preview exists) */}
        <AnimatePresence>
          {previewUrl && !isRecording && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full flex flex-col gap-2 p-3 bg-slate-950/40 border border-slate-850 rounded-xl overflow-hidden"
            >
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Listen to Preview</span>
              <audio controls className="w-full h-8 accent-purple-500" src={previewUrl} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-3 mt-2">
          {!isRecording && !previewUrl ? (
            <button
              onClick={startRecording}
              disabled={isUploading}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-bold px-5 py-2.5 rounded-full shadow-lg transition-all duration-300 transform active:scale-95 disabled:opacity-50"
            >
              <Mic className="h-4.5 w-4.5 animate-pulse" />
              <span>Record Voice</span>
            </button>
          ) : isRecording ? (
            <>
              {isPaused ? (
                <button
                  onClick={resumeRecording}
                  className="p-3 bg-slate-800 hover:bg-slate-755 border border-slate-700 text-slate-200 rounded-full transition-all"
                  title="Resume"
                >
                  <Play className="h-4.5 w-4.5" />
                </button>
              ) : (
                <button
                  onClick={pauseRecording}
                  className="p-3 bg-slate-800 hover:bg-slate-755 border border-slate-700 text-slate-200 rounded-full transition-all"
                  title="Pause"
                >
                  <Pause className="h-4.5 w-4.5" />
                </button>
              )}

              <button
                onClick={stopRecording}
                className="p-3.5 bg-red-600 hover:bg-red-500 text-white rounded-full transition-all shadow-md shadow-red-950/40"
                title="Stop & Save"
              >
                <Square className="h-4.5 w-4.5" />
              </button>
            </>
          ) : (
            // Preview State buttons: Discard or Submit
            <div className="flex items-center gap-3 animate-fade-in">
              <button
                onClick={discardRecording}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-slate-300 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
              >
                <Trash2 className="h-4 w-4" />
                <span>Discard</span>
              </button>
              <button
                onClick={handleSubmit}
                className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-950/20"
              >
                <ArrowUpCircle className="h-4 w-4" />
                <span>Transcribe Audio</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
