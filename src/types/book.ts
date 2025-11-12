import type { Tome, RecentTome, BookStatus } from "./tome";

export type { BookStatus, RecentTome };

export interface Book {
  id: string;
  name: string;
  status: "BORRADOR" | "FINALIZADO" | "ARCHIVADO";
  createdBy: {
    id: string;
    nombre: string;
    rol: string;
    activo: boolean;
    createdAt: string;
    updatedAt: string;
  };
  authorizationDate: string | null;
  closingDate: string | null;
  createdAt: string;
  updatedAt: string;
  tomos?: Tome[];
}

export type RecentBook = RecentTome;
