import {
  apiPostDirect,
  apiGetDirect,
  apiDelete,
  apiPatchDirect,
} from "@/lib/apiHelpers";
import { numberToRoman } from "@/lib/textUtils";
import { type Tome, type BookStatus } from "@/types";

// 1. Definición de los settings por defecto (sin cambios)
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

/**
 * 2. DTO para el PAYLOAD de CREACIÓN
 * (Coincide con tu imagen image_0926e1.png)
 */
interface CreateVolumePayload {
  number: number;
  bookId: string;
  name: string | null;
  pdfSettings: typeof DEFAULT_PDF_SETTINGS;
  status: BookStatus;
}

/**
 * 3. DTO de entrada para NUESTRA función (sin cambios)
 */
interface CreateVolumeInput {
  number: number;
  bookId: string;
}

/**
 * 4. DTO para ACTUALIZAR
 * (Coincide con tu imagen image_0926fd.png)
 * Es Partial<> porque solo enviamos los campos que cambian.
 */
type UpdateVolumePayload = Partial<{
  name: string | null;
  pdfSettings: typeof DEFAULT_PDF_SETTINGS | null; // ✅ CORRECCIÓN: Aceptar null
  number: number;
  pageCount: number;
  status: BookStatus;
  authorizationDate: string;
  closingDate: string | null;
}>;

/**
 * Servicio para operaciones de volúmenes (tomos) con el backend
 */
export const volumeService = {
  /**
   * Crear un nuevo volumen (tomo)
   */
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

  // ... (getAllVolumes, getVolumesByBookId, getVolumeById sin cambios) ...
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

  /**
   * 5. updateVolume ahora usa el DTO de actualización
   * y apunta al endpoint /volume/update/:id
   */
  updateVolume: async (
    id: string,
    data: UpdateVolumePayload // Acepta el DTO parcial de actualización
  ): Promise<Tome> => {
    const updatedTome = await apiPatchDirect<UpdateVolumePayload, Tome>(
      `/volume/update/${id}`, // Endpoint de actualización
      data
    );

    return updatedTome;
  },

  deleteVolume: async (id: string): Promise<void> => {
    await apiDelete(`/volume/${id}`);
  },
};
