import { type CouncilMember } from "@/types";

/**
 * Esta es AHORA la 'Single Source of Truth' para los
 * oficiales que están definidos en el frontend.
 */

export const OFFICIAL_SYNDIC: CouncilMember = {
  // Este ID es solo para la lógica del frontend (el <Select>)
  id: "cm-2",
  name: "Edwin Gilberto Orellana Núñez",
  role: "SYNDIC",
};

export const OFFICIAL_SECRETARY: CouncilMember = {
  // Este ID es solo para la lógica del frontend (el <Select>)
  id: "cm-1",
  name: "Zoila Milagro Navas Quintanilla",
  role: "SECRETARY",
};

/**
 * Listas exportadas para que el modal las consuma
 */
export const availableSyndics: CouncilMember[] = [OFFICIAL_SYNDIC];
export const availableSecretaries: CouncilMember[] = [OFFICIAL_SECRETARY];
