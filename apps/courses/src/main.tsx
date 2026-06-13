import React from 'react';
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./styles/index.css";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Failed to find #root element — check index.html");

createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
