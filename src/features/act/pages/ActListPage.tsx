
import { getAllActs } from "@/features/book/api/book";
import { columns } from "../components/ActColumns";
import { DataTable } from "@/components/ui/DataTable";

export const ActListPage = () => {
  const allActs = getAllActs();

  return (
    <div className="space-y-8 overflow-y-auto p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestión de Actas
          </h1>
          <p className="text-muted-foreground mt-1">
            Actas de las sesiones municipales.
          </p>
        </div>
      </div>

      {/* ✅ Usando el componente DataTable genérico */}
      <DataTable
        columns={columns}
        data={allActs}
        filterColumnId="name"
        filterPlaceholder="Filtrar por nombre de acta..."
      />
    </div>
  );
};