import { columns } from "../components/ActColumns";
import { DataTable } from "@/components/ui/DataTable";
import { useEffect, useState } from "react";
import { actService } from "../api/minutesService";
import { toast } from "sonner";
import type { Act } from "@/types";
import { Loader2 } from "lucide-react";

export const ActListPage = () => {
  const [allActs, setAllActs] = useState<Act[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Hook para cargar datos cuando el componente se monta
  useEffect(() => {
    const fetchActs = async () => {
      try {
        // Llamar al servicio REAL (que apunta al endpoint futuro)
        const acts = await actService.getAllActs();
        setAllActs(acts);
      } catch (error: unknown) {
        console.error("Error al cargar actas:", error);
        // Si el endpoint aún no existe, esto mostrará un error 404
        toast.error(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar las actas (endpoint no disponible)."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchActs();
  }, []); // El array vacío asegura que se ejecute solo una vez

  return (
    <div className="space-y-8 overflow-y-auto p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestión de Actas
          </h1>
          <p className="text-muted-foreground mt-1">
            Todas las actas de las sesiones municipales.
          </p>
        </div>
      </div>

      {/* Mostrar estado de carga o la tabla */}
      {isLoading ? (
        <div className="h-32 flex items-center justify-center">
          <Loader2 className="mr-2 h-5 w-5 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground text-center">Cargando...</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={allActs}
          filterColumnId="name"
          filterPlaceholder="Filtrar por nombre de acta..."
        />
      )}
    </div>
  );
};
