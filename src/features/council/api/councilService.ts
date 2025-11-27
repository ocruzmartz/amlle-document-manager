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
} from "@/types/council";

const mapPropietario = (apiData: PropietarioApiResponse): Propietario => ({
  id: apiData.id,
  name: apiData.name,
  substitutos: apiData.approvedSubstitutes || [],
});

export const councilService = {
  getPropietarios: async (): Promise<Propietario[]> => {
    const response = await apiGetDirect<PropietarioApiResponse[]>(
      "/participants/propietarios"
    );
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

  getSubstitutos: async () => {
    return apiGetDirect<Substituto[]>("/participants/substitutos");
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
