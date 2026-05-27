import React from "react";
import * as Icons from "lucide-react";

export default function EmptyState({ iconName = "FileAudio", title, description, actionButton }) {
  // Dynamically resolve icon from lucide
  const IconComponent = Icons[iconName] || Icons.FileAudio;

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-800 rounded-2xl bg-slate-950/20 max-w-md mx-auto my-6 animate-fade-in">
      <div className="p-4 bg-slate-900 border border-slate-800/80 rounded-2xl text-slate-500 mb-4 shadow-md">
        <IconComponent className="h-8 w-8 text-slate-400" />
      </div>
      <h3 className="text-base font-bold text-slate-200 mb-1">{title}</h3>
      <p className="text-xs text-slate-400 leading-relaxed mb-4 max-w-xs">{description}</p>
      {actionButton && <div className="mt-1">{actionButton}</div>}
    </div>
  );
}
