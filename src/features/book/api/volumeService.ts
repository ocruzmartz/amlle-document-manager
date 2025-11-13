import {
  apiPostDirect,
  apiGetDirect,
  apiDelete,
  apiPatchDirect,
} from "@/lib/apiHelpers";
import { numberToRoman } from "@/lib/textUtils";
import { type Tome, type BookStatus } from "@/types";

const DEFAULT_PDF_SETTINGS = {
  pageSize: "A4",
  orientation: "portrait",
  margins: {
    top: 50,
    bottom: 50,
    left: 60,
    right: 60,
  },
  lineHeight: 1.5,
  fontSize: 11,
  enablePageNumbering: false,
  pageNumberingOffset: 0,
  pageNumberingPosition: "center",
  pageNumberingFormat: "simple",
};
interface CreateVolumePayload {
  number: number;
  bookId: string;
  name: string | null;
  pdfSettings: typeof DEFAULT_PDF_SETTINGS;
  status: BookStatus;
}

interface CreateVolumeInput {
  number: number;
  bookId: string;
}

type UpdateVolumePayload = Partial<{
  name: string | null;
  pdfSettings: typeof DEFAULT_PDF_SETTINGS | null; // ✅ CORRECCIÓN: Aceptar null
  number: number;
  pageCount: number;
  status: BookStatus;
  authorizationDate: string;
  closingDate: string | null;
}>;

interface UpdateStatusDto {
  status: BookStatus;
}

export const volumeService = {
  createVolume: async (data: CreateVolumeInput): Promise<Tome> => {
    const payload: CreateVolumePayload = {
      bookId: data.bookId,
      number: data.number,
      name: null,
      status: "BORRADOR",
      pdfSettings: DEFAULT_PDF_SETTINGS,
    };

    const newTome = await apiPostDirect<CreateVolumePayload, Tome>(
      "/volume/create",
      payload
    );

    console.log("✅ Tomo creado (Payload AHORA SÍ es correcto):", newTome);

    if (!newTome.name) {
      newTome.name = `Tomo ${numberToRoman(newTome.number)}`;
    }
    newTome.acts = newTome.acts || [];
    newTome.actCount = newTome.actCount || 0;
    newTome.agreementCount = newTome.agreementCount || 0;

    return newTome;
  },

  getAllVolumes: async (): Promise<Tome[]> => {
    const response = await apiGetDirect<Tome[]>("/volume/find-all");
    console.log("✅ Tomos obtenidos (GET /volume/find-all):", response);
    return response;
  },

  getVolumesByBookId: async (bookId: string): Promise<Tome[]> => {
    return apiGetDirect<Tome[]>(`/volume/find-all-by-book/${bookId}`);
  },

  getVolumeById: async (id: string): Promise<Tome> => {
    const tome = await apiGetDirect<Tome>(`/volume/find/${id}`);
    console.log("✅ Tomo obtenido (GET /volume/find/:id):", tome);
    tome.acts = tome.acts || [];
    tome.actCount = tome.actCount || 0;
    tome.agreementCount = tome.agreementCount || 0;
    return tome;
  },

  updateVolume: async (
    id: string,
    data: UpdateVolumePayload
  ): Promise<Tome> => {
    const updatedTome = await apiPatchDirect<UpdateVolumePayload, Tome>(
      `/volume/update/${id}`,
      data
    );

    return updatedTome;
  },

  updateVolumeStatus: async (id: string, status: BookStatus): Promise<Tome> => {
    const payload: UpdateStatusDto = { status };
    return await apiPatchDirect<UpdateStatusDto, Tome>(
      `/volume/update-status/${id}`,
      payload
    );
  },

  deleteVolume: async (id: string): Promise<void> => {
    await apiDelete(`/volume/delete/${id}`);
  },
};
