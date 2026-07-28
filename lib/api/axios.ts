import axios from "axios";
import { clearAuthCookies, getAuthToken } from "@/lib/utils/cookies";

export const baseURL ="https://api.staging.mylovingday.com";

export const API = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && typeof window !== "undefined") {
      clearAuthCookies();
      if (!window.location.pathname.startsWith("/auth/login")) {
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);
