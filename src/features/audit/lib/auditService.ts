import type { AuditLogEntry } from "@/types/audit"; 

/**
 * Obtiene el registro de auditoría del backend.
 * Nota: Asume que el token se obtiene de alguna manera (p. ej., de un hook de autenticación o se pasa como argumento).
 * * @param token Token de autenticación del usuario.
 * @returns Una promesa que resuelve con la lista de entradas de auditoría.
 */
export const apiGetAuditLogs = async (token: string): Promise<AuditLogEntry[]> => {
  const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT || "http://localhost:3000"; 

  try {
    const response = await fetch(`${API_ENDPOINT}/audit/logs`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // La auditoría requiere autenticación y, probablemente, permisos de Superadmin.
        "Authorization": `Bearer ${token}`, 
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al obtener el registro de auditoría");
    }

    const auditLogs: AuditLogEntry[] = await response.json();
    return auditLogs;

  } catch (error: any) {
    console.error("Error en apiGetAuditLogs:", error.message);
    throw new Error(error.message || "Error de conexión al obtener la auditoría");
  }
};