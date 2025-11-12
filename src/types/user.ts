// filepath: src/types/user.ts
// (Este archivo reemplaza el user.ts que tenías)

export type UserRole = "admin" | "editor" | "lector" | "regular";
export type SessionType = "indefinida" | "temporal";

/**
 * Este es el modelo de datos de Usuario
 * tal como lo define el backend.
 */
export type User = {
  id: string;
  nombre: string;
  rol: UserRole;
  activo: boolean;
  sessionType: SessionType;
  sessionDuration: string | null; // ej: "8h", "1d"
  createdAt: string;
  updatedAt: string;
  
  // Campos que el GET /all no trae, pero el form usa
  email?: string; 
};

export type SimpleUser = {
  id: string;
  nombre: string;
};