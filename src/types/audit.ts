export interface AuditLogEntry {
    id: string;
    
    // Quién realizó la acción
    actorId: string;
    actorName: string; 
    
    // Qué acción se realizó (CRUD)
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'PASSWORD_CHANGE'; 
    
    // Sobre qué entidad se realizó la acción (Libro, Usuario, etc.)
    entityType: 'BOOK' | 'USER' | 'ACT';
    entityId: string;
    entityName: string; // Nombre del libro/usuario afectado (para facilitar la lectura)
    
    // Cuándo ocurrió la acción
    timestamp: string; // Fecha y hora ISO
  }