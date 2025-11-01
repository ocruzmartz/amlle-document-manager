import { getAllLogs } from "@/features/audit/api/audit";
import { columns } from "../components/AuditLogColumns";
import { DataTable } from "@/components/ui/DataTable";

export const AuditLogListPage = () => {
  const allLogs = getAllLogs();

  const facetedFilters = [
    {
      columnId: "action",
      title: "Acción",
      options: [
        { label: "Creado", value: "CREATED" },
        { label: "Modificado", value: "UPDATED" },
        { label: "Eliminado", value: "DELETED" },
        { label: "Finalizado", value: "FINALIZED" },
        { label: "Exportado", value: "EXPORTED" },
      ],
    },
    {
      columnId: "targetType",
      title: "Objeto",
      options: [
        { label: "Libro", value: "Libro" },
        { label: "Acta", value: "Acta" },
        { label: "Acuerdo", value: "Acuerdo" },
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
            Un registro detallado de todas las acciones realizadas en el
            sistema.
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={allLogs}
        filterColumnId="targetName"
        filterPlaceholder="Filtrar por nombre de objeto..."
        facetedFilters={facetedFilters}
      />
    </div>
  );
};
