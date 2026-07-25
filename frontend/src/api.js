import axios from "axios";

// A single Axios client keeps the backend URL in one place.  Vite exposes
// variables prefixed with VITE_ to browser code at build time.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
});

// This small function verifies that the browser can reach FastAPI.
export async function checkHealth() {
  const response = await api.get("/health");
  return response.data;
}
