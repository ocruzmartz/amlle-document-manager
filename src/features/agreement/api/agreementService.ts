import { apiPostDirect, apiPatchDirect, apiGetDirect } from "@/lib/apiHelpers";
import { type Agreement } from "@/types";

/**
 * DTO para crear un nuevo acuerdo.
 * Basado en la imagen: POST /api/agreements/create
 * (El content es opcional y lo omitimos en la creación)
 */
interface CreateAgreementDto {
  minutesId: string;
  name: string;
  agreementNumber: number;
}

/**
 * DTO para actualizar el contenido de un acuerdo.
 * Basado en la imagen: PATCH /api/agreements/update/:id
 */
interface UpdateAgreementDto {
  content: string;
}

/**
 * DTO para actualizar el nombre y número de un acuerdo (para reordenar).
 * Basado en la imagen: PATCH /api/agreements/update-name-number/:id
 */
interface UpdateAgreementNameNumberDto {
  name?: string;
  agreementNumber: number;
}

export const agreementService = {
  /**
   * Crea un nuevo acuerdo y lo asocia a un acta (minutesId).
   */
  createAgreement: async (payload: CreateAgreementDto): Promise<Agreement> => {
    const newAgreement = await apiPostDirect<CreateAgreementDto, Agreement>(
      "/agreements/create",
      payload
    );
    console.log("✅ Acuerdo creado:", newAgreement);
    return newAgreement;
  },

  /**
   * Actualiza el contenido de un acuerdo existente.
   */
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

  /**
   * Actualiza el nombre y/o número de un acuerdo (usado para reordenar).
   */
  updateAgreementNameNumber: async (
    id: string,
    payload: UpdateAgreementNameNumberDto
  ): Promise<void> => {
    await apiPatchDirect<UpdateAgreementNameNumberDto, void>(
      `/agreements/update-name-number/${id}`,
      payload
    );
  },
};
