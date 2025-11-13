import {
  apiPostDirect,
  apiPatchDirect,
  apiGetDirect,
  apiDelete,
} from "@/lib/apiHelpers";
import { type Agreement } from "@/types";

interface CreateAgreementDto {
  minutesId: string;
  name: string;
  agreementNumber: number;
}

interface UpdateAgreementDto {
  content: string;
}

interface UpdateAgreementNameNumberDto {
  name?: string;
  agreementNumber: number;
}

export const agreementService = {
  createAgreement: async (payload: CreateAgreementDto): Promise<Agreement> => {
    const newAgreement = await apiPostDirect<CreateAgreementDto, Agreement>(
      "/agreements/create",
      payload
    );
    console.log("✅ Acuerdo creado:", newAgreement);
    return newAgreement;
  },

  updateAgreement: async (
    id: string,
    payload: UpdateAgreementDto
  ): Promise<Agreement> => {
    const updatedAgreement = await apiPatchDirect<
      UpdateAgreementDto,
      Agreement
    >(`/agreements/update/${id}`, payload);
    return updatedAgreement;
  },

  getAllAgreements: async (): Promise<Agreement[]> => {
    console.log("🔍 Cargando TODOS los acuerdos...");
    const agreements = await apiGetDirect<Agreement[]>("/agreements/get-all");
    console.log(agreements);
    return agreements;
  },

  updateAgreementNameNumber: async (
    id: string,
    payload: UpdateAgreementNameNumberDto
  ): Promise<void> => {
    await apiPatchDirect<UpdateAgreementNameNumberDto, void>(
      `/agreements/update-name-number/${id}`,
      payload
    );
  },

  deleteAgreement: async (id: string): Promise<void> => {
    await apiDelete(`/agreements/delete/${id}`); //
  },
};
