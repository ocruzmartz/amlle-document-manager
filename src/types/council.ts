export type MemberRole = "OWNER" | "SUBSTITUTE" | "SYNDIC" | "SECRETARY";

export interface SimpleMember {
  id: string;
  name: string;
}

export interface CouncilMember {
  id: string;
  name: string;
  role: MemberRole;
  substituteForId?: string;
  approvedSubstitutes?: SimpleMember[];
}
export interface PropietarioApiResponse {
  id: string;
  name: string;
  approvedSubstitutes: { id: string; name: string }[];
  attendanceRecords?: unknown[]; 
}

// Lo que usa tu Frontend (UI)
export interface Substituto {
  id: string;
  name: string;
}

export interface Propietario {
  id: string;
  name: string;
  substitutos: Substituto[]; // Mapeado desde approvedSubstitutes
}

export interface CreateParticipantDto {
  name: string;
}
