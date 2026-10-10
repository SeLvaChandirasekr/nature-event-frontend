const backendOrigin =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD
    ? "https://nature-event-backend.onrender.com"
    : "http://localhost:8080");

export const API_BASE_URL = `${backendOrigin.replace(/\/+$/, "")}/api`;
