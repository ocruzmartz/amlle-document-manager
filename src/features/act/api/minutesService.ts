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
import { councilService } from "@/features/council/api/councilService";
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

interface AttendanceListItemDto {
  syndic: string;
  secretary: string;
  propietarioConvocadoId: string;
  asistioPropietario: boolean;
  substitutoAsistenteId: string | null;
}

interface UpdateMinutesDto {
  actNumber?: number;
  meetingDate?: string;
  meetingTime?: string;
  agenda?: string;
  bodyContent?: string;
  status?: string;
  attendanceList?: AttendanceListItemDto[];
  lastPageNumber?: number;
}

async function _parseActFromApi(actResponse: ActApiResponse): Promise<Act> {
  const allPropietarios = await councilService.getPropietarios();

  const presentOwnerIds = new Set<string>();
  const attendanceList = actResponse.attendanceList || [];

  attendanceList.forEach((record: any) => {
    const asistio = record.asistioPropietario ?? record.attended ?? false;
    const pId =
      record.propietarioConvocado?.id ||
      record.propietarioConvocadoId ||
      record.propietarioId;

    if (asistio && pId) {
      presentOwnerIds.add(pId);
    }
  });

  let syndic: CouncilMember | null = null;
  let secretary: CouncilMember | null = null;
  const owners: CouncilMember[] = [];

  if (attendanceList.length > 0) {
    attendanceList.forEach((record: any) => {
      const propietarioId =
        record.propietarioConvocado?.id ||
        record.propietarioConvocadoId ||
        record.propietarioId;
      const ownerAttended =
        record.asistioPropietario ?? record.attended ?? false;
      const rawSub =
        record.substitutoAsistente ||
        record.substitutoAsistenteId ||
        record.substituteId;
      const substituteId =
        typeof rawSub === "object" && rawSub !== null ? rawSub.id : rawSub;

      const ownerConfig = allPropietarios.find((p) => p.id === propietarioId);

      if (ownerConfig) {
        if (ownerAttended) {
          const alreadyAdded =
            owners.some((o) => o.id === ownerConfig.id) ||
            syndic?.id === ownerConfig.id ||
            secretary?.id === ownerConfig.id;

          if (!alreadyAdded) {
            const ownerMember: CouncilMember = {
              id: ownerConfig.id,
              name: ownerConfig.name,
              role: ownerConfig.type,
            };
            distributeMember(ownerMember, ownerConfig.type);
          }
        }

        if (substituteId) {
          const subConfig = ownerConfig.substitutos?.find(
            (s) => s.id === substituteId
          );

          if (subConfig) {
            const isSubstituting = !presentOwnerIds.has(ownerConfig.id);

            const subMember: CouncilMember = {
              id: subConfig.id,
              name: subConfig.name,
              role: subConfig.type,
              substituteForId: isSubstituting ? ownerConfig.id : undefined,
            };
            distributeMember(subMember, subConfig.type);
          }
        }
      }
    });
  }

  function distributeMember(member: CouncilMember, roleType?: string | null) {
    if (roleType === "SINDICO") {
      if (!syndic || member.substituteForId) syndic = member;
    } else if (roleType === "SECRETARIA") {
      if (!secretary || member.substituteForId) secretary = member;
    } else {
      if (!owners.some((o) => o.id === member.id)) {
        owners.push(member);
      }
    }
  }

  const agreements = (actResponse.agreements || []).sort(
    (a: Agreement, b: Agreement) => {
      if (a.agreementNumber != null && b.agreementNumber != null)
        return a.agreementNumber - b.agreementNumber;
      return 0;
    }
  );

  return {
    ...actResponse,
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
}

export const actService = {
  createAct: async (payload: CreateMinutesDto): Promise<Act> => {
    const newActResponse = await apiPostDirect<
      CreateMinutesDto,
      ActApiResponse
    >("/minutes/create", payload);
    return _parseActFromApi(newActResponse);
  },

  getActById: async (id: string): Promise<Act> => {
    const actResponse = await apiGetDirect<ActApiResponse>(
      `/minutes/find/${id}`
    );
    return _parseActFromApi(actResponse);
  },

  getAllActs: async (): Promise<Act[]> => {
    const actsResponse = await apiGetDirect<ActApiResponse[]>(
      "/minutes/management/find-all"
    );
    const parsedActs = await Promise.all(
      actsResponse.map((act) => _parseActFromApi(act))
    );
    return parsedActs;
  },

  getTotalActCount: async (): Promise<number> => {
    return apiGetDirect<number>("/minutes/count/total");
  },

  updateAct: async (actToSave: Act): Promise<void> => {
    const allOwners = await councilService.getPropietarios();
    const syndicNameString = actToSave.attendees?.syndic?.name || "Sin Asignar";
    const secretaryNameString =
      actToSave.attendees?.secretary?.name || "Sin Asignar";

    const allPresentMembers = [
      actToSave.attendees?.syndic,
      actToSave.attendees?.secretary,
      ...(actToSave.attendees?.owners || []),
    ].filter((m): m is CouncilMember => !!m);

    const attendanceList: AttendanceListItemDto[] = [];

    allOwners.forEach((owner) => {
      // 1. Propietario
      const ownerRecord = allPresentMembers.find((att) => att.id === owner.id);

      if (ownerRecord) {
        // Enviar registro del propietario
        attendanceList.push({
          syndic: syndicNameString,
          secretary: secretaryNameString,
          propietarioConvocadoId: owner.id,
          asistioPropietario: true,
          substitutoAsistenteId: null,
        });
      }

      // 2. Suplentes (Iteramos para ver si alguno asistió)
      if (owner.substitutos && owner.substitutos.length > 0) {
        owner.substitutos.forEach((sub) => {
          const subIsPresent = allPresentMembers.some(
            (att) => att.id === sub.id
          );

          if (subIsPresent) {
            // Enviar registro del suplente (vinculado al propietario, pero asistio=false)
            // Esto cumple: "1 asistencia para 1 persona (el suplente)"
            attendanceList.push({
              syndic: syndicNameString,
              secretary: secretaryNameString,
              propietarioConvocadoId: owner.id,
              asistioPropietario: false,
              substitutoAsistenteId: sub.id,
            });
          }
        });
      }
    });

    const payload: UpdateMinutesDto = {
      meetingDate: actToSave.meetingDate,
      meetingTime: actToSave.meetingTime,
      bodyContent: actToSave.bodyContent,
      status: SessionTypeMapper.toBackend(actToSave.sessionType),
      attendanceList: attendanceList,
      lastPageNumber: actToSave.lastPageNumber,
    };

    await apiPatchDirect<UpdateMinutesDto, void>(
      `/minutes/update/${actToSave.id}`,
      payload
    );
  },

  getActsByVolumeId: async (volumeId: string): Promise<Act[]> => {
    const actsResponse = await apiGetDirect<ActApiResponse[]>(
      `/minutes/find-all-by-volume/${volumeId}`
    );
    return Promise.all(actsResponse.map((act) => _parseActFromApi(act)));
  },

  updateActNameNumber: async (
    id: string,
    name: string,
    actNumber: number
  ): Promise<void> => {
    const payload: UpdateMinutesNameNumberDto = { name, actNumber };
    await apiPatchDirect<UpdateMinutesNameNumberDto, void>(
      `update-name-number/${id}`,
      payload
    );
  },

  deleteAct: async (id: string): Promise<void> => {
    await apiDelete(`/minutes/delete/${id}`);
  },
};
