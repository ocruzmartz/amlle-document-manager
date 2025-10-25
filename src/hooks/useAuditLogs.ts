import { useState, useEffect } from 'react';
import { apiGetAuditLogs } from '@/features/audit/lib/auditService'; 
import type { AuditLogEntry } from '@/types/audit'; 
import { useAuth } from '@/hooks/AuthContext'; 

export const useAuditLogs = () => {
  const { user } = useAuth(); // Obtenemos el usuario (y el token)
  
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      if (!user?.token) {
        setError("Token de usuario no disponible. No autorizado.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await apiGetAuditLogs(user.token);
        setLogs(data);
      } catch (err: any) {
        setError(err.message || "Fallo al cargar logs.");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [user?.token]); // Se ejecuta al cargar y si cambia el token

  return { logs, loading, error };
};