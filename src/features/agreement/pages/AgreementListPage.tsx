import { getAllAgreements } from "@/features/book/api/book";
import { columns } from "../components/AgreementColumns";
import { DataTable } from "@/components/ui/DataTable";

export const AgreementListPage = () => {
  // En el futuro, esto vendrá de una llamada a la API
  const allAgreements = getAllAgreements();

  return (
    <div className="space-y-8 overflow-y-auto p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestión de Acuerdos
          </h1>
          <p className="text-muted-foreground mt-1">
            Acuerdos de Actas Municipales.
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={allAgreements}
        filterColumnId="content"
        filterPlaceholder="Filtrar por contenido del acuerdo..."
      />
    </div>
  );
};
