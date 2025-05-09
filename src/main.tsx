import "./index.css";

import App from "./App";
import React from "react";
import ReactDOM from "react-dom/client";

// Başlangıç temasını belirle
const theme =
  localStorage.getItem("theme") ||
  (window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light");

// HTML elementine tema sınıfını ekle
if (theme === "dark") {
  document.documentElement.classList.add("dark");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
