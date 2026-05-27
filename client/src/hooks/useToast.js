import { useContext } from "react";
import { ToastContext } from "../context/ToastContext";

/**
 * Custom React hook to launch toast alerts
 * @returns {{ addToast: (message: string, type: 'success'|'error'|'info') => void }}
 */
export default function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside a ToastProvider");
  }
  return context;
}
