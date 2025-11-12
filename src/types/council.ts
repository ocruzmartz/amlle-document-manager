// filepath: src/types/council.ts

export type MemberRole = "OWNER" | "SUBSTITUTE" | "SYNDIC" | "SECRETARY";

/**
 * Un tipo simple para el array de sustitutos
 * (Coincide con la estructura de 'approvedSubstitutes')
 */
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
