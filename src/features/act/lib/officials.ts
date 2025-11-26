import { type CouncilMember } from "@/types";

export const OFFICIAL_SYNDIC: CouncilMember = {
  id: "cm-2",
  name: "Edwin Gilberto Orellana Núñez",
  role: "SYNDIC",
};

export const OFFICIAL_SECRETARY: CouncilMember = {
  id: "cm-1",
  name: "Zoila Milagro Navas Quintanilla",
  role: "SECRETARY",
};

export const availableSyndics: CouncilMember[] = [OFFICIAL_SYNDIC];
export const availableSecretaries: CouncilMember[] = [OFFICIAL_SECRETARY];
