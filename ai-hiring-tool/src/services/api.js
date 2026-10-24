import axios from "axios";

const baseURL =
  (import.meta.env.VITE_API_URL ?? "http://localhost:5000").replace(/\/$/, "") +
  "/api/v1";

const API = axios.create({
  baseURL,
  withCredentials: true,
});

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeToRefresh = (callback) => refreshSubscribers.push(callback);
const notifyRefreshSubscribers = () => {
  refreshSubscribers.forEach((callback) => callback());
  refreshSubscribers = [];
};

// --- INTERCEPTORS ---

API.interceptors.request.use((config) => {
  // If you store tokens in localStorage, attach them here. 
  // (If using HTTP-only cookies, withCredentials handles this automatically)
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (res) => {
    // GLOBALLY UNWRAP ApiResponse: 
    // Backend returns { success: true, message: "...", data: {...} }
    // We return just the `data` payload to the frontend functions
    return res.data?.data !== undefined ? res.data.data : res.data;
  },
  async (err) => {
    const status = err.response?.status;
    const originalRequest = err.config;
    const url = originalRequest?.url ?? "";
    const isAuthRequest = /\/auth\/(login|register|refresh-token|me)$/.test(url);

    if (status === 401 && !isAuthRequest && !originalRequest._retry) {
      if (!isRefreshing) {
        isRefreshing = true;
        originalRequest._retry = true;

        try {
          await API.post("/auth/refresh-token");
          notifyRefreshSubscribers();
          return API(originalRequest);
        } catch (refreshErr) {
          localStorage.removeItem("accessToken"); // clear auth
          window.dispatchEvent(new CustomEvent("auth:sessionExpired"));
          return Promise.reject(refreshErr);
        } finally {
          isRefreshing = false;
        }
      } else {
        return new Promise((resolve) => {
          subscribeToRefresh(() => resolve(API(originalRequest)));
        });
      }
    }

    if (status === 401 && !isAuthRequest) {
      localStorage.removeItem("accessToken");
      window.dispatchEvent(new CustomEvent("auth:sessionExpired"));
    }

    // Extract standardized ApiError message from backend
    const errorMessage = err.response?.data?.message || err.message || "An unexpected error occurred";
    return Promise.reject(new Error(errorMessage));
  }
);

// -------- AUTH --------
export const loginAPI = (email, password) => API.post("/auth/login", { email, password });
export const registerAPI = (companyName, email, password) => API.post("/auth/register", { companyName, email, password });
export const logoutAPI = () => API.post("/auth/logout");

// -------- JOBS & RESUMES --------
export const parseJD = (jdText) => API.post("/jobs/create", { text: jdText });
export const parseLinkedIn = (url) => API.post("/resume/linkedin", { url });
export const parseResumeText = (text) => API.post("/resume/parse-text", { text });

export const uploadResumePDF = (file) => {
  const formData = new FormData();
  formData.append("resume", file);
  return API.post("/resume/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// -------- SCORING & INTERVIEWS --------
export const fetchScoringJobs = () => API.get("/scoring-jobs");
export const cancelScoringJob = (id) => API.post(`/scoring-jobs/${id}/cancel`);
export const generateInterviewQuestionsAPI = (payload) => API.post("/interviews", payload);

export default API;