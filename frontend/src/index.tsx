// frontend/src/index.tsx
import "../tailwind.css";    // Adjusted the path to match the likely location of the file.
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app.tsx";

const container = document.getElementById("root");
if (!container) throw new Error("#root not found");
createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
