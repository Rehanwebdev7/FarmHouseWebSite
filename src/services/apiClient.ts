import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";

// Retrieve API Base URL from environment or fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://api.bossfarmhouse.com/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach Auth Token dynamically
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("boss_auth_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Global Error and Status Handler
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    const status = error.response?.status;
    const data = error.response?.data as { message?: string } | undefined;
    const message = data?.message || "An unexpected system error occurred.";

    if (status === 401) {
      // Unauthorized: Clear tokens and redirect to login if not already there
      localStorage.removeItem("boss_auth_token");
      localStorage.removeItem("boss_user_role");
      
      toast.error("Session Expired", {
        description: "Please log in again to restore secure access.",
      });

      if (!window.location.pathname.startsWith("/auth/login")) {
        window.location.href = `/auth/login?redirect=${encodeURIComponent(
          window.location.pathname
        )}`;
      }
    } else if (status === 403) {
      toast.error("Access Denied", {
        description: "You do not have authorization to view this resource.",
      });
    } else if (status === 500) {
      toast.error("Server Error", {
        description: "The core platform encountered an internal error. Engineers have been notified.",
      });
    } else {
      toast.error("Connection Error", {
        description: message,
      });
    }

    return Promise.reject(error);
  }
);

export default apiClient;
