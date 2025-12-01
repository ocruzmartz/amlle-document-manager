import {
  apiGetDirect,
  apiPostDirect,
  apiPatchDirect,
  apiDelete,
} from "@/lib/apiHelpers";
import type {
  Propietario,
  Substituto,
  CreateParticipantDto,
  PropietarioApiResponse,
  CouncilMemberType,
} from "@/types/council";

interface SubstitutoApiResponse {
  id: string;
  name: string;
  type: CouncilMemberType | null;
}

const mapPropietario = (apiData: PropietarioApiResponse): Propietario => ({
  id: apiData.id,
  name: apiData.name,
  type: apiData.type, // ✅
  substitutos: (apiData.approvedSubstitutes || []).map((s) => ({
    id: s.id,
    name: s.name,
    type: s.type,
  })),
});

const mapSubstituto = (apiData: SubstitutoApiResponse): Substituto => ({
  id: apiData.id,
  name: apiData.name,
  type: apiData.type, // ✅
});

export const councilService = {
  getPropietarios: async (): Promise<Propietario[]> => {
    const response = await apiGetDirect<PropietarioApiResponse[]>(
      "/participants/propietarios"
    );
    console.log("Propietarios API Response:", response);
    return response.map(mapPropietario);
  },

  getPropietarioById: async (id: string): Promise<Propietario> => {
    const response = await apiGetDirect<PropietarioApiResponse>(
      `/participants/propietarios/${id}`
    );
    return mapPropietario(response);
  },

  createPropietario: async (data: CreateParticipantDto) => {
    return apiPostDirect<CreateParticipantDto, Propietario>(
      "/participants/propietarios",
      data
    );
  },

  updatePropietario: async (id: string, data: CreateParticipantDto) => {
    return apiPatchDirect<CreateParticipantDto, Propietario>(
      `/participants/propietarios/${id}`,
      data
    );
  },

  deletePropietario: async (id: string) => {
    return apiDelete(`/participants/propietarios/${id}`);
  },

  getSubstitutos: async (): Promise<Substituto[]> => {
    const response = await apiGetDirect<SubstitutoApiResponse[]>(
      "/participants/substitutos"
    );
    return response.map(mapSubstituto);
  },

  createSubstituto: async (data: CreateParticipantDto) => {
    return apiPostDirect<CreateParticipantDto, Substituto>(
      "/participants/substitutos",
      data
    );
  },

  updateSubstituto: async (id: string, data: CreateParticipantDto) => {
    return apiPatchDirect<CreateParticipantDto, Substituto>(
      `/participants/substitutos/${id}`,
      data
    );
  },

  deleteSubstituto: async (id: string) => {
    return apiDelete(`/participants/substitutos/${id}`);
  },

  assignSubstituto: async (propietarioId: string, substitutoId: string) => {
    return apiPostDirect(
      `/participants/propietarios/${propietarioId}/assign-substituto`,
      {
        substitutoId,
      }
    );
  },

  removeSubstituto: async (propietarioId: string, substitutoId: string) => {
    return apiDelete(
      `/participants/propietarios/${propietarioId}/remove-substituto/${substitutoId}`
    );
  },
};
