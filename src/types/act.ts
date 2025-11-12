// src/types/act.ts
import { type Agreement } from "./agreement";
import type { CouncilMember } from "./council";

export type ActSessionType = "Ordinaria" | "Extraordinaria" | "Especial";

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
  latestModificationDate?: string;
  latestModifierName?: string;
  createdByName?: string;
  // sessionDate: string;
  //sessionTime?: string;
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
};

