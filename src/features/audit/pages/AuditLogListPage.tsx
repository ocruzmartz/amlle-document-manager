import { useState, useEffect } from "react";
import {
  type FullActivityLog,
  type Tome,
  type Act,
  type Agreement,
  type LogTargetType,
} from "@/types";
import { columns } from "../components/AuditLogColumns";
import { DataTable } from "@/components/ui/DataTable";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { numberToRoman } from "@/lib/textUtils";
import { volumeService } from "@/features/book/api/volumeService";
import { actService } from "@/features/act/api/minutesService";
import { agreementService } from "@/features/agreement/api/agreementService";

const mapTomeToActivityLogs = (tome: Tome): FullActivityLog[] => {
  const logs: FullActivityLog[] = [];
  const createdUser = {
    nombre: tome.createdByName || "Sistema", // ✅ CORREGIDO
  };
  const lastModifier =
    tome.modificationName && tome.modificationName.length > 0
      ? tome.modificationName[tome.modificationName.length - 1]
      : tome.createdByName;
  const modifiedUser = {
    nombre: lastModifier || "Sistema", // ✅ CORREGIDO
  };
  const targetName = tome.name || `Tomo ${numberToRoman(tome.number)}`;
  const targetUrl = `/books/${tome.id}`;
  const targetType: LogTargetType = "Book";

  // 1. Log de Creación
  logs.push({
    id: `${tome.id}-created`,
    user: createdUser,
    action: "CREATED",
    timestamp: tome.createdAt,
    targetType: targetType,
    targetName: targetName,
    targetUrl: targetUrl,
    targetState: { initialActId: null },
  });

  // 2. Log de Modificación (usando updatedAt)
  if (tome.updatedAt && tome.updatedAt !== tome.createdAt) {
    logs.push({
      id: `${tome.id}-updated`,
      user: modifiedUser,
      action: "UPDATED",
      timestamp: tome.updatedAt,
      targetType: targetType,
      targetName: targetName,
      targetUrl: targetUrl,
      targetState: { initialActId: null },
    });
  }
  return logs;
};

const mapActToActivityLogs = (act: Act): FullActivityLog[] => {
  const logs: FullActivityLog[] = [];
  const createdUser = { nombre: act.createdBy || "Sistema" };
  const modifiedUser = {
    nombre: act.createdBy || act.createdBy || "Sistema",
  };
  const targetType: LogTargetType = "Act";

  logs.push({
    id: `${act.id}-created`,
    user: createdUser,
    action: "CREATED",
    timestamp: act.createdAt,
    targetType: targetType,
    targetName: act.name,
    targetUrl: `/books/${act.volumeId}`,
    targetState: { initialActId: act.id },
  });

  if (act.lastModified) {
    logs.push({
      id: `${act.id}-updated`,
      user: modifiedUser,
      action: "UPDATED",
      timestamp: act.lastModified,
      targetType: targetType,
      targetName: act.name,
      targetUrl: `/books/${act.volumeId}`,
      targetState: { initialActId: act.id },
    });
  }
  return logs;
};

const mapAgreementToActivityLogs = (
  agreement: Agreement
): FullActivityLog[] => {
  const logs: FullActivityLog[] = [];
  const createdUser = {
    nombre: agreement.createdByName || "Sistema",
  };
  const modifiedUser = {
    nombre:
      agreement.latestModifierName || agreement.createdByName || "Sistema",
  };
  const targetType: LogTargetType = "Agreement";

  logs.push({
    id: `${agreement.id}-created`,
    user: createdUser,
    action: "CREATED",
    timestamp: agreement.createdAt,
    targetType: targetType,
    targetName: agreement.name,
    targetUrl: `/books/${agreement.volumeId}`,
    targetState: {
      initialActId: agreement.minutesId,
      initialDetailView: {
        type: "agreement-editor",
        agreementId: agreement.id,
      },
    },
  });

  if (agreement.latestModificationDate) {
    logs.push({
      id: `${agreement.id}-updated`,
      user: modifiedUser,
      action: "UPDATED",
      timestamp: agreement.latestModificationDate,
      targetType: targetType,
      targetName: agreement.name,
      targetUrl: `/books/${agreement.volumeId}`,
      targetState: {
        initialActId: agreement.minutesId,
        initialDetailView: {
          type: "agreement-editor",
          agreementId: agreement.id,
        },
      },
    });
  }
  return logs;
};

// --- Página del Módulo de Auditoría ---

export const AuditLogListPage = () => {
  const [allLogs, setAllLogs] = useState<FullActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAllAuditData = async () => {
      setIsLoading(true);
      try {
        const [tomesResult, actsResult, agreementsResult] =
          await Promise.allSettled([
            volumeService.getAllVolumes(),
            actService.getAllActs(),
            agreementService.getAllAgreements(),
          ]);

        const combinedActivity: FullActivityLog[] = [];

        if (tomesResult.status === "fulfilled") {
          combinedActivity.push(
            ...tomesResult.value.flatMap(mapTomeToActivityLogs)
          );
        } else {
          toast.error("No se pudieron cargar los Tomos para la auditoría.");
        }

        if (actsResult.status === "fulfilled") {
          combinedActivity.push(
            ...actsResult.value.flatMap(mapActToActivityLogs)
          );
        } else {
          toast.error("No se pudieron cargar las Actas para la auditoría.");
        }

        if (agreementsResult.status === "fulfilled") {
          combinedActivity.push(
            ...agreementsResult.value.flatMap(mapAgreementToActivityLogs)
          );
        } else {
          toast.error("No se pudieron cargar los Acuerdos para la auditoría.");
        }

        const sortedActivity = combinedActivity.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        setAllLogs(sortedActivity);
      } catch (error: unknown) {
        console.error("Error crítico al cargar la auditoría:", error);
        if (error instanceof Error) {
          toast.error(
            error.message || "Error inesperado al cargar la auditoría."
          );
        } else {
          toast.error("Error inesperado al cargar la auditoría.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadAllAuditData();
  }, []);

  const facetedFilters = [
    {
      columnId: "action",
      title: "Acción",
      options: [
        { label: "Creado", value: "CREATED" },
        { label: "Modificado", value: "UPDATED" },
        // Eliminamos las acciones que ya no podemos detectar
      ],
    },
    {
      columnId: "targetType",
      title: "Objeto",
      options: [
        { label: "Libro (Tomo)", value: "Book" },
        { label: "Acta", value: "Act" },
        { label: "Acuerdo", value: "Agreement" },
      ],
    },
  ];

  return (
    <div className="space-y-8 overflow-y-auto p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Registro de Auditoría
          </h1>
          <p className="text-muted-foreground mt-1">
            Un registro de todas las creaciones y modificaciones en el sistema.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="mr-2 h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground text-center">
            Cargando historial de auditoría...
          </p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={allLogs}
          filterColumnId="targetName"
          filterPlaceholder="Filtrar por nombre de objeto..."
          facetedFilters={facetedFilters}
        />
      )}
    </div>
  );
};
