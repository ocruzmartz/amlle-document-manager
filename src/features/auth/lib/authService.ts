import type { UserLogin } from "@/types/authContext";

// Definimos la interfaz para las credenciales de entrada
interface LoginCredentials {
  username: string;
  password: string; 
}
// Interfaz para el cambio de contraseña
interface ChangePasswordPayload {
    currentPassword: string;
    newPassword: string;
  }

export const apiChangePassword = async (
    payload: ChangePasswordPayload,
    token: string
  ): Promise<void> => {
    const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT || "http://localhost:3000"; 
  
    try {
      const response = await fetch(`${API_ENDPOINT}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // ⬇️ Incluye el token de autenticación
          Authorization: `Bearer ${token}`, 
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al cambiar la contraseña");
      }
  
      // La respuesta no necesita datos, solo éxito (200/204)
      console.log("Contraseña cambiada exitosamente");
    } catch (error: any) {
      console.error("Error en apiChangePassword:", error.message);
      throw new Error(error.message || "Error de conexión al cambiar la contraseña");
    }
  };

export const apiForgotPassword = async (email: string): Promise<void> => {
    const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT || "http://localhost:3000"; 
  
    try {
      const response = await fetch(`${API_ENDPOINT}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
  
      if (!response.ok) {
        // Intenta obtener un mensaje de error del backend
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al solicitar el restablecimiento");
      }
  
      // La respuesta exitosa generalmente no devuelve datos
      console.log("Solicitud de restablecimiento enviada exitosamente");
  
    } catch (error: any) {
      console.error("Error en apiForgotPassword:", error.message);
      throw new Error(error.message || "Error desconocido al contactar al servidor");
    }
  };
/**
 * Llama a la API para iniciar sesión.
 */
export const apiLogin = async (credentials: LoginCredentials): Promise<UserLogin> => {
  const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT || "http://localhost:3000"; 

  try {
    const response = await fetch(`${API_ENDPOINT}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al iniciar sesión");
    }

    const userData: UserLogin = await response.json();
    return userData;
  } catch (error: any) {
    console.error("Error en apiLogin:", error.message);
    throw new Error(error.message || "Error desconocido al conectar con el backend");
  }
};

/**
 * Función para cerrar sesión en el backend (ej. revocar token).
 */
export const apiLogout = async (): Promise<void> => {
  const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT || "http://localhost:3000";

  try {
    const response = await fetch(`${API_ENDPOINT}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Error al cerrar sesión");
    }

    console.log("Sesión cerrada exitosamente");
  } catch (error: any) {
    console.error("Error en apiLogout:", error.message);
    throw new Error(error.message || "Error desconocido al cerrar sesión");
  }
};