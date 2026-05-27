import React from "react";
import { ToastProvider } from "./context/ToastContext";
import Navbar from "./components/ui/Navbar";
import Workspace from "./pages/Workspace";

function App() {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />
        <Workspace />
      </div>
    </ToastProvider>
  );
}

export default App;