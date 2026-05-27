import React from "react";
import { Compass, LayoutDashboard, History, Users } from "lucide-react";

export default function Navbar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: "upload", label: "Workspace", icon: LayoutDashboard },
    { id: "history", label: "Transcriptions", icon: History },
    { id: "communities", label: "Communities", icon: Users },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/75 backdrop-blur-md px-6 lg:px-8">
      <div className="flex h-16 items-center justify-between">
        {/* Branding Logo */}
        <div className="flex items-center gap-2.5">
          <div className="h-8.5 w-8.5 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-purple-900/35">
            <Compass className="h-4.5 w-4.5 animate-spin-slow" />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight bg-gradient-to-r from-purple-400 to-indigo-300 bg-clip-text text-transparent">
              AuraScribe
            </span>
            <span className="block text-[8px] font-semibold text-slate-500 uppercase tracking-widest leading-none">
              STT Platform
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 bg-slate-900/60 border border-slate-850 p-1 rounded-xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-purple-600 text-white shadow-sm shadow-purple-950/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-850/40"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User profile dropdown placeholder */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-semibold text-slate-300 leading-tight">Safiya Banu</span>
            <span className="text-[9px] text-slate-500 font-medium">Free Tier</span>
          </div>
          <div className="h-8.5 w-8.5 rounded-full bg-slate-850 border border-slate-700/80 flex items-center justify-center text-xs font-bold text-slate-300 shadow-md">
            S
          </div>
        </div>
      </div>
    </header>
  );
}
