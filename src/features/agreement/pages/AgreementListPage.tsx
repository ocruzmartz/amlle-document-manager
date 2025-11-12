import { useState, useEffect } from "react";
import { agreementService } from "@/features/agreement/api/agreementService"; // <-- Servicio REAL
import { columns } from "../components/AgreementColumns";
import { DataTable } from "@/components/ui/DataTable";
import { type Agreement } from "@/types";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const AgreementListPage = () => {
  const [allAgreements, setAllAgreements] = useState<Agreement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Hook para cargar datos cuando el componente se monta
  useEffect(() => {
    const fetchAgreements = async () => {
      try {
        // Llamar al servicio REAL (que apunta al endpoint futuro)
        const agreements = await agreementService.getAllAgreements();
        setAllAgreements(agreements);
      } catch (error: any) {
        console.error("Error al cargar acuerdos:", error);
        // Si el endpoint aún no existe, esto mostrará un error 404
        toast.error(
          error.message ||
            "No se pudieron cargar los acuerdos (endpoint no disponible)."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgreements();
  }, []); // El array vacío asegura que se ejecute solo una vez

  return (
    <div className="space-y-8 overflow-y-auto p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestión de Acuerdos
          </h1>
          <p className="text-muted-foreground mt-1">
            Todos los acuerdos de las actas municipales.
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
          data={allAgreements}
          filterColumnId="content" // O 'name' si lo prefieres
          filterPlaceholder="Filtrar por contenido del acuerdo..."
        />
      )}
    </div>
  );
};
