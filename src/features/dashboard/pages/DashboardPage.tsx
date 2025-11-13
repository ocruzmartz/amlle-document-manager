import { useState, useEffect } from "react";
import { Book, FileText, Handshake, Loader2 } from "lucide-react";
import { volumeService } from "@/features/book/api/volumeService";
import { actService } from "@/features/act/api/minutesService";
import { agreementService } from "@/features/agreement/api/agreementService";
import StatCard from "../components/StatCard/StatCard";
import { RecentBooksTable } from "../components/RecentBookTable";
import { ActivityCard } from "../components/ActivityCard/ActiviyCard";
import {
  type Tome,
  type Act,
  type Agreement,
  type RecentTome,
  type ActivityLog,
  type LogTargetType,
} from "@/types";
import { numberToRoman } from "@/lib/textUtils";
import { toast } from "sonner";

interface DashboardStats {
  tomeCount: number;
  actCount: number;
  agreementCount: number;
}

const mapTomeToActivityLogs = (tome: Tome): ActivityLog[] => {
  const logs: ActivityLog[] = [];
  const createdUser = {
    nombre: tome.createdByName || "Sistema",
  };

  const lastModifier =
    tome.modificationName && tome.modificationName.length > 0
      ? tome.modificationName[tome.modificationName.length - 1]
      : tome.createdByName;

  const modifiedUser = {
    nombre: lastModifier || "Sistema",
  };

  const target = {
    type: "Book" as LogTargetType, 
    name: tome.name || `Tomo ${numberToRoman(tome.number)}`,
    url: `/books/${tome.id}`,
    state: { initialActId: null },
  };

  logs.push({
    id: `${tome.id}-created`,
    user: createdUser,
    action: "CREATED",
    timestamp: tome.createdAt,
    target: target,
  });

  if (tome.updatedAt && tome.updatedAt !== tome.createdAt) {
    logs.push({
      id: `${tome.id}-updated`,
      user: modifiedUser,
      action: "UPDATED",
      timestamp: tome.updatedAt,
      target: target,
    });
  }
  return logs;
};

const mapActToActivityLogs = (act: Act): ActivityLog[] => {
  const logs: ActivityLog[] = [];
  const createdUser = { nombre: act.createdBy || "Sistema" };
  const modifiedUser = {
    nombre: act.modifiedBy || act.createdBy || "Sistema", // ✅ CORREGIDO
  };
  const target = {
    type: "Act" as LogTargetType,
    name: act.name,
    url: `/books/${act.volumeId}`,
    state: { initialActId: act.id },
  };

  logs.push({
    id: `${act.id}-created`,
    user: createdUser,
    action: "CREATED",
    timestamp: act.createdAt,
    target: target,
  });

  if (act.lastModified) {
    logs.push({
      id: `${act.id}-updated`,
      user: modifiedUser,
      action: "UPDATED",
      timestamp: act.lastModified,
      target: target,
    });
  }
  return logs;
};

const mapAgreementToActivityLogs = (agreement: Agreement): ActivityLog[] => {
  const logs: ActivityLog[] = [];
  const createdUser = {
    nombre: agreement.createdByName || "Sistema", // ✅ CORREGIDO
  };
  const modifiedUser = {
    nombre:
      agreement.latestModifierName || agreement.createdByName || "Sistema", // ✅ CORREGIDO
  };
  const target = {
    type: "Agreement" as LogTargetType,
    name: agreement.name,
    url: `/books/${agreement.volumeId}`,
    state: {
      initialActId: agreement.minutesId,
      initialDetailView: {
        type: "agreement-editor",
        agreementId: agreement.id,
      },
    },
  };

  // 1. Log de Creación
  logs.push({
    id: `${agreement.id}-created`,
    user: createdUser,
    action: "CREATED",
    timestamp: agreement.createdAt,
    target: target,
  });

  // 2. Log de Modificación (usando latestModificationDate)
  if (agreement.latestModificationDate) {
    logs.push({
      id: `${agreement.id}-updated`,
      user: modifiedUser,
      action: "UPDATED",
      timestamp: agreement.latestModificationDate,
      target: target,
    });
  }
  return logs;
};

/**
 * Convierte un Tome al formato esperado por la tabla de libros recientes.
 */
