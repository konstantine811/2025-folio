import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router";
import "./i18n"; // <- додали
import "./register-service-worker";
import { inject } from "@vercel/analytics";

inject({
  mode: import.meta.env.DEV ? "development" : "production",
  debug: import.meta.env.DEV,
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
