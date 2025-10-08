import { type Agreement } from "./agreement";
import type { CouncilMember } from "./council";

export type ActSessionType = "Ordinary" | "Extraordinary" | "Special";

export type Act = {
  id: string;
  name: string;
  bookId: string;
  bookName: string;
  sessionDate: string;
  actNumber?: number;
  sessionType?: ActSessionType;
  sessionTime?: string;
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
