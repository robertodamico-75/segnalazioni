import React from "react";
export function NcToast({ toast, onClose }) {
  if (!toast?.message) return null;

  return (
    <div className={`toast toast-${toast.type || "info"}`} role="status" aria-live="polite">
      <div className="toast-body">{toast.message}</div>
      <button className="toast-close" onClick={onClose} aria-label="Chiudi notifica">
        ×
      </button>
    </div>
  );
}

