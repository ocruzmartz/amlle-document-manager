import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error("❌ Error en request interceptor:", error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      "❌ Error en response:",
      error.response?.status,
      error.response?.data
    );

    if (error.response?.status === 401) {
      const hasToken = localStorage.getItem("token");
      if (hasToken) {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