const mapTomeToRecentTome = (tome: Tome): RecentTome => {
  const tomeName = tome.name || `Tomo ${numberToRoman(tome.number)}`;

  // Obtener el último modificador del array
  const lastModifier =
    tome.modificationName && tome.modificationName.length > 0
      ? tome.modificationName[tome.modificationName.length - 1]
      : tome.createdByName;

  return {
    id: tome.id,
    name: tomeName,
    bookName: tome.bookName || "Libro Desconocido", // bookName viene en el JSON
    status: tome.status,
    lastModified: tome.updatedAt, // updatedAt es la fecha de mod. más reciente
    url: `/books/${tome.id}`,
    modifiedBy: lastModifier || "Sistema", // Usar el último modificador
  };
};

// --- Componente Principal del Dashboard ---

const DashboardPage = () => {
  // Estados (sin cambios)
  const [stats, setStats] = useState<DashboardStats>({
    tomeCount: 0,
    actCount: 0,
    agreementCount: 0,
  });
  const [recentTomes, setRecentTomes] = useState<RecentTome[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // useEffect (lógica interna sin cambios, ahora usa los mappers corregidos)
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        const [tomesResult, actsResult, agreementsResult] =
          await Promise.allSettled([
            volumeService.getAllVolumes(),
            actService.getAllActs(),
            agreementService.getAllAgreements(),
          ]);

        // --- Procesar Estadísticas ---
        const newStats: DashboardStats = {
          tomeCount:
            tomesResult.status === "fulfilled" ? tomesResult.value.length : 0,
          actCount:
            actsResult.status === "fulfilled" ? actsResult.value.length : 0,
          agreementCount:
            agreementsResult.status === "fulfilled"
              ? agreementsResult.value.length
              : 0,
        };
        setStats(newStats);

        // --- Procesar Tomos Recientes ---
        if (tomesResult.status === "fulfilled") {
          const sortedTomes = [...tomesResult.value].sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
          setRecentTomes(sortedTomes.slice(0, 5).map(mapTomeToRecentTome));
        } else {
          console.error("Error al cargar tomos:", tomesResult.reason);
          toast.error("No se pudieron cargar los libros recientes.");
        }

        // --- Procesar Actividad Reciente (con mappers corregidos) ---
        const combinedActivity: ActivityLog[] = [];

        if (tomesResult.status === "fulfilled") {
          combinedActivity.push(
            ...tomesResult.value.flatMap(mapTomeToActivityLogs)
          );
        }
        if (actsResult.status === "fulfilled") {
          combinedActivity.push(
            ...actsResult.value.flatMap(mapActToActivityLogs)
          );
        }
        if (agreementsResult.status === "fulfilled") {
          combinedActivity.push(
            ...agreementsResult.value.flatMap(mapAgreementToActivityLogs)
          );
        }

        // Ordenar la lista combinada por fecha descendente
        const sortedActivity = combinedActivity.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        // Guardar las 4 más recientes
        setRecentActivity(sortedActivity.slice(0, 4));
      } catch (error) {
        console.error("Error crítico al cargar el dashboard:", error);
        toast.error("Error inesperado al cargar el dashboard.");
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Definición de statCardItems (sin cambios)
  const statCardItems = [
    {
      id: 1,
      icon: Book,
      description: "Tomos Registrados",
      value: isLoading ? "..." : stats.tomeCount,
      route: "/books",
    },
    {
      id: 2,
      icon: FileText,
      description: "Actas Registradas",
      value: isLoading ? "..." : stats.actCount,
      route: "/acts",
    },
    {
      id: 3,
      icon: Handshake,
      description: "Acuerdos Registrados",
      value: isLoading ? "..." : stats.agreementCount,
      route: "/agreements",
    },
  ];

  // JSX de renderizado (sin cambios)
  return (
    <div className="space-y-6 overflow-y-auto p-4 lg:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Un resumen rápido de la actividad del sistema.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 ">
        {statCardItems.map((item) => (
          <StatCard
            key={item.id}
            description={item.description}
            value={item.value}
            icon={item.icon}
            route={item.route}
          />
        ))}
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center rounded-lg border">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Cargando datos del dashboard...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <RecentBooksTable books={recentTomes} />
          <ActivityCard logs={recentActivity} />
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
