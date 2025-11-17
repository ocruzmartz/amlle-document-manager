import {
  apiDelete,
  apiGetDirect,
  apiPatchDirect,
  apiPostDirect,
} from "@/lib/apiHelpers";
import {
  type Act,
  type ActApiResponse,
  type Agreement,
  type CouncilMember,
} from "@/types";
import { participantsService } from "./participantsService";
import { SessionTypeMapper } from "../lib/actMappers";

interface CreateMinutesDto {
  volumeId: string;
  actNumber: number;
  meetingDate: string;
  name: string;
  meetingTime: string | null;
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

async function _parseActFromApi(
  actResponse: ActApiResponse, // Aceptamos el JSON crudo
  allPropietarios: CouncilMember[],
  officials: {
    OFFICIAL_SYNDIC: CouncilMember;
    OFFICIAL_SECRETARY: CouncilMember;
  }
): Promise<Act> {
  const { OFFICIAL_SYNDIC, OFFICIAL_SECRETARY } = officials;

  let syndic: CouncilMember | null = null;
  let secretary: CouncilMember | null = null;
  const owners: CouncilMember[] = [];

  const attendanceList = actResponse.attendanceList;

  if (attendanceList && attendanceList.length > 0) {
    const firstRecord = attendanceList[0];

    // Asistencia de Oficiales
    if (firstRecord.syndic && firstRecord.syndic === OFFICIAL_SYNDIC.name) {
      syndic = OFFICIAL_SYNDIC;
    }
    if (
      firstRecord.secretary &&
      firstRecord.secretary === OFFICIAL_SECRETARY.name
    ) {
      secretary = OFFICIAL_SECRETARY;
    }

    // Asistencia de Propietarios
    attendanceList.forEach((record) => {
      const propietarioId =
        record.propietarioConvocado?.id || record.propietarioId;
      const attended = record.asistioPropietario ?? record.attended ?? false;
      const substituteId = record.substitutoAsistente || record.substituteId;

      if (attended) {
        if (substituteId) {
          const owner = allPropietarios.find((p) => p.id === propietarioId);
          const substitute = owner?.approvedSubstitutes?.find(
            (s) => s.id === substituteId
          );
          if (substitute) {
            owners.push({
              ...substitute,
              role: "SUBSTITUTE",
              substituteForId: owner?.id,
            });
          }
        } else {
          const owner = allPropietarios.find((p) => p.id === propietarioId);
          if (owner) {
            owners.push(owner);
          }
        }
      }
    });
  }

  // Ordenar acuerdos (AHORA SON COMPLETOS)
  const agreements = (actResponse.agreements || []).sort(
    (a: Agreement, b: Agreement) => {
      if (a.agreementNumber != null && b.agreementNumber != null) {
        return a.agreementNumber - b.agreementNumber;
      }
      return 0;
    }
  );

  // Mapear al tipo 'Act' limpio
  const finalAct: Act = {
    ...actResponse, // Copiamos la mayoría de los campos
    tomeId: actResponse.volume?.id ?? actResponse.volumeId!,
    tomeName: actResponse.volume?.name ?? actResponse.volumeName!,
    volumeId: actResponse.volume?.id ?? actResponse.volumeId!,
    volumeName: actResponse.volume?.name ?? actResponse.volumeName,
    bookName: actResponse.bookName ?? "",
    bookId: actResponse.bookId ?? "",
    sessionType: SessionTypeMapper.fromBackend(actResponse.status),
    attendees: { syndic, secretary, owners },
    agreements: agreements,
    agreementsCount: actResponse.agreementCount ?? agreements.length,
    bodyContent: actResponse.bodyContent || "",
    meetingTime: actResponse.meetingTime || undefined,
    createdBy:
      actResponse.createdByName || actResponse.createdBy?.nombre || "Sistema",
    lastModified:
      actResponse.latestModificationDate ||
      actResponse.updatedAt ||
      actResponse.createdAt,
    modifiedBy:
      actResponse.latestModifierName ||
      actResponse.createdBy?.nombre ||
      "Sistema",
  };

  return finalAct;
}

export const actService = {
  createAct: async (payload: CreateMinutesDto): Promise<Act> => {
    const newActResponse = await apiPostDirect<
      CreateMinutesDto,
      ActApiResponse
    >("/minutes/create", payload);

    console.log("✅ Acta creada desde el backend:", newActResponse);

    const [allPropietarios, { OFFICIAL_SYNDIC, OFFICIAL_SECRETARY }] =
      await Promise.all([
        participantsService.getPropietarios(),
        import("../lib/officials"),
      ]);

    return _parseActFromApi(newActResponse, allPropietarios, {
      OFFICIAL_SYNDIC,
      OFFICIAL_SECRETARY,
    });
  },

  getActById: async (id: string): Promise<Act> => {
    console.log(
      `🔍 Llamando a GET /api/minutes/find/${id} para cargar acta...`
    );

    const [
      allPropietarios,
      { OFFICIAL_SYNDIC, OFFICIAL_SECRETARY },
      actResponse,
    ] = await Promise.all([
      participantsService.getPropietarios(),
      import("../lib/officials"),
      apiGetDirect<ActApiResponse>(`/minutes/find/${id}`), // Recibimos 'any'
    ]);

    console.log("✅ Acta recibida del backend:", actResponse);

    return _parseActFromApi(actResponse, allPropietarios, {
      OFFICIAL_SYNDIC,
      OFFICIAL_SECRETARY,
    });
  },

  getAllActs: async (): Promise<Act[]> => {
    console.log("🔍 Cargando TODAS las actas...");

    const [
      allPropietarios,
      { OFFICIAL_SYNDIC, OFFICIAL_SECRETARY },
      actsResponse,
    ] = await Promise.all([
      participantsService.getPropietarios(),
      import("../lib/officials"),
      apiGetDirect<ActApiResponse[]>("/minutes/management/find-all"),
    ]);

    const parsedActs = await Promise.all(
      actsResponse.map((actResponse) =>
        _parseActFromApi(actResponse, allPropietarios, {
          OFFICIAL_SYNDIC,
          OFFICIAL_SECRETARY,
        })
      )
    );
    return parsedActs;
  },

  getTotalActCount: async (): Promise<number> => {
    return apiGetDirect<number>("/minutes/count/total");
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
      //actNumber: actToSave.actNumber,
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

    const [
      allPropietarios,
      { OFFICIAL_SYNDIC, OFFICIAL_SECRETARY },
      actsResponse,
    ] = await Promise.all([
      participantsService.getPropietarios(),
      import("../lib/officials"),
      apiGetDirect<ActApiResponse[]>(`/minutes/find-all-by-volume/${volumeId}`), // Recibimos 'any[]'
    ]);

    const parsedActs = await Promise.all(
      actsResponse.map((actResponse) =>
        _parseActFromApi(actResponse, allPropietarios, {
          OFFICIAL_SYNDIC,
          OFFICIAL_SECRETARY,
        })
      )
    );

    return parsedActs;
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

  deleteAct: async (id: string): Promise<void> => {
    await apiDelete(`/minutes/delete/${id}`); //
  },
};
