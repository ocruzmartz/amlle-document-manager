export type CouncilMemberType =
  | "ALCALDESA"
  | "SINDICO"
  | "SECRETARIA"
  | "PRIMER_REGIDOR"
  | "SEGUNDO_REGIDOR"
  | "TERCER_REGIDOR"
  | "CUARTO_REGIDOR"
  | "PRIMER_SUPLENTE"
  | "SEGUNDO_SUPLENTE"
  | "TERCER_SUPLENTE"
  | "CUARTO_SUPLENTE";

export interface SimpleMember {
  id: string;
  name: string;
}

export interface CouncilMember {
  id: string;
  name: string;
  role: CouncilMemberType | null;
  substituteForId?: string;
  approvedSubstitutes?: SimpleMember[];
}

export interface PropietarioApiResponse {
  id: string;
  name: string;
  type: CouncilMemberType | null;
  approvedSubstitutes: {
    id: string;
    name: string;
    type: CouncilMemberType | null;
  }[];
  attendanceRecords?: unknown[];
}

export interface Substituto {
  id: string;
  name: string;
  type: CouncilMemberType | null;
}

export interface Propietario {
  id: string;
  name: string;
  type: CouncilMemberType | null;
  substitutos: Substituto[];
}

export interface CreateParticipantDto {
  name: string;
  type?: CouncilMemberType | null;
}
