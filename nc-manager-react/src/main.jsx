import React from "react";
import { createRoot } from "react-dom/client";
import { NcDashboard } from "./components/NcDashboard";
import "./styles.css";

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: String(error?.message || error) };
  }

  componentDidCatch(error) {
    console.error("NC Manager runtime error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "24px", fontFamily: "Segoe UI, sans-serif" }}>
          <h2>Errore applicazione React</h2>
          <p>Apri la console browser (F12) e inviami questo messaggio:</p>
          <pre style={{ whiteSpace: "pre-wrap", background: "#fff", border: "1px solid #ddd", padding: "12px", borderRadius: "8px" }}>
            {this.state.message}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <NcDashboard />
    </AppErrorBoundary>
  </React.StrictMode>
);
