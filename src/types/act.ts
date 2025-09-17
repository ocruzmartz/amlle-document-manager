import { type Agreement } from "./agreement";
import type { CouncilMember } from "./CouncilMembers";

export type Act = {
  id: string;
  name: string;
  sessionDate: string;
  actNumber?: number;
  sessionType?: "ordinaria" | "extraordinaria" | "especial";
  sessionTime?: string;
  sessionPoints?: string[];
  attendees?: {
    sindico?: CouncilMember | null;
    propietarios?: CouncilMember[];
    secretaria?: CouncilMember | null;
  };
  bodyContent: string;
  agreements: Agreement[];
};
