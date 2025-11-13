// filepath: src/types/act.ts
import { type Agreement } from "./agreement";
import type { CouncilMember } from "./council";

export type ActSessionType = "Ordinaria" | "Extraordinaria" | "Especial";

/**
 * ✅ 1. ESTE TIPO REPRESENTA LA RESPUESTA CRUDA DE LA API
 * Define AMBAS respuestas (getById y getByVolumeId) usando campos opcionales.
 */
export interface ActApiResponse {
  id: string;
  name: string;
  actNumber: number;
  meetingDate: string;
  meetingTime: string | null;
  bodyContent: string | null;
  status: string; // "ORDINARIA", "ESPECIAL", etc.
  createdAt: string;
  agreements: Agreement[]; // ✅ Siempre es un array de Agreement completo
  agreementCount?: number;
  sessionPoints?: string[];
  clarifyingNote?: string;

  // --- Campos que difieren ---

  // Para getById
  volume?: { id: string; name: string };
  createdBy?: { id: string; nombre: string; rol: string } | null;
  updatedAt?: string;
  attendanceList: {
    id?: string; // Solo en getById
    syndic: string | null;
    secretary: string | null;
    propietarioConvocado?: { id: string; name: string }; // Solo en getById
    asistioPropietario?: boolean; // Solo en getById
    substitutoAsistente?: string | null; // Solo en getById

    // Solo en getByVolumeId
    propietarioId?: string;
    propietarioName?: string;
    attended?: boolean;
    substituteId?: string | null;
    substituteName?: string | null;
  }[];

  // Para getByVolumeId
  volumeId?: string;
  volumeName?: string;
  bookName?: string;
  bookId?: string;
  createdByName?: string;
  latestModifierName?: string | null;
  latestModificationDate?: string | null;
}

/**
 * ✅ 2. ESTE TIPO ES EL MODELO LIMPIO QUE USA EL FRONTEND
 * (Sin cambios, ya era correcto)
 */
export type Act = {
  id: string;
  name: string;
  tomeId: string;
  tomeName: string;
  volumeId: string;
  volumeName?: string;
  bookName?: string;
  bookId?: string;
  actNumber?: number;
  sessionType?: ActSessionType;
  meetingDate?: string;
  meetingTime?: string;
  sessionPoints?: string[];
  attendees?: {
    syndic?: CouncilMember | null;
    owners?: CouncilMember[];
    secretary?: CouncilMember | null;
  };
  bodyContent: string;
  agreements: Agreement[]; // Siempre completo
  agreementsCount?: number;
  clarifyingNote?: string;
  createdAt: string;
  createdBy: string;
  lastModified: string;
  modifiedBy: string;

  // Opcional: El campo crudo de la API (si lo necesitamos)
  attendanceList?: ActApiResponse["attendanceList"];
};
