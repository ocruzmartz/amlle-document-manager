export type MemberRole = "PROPIETARIO" | "SUPLENTE" | "SINDICO" | "SECRETARIA";

export interface CouncilMember {
  id: string;
  name: string;
  role: MemberRole;
  substituteForId?: string;
}
