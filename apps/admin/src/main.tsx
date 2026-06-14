import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "@shared/styles/globals.css";
import ErrorBoundary from "./shared/components/ErrorBoundary";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Failed to find #root element — check index.html");

createRoot(rootEl).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
