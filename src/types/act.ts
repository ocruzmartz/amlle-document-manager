import { type Agreement } from "./agreement";
import type { CouncilMember } from "./council";

export type ActSessionType = "Ordinaria" | "Extraordinaria" | "Especial";

export interface ActApiResponse {
  id: string;
  name: string;
  actNumber: number;
  meetingDate: string;
  meetingTime: string | null;
  bodyContent: string | null;
  status: string;
  createdAt: string;
  agreements: Agreement[];
  agreementCount?: number;
  sessionPoints?: string[];
  clarifyingNote?: string;
  volume?: { id: string; name: string };
  createdBy?: { id: string; nombre: string; rol: string } | null;
  updatedAt?: string;
  attendanceList: {
    id?: string;
    syndic: string | null;
    secretary: string | null;
    propietarioConvocado?: { id: string; name: string };
    asistioPropietario?: boolean;
    substitutoAsistente?: string | null;

    propietarioId?: string;
    propietarioName?: string;
    attended?: boolean;
    substituteId?: string | null;
    substituteName?: string | null;
  }[];

  volumeId?: string;
  volumeName?: string;
  bookName?: string;
  bookId?: string;
  createdByName?: string;
  latestModifierName?: string | null;
  latestModificationDate?: string | null;
}

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
  agreements: Agreement[];
  agreementsCount?: number;
  clarifyingNote?: string;
  createdAt: string;
  createdBy: string;
  lastModified: string;
  modifiedBy: string;
  attendanceList?: ActApiResponse["attendanceList"];
};
