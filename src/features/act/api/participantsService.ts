// filepath: src/features/act/api/participantsService.ts

import { apiGetDirect } from "@/lib/apiHelpers";
// Importamos los dos tipos
import { type CouncilMember, type SimpleMember } from "@/types";

/**
 * Este es el tipo que REALMENTE devuelve la API
 * (id, name, approvedSubstitutes)
 */
interface PropietarioApiResponse {
  id: string;
  name: string;
  approvedSubstitutes: SimpleMember[];
}

let propietariosCache: CouncilMember[] | null = null;

export const participantsService = {
  getPropietarios: async (): Promise<CouncilMember[]> => {
    if (propietariosCache) {
      console.log("✅ Devolviendo propietarios desde caché...");
      return propietariosCache;
    }

    console.log("🔍 Llamando a /api/participants/propietarios...");
    const propietariosFromApi = await apiGetDirect<PropietarioApiResponse[]>(
      "/participants/propietarios"
    );

    const propietariosAsCouncilMembers: CouncilMember[] =
      propietariosFromApi.map((p) => ({
        ...p,
        role: "OWNER",
      }));

    propietariosCache = propietariosAsCouncilMembers;
    return propietariosCache;
  },
};
