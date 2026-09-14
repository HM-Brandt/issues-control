import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "bootstrap/dist/css/bootstrap.min.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const params = new URLSearchParams(window.location.search);
const tokenFromUrl = params.get("token");
const refreshFromUrl = params.get("refreshToken");

if (tokenFromUrl) {
  // Escribimos directamente en localStorage antes de que Zustand o la App carguen
  localStorage.setItem("auth_token", tokenFromUrl);
  if (refreshFromUrl) {
    localStorage.setItem("refresh_token", refreshFromUrl);
  }
}

const queryClient = new QueryClient();
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
