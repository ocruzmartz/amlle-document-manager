import type { AuditLogEntry } from "@/types/audit";

// Obtener la fecha actual para simular entradas recientes
const now = new Date();

export const dummyAuditLogs: AuditLogEntry[] = [
  // 1. Creación de un nuevo libro (Reciente)
  {
    id: "log_001",
    actorId: "user_a",
    actorName: "Juan Pérez (Superadmin)",
    action: 'CREATE',
    entityType: 'BOOK',
    entityId: "book_4567",
    entityName: "Introducción a la Programación Funcional",
    // Hace 5 minutos
    timestamp: new Date(now.getTime() - 5 * 60000).toISOString(), 
  },
  
  // 2. Actualización de estado de un libro (Archivado)
  {
    id: "log_002",
    actorId: "user_b",
    actorName: "María García",
    action: 'UPDATE',
    entityType: 'BOOK',
    entityId: "book_1234",
    entityName: "Modelado de Bases de Datos NoSQL",
    // Hace 30 minutos
    timestamp: new Date(now.getTime() - 30 * 60000).toISOString(), 
  },
  
  // 3. Inicio de sesión exitoso (Seguridad)
  {
    id: "log_003",
    actorId: "user_a",
    actorName: "Juan Pérez (Superadmin)",
    action: 'LOGIN',
    entityType: 'USER',
    entityId: "user_a",
    entityName: "Juan Pérez",
    // Hace 45 minutos
    timestamp: new Date(now.getTime() - 45 * 60000).toISOString(), 
  },
  
  // 4. Eliminación de un documento crítico
  {
    id: "log_004",
    actorId: "user_c",
    actorName: "Carlos Ledesma",
    action: 'DELETE',
    entityType: 'ACT',
    entityId: "doc_9988",
    entityName: "Contrato Anual 2025",
    // Hace 2 horas
    timestamp: new Date(now.getTime() - 2 * 3600000).toISOString(), 
  },
  
  // 5. Cambio de contraseña (Seguridad)
  {
    id: "log_005",
    actorId: "user_b",
    actorName: "María García",
    action: 'PASSWORD_CHANGE',
    entityType: 'USER',
    entityId: "user_b",
    entityName: "María García",
    // Hace 1 día
    timestamp: new Date(now.getTime() - 24 * 3600000).toISOString(), 
  },
];