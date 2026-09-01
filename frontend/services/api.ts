import axios from "axios";
import { getToken, clearToken } from "./auth";

// Create axios instance with baseURL
const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE,
  // Generous timeout: the free-tier backend can take a while to wake from
  // idle, but requests should still fail with a clear error instead of
  // hanging the UI forever.
  timeout: 45000,
});

// Automatically attach token
API.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If a token is invalid/expired, stop letting every page fail silently —
// clear it and send the user back to login.
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (
      (status === 401 || status === 403) &&
      typeof window !== "undefined" &&
      window.location.pathname !== "/login" &&
      window.location.pathname !== "/signup"
    ) {
      clearToken();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ===========================
// AUTH
// ===========================

// Signup new user
export const signup = (data: any) => API.post("/auth/signup", data);

// Login user
export const login = (data: any) => API.post("/auth/login", data);

// Check currently logged in user
export const fetchCurrentUser = () => API.get("/users/me");

// ===========================
// PROFILE
// ===========================

// Save or update profile
export const saveProfile = (data: any) => API.post("/profile/", data);

// Fetch profile
export const fetchProfile = () => API.get("/profile/");

// ===========================
// LOGS
// ===========================

// Submit a new log
export const submitLog = (data: any) => API.post("/logs/", data);

// Alias if needed
export const saveLog = (data: any) => API.post("/logs/", data);

// ===========================
// ANALYSIS
// ===========================

// Trigger backend analysis
export const analyze = () => API.post("/analyze/");

// ===========================
// PROGRESS
// ===========================

// Fetch combined progress
export const fetchProgress = () => API.get("/progress/");

// ===========================
// WEEKLY PLAN & DIET
// ===========================

// Fetch plan + diet for the user
export const fetchPlanDiet = () => API.get("/plan_diet/");

// Ask the AI to generate a fresh plan + diet (overwrites the stored one)
export const regeneratePlanDiet = () => API.post("/plan_diet/");
