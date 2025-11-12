// filepath: src/features/audit/api/audit.ts
import { type FullActivityLog, type User, type LogAction, type LogTargetType } from "@/types";

// --- Almacén de Logs (ahora inicia vacío) ---
declare global {
  interface Window {
    auditLogsStore?: FullActivityLog[];
  }
}

/** Obtiene el almacén de logs, inicializándolo si es necesario */
const getLogsStore = (): FullActivityLog[] => {
  if (import.meta.env.DEV) {
    if (!window.auditLogsStore) {
      // ✅ Inicia como un array vacío, no con datos falsos
      window.auditLogsStore = [];
    }
    return window.auditLogsStore;
  }
  // En producción, siempre estará vacío al inicio
  return [];
};

/** Actualiza el almacén de logs (solo en DEV) */
const setLogsStore = (logs: FullActivityLog[]) => {
  if (import.meta.env.DEV) {
    window.auditLogsStore = logs;
  }
};

// --- Funciones de la API ---

/**
 * (Frontend) Recupera todos los logs de auditoría que se han registrado
 * en esta sesión del navegador.
 */
export const getAllLogs = (): FullActivityLog[] => {
    const logs = getLogsStore();
    // Devuelve los logs ordenados, los más nuevos primero
    const sortedLogs = [...logs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return sortedLogs;
};

/**
 * (Frontend) Añade un nuevo registro de auditoría al almacén de la sesión.
 * Esto es llamado por otros servicios (bookService, volumeService, etc.)
 */
export const addAuditLog = (logData: {
  user: Pick<User, "id" | "nombre">;
  action: LogAction;
  target: {
    type: LogTargetType;
    name: string;
    url: string;
  };
}): void => {
  const currentLogs = getLogsStore();

  const newLogEntry: FullActivityLog = {
    id: crypto.randomUUID(),
    user: logData.user.nombre,
    action: logData.action,
    targetType: logData.target.type,
    targetName: logData.target.name,
    targetUrl: logData.target.url,
    timestamp: new Date().toISOString(),
  };

  const updatedLogs = [newLogEntry, ...currentLogs];
  setLogsStore(updatedLogs);

  // eslint-disable-next-line no-console
  console.log("✅ Log de Auditoría (Frontend) Añadido:", newLogEntry);
};