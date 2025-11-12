import { apiGetDirect, apiPatchDirect, apiPostDirect } from "@/lib/apiHelpers";
import { type Act, type Agreement, type CouncilMember } from "@/types";
import { participantsService } from "./participantsService";
import { SessionTypeMapper } from "../lib/actMappers";

interface CreateMinutesDto {
  volumeId: string;
  actNumber: number;
  meetingDate: string;
  name: string;
}

interface UpdateMinutesNameNumberDto {
  name: string;
  actNumber: number;
}

/**
 * 1. DTO de la LISTA DE ASISTENCIA (para el array attendanceList)
 */
interface AttendanceListItemDto {
  syndic: string | null;
  secretary: string | null;
  propietarioConvocadoId: string;
  asistioPropietario: boolean;
  substitutoAsistenteId: string | null;
}

/**
 * 2. DTO de ACTUALIZACIÓN COMPLETO (Basado en el payload del backend)
 */
interface UpdateMinutesDto {
  actNumber?: number; // Lo enviamos como number
  meetingDate?: string; // ISO 8601
  meetingTime?: string;
  agenda?: string; // Mapeado desde act.sessionPoints
  bodyContent?: string;
  status?: string;
  attendanceList?: AttendanceListItemDto[];
}

interface PropietarioConvocadoApiItem {
  id: string;
  name: string;
}

interface AttendanceListApiResponseItem {
  id: string;
  syndic: string | null; // El backend devuelve el NOMBRE
  secretary: string | null; // El backend devuelve el NOMBRE
  propietarioConvocado: PropietarioConvocadoApiItem;
  asistioPropietario: boolean;
  substitutoAsistente: string | null; // ID del sustituto
}

interface ActApiResponse {
  id: string;
  name: string;
  volume: { id: string; name: string };
  actNumber: number;
  meetingDate: string;
  meetingTime: string | null;
  bodyContent: string;
  status: string; // "ORDINARIA", "ESPECIAL", etc.
  attendanceList: AttendanceListApiResponseItem[];
  agreements: Agreement[];
  createdBy: {
    id: string;
    nombre: string;
    rol: string;
  } | null;
  // Faltan 'sessionPoints' y 'clarifyingNote' en tu JSON,
  // pero los mantendremos por si acaso
  sessionPoints?: string[];
  clarifyingNote?: string;
  createdAt: string;
  updatedAt: string;
}

