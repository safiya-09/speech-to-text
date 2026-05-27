import React, { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Pause, RefreshCw, Radio } from "lucide-react";

export default function AudioRecorder({ onRecordingComplete, isUploading }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [timerText, setTimerText] = useState("00:00");

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const animationFrameRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopTimer();
      cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Format seconds to MM:SS
  useEffect(() => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    const formattedMinutes = minutes.toString().padStart(2, "0");
    const formattedSeconds = seconds.toString().padStart(2, "0");
    setTimerText(`${formattedMinutes}:${formattedSeconds}`);
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

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const options = { mimeType: "audio/webm" }; // WebM is widely supported in browsers
      let recorder;
      
      try {
        recorder = new MediaRecorder(stream, options);
      } catch (err) {
        // Fallback if audio/webm is not supported (like on Safari)
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
        // Generate a filename with timestamp
        const fileName = `recorded-audio-${Date.now()}.wav`;
        const audioFile = new File([audioBlob], fileName, { type: "audio/wav" });
        onRecordingComplete(audioFile, duration);
        
        // Stop stream tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start(250); // Get chunks every 250ms
      setIsRecording(true);
      setIsPaused(false);
      startTimer();
      setupVisualizer(stream);
    } catch (err) {
      console.error("Microphone access denied or failed:", err);
      alert("Microphone access is required to record audio. Please verify permissions.");
    }
  };

  const setupVisualizer = (stream) => {
    // Create Audio Context
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

      // Clean background with a slight fade
      ctx.fillStyle = "rgba(15, 23, 42, 1)"; // slate-900 matching dashboard
      ctx.fillRect(0, 0, width, height);

      const barWidth = (width / bufferLength) * 1.8;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 1.5; // Scale height

        // HSL styling for a beautiful glowing gradient (Purple to Blue)
        const hue = i * 2.5 + 240; // 240 is blue, moves towards purple
        ctx.fillStyle = `hsla(${hue}, 80%, 60%, 0.8)`;
        ctx.shadowBlur = 4;
        ctx.shadowColor = `hsla(${hue}, 80%, 60%, 0.5)`;

        // Draw rounded bars centered vertically
        const y = (height - barHeight) / 2;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, barWidth - 2, barHeight, 4);
          ctx.fill();
        } else {
          ctx.fillRect(x, y, barWidth - 2, barHeight);
        }

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

  const resetRecorder = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    stopTimer();
    cancelAnimationFrame(animationFrameRef.current);
    setIsRecording(false);
    setIsPaused(false);
    setDuration(0);
    
    // Clear canvas
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "rgba(15, 23, 42, 1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-900/30 rounded-2xl border border-slate-800/80">
      <div className="w-full max-w-md flex flex-col items-center gap-4">
        {/* Waveform Visualization Canvas */}
        <div className="relative w-full h-24 bg-slate-950/70 border border-slate-800/50 rounded-xl overflow-hidden shadow-inner">
          <canvas
            ref={canvasRef}
            width={400}
            height={96}
            className="w-full h-full block"
          />
          {!isRecording && (
            <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm gap-2">
              <Radio className="h-4 w-4" />
              <span>Waveform visualizer ready</span>
            </div>
          )}
          {isRecording && isPaused && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 text-purple-400 text-sm font-semibold tracking-wider uppercase animate-pulse">
              Recording Paused
            </div>
          )}
        </div>

        {/* Status Indicators and Timer */}
        <div className="flex items-center justify-between w-full px-2">
          <div className="flex items-center gap-2">
            {isRecording ? (
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
            ) : (
              <span className="h-2.5 w-2.5 rounded-full bg-slate-600"></span>
            )}
            <span className="text-sm font-medium text-slate-400">
              {isRecording
                ? isPaused
                  ? "Paused"
                  : "Recording Live..."
                : "Idle"}
            </span>
          </div>

          <div className="text-2xl font-mono font-bold text-slate-200 tracking-wider">
            {timerText}
          </div>
        </div>

        {/* Buttons Panel */}
        <div className="flex items-center justify-center gap-4 mt-2">
          {!isRecording ? (
            <button
              onClick={startRecording}
              disabled={isUploading}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium px-6 py-3 rounded-full shadow-lg shadow-purple-950/20 hover:shadow-purple-500/10 transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Mic className="h-5 w-5" />
              <span>Record Voice</span>
            </button>
          ) : (
            <>
              {isPaused ? (
                <button
                  onClick={resumeRecording}
                  className="p-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full border border-slate-700/60 transition-colors duration-200"
                  title="Resume Recording"
                >
                  <Play className="h-5 w-5" />
                </button>
              ) : (
                <button
                  onClick={pauseRecording}
                  className="p-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full border border-slate-700/60 transition-colors duration-200"
                  title="Pause Recording"
                >
                  <Pause className="h-5 w-5" />
                </button>
              )}

              <button
                onClick={stopRecording}
                className="p-4 bg-red-600 hover:bg-red-500 text-white rounded-full transition-transform duration-200 transform active:scale-95 shadow-md shadow-red-950/40"
                title="Stop & Save Recording"
              >
                <Square className="h-5 w-5" />
              </button>

              <button
                onClick={resetRecorder}
                className="p-3.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-full border border-slate-700/60 transition-colors duration-200"
                title="Cancel Recording"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
