import axios from "axios";

// Default base URL for API endpoints
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds (generous for larger audio uploads)
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: can be used for appending JWT auth tokens
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: unifies error handling from backend
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Standardize error formats
    const standardizedError = {
      message: "An unexpected error occurred",
      status: error.response?.status || 500,
      data: error.response?.data || null,
    };

    if (error.response) {
      // Server responded with an error status
      standardizedError.message = error.response.data?.message || error.response.data?.error || `Server error (${error.response.status})`;
    } else if (error.request) {
      // Request was made but no response received
      standardizedError.message = "No response from server. Check your connection.";
    } else {
      // Error setting up request
      standardizedError.message = error.message;
    }

    console.error("[Axios Interceptor Error]:", standardizedError);
    return Promise.reject(standardizedError);
  }
);

export default apiClient;
