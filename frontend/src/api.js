import axios from "axios";

// A single Axios client keeps the backend URL in one place.  Vite exposes
// variables prefixed with VITE_ to browser code at build time.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
});

// This interceptor runs once when this module is imported.  It reads the
// latest token before every request, so components do not repeat auth headers.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function getStoredToken() {
  return localStorage.getItem("access_token");
}

export function logoutUser() {
  localStorage.removeItem("access_token");
}

export async function registerUser(email, password) {
  const response = await api.post("/auth/signup", { email, password });
  return response.data;
}

export async function loginUser(email, password) {
  const response = await api.post("/auth/login", { email, password });
  localStorage.setItem("access_token", response.data.access_token);
  return response.data;
}

// This small function verifies that the browser can reach FastAPI.
export async function checkHealth() {
  const response = await api.get("/health");
  return response.data;
}

const userId = Number(import.meta.env.VITE_USER_ID || 1);

// API layer keeps backend calls and the temporary demo user id in one place.
export async function getWallets() {
  const response = await api.get("/wallets", { params: { user_id: userId } });
  return response.data;
}

export async function getCategories() {
  const response = await api.get("/categories", { params: { user_id: userId } });
  return response.data;
}

export async function createTransaction(payload) {
  const response = await api.post("/transactions", { ...payload, user_id: userId });
  return response.data;
}
