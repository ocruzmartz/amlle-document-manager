import { apiGetDirect } from "@/lib/apiHelpers";
import { type CouncilMember, type SimpleMember } from "@/types";

interface PropietarioApiResponse {
  id: string;
  name: string;
  approvedSubstitutes: SimpleMember[];
}

export const participantsService = {
  getPropietarios: async (): Promise<CouncilMember[]> => {
    const propietariosFromApi = await apiGetDirect<PropietarioApiResponse[]>(
      "/participants/propietarios"
    );

    const propietariosAsCouncilMembers: CouncilMember[] =
      propietariosFromApi.map((p) => ({
        ...p,
        role: "OWNER" as CouncilMember["role"],
      }));

    return propietariosAsCouncilMembers;
  },
};  