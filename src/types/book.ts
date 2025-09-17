import type { Act } from "./act";
import type { Agreement } from "./agreement";

export type BookStatus = 'BORRADOR' | 'PENDIENTE' | 'FINALIZADO' | 'ARCHIVADO';

export type Book = {
  id: string;
  name: string;
  tome?: number; // Lo mantenemos opcional para el futuro, pero no lo usaremos en la creación
  status: BookStatus;
  actaCount: number;
  acuerdoCount: number;
  pageCount: number;
  actas?: Act[];
  createdAt: string;
  lastModified: string;
  modifiedBy: string;
};

// Este es el tipo que usa nuestra tabla del dashboard
export type RecentBook = {
    id: string;
    name: string;
    status: BookStatus; // <-- Añadimos el estado
    lastModified: string;
    url: string;
    modifiedBy: string;
};

export type SelectedItem = 
  | { type: 'cover' } 
  | { type: 'acta', data: Act } 
  | { type: 'agreement', data: Agreement };

// ✅ Definición unificada y completa de WorkspaceView
export type WorkspaceView = 
  | { type: "cover" }
  | { type: "acta-list" }
  | { type: "acta-edit"; actaId: string }
  | { type: "acta"; data: Act }
  | { type: "agreement"; data: Agreement }
  | { type: "acta-editor"; data: Act }
  | { type: "agreement-editor"; data: Agreement };

  