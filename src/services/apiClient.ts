import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

// ✅ Interceptor de request: Agregar token automáticamente
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("🔑 Token agregado a la petición");
    }
    
    return config;
  },
  (error) => {
    console.error("❌ Error en request interceptor:", error);
    return Promise.reject(error);
  }
);

// ✅ Interceptor de response: Manejar errores 401 sin reload
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("❌ Error en response:", error.response?.status, error.response?.data);

    // ✅ Si el token es inválido (401), solo limpiar localStorage
    if (error.response?.status === 401) {
      console.warn("⚠️ Token inválido o expirado (401)");
      
      // Limpiar solo si hay token guardado
      const hasToken = localStorage.getItem("token");
      if (hasToken) {
        console.log("🧹 Limpiando token expirado...");
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        
        // ✅ NO hacer reload, dejar que el usuario vea el error
        // window.location.href = "/login"; ❌ ELIMINAR ESTO
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