export const actService = {
  createAct: async (payload: CreateMinutesDto): Promise<Act> => {
    const newAct = await apiPostDirect<CreateMinutesDto, Act>(
      "/minutes/create",
      payload
    );

    console.log("✅ Acta creada desde el backend:", newAct);

    if (!newAct.agreements) {
      newAct.agreements = [];
    }

    return newAct;
  },

  getActById: async (id: string): Promise<Act> => {
    console.log(
      `🔍 Llamando a GET /api/minutes/find/${id} para cargar acta...`
    );

    const allPropietarios = await participantsService.getPropietarios();

    // ✅ 2. Cargar nuestra "fuente de verdad" de oficiales
    const { OFFICIAL_SYNDIC, OFFICIAL_SECRETARY } = await import(
      "../lib/officials"
    );

    const actResponse = await apiGetDirect<ActApiResponse>(
      `/minutes/find/${id}`
    );

    console.log("✅ Acta recibida del backend:", actResponse);

    let syndic: CouncilMember | null = null;
    let secretary: CouncilMember | null = null;
    const owners: CouncilMember[] = [];

    const attendanceList: AttendanceListApiResponseItem[] | undefined =
      actResponse.attendanceList;

    if (attendanceList && attendanceList.length > 0) {
      // Usamos el primer registro solo para verificar la asistencia
      // de los oficiales.
      const firstRecord = attendanceList[0];

      // ✅ 5. Lógica de asistencia (CORREGIDA)
      // Comparamos el NOMBRE del JSON de API con el NOMBRE de nuestra
      // fuente de verdad.
      if (firstRecord.syndic && firstRecord.syndic === OFFICIAL_SYNDIC.name) {
        syndic = OFFICIAL_SYNDIC; // Asistió
      } else {
        syndic = null; // No asistió
      }

      if (
        firstRecord.secretary &&
        firstRecord.secretary === OFFICIAL_SECRETARY.name
      ) {
        secretary = OFFICIAL_SECRETARY; // Asistió
      } else {
        secretary = null; // No asistió
      }

      // ✅ 6. Lógica de propietarios (sin cambios, ya era correcta)
      attendanceList.forEach((record) => {
        if (record.asistioPropietario) {
          const isSubstitute = !!record.substitutoAsistente;

          if (isSubstitute) {
            const owner = allPropietarios.find(
              (p) => p.id === record.propietarioConvocado.id
            );
            const substitute = owner?.approvedSubstitutes?.find(
              (s) => s.id === record.substitutoAsistente
            );

            if (substitute) {
              owners.push({
                ...substitute,
                role: "SUBSTITUTE",
                substituteForId: owner?.id,
              });
            }
          } else {
            const owner = allPropietarios.find(
              (p) => p.id === record.propietarioConvocado.id
            );
            if (owner) {
              owners.push(owner);
            }
          }
        }
      });
    }

    const agreementsFromApi: Agreement[] = actResponse.agreements || [];
    const sortedAgreements = agreementsFromApi.sort((a, b) => {
      if (a.agreementNumber && b.agreementNumber) {
        return a.agreementNumber - b.agreementNumber;
      }
      return 0;
    });

    const finalAct: Act = {
      id: actResponse.id,
      name: actResponse.name,
      tomeId: actResponse.volume.id,
      tomeName: actResponse.volume.name,
      volumeId: actResponse.volume.id,
      actNumber: actResponse.actNumber,
      meetingDate: actResponse.meetingDate,
      meetingTime: actResponse.meetingTime || undefined,
      sessionType: SessionTypeMapper.fromBackend(actResponse.status),
      attendees: {
        syndic,
        secretary,
        owners,
      },
      agreements: sortedAgreements,
      sessionPoints: actResponse.sessionPoints || [],
      bodyContent: actResponse.bodyContent || "",
      clarifyingNote: actResponse.clarifyingNote || "",
      createdAt: actResponse.createdAt,
      createdBy: actResponse.createdBy?.nombre || "",
      lastModified: actResponse.updatedAt,
      modifiedBy: actResponse.createdBy?.nombre || "",
    };

    console.log(
      `✅ Acta ${id} cargada y mapeada. Concejales Presentes: ${owners.length}`
    );
    return finalAct;
  },

  getAllActs: async (): Promise<Act[]> => {
    console.log("🔍 Cargando TODAS las actas...");
    const acts = await apiGetDirect<Act[]>("/minutes/find-all");
    console.log(acts);
    return acts.map((act) => ({
      ...act,
      agreements: act.agreements || [],
    }));
  },

  updateAct: async (actToSave: Act): Promise<void> => {
    const allOwners = await participantsService.getPropietarios();

    const syndicNameString = actToSave.attendees?.syndic?.name;
    const secretaryNameString = actToSave.attendees?.secretary?.name;

    if (!syndicNameString || !secretaryNameString) {
      throw new Error(
        "No se pudieron encontrar los nombres del Síndico o Secretaria en el acta. Por favor, gestione la asistencia de nuevo."
      );
    }

    const attendedMembers = actToSave.attendees?.owners || [];

    const attendanceList: AttendanceListItemDto[] = allOwners.map((owner) => {
      const attendanceRecord = attendedMembers.find(
        (att) => att.id === owner.id || att.substituteForId === owner.id
      );

      const asistio = !!attendanceRecord;
      let substitutoId: string | null = null;

      if (asistio && attendanceRecord?.substituteForId === owner.id) {
        substitutoId = attendanceRecord.id;
      }

      return {
        syndic: syndicNameString,
        secretary: secretaryNameString,
        propietarioConvocadoId: owner.id,
        asistioPropietario: asistio,
        substitutoAsistenteId: substitutoId,
      };
    });

    // ✅ Payload simplificado
    const payload: UpdateMinutesDto = {
      actNumber: actToSave.actNumber,
      meetingDate: actToSave.meetingDate,
      meetingTime: actToSave.meetingTime,
      bodyContent: actToSave.bodyContent,
      status: SessionTypeMapper.toBackend(actToSave.sessionType), // ✅ Usar mapper
      attendanceList: attendanceList,
    };

    await apiPatchDirect<UpdateMinutesDto, void>(
      `/minutes/update/${actToSave.id}`,
      payload
    );

    console.log(`✅ Acta ${actToSave.id} actualizada.`);
  },

  getActsByVolumeId: async (volumeId: string): Promise<Act[]> => {
    console.log(`🔍 Cargando actas para el tomo ${volumeId}...`);

    const acts = await apiGetDirect<Act[]>(
      `/minutes/find-all-by-volume/${volumeId}`
    );
    return acts.map((act) => ({
      ...act,
      agreements: act.agreements || [],
    }));
  },

  updateActNameNumber: async (
    id: string,
    name: string,
    actNumber: number
  ): Promise<void> => {
    const payload: UpdateMinutesNameNumberDto = {
      name,
      actNumber,
    };

    await apiPatchDirect<UpdateMinutesNameNumberDto, void>(
      `update-name-number/${id}`,
      payload
    );
  },
};
