import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";
createRoot(document.getElementById("root")).render(<App />);

// Offline support. Only runs in the built app (npm run build), not in npm run dev.
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js")
      .then(() => navigator.serviceWorker.ready)
      .then((reg) => {
        const urls = performance.getEntriesByType("resource").map((r) => r.name)
          .filter((u) => u.startsWith(location.origin) || /fonts\.(googleapis|gstatic)\.com/.test(u));
        reg.active?.postMessage({ type: "CACHE", urls });
      })
      .catch(() => {});
  });
}
