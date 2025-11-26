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
