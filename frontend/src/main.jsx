import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./i18n";

// Apply the saved theme before React paints the first screen, including Login.
document.documentElement.dataset.theme = localStorage.getItem("theme") || "dark";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
