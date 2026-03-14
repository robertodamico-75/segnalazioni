import React from "react";
import { createRoot } from "react-dom/client";
import { NcDashboard } from "./components/NcDashboard";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <NcDashboard />
  </React.StrictMode>
);

