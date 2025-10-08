export type MemberRole = "OWNER" | "SUBSTITUTE" | "SYNDIC" | "SECRETARY";

export interface CouncilMember {
  id: string;
  name: string;
  role: MemberRole;
  substituteForId?: string;
}
