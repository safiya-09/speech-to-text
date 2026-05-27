import React from "react";
import { motion } from "framer-motion";
import { Volume2, Loader } from "lucide-react";

export default function UploadProgress({ progress, status }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md"
    >
      <div className="flex items-center justify-between text-xs font-semibold mb-2.5">
        <span className="text-purple-400 flex items-center gap-2">
          {progress < 100 ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            <Volume2 className="h-4.5 w-4.5 animate-bounce text-purple-400" />
          )}
          <span>{status || "Uploading audio file..."}</span>
        </span>
        <span className="font-mono text-slate-400">{progress}%</span>
      </div>

      <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {progress === 100 && (
        <p className="text-[10px] text-slate-500 mt-2 text-center italic">
          This may take a few seconds depending on file duration. Do not close this window.
        </p>
      )}
    </motion.div>
  );
}
