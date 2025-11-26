import { apiGetDirect } from "@/lib/apiHelpers";
import { type CouncilMember, type SimpleMember } from "@/types";

interface PropietarioApiResponse {
  id: string;
  name: string;
  approvedSubstitutes: SimpleMember[];
}

let propietariosCache: CouncilMember[] | null = null;

export const participantsService = {
  getPropietarios: async (): Promise<CouncilMember[]> => {
    if (propietariosCache) {
      return propietariosCache;
    }

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
