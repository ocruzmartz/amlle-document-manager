export type UserRole = "admin" | "editor" | "lector" | "regular";
export type SessionType = "indefinida" | "temporal";

export type User = {
  id: string;
  nombre: string;
  rol: UserRole;
  activo: boolean;
  sessionType: SessionType;
  sessionDuration: string | null; 
  createdAt: string;
  updatedAt: string;

  email?: string; 
};

export type SimpleUser = {
  id: string;
  nombre: string;
};